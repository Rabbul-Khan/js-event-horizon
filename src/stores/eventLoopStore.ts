import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PromiseScenario } from '@/scenarios/promiseScenario'
import type { Scenario, EventLoopState } from '@/types/eventLoop'
import { createInitialState, stepForward } from '@/utils/executionEngine'

export const useEventLoopStore = defineStore('eventLoop', () => {
  const currentScenario = ref<Scenario>(PromiseScenario)
  const state = ref<EventLoopState>(createInitialState(PromiseScenario))

  const loadScenario = (scenario: Scenario) => {
    currentScenario.value = scenario
    state.value = createInitialState(currentScenario.value)
  }

  const nextStep = () => {
    state.value = stepForward(state.value, currentScenario.value)
  }
  return { state, currentScenario, loadScenario, nextStep }
})
