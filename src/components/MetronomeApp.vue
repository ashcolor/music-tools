<script setup lang="ts">
import { useMetronomeStore } from '@/stores/metronome'
import BPMInput from './BPMInput.vue'
import BeatsInput from './BeatsInput.vue'
import BeatsDots from './BeatsDots.vue'
import DoubleArrowIcon from './Icons/DoubleArrowIcon.vue'
import PlayIcon from './Icons/PlayIcon.vue'
import StopIcon from './Icons/StopIcon.vue'
import PauseIcon from './Icons/PauseIcon.vue'
import AccelerationStepInput from './AccelerationStepInput.vue'
import AccerationStepInput from './AccelerationIntervalInput.vue'

const metronome = useMetronomeStore()

// 加速設定の更新
const updateAccelerationSettings = () => {
  metronome.setAccelerationSettings(
    metronome.accelerationStartBpm,
    metronome.accelerationTargetBpm,
    metronome.accelerationInterval,
  )
}

// BPM変化量の更新
const updateAccelerationStep = () => {
  metronome.setAccelerationStep(metronome.accelerationStep)
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-xl space-y-8">
    <p>だんだん早くなる、だんだん遅くなる機能付き</p>
    <h1 class="text-3xl font-bold text-center text-primary">メトロノーム</h1>

    <div class="space-y-4">
      <div class="text-center">
        <div class="text-6xl font-mono font-bold text-primary mb-2">
          {{ metronome.bpm }}
        </div>
        <div class="text-lg text-base-content/70">BPM</div>
      </div>

      <BeatsDots
        :isPlaying="metronome.isPlaying"
        :currentBeat="metronome.currentBeat"
        :beatsPerMeasure="metronome.beatsPerMeasure"
      />
    </div>

    <div class="space-y-6">
      <div>
        <div class="space-y-4">
          <div class="grid grid-cols-5 gap-4 items-center">
            <div class="col-span-2">
              <div class="text-center font-bold text-sm">START</div>
              <BPMInput v-model="metronome.accelerationStartBpm" />
            </div>
            <div class="col-span-1 flex justify-center">
              <DoubleArrowIcon />
            </div>
            <div class="col-span-2">
              <div class="text-center font-bold text-sm">GOAL</div>
              <BPMInput v-model="metronome.accelerationTargetBpm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="label-text text-sm">BPM変化量</label>
              <AccelerationStepInput v-model="metronome.accelerationStep" />
              <div class="text-xs text-base-content/60">1回の加速で増加するBPM</div>
            </div>
            <div class="space-y-2">
              <label class="label-text text-sm">間隔（小節）</label>
              <AccerationStepInput v-model="metronome.accelerationInterval"></AccerationStepInput>
              <div class="text-xs text-base-content/60">小節ごとに加速</div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <label class="label-text text-sm">拍子</label>
        <BeatsInput v-model="metronome.beatsPerMeasure" />
      </div>
    </div>

    <div class="flex justify-center gap-4 pt-4">
      <button
        v-if="!metronome.isPlaying || metronome.isPaused"
        class="btn btn-lg rounded-2xl btn-primary"
        @click="metronome.start"
      >
        <PlayIcon />
      </button>

      <button
        v-if="metronome.isPlaying"
        class="btn btn-lg rounded-2xl btn-warning"
        @click="metronome.pause"
      >
        <PauseIcon />
      </button>

      <button
        v-if="metronome.isPlaying"
        class="btn btn-lg rounded-2xl btn-error"
        @click="metronome.stop"
      >
        <StopIcon />
      </button>
    </div>
  </div>
</template>
