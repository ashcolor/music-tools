<script setup lang="ts">
const { beatsPerMeasure = 1, currentBeat = 1 } = defineProps<{
  beatsPerMeasure?: number
  currentBeat?: number
}>()
const getBeatDotClass = (beat: number) => {
  if (currentBeat === beat) {
    if (beat === 1) {
      return 'bg-accent animate-pulse scale-150'
    } else {
      return 'bg-success animate-pulse scale-150'
    }
  } else {
    return 'bg-neutral-content'
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div class="flex items-center gap-4">
      <div
        v-for="beat in beatsPerMeasure"
        :key="beat"
        class="w-4 h-4 rounded-full transition-all duration-100"
        :class="getBeatDotClass(beat)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 0.1s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--color-primary), 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(var(--color-primary), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--color-primary), 0);
  }
}
</style>
