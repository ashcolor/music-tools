<script setup lang="ts">
const MIN_BPM = 40
const MAX_BPM = 300

const model = defineModel<number>()

const buttonValues = [1, 10]
const negativeButtonValues = buttonValues.map((v) => -v).reverse()

const onClickButton = (value: number) => {
  if (!model.value) {
    model.value = 120
    return
  }
  const newValue = model.value + value
  model.value = newValue
}
</script>

<template>
  <div class="flex flex-row gap-1 items-center">
    <div class="flex flex-col items-center justify-center text-sm gap-1">
      <button
        v-for="value in buttonValues"
        :key="value"
        class="btn btn-neutral btn-soft btn-sm"
        @click="onClickButton(value)"
      >
        {{ value > 0 ? '+' + value : value }}
      </button>
    </div>
    <input
      v-model="model"
      type="number"
      :min="MIN_BPM"
      :max="MAX_BPM"
      class="input input-bordered input-lg w-24 text-center text-xl font-mono"
    />
    <div class="flex flex-col items-center justify-center text-sm gap-1">
      <button
        v-for="value in buttonValues"
        :key="value"
        class="btn btn-neutral btn-soft btn-sm"
        @click="onClickButton(value)"
      >
        {{ value > 0 ? '+' + value : value }}
      </button>
    </div>
  </div>
</template>
