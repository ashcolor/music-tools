<script setup lang="ts">
import { useMetronomeStore } from '@/stores/metronome'
import BPMInput from './BPMInput.vue'
import BeatsInput from './BeatsInput.vue'
import BeatsDots from './BeatsDots.vue'

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
              <div class="text-center font-bold text-sm mb-2">START</div>
              <BPMInput v-model="metronome.accelerationStartBpm" />
            </div>

            <div class="col-span-1 flex justify-center">
              <svg
                class="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </div>
            <div class="col-span-2">
              <div class="text-center font-bold text-sm mb-2">GOAL</div>
              <BPMInput v-model="metronome.accelerationTargetBpm" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="label-text text-sm">BPM変化量</label>
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              v-model="metronome.accelerationStep"
              class="input input-bordered input-sm w-full"
              :disabled="metronome.isPlaying"
              @input="updateAccelerationStep"
            />
            <div class="text-xs text-base-content/60">1回の加速で増加するBPM</div>
          </div>

          <div class="space-y-2">
            <label class="label-text text-sm">間隔（小節）</label>

            <input
              type="number"
              min="1"
              max="16"
              step="1"
              v-model="metronome.accelerationInterval"
              class="input input-bordered input-sm w-full"
              :disabled="metronome.isPlaying"
              @input="updateAccelerationSettings"
            />
            <div class="text-xs text-base-content/60">小節ごとに加速</div>
          </div>
        </div>
      </div>

      <!-- 拍子設定 -->
      <BeatsInput v-model="metronome.beatsPerMeasure" />
    </div>

    <!-- アクションエリア -->
    <div class="flex justify-center gap-4 pt-4">
      <!-- 再生ボタン -->
      <button
        v-if="!metronome.isPlaying && !metronome.isPaused"
        class="btn btn-lg rounded-2xl btn-primary"
        @click="metronome.start"
      >
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <!-- 復帰ボタン（一時停止中） -->
      <button
        v-if="metronome.isPaused"
        class="btn btn-lg rounded-2xl btn-primary"
        @click="metronome.start"
      >
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <!-- 一時停止ボタン -->
      <button
        v-if="metronome.isPlaying"
        class="btn btn-lg rounded-2xl btn-warning"
        @click="metronome.pause"
      >
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </button>

      <!-- 停止ボタン -->
      <button
        v-if="metronome.isPlaying || metronome.isPaused"
        class="btn btn-lg rounded-2xl btn-error"
        @click="metronome.stop"
      >
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      </button>
    </div>
  </div>
</template>
