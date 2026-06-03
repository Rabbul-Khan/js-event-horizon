Browser Event Loop Visualizer — Implementation Plan

An interactive educational tool that visually demonstrates how the JavaScript Event Loop operates inside the browser. Built with Vue 3, TypeScript, Pinia, Tailwind CSS v4, Shiki, and VueUse.

Resolved Design Decisions

All decisions below were resolved during the design interview.

Decision Resolution

Tailwind version v4 (CSS-native config)

Queue layout 4-column: Code Viewer (40%) + Call Stack (20%) + Web APIs (20%) + Queues (20%)

Microtask/Macrotask arrangement Stacked vertically in the Queues column (Micro on top, Macro below)

Task movement animation Vue <TransitionGroup> with FLIP (v-move class)

Step granularity One atomic Event Loop operation per step

Engine computation model On-the-fly (not pre-computed)

Reset strategy Re-call loadScenario() with current scenario

Scenario structure Tree structure with spawns property for callbacks

Engine phase tracking Explicit phase field: EXECUTING_SYNC, DRAINING_MICROTASKS, PROCESSING_MACROTASK, IDLE

Steps per task 2 steps: PUSH → EXECUTE_AND_POP

setTimeout lifecycle 6 total steps: PUSH → EXECUTE_AND_POP (→ Web APIs) → WEB_API_COMPLETE (→ Macrotask Queue) → PUSH callback → EXECUTE_AND_POP callback

Playback speed 3 tiers: 0.5x (2500ms), 1x (1500ms, default), 2x (800ms)

Shiki theme One Dark Pro

Active line highlight Left gutter anchor (4px border) + translucent wash (10-15% opacity bg) + spotlight dimming (inactive lines at 0.6 opacity) + 150ms micro-transition

Line highlight implementation Imperative DOM mutation (add/remove CSS classes, render Shiki HTML once)

Task card design Left border color anchor + dark bg + monospace label + dimmed metadata

Console output Separate panel below Code Viewer in the 40% left column (Code 75% / Console 25%)

Execution log style 4 visual zones: color left-border, tick number, action message, code payload badge

Execution log scrolling Fixed-height panel with internal auto-scroll

Page layout Full-viewport fixed (100vh, no page scroll)

Responsive design Desktop-only for MVP (min ~1024px)

FPS display Glassmorphic floating badge (bottom-right, pointer-events-none, reactive color coding)

Phase indicator Two places: global status badge in Controls + contextual column highlight on active queue

Play/pause mechanism setInterval with auto-stop on IDLE

Engine pattern Pure utility module (plain TypeScript, zero Vue imports)

State mutation Immutable — stepForward(state) returns a new state object

Vue Router No router for MVP

Testing Vitest for engine unit tests

Shiki highlighting One Dark Pro

Architecture

Scenario Definition (Tree Structure)
        ↓

Simulation Engine (Pure TypeScript utility — utils/executionEngine.ts)
        ↓

Pinia Stores (eventLoopStore.ts + uiStore.ts)
        ↓

Vue Components (reactive visualization)
        ↓

User sees: Code Viewer, Queue Columns, Console Output, Execution Log, FPS

The engine is a pure function module with zero Vue/Pinia imports. It receives state and returns new state (immutable pattern). The Pinia store calls engine functions and manages reactive state.

Proposed Changes

Domain Types

[NEW]

eventLoop.ts

Core type definitions for the entire application:

typescript

// Task types supported in MVP

type TaskType = 'sync' | 'setTimeout' | 'promise'

// Instruction in the scenario tree

interface Instruction {
  id: string
  type: TaskType
  label: string           // e.g., 'console.log("A")'
  sourceLine: number      // line number in displayed code
  spawns?: Instruction[]  // callback tasks routed to queues

}

// A task card visible in queues

interface Task {
  id: string
  label: string
  type: TaskType
  sourceLine: number

}

// Engine phases

type EventLoopPhase =
  | 'EXECUTING_SYNC'
  | 'DRAINING_MICROTASKS'
  | 'PROCESSING_MACROTASK'
  | 'IDLE'

// Full engine state (immutable, returned by stepForward)

