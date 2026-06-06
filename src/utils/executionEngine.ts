import type { EventLoopState, Scenario } from '@/types/eventLoop'

export const createInitialState = (scenario: Scenario): EventLoopState => {
  return {
    phase: scenario.instructions.length > 0 ? 'EXECUTING_SYNC' : 'IDLE',
    callStack: [],
    webApis: [],
    microtaskQueue: [],
    macrotaskQueue: [],
    executionLog: [],
    consoleOutput: [],
    currentInstructionIndex: 0,
    pendingAction: null,
    currentTask: null,
    isComplete: scenario.instructions.length > 0 ? false : true,
    activeLine: scenario.instructions[0]?.sourceLine ?? null,
  }
}

export const stepForward = (state: EventLoopState, scenario: Scenario): EventLoopState => {
  // If we are already done, do nothing and return the state as-is
  if (state.isComplete || state.phase === 'IDLE') {
    return state
  }

  // We are going to build a completely new state object to return at the end
  let newState = {
    ...state,
  }

  switch (newState.phase) {
    case 'EXECUTING_SYNC': {
      // TODO: Handle the 3 pending actions:
      // 1. pendingAction === null (Need to grab next instruction and queue a PUSH)
      if (state.pendingAction === null) {
        const instruction = scenario.instructions[state.currentInstructionIndex]
        if (!instruction) {
          return { ...state, phase: 'DRAINING_MICROTASKS' as const }
        }
        return {
          ...state,
          currentTask: {
            id: instruction.id,
            label: instruction.label,
            type: instruction.type,
            sourceLine: instruction.sourceLine,
          },
          pendingAction: 'PUSH',
          currentInstructionIndex: state.currentInstructionIndex + 1,
        }
      }
      // 2. pendingAction === 'PUSH' (Need to move task to Call Stack)
      if (state.pendingAction === 'PUSH') {
        if (state.currentTask === null) {
          return state
        }
        return {
          ...state,
          pendingAction: 'EXECUTE_AND_POP',
          callStack: [...state.callStack, state.currentTask],
          activeLine: state.currentTask.sourceLine,
        }
      }
      // 3. pendingAction === 'EXECUTE_AND_POP' (Need to pop off stack and route spawns)
      if (state.pendingAction === 'EXECUTE_AND_POP') {
        if (!state.currentTask) return state
        const match = state.currentTask.label.match(/"(.*?)"/)
        let consoleLog
        if (match) {
          consoleLog = String(match[1])
        }

        const pushToQueue = (taskType: 'setTimeout' | 'promise') => {
          const taskToPush = scenario.instructions.find(
            (instruction) =>
              instruction.id === state.currentTask?.id && instruction.type === taskType,
          )

          const spawnTasks = taskToPush?.spawns?.map((spawn) => {
            return {
              id: spawn.id,
              label: spawn.label,
              type: spawn.type,
              sourceLine: spawn.sourceLine,
            }
          })

          if (taskType === 'setTimeout') {
            newState = { ...state, webApis: [...state.webApis, ...(spawnTasks ?? [])] }
          } else if (taskType === 'promise') {
            newState = {
              ...state,
              microtaskQueue: [...state.microtaskQueue, ...(spawnTasks ?? [])],
            }
          }
        }

        if (state.currentTask.type === 'setTimeout') {
          pushToQueue('setTimeout')
        } else if (state.currentTask.type === 'promise') {
          pushToQueue('promise')
        }

        return {
          ...newState,
          callStack: state.callStack.slice(0, -1),
          consoleOutput: consoleLog ? [...state.consoleOutput, consoleLog] : state.consoleOutput,
          pendingAction: null,
          currentTask: null,
          activeLine: null,
        }
      }
      break
    }
    case 'DRAINING_MICROTASKS':
      // TODO: Empty the microtask queue one by one
      break

    case 'PROCESSING_MACROTASK':
      // TODO: Process exactly ONE macrotask, then go back to microtasks
      break
  }

  return state
}
