<script setup lang="ts">
const model = defineModel<number>()

const MIN_STEP = 1
const MAX_STEP = 10
const STEP = 1
</script>

<template>
  <input
    type="number"
    :min="MIN_STEP"
    :max="MAX_STEP"
    :step="STEP"
    v-model="model"
    class="input input-bordered w-full"
  />
</template>