interface EventLoopState {
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

// Execution log entry (4 visual zones)

interface LogEntry {
  tick: number
  taskType: TaskType
  message: string
  codeSnippet: string    // inline code badge

}

// Scenario definition

interface Scenario {
  id: string
  title: string
  description: string
  code: string            // raw source code for Shiki
  instructions: Instruction[]

}

Scenarios

[NEW]

basicScenario.ts

Scenario 1: Basic synchronous execution (console.log("A"), "B", "C"). Pure sync tasks, demonstrates Call Stack.

[NEW]

promiseScenario.ts

Scenario 2: Promise vs setTimeout — output order A, D, C, B. Tree structure with spawns for callbacks:

instructions: [
  { type: 'sync', label: 'console.log("A")', line: 1 },
  { type: 'setTimeout', label: 'setTimeout(...)', line: 3, spawns: [
    { type: 'sync', label: 'console.log("B")', line: 4 }
  ]},
  { type: 'promise', label: 'Promise.resolve().then(...)', line: 7, spawns: [
    { type: 'sync', label: 'console.log("C")', line: 8 }
  ]},
  { type: 'sync', label: 'console.log("D")', line: 11 }

]

[NEW]

nestedPromiseScenario.ts

Scenario 3: Nested promises — microtasks spawning microtasks.

Simulation Engine

[NEW]

executionEngine.ts

The heart of the application. A pure TypeScript utility module with zero framework dependencies.

Exported functions:

Function Signature Description

createInitialState (scenario: Scenario) → EventLoopState Creates the initial state from a scenario

stepForward (state: EventLoopState, scenario: Scenario) → EventLoopState Returns a new state object representing the next atomic step

Step execution logic (stepForward):

The function checks state.phase and state.pendingAction to determine the next atomic operation:

EXECUTING_SYNC phase:

If pendingAction === null: Pick the next instruction, create a Task, set pendingAction = 'PUSH'

If pendingAction === 'PUSH': Add task to callStack, set activeLine, set pendingAction = 'EXECUTE_AND_POP'

If pendingAction === 'EXECUTE_AND_POP': Remove from callStack. If task has spawns, route them:

promise spawns → microtaskQueue

setTimeout spawns → webApis

If task is a console.log, append to consoleOutput

If no more sync instructions: transition to DRAINING_MICROTASKS (or IDLE if all queues empty)

DRAINING_MICROTASKS phase:

Same PUSH/EXECUTE_AND_POP pattern for tasks from microtaskQueue

After draining: if macrotaskQueue has items → PROCESSING_MACROTASK, else check webApis

PROCESSING_MACROTASK phase:

Process one task from macrotaskQueue (PUSH/EXECUTE_AND_POP)

After processing: back to DRAINING_MICROTASKS (to check for any new microtasks)

Web API completion:

When all sync instructions are processed and webApis has items, generate a WEB_API_COMPLETE step that moves tasks from webApis to macrotaskQueue

State Management

[NEW]

eventLoopStore.ts

Pinia store wrapping the simulation engine:

State: EventLoopState + current Scenario

Actions:

loadScenario(scenario) — calls createInitialState(), replaces state

stepForward() — calls engine's stepForward(), replaces state with returned object

reset() — calls loadScenario() with current scenario

[NEW]

uiStore.ts

Pinia store for presentation state:

State: isPlaying, selectedScenarioId, speedTier ('0.5x' | '1x' | '2x'), intervalId

Getters: speedMs → maps tier to 2500/1500/800

Actions:

play() — starts setInterval calling eventLoopStore.stepForward() at speedMs. Auto-stops on IDLE

pause() — clearInterval()

setSpeed(tier) — updates tier, restarts interval if playing

selectScenario(id) — loads scenario + resets

Vue Components

Component Tree

App.vue

└── EventLoopVisualizer.vue
    ├── ControlsBar.vue
    │   ├── ScenarioSelector (dropdown)
    │   ├── StepForward button
    │   ├── Play/Pause toggle
    │   ├── Reset button
    │   ├── Speed tier selector (0.5x / 1x / 2x)
    │   └── PhaseStatusBadge (global phase indicator)
    ├── MainPanel (CSS Grid)
    │   ├── LeftColumn (40%)
    │   │   ├── CodeViewer.vue (75% height)
    │   │   └── ConsoleOutput.vue (25% height)
    │   └── RightColumns (60%)
    │       ├── QueueColumn.vue — Call Stack (20%)
    │       ├── QueueColumn.vue — Web APIs (20%)
    │       └── QueuePair (20%)
    │           ├── QueueColumn.vue — Microtask Queue (top 50%)
    │           └── QueueColumn.vue — Macrotask Queue (bottom 50%)
    ├── ExecutionLog.vue
    └── FpsTelemetry.vue (absolute overlay)

[NEW] Core Components (src/components/core/)

QueueColumn.vue — Reusable column for any queue structure:

Props: title, tasks: Task[], isActive (for phase highlight)

Uses <TransitionGroup> with FLIP for task card animations

Active column gets a subtle glow/border when its phase is active

TaskCard.vue — Individual task card:

Props: task: Task

Visual: 4px left border (color by type), dark bg (gray-800), monospace label, dimmed metadata (type + line number)

Color mapping: sync → blue-500, promise → purple-500, setTimeout → amber-500

[NEW] Controls (src/components/controls/)

ControlsBar.vue — Top control bar:

Scenario dropdown selector

Step Forward, Play/Pause (toggle icon), Reset buttons

Speed tier selector (three buttons: 0.5x / 1x / 2x)

Phase status badge (shows current EventLoopPhase in human-readable text)

Buttons disabled appropriately (e.g., Step Forward disabled when IDLE or playing)

[NEW] Code Panel (src/components/code/)

CodeViewer.vue — Shiki-powered code viewer:

Renders Shiki HTML once on scenario load using v-html

Imperative DOM mutation: watches activeLine from store, adds/removes CSS classes on individual <span class="line"> elements

Active line CSS: 4px left border (blue-500), 10-15% opacity blue background wash

Inactive lines: 3px transparent left border (prevents layout shift), opacity 0.6-0.7

Active line: opacity 1.0

150ms ease-in-out transition on background-color, border-color, opacity

Line numbers displayed

ConsoleOutput.vue — Isolated console output panel:

Displays consoleOutput: string[] from store

Styled like a terminal: dark bg, monospace font, > prefix per line

Auto-scrolls on new entries

[NEW] Logs (src/components/logs/)

ExecutionLog.vue — Engine telemetry log:

Fixed-height panel with internal overflow-y: auto and auto-scroll

Each entry has 4 visual zones:

Color left-border (2px, matches task type)

Tick number (monospace, dimmed, e.g., [04])

Action message (standard light text)

Code payload badge (inline-code style highlight)

[NEW] Telemetry (src/components/telemetry/)

FpsTelemetry.vue — Glassmorphic FPS overlay:

position: absolute, bottom-4, right-6, z-50

bg-black/60, backdrop-blur-sm

pointer-events-none (clicks pass through to Execution Log)

Displays: FPS: 60 | Avg: 58

Reactive color coding: green (≥50), yellow (30-49), red (<30)

Composables

[NEW]

useFpsTracker.ts

VueUse-style composable using requestAnimationFrame:

Tracks frame timestamps

Computes current FPS and running average

Returns reactive { fps, avgFps }

Starts/stops with component lifecycle

Vitest Tests

[NEW]

executionEngine.test.ts

Unit tests for the pure engine module:

Scenario 1 (Sync): Verify 6 steps (3 tasks × 2 steps each), correct call stack pushes/pops, console output ["A", "B", "C"], ends in IDLE

Scenario 2 (Promise vs setTimeout): Verify correct console output order ["A", "D", "C", "B"], verify microtask drains before macrotask, verify setTimeout callback goes through Web APIs → Macrotask Queue

Scenario 3 (Nested Promises): Verify nested microtask spawning and draining

Edge cases: createInitialState returns correct initial values, stepForward on IDLE state is a no-op

Project Setup & Config

[NEW] Vue 3 + Vite + TypeScript project

Initialize with: npm create vue@latest ./ (TypeScript enabled, Pinia enabled, no Router, no E2E, Vitest enabled)

Tailwind CSS v4 setup

Install via: npm install tailwindcss @tailwindcss/vite and configure the Vite plugin.

Additional dependencies

Package Purpose

shiki Syntax highlighting for Code Viewer

@vueuse/core Utility composables

Full Viewport Layout (CSS Grid)

css

.app-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;  /_ controls | main | log _/
  height: 100vh;
  overflow: hidden;

}

