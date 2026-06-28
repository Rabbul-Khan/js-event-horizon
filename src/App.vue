<script setup lang="ts">
import { useEventLoopStore } from './stores/eventLoopStore'

const eventLoopStore = useEventLoopStore()
</script>

<template>
  <button @click="eventLoopStore.nextStep()">Step Forward</button>

  <pre>{{ eventLoopStore.state }}</pre>
</template>

<style scoped></style>
