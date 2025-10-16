<script setup lang="ts">
const model = defineModel<number>()

const MIN_INTERVAL = 1
const MAX_INTERVAL = 16
const STEP = 1
</script>

<template>
  <input
    type="number"
    :min="MIN_INTERVAL"
    :max="MAX_INTERVAL"
    :step="STEP"
    v-model="model"
    class="input input-bordered max-w-12 text-center"
  />
</template>
