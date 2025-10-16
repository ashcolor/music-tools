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
</script>

<template>
  <div
    class="bg-base-100 max-w-xl mx-auto p-8 rounded-lg shadow-lg gap-8 flex flex-col items-center"
  >
    <div class="indicator">
      <span class="indicator-item indicator-center badge badge-secondary">加速機能付き</span>
      <h1 class="text-3xl font-bold mt-4">メトロノーム</h1>
    </div>

    <div class="flex flex-col gap-6">
      <div class="text-center">
        <div class="text-6xl font-mono font-bold text-primary-content">
          {{ metronome.bpm }}
        </div>
        <div class="text-lg text-neutral">BPM</div>
      </div>
      <BeatsDots
        :isPlaying="metronome.isPlaying"
        :currentBeat="metronome.currentBeat"
        :beatsPerMeasure="metronome.beatsPerMeasure"
      />
    </div>

    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-1">
        <label class="label-text text-sm">テンポ</label>
        <div class="flex flex-row gap-4 items-center">
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
      </div>

      <div class="flex flex-col gap-1">
        <label class="label-text text-sm">加速</label>
        <div class="flex flex-row gap-1 items-center justify-center">
          <AccerationStepInput v-model="metronome.accelerationInterval" />
          <span class="shrink-0">小節ごとに</span>
          <AccelerationStepInput v-model="metronome.accelerationStep" />
          <span class="shrink-0">BPM変化</span>
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
        class="btn btn-lg rounded-2xl btn-primary"
        @click="metronome.pause"
      >
        <PauseIcon />
      </button>

      <button
        v-if="metronome.isPlaying"
        class="btn btn-lg rounded-2xl btn-accent"
        @click="metronome.stop"
      >
        <StopIcon />
      </button>
    </div>
  </div>
</template>
