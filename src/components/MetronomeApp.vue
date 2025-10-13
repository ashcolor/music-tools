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
      <!-- 加速機能 -->
      <div>
        <div class="space-y-4">
          <!-- START と GOAL を横並び配置 -->
          <div class="grid grid-cols-5 gap-4 items-center">
            <!-- 開始BPM設定 (START) -->
            <div class="col-span-2">
              <div class="text-center font-bold text-sm mb-2">START</div>
              <div class="space-y-3">
                <!-- 大きめの入力フィールド -->
                <input
                  type="number"
                  min="40"
                  max="300"
                  :value="metronome.accelerationStartBpm"
                  @input="updateStartBpmInput"
                  class="input input-bordered input-lg w-full text-center text-xl font-mono"
                  :disabled="metronome.isPlaying"
                />
                <!-- 増減ボタン -->
                <div class="flex justify-center gap-1">
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustStartBpm(-10)"
                    :disabled="metronome.isPlaying || metronome.accelerationStartBpm <= 40"
                  >
                    -10
                  </button>
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustStartBpm(-1)"
                    :disabled="metronome.isPlaying || metronome.accelerationStartBpm <= 40"
                  >
                    -1
                  </button>
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustStartBpm(1)"
                    :disabled="metronome.isPlaying || metronome.accelerationStartBpm >= 300"
                  >
                    +1
                  </button>
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustStartBpm(10)"
                    :disabled="metronome.isPlaying || metronome.accelerationStartBpm >= 300"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            <!-- 矢印アイコン -->
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

            <!-- 目標BPM設定 (GOAL) -->
            <div class="col-span-2">
              <div class="text-center font-bold text-sm mb-2">GOAL</div>
              <div class="space-y-3">
                <!-- 大きめの入力フィールド -->
                <input
                  type="number"
                  min="40"
                  max="300"
                  :value="metronome.accelerationTargetBpm"
                  @input="updateTargetBpmInput"
                  class="input input-bordered input-lg w-full text-center text-xl font-mono"
                  :disabled="metronome.isPlaying"
                />
                <!-- 増減ボタン -->
                <div class="flex justify-center gap-1">
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustTargetBpm(-10)"
                    :disabled="metronome.isPlaying || metronome.accelerationTargetBpm <= 40"
                  >
                    -10
                  </button>
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustTargetBpm(-1)"
                    :disabled="metronome.isPlaying || metronome.accelerationTargetBpm <= 40"
                  >
                    -1
                  </button>
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustTargetBpm(1)"
                    :disabled="metronome.isPlaying || metronome.accelerationTargetBpm >= 300"
                  >
                    +1
                  </button>
                  <button
                    class="btn btn-outline btn-xs"
                    @click="adjustTargetBpm(10)"
                    :disabled="metronome.isPlaying || metronome.accelerationTargetBpm >= 300"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- BPM変化量設定 -->
          <div>
            <label class="label-text text-sm">BPM変化量</label>
            <input
              type="number"
              min="1"
              max="100"
              v-model="metronome.accelerationBpmChange"
              class="input input-bordered input-sm w-full"
              :disabled="metronome.isPlaying"
              @input="updateAccelerationBpmChange"
            />
          </div>

          <!-- 間隔設定（単位切り替えとセット） -->
          <div class="space-y-2">
            <label class="label-text text-sm">間隔</label>

            <!-- 単位切り替えラジオボタン -->
            <div class="flex gap-4">
              <label class="label cursor-pointer">
                <input
                  type="radio"
                  name="intervalType"
                  value="measures"
                  :checked="metronome.accelerationIntervalType === 'measures'"
                  @change="setIntervalType('measures')"
                  :disabled="metronome.isPlaying"
                  class="radio radio-primary"
                />
                <span class="label-text ml-2">小節</span>
              </label>
              <label class="label cursor-pointer">
                <input
                  type="radio"
                  name="intervalType"
                  value="seconds"
                  :checked="metronome.accelerationIntervalType === 'seconds'"
                  @change="setIntervalType('seconds')"
                  :disabled="metronome.isPlaying"
                  class="radio radio-primary"
                />
                <span class="label-text ml-2">秒</span>
              </label>
            </div>

            <!-- 間隔値入力 -->
            <input
              type="number"
              :min="metronome.accelerationIntervalType === 'measures' ? 1 : 0.5"
              :max="metronome.accelerationIntervalType === 'measures' ? 16 : 60"
              :step="metronome.accelerationIntervalType === 'measures' ? 1 : 0.5"
              v-model="metronome.accelerationInterval"
              class="input input-bordered input-sm w-full"
              :disabled="metronome.isPlaying"
              @input="updateAccelerationSettings"
            />
            <div class="text-xs text-base-content/60">
              {{
                metronome.accelerationIntervalType === 'measures'
                  ? '小節ごとに加速'
                  : '秒ごとに加速'
              }}
            </div>
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
    <div class="flex justify-center gap-4 pt-4">
      <!-- 再生ボタン -->
      <button
        v-if="!metronome.isPlaying"
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

// 開始BPM調整関数
const updateStartBpmInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 40
  metronome.setAccelerationStartBpm(Math.max(40, Math.min(300, value)))
}

const adjustStartBpm = (amount: number) => {
  const newValue = metronome.accelerationStartBpm + amount
  metronome.setAccelerationStartBpm(Math.max(40, Math.min(300, newValue)))
}

// 目標BPM調整関数
const updateTargetBpmInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 40
  metronome.setAccelerationTargetBpm(Math.max(40, Math.min(300, value)))
}

const adjustTargetBpm = (amount: number) => {
  const newValue = metronome.accelerationTargetBpm + amount
  metronome.setAccelerationTargetBpm(Math.max(40, Math.min(300, newValue)))
}

// 加速設定の更新
const updateAccelerationSettings = () => {
  metronome.setAccelerationSettings(
    metronome.accelerationStartBpm,
    metronome.accelerationTargetBpm,
    metronome.accelerationInterval,
  )
}

// BPM変化量の更新
const updateAccelerationBpmChange = () => {
  metronome.setAccelerationBpmChange(metronome.accelerationBpmChange)
}

// 間隔単位の設定
const setIntervalType = (type: 'measures' | 'seconds') => {
  metronome.setAccelerationIntervalType(type)
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
