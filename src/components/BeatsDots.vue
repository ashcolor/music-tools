<script setup lang="ts">
const {
  isPlaying = false,
  beatsPerMeasure = 1,
  currentBeat = 1,
} = defineProps<{
  isPlaying?: boolean
  beatsPerMeasure?: number
  currentBeat?: number
}>()
const getBeatDotClass = (beat: number) => {
  if (!isPlaying) {
    return 'bg-base-300'
  }

  if (currentBeat === beat) {
    if (beat === 1) {
      return 'bg-error animate-pulse scale-150'
    } else {
      return 'bg-success animate-pulse scale-150'
    }
  } else {
    return 'bg-base-300'
  }
}
</script>

<template>
  <!-- 視覚的フィードバック - 拍子ドット表示 -->
  <div class="flex justify-center">
    <div class="flex items-center gap-3">
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
