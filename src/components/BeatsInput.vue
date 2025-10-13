<script setup lang="ts">
const model = defineModel<number>()
const BEATS = [2, 3, 4, 5, 6, 7, 8]
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="beats in BEATS"
      :key="beats"
      class="btn btn-sm rounded-full"
      :class="model === beats ? 'btn-primary' : 'btn-outline'"
      @click="model = beats"
    >
      {{ beats }}
    </button>
  </div>
</template>
