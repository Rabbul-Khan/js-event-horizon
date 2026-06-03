import type { Scenario } from '@/types/eventLoop'

export const PromiseScenario: Scenario = {
  id: 'promise',
  title: 'Promise Scenario',
  description: 'Demonstrates nested async execution.',
  code: `console.log("A");\nPromise.resolve().then(()=>{console.log("1")\nPromise.resolve().then(()=>console.log("2"))})\nconsole.log("B")`,
  instructions: [
    {
      id: 'nested-1',
      type: 'sync',
      label: 'console.log("A")',
      sourceLine: 1,
    },
    {
      id: 'nested-2',
      type: 'promise',
      label: 'Promise.resolve(...)',
      sourceLine: 2,
      spawns: [
        {
          id: 'nested-3',
          type: 'sync',
          label: 'console.log("1")',
          sourceLine: 2,
        },
        {
          id: 'nested-4',
          type: 'promise',
          label: 'Promise.resolve(...)',
          sourceLine: 3,
          spawns: [
            {
              id: 'nested-5',
              type: 'sync',
              label: 'console.log("2")',
              sourceLine: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'nested-6',
      type: 'sync',
      label: 'console.log("B")',
      sourceLine: 4,
    },
  ],
}
