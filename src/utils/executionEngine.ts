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
      if (newState.pendingAction === null) {
        const instruction = scenario.instructions[newState.currentInstructionIndex]
        if (!instruction) {
          return { ...newState, phase: 'DRAINING_MICROTASKS' as const }
        }
        return {
          ...newState,
          currentTask: {
            id: instruction.id,
            label: instruction.label,
            type: instruction.type,
            sourceLine: instruction.sourceLine,
          },
          pendingAction: 'PUSH',
          currentInstructionIndex: newState.currentInstructionIndex + 1,
        }
      }
      // 2. pendingAction === 'PUSH' (Need to move task to Call Stack)
      if (newState.pendingAction === 'PUSH') {
        if (newState.currentTask === null) {
          return newState
        }
        return {
          ...newState,
          pendingAction: 'EXECUTE_AND_POP',
          callStack: [...newState.callStack, newState.currentTask],
          activeLine: newState.currentTask.sourceLine,
        }
      }
      // 3. pendingAction === 'EXECUTE_AND_POP' (Need to pop off stack and route spawns)
      if (newState.pendingAction === 'EXECUTE_AND_POP') {
        if (!newState.currentTask) return newState
        const match = newState.currentTask.label.match(/"(.*?)"/)
        let consoleLog
        if (match) {
          consoleLog = String(match[1])
        }

        const pushToQueue = (taskType: 'setTimeout' | 'promise') => {
          const taskToPush = scenario.instructions.find(
            (instruction) =>
              instruction.id === newState.currentTask?.id && instruction.type === taskType,
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
            newState = { ...newState, webApis: [...newState.webApis, ...(spawnTasks ?? [])] }
          } else if (taskType === 'promise') {
            newState = {
              ...newState,
              microtaskQueue: [...newState.microtaskQueue, ...(spawnTasks ?? [])],
            }
          }
        }

        if (newState.currentTask.type === 'setTimeout') {
          pushToQueue('setTimeout')
        } else if (newState.currentTask.type === 'promise') {
          pushToQueue('promise')
        }

        return {
          ...newState,
          callStack: newState.callStack.slice(0, -1),
          consoleOutput: consoleLog
            ? [...newState.consoleOutput, consoleLog]
            : newState.consoleOutput,
          pendingAction: null,
          currentTask: null,
          activeLine: null,
        }
      }
      break
    }
    case 'DRAINING_MICROTASKS':
      // TODO: Empty the microtask queue one by one
      // TODO: Handle the 3 pending actions:
      // 1. pendingAction === null (Need to grab micro task from micro task queue)
      if (newState.pendingAction === null) {
        if (newState.microtaskQueue.length === 0) {
          return { ...newState, phase: 'PROCESSING_MACROTASK' as const }
        }
        const currentMicrotask = newState.microtaskQueue[0]
        return {
          ...newState,
          microtaskQueue: newState.microtaskQueue.slice(1),
          pendingAction: 'PUSH',
          currentTask: currentMicrotask ?? null,
        }
      }

      // 2. pendingAction === PUSH (Need to move micro task to call stack)
      if (newState.pendingAction === 'PUSH') {
        if (!newState.currentTask) {
          return newState
        }
        return {
          ...newState,
          callStack: [...newState.callStack, newState.currentTask],
          pendingAction: 'EXECUTE_AND_POP',
          activeLine: newState.currentTask.sourceLine,
        }
      }

      // 3. pendingAction === 'EXECUTE_AND_POP' (Need to pop off stack and route spawns)
      if (newState.pendingAction === 'EXECUTE_AND_POP') {
        if (!newState.currentTask) {
          return state
        }
        let consoleLog
        let taskToPush
        let spawns

        const match = newState.currentTask.label.match(/"(.*?)"/)
        if (match) {
          consoleLog = String(match[1])
        }

        if (newState.currentTask.type === 'promise' || newState.currentTask.type === 'setTimeout') {
          taskToPush = scenario.instructions.find((instruction) => {
            return instruction.id === newState.currentTask?.id
          })
          if (taskToPush) {
            spawns = taskToPush.spawns?.map((task) => {
              return {
                id: task.id,
                type: task.type,
                label: task.label,
                sourceLine: task.sourceLine,
              }
            })
          }
        }

        return {
          ...newState,
          webApis:
            spawns && newState.currentTask.type === 'setTimeout'
              ? [...newState.webApis, ...spawns]
              : newState.webApis,
          microtaskQueue:
            spawns && newState.currentTask.type === 'promise'
              ? [...newState.microtaskQueue, ...spawns]
              : newState.microtaskQueue,
          callStack: newState.callStack.slice(0, -1),
          consoleOutput: consoleLog
            ? [...newState.consoleOutput, consoleLog]
            : newState.consoleOutput,
          pendingAction: null,
          currentTask: null,
          activeLine: null,
        }
      }

      break

    case 'PROCESSING_MACROTASK':
      // TODO: Process exactly ONE macrotask, then go back to microtasks

      break
  }

  return newState
}
