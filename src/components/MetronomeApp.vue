<template>
  <div class="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-xl space-y-8">
    <!-- メトロノームタイトル -->
    <h1 class="text-3xl font-bold text-center text-primary">メトロノーム</h1>

    <!-- メイン表示エリア（BPM + ビジュアルフィードバック） -->
    <div class="space-y-4">
      <!-- BPM表示 -->
      <div class="text-center">
        <div class="text-6xl font-mono font-bold text-primary mb-2">
          {{ metronome.bpm }}
        </div>
        <div class="text-lg text-base-content/70">BPM</div>
      </div>

      <!-- 視覚的フィードバック - 拍子ドット表示 -->
      <div class="flex justify-center">
        <div class="flex items-center gap-3">
          <div
            v-for="beat in metronome.beatsPerMeasure"
            :key="beat"
            class="w-4 h-4 rounded-full transition-all duration-100"
            :class="getBeatDotClass(beat)"
          ></div>
        </div>
      </div>
    </div>

    <!-- コントロールエリア -->
    <div class="space-y-6">
      <!-- BPMコントロール -->
      <div>
        <label class="label">
          <span class="label-text">BPM: {{ metronome.bpm }}</span>
        </label>
        <div class="flex items-center gap-2">
          <button
            class="btn btn-outline btn-sm rounded-full"
            @click="decrementBpm"
            :disabled="metronome.bpm <= 40"
          >
            -
          </button>
          <input
            type="range"
            min="40"
            max="200"
            :value="metronome.bpm"
            @input="updateBpm"
            class="range range-primary flex-1"
          />
          <button
            class="btn btn-outline btn-sm rounded-full"
            @click="incrementBpm"
            :disabled="metronome.bpm >= 200"
          >
            +
          </button>
        </div>
        <div class="flex justify-between text-xs text-base-content/50 mt-1">
          <span>40</span>
          <span>200</span>
        </div>
      </div>

      <!-- 加速機能 -->
      <div>
        <label class="label">
          <span class="label-text">加速機能</span>
          <span v-if="metronome.isAccelerating" class="badge badge-warning">加速中</span>
        </label>
        <div class="space-y-3">
          <!-- BPM範囲（開始→目標） -->
          <div class="flex items-end gap-3">
            <div class="flex-1">
              <label class="label-text text-sm">開始BPM</label>
              <input
                type="number"
                min="40"
                max="200"
                v-model="metronome.accelerationStartBpm"
                class="input input-bordered input-sm w-full"
                :disabled="metronome.isPlaying"
                @input="updateAccelerationSettings"
              />
            </div>
            <div class="flex items-center justify-center pb-1">
              <svg
                class="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <div class="flex-1">
              <label class="label-text text-sm">目標BPM</label>
              <input
                type="number"
                min="40"
                max="200"
                v-model="metronome.accelerationTargetBpm"
                class="input input-bordered input-sm w-full"
                :disabled="metronome.isPlaying"
                @input="updateAccelerationSettings"
              />
            </div>
          </div>

          <!-- 間隔設定 -->
          <div>
            <label class="label-text text-sm">間隔 (小節)</label>
            <input
              type="number"
              min="1"
              max="16"
              v-model="metronome.accelerationInterval"
              class="input input-bordered input-sm w-full"
              :disabled="metronome.isPlaying"
              @input="updateAccelerationSettings"
            />
          </div>
        </div>
      </div>

      <!-- 拍子設定 -->
      <div>
        <label class="label">
          <span class="label-text">拍子</span>
        </label>
        <div class="flex gap-2">
          <button
            v-for="beats in [2, 3, 4, 5, 6, 7, 8]"
            :key="beats"
            class="btn btn-sm rounded-full"
            :class="metronome.beatsPerMeasure === beats ? 'btn-primary' : 'btn-outline'"
            @click="metronome.setBeatsPerMeasure(beats)"
          >
            {{ beats }}
          </button>
        </div>
      </div>
    </div>

    <!-- アクションエリア -->
    <div class="flex justify-center pt-4">
      <button
        class="btn btn-lg rounded-2xl"
        :class="metronome.isPlaying ? 'btn-error' : 'btn-primary'"
        @click="metronome.toggle"
      >
        <svg v-if="!metronome.isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
        {{ metronome.isPlaying ? '停止' : '開始' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMetronomeStore } from '@/stores/metronome'

const metronome = useMetronomeStore()

// 拍のドットのクラスを取得
const getBeatDotClass = (beat: number) => {
  if (!metronome.isPlaying) {
    return 'bg-base-300'
  }

  if (metronome.currentBeat === beat) {
    // 1拍目（アクセント）は赤、その他は緑
    if (beat === 1) {
      return 'bg-error animate-pulse scale-150'
    } else {
      return 'bg-success animate-pulse scale-150'
    }
  } else {
    return 'bg-base-300'
  }
}

// BPM調整
const updateBpm = (event: Event) => {
  const target = event.target as HTMLInputElement
  metronome.setBpm(parseInt(target.value))
}

const incrementBpm = () => {
  metronome.setBpm(metronome.bpm + 1)
}

const decrementBpm = () => {
  metronome.setBpm(metronome.bpm - 1)
}

// 加速設定の更新
const updateAccelerationSettings = () => {
  metronome.setAccelerationSettings(
    metronome.accelerationStartBpm,
    metronome.accelerationTargetBpm,
    metronome.accelerationInterval,
  )
}
</script>

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
