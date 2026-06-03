import type { Scenario } from '../types/eventLoop'

export const basicScenario: Scenario = {
  id: 'basic',
  title: '1. Basic Synchronous Execution',
  description: 'Demonstrates synchronous execution. Watch how instructions are pushed onto the Call Stack and executed in order, popping off immediately after execution.',
  code: `console.log("A");\nconsole.log("B");\nconsole.log("C");`,
  instructions: [
    {
      id: 'basic-1',
      type: 'sync',
      label: 'console.log("A")',
      sourceLine: 1
    },
    {
      id: 'basic-2',
      type: 'sync',
      label: 'console.log("B")',
      sourceLine: 2
    },
    {
      id: 'basic-3',
      type: 'sync',
      label: 'console.log("C")',
      sourceLine: 3
    }
  ]
}
