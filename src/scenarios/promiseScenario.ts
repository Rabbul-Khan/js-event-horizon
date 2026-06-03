import type { Scenario } from '@/types/eventLoop'

export const PromiseScenario: Scenario = {
  id: 'promise',
  title: 'Promise Scenario',
  description: 'Demonstrates asynchronous execution.',
  code: `console.log("A");\nsetTimeout(()=>{console.log("1")}, 3000);\nPromise.resolve().then(()=>console.log("2"))\nconsole.log("B")`,
  instructions: [
    {
      id: 'promise-1',
      type: 'sync',
      label: 'console.log("A")',
      sourceLine: 1,
    },
    {
      id: 'promise-2',
      type: 'setTimeout',
      label: 'setTimeout(...)',
      sourceLine: 2,
      spawns: [
        {
          id: 'promise-3',
          type: 'sync',
          label: 'console.log("1")',
          sourceLine: 2,
        },
      ],
    },
    {
      id: 'promise-4',
      type: 'promise',
      label: 'Promise.resolve(...)',
      sourceLine: 3,
      spawns: [
        {
          id: 'promise-5',
          type: 'sync',
          label: 'console.log("2")',
          sourceLine: 3,
        },
      ],
    },
    {
      id: 'promise-6',
      type: 'sync',
      label: 'console.log("B")',
      sourceLine: 4,
    },
  ],
}