.main-panel {
  display: grid;
  grid-template-columns: 40% 20% 20% 20%;
  overflow: hidden;

}

.left-column {
  display: grid;
  grid-template-rows: 75% 25%;

}

.queues-column {
  display: grid;
  grid-template-rows: 1fr 1fr;  /_ microtask top, macrotask bottom _/

}

Verification Plan

Automated Tests

Engine unit tests (Vitest):

bash

npx vitest run

All 3 scenarios produce correct state transitions

Console output order matches expected for each scenario

Phase transitions follow Event Loop rules

createInitialState and reset work correctly

Build verification:

bash

npm run build

Zero TypeScript errors in strict mode

Clean production build

Dev server smoke test:

bash

npm run dev

App loads without console errors

All 3 scenarios selectable and executable

Manual Verification
 Step through each scenario manually — verify queue visualization matches expected behavior
 Run auto-play at all 3 speed tiers — verify animations are smooth (check FPS counter)
 Verify active line highlighting syncs with Call Stack state
 Verify console output order matches expected for Scenario 2 (A, D, C, B)
 Verify execution log entries have correct color coding
 Verify reset returns to initial state
 Verify desktop-only message on viewports < 1024px

Development Timeline

Week 1: Simulation Engine

Project setup (Vue 3 + Vite + TypeScript + Pinia + Tailwind v4)

Define all types in eventLoop.ts

Create 3 scenario definitions

Build executionEngine.ts (pure utility module)

Write Vitest unit tests for all 3 scenarios

Deliverable: Engine passes all tests — zero UI

Week 2: Visualization Layer

Build CSS Grid layout (full viewport, 4-column)

Build QueueColumn.vue and TaskCard.vue with FLIP animations

Build ControlsBar.vue (scenario selector, step/play/pause/reset, speed tiers, phase badge)

Connect Pinia stores to components

Deliverable: Tasks visibly move through queues

Week 3: Code Viewer & Logs

Integrate Shiki with One Dark Pro theme

Build CodeViewer.vue with imperative DOM mutation for active line

Build ConsoleOutput.vue

Build ExecutionLog.vue with 4-zone log entries

Deliverable: Full synchronized visualization

Week 4: Polish & Deploy

Build FpsTelemetry.vue (glassmorphic overlay)

Build useFpsTracker.ts composable

Animation polish (timing, easing)

Desktop-only viewport check

README creation

Vercel deployment

Deliverable: Portfolio-ready, deployed application
