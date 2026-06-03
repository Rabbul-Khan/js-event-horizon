// src/types/eventLoop.ts

export type TaskType = 'sync' | 'setTimeout' | 'promise'

export interface Instruction {
  id: string
  type: TaskType
  label: string
  sourceLine: number
  spawns?: Instruction[]
}

export interface Task {
  id: string
  label: string
  type: TaskType
  sourceLine: number
}

export type EventLoopPhase =
  | 'EXECUTING_SYNC'
  | 'DRAINING_MICROTASKS'
  | 'PROCESSING_MACROTASK'
  | 'IDLE'

export interface LogEntry {
  tick: number
  taskType: TaskType
  message: string
  codeSnippet: string
}

export interface EventLoopState {
  phase: EventLoopPhase
  callStack: Task[]
  webApis: Task[]
  microtaskQueue: Task[]
  macrotaskQueue: Task[]
  executionLog: LogEntry[]
  consoleOutput: string[]
  currentInstructionIndex: number
  pendingAction: 'PUSH' | 'EXECUTE_AND_POP' | 'WEB_API_COMPLETE' | null
  currentTask: Task | null
  isComplete: boolean
  activeLine: number | null
}

export interface Scenario {
  id: string
  title: string
  description: string
  code: string
  instructions: Instruction[]
}
