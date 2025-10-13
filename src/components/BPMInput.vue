<script setup lang="ts">
const model = defineModel<number>()

const buttonValues = [-10, -1, 1, 10]

const MIN_BPM = 40
const MAX_BPM = 300
</script>

<template>
  <div class="space-y-3">
    <input
      v-model="model"
      type="number"
      :min="MIN_BPM"
      :max="MAX_BPM"
      class="input input-bordered input-lg w-full text-center text-xl font-mono"
    />
    <div class="flex justify-center gap-1">
      <button
        v-for="value in buttonValues"
        :key="value"
        class="btn btn-outline btn-xs"
        @click="
          () => {
            if (!model) {
              model = 120
              return
            }
            const newValue = model + value
            model = newValue
          }
        "
      >
        {{ value > 0 ? '+' + value : value }}
      </button>
    </div>
  </div>
</template>
