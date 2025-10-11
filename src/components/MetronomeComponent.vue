<template>
  <div class="min-h-screen bg-base-100 flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-200 shadow-xl">
      <div class="card-body space-y-8">
        <!-- タイトル -->
        <h1 class="text-3xl font-bold text-center text-primary">メトロノーム</h1>
        
        <!-- メイン表示エリア -->
        <div class="text-center space-y-4">
          <!-- BPM表示 -->
          <div class="text-5xl font-bold text-primary">
            {{ metronome.bpm }} BPM
          </div>
          
          <!-- 拍子ドット表示 -->
          <div class="flex justify-center space-x-2">
            <div
              v-for="beat in metronome.timeSignature"
              :key="beat"
              :class="getBeatDotClass(beat - 1)"
              class="w-4 h-4 rounded-full transition-all duration-200"
            ></div>
          </div>
        </div>
        
        <!-- コントロールエリア -->
        <div class="space-y-6">
          <!-- BPMスライダー -->
          <div class="space-y-2">
            <label class="text-sm font-medium">BPM</label>
            <div class="flex items-center space-x-3">
              <button
                @click="adjustBpm(-1)"
                class="btn btn-sm btn-circle btn-outline rounded-full"
              >
                -
              </button>
              <input
                type="range"
                :min="metronome.minBpm"
                :max="metronome.maxBpm"
                v-model.number="metronome.bpm"
                class="range range-primary flex-1"
              />
              <button
                @click="adjustBpm(1)"
                class="btn btn-sm btn-circle btn-outline rounded-full"
              >
                +
              </button>
            </div>
          </div>
          
          <!-- 拍子選択 -->
          <div class="space-y-2">
            <label class="text-sm font-medium">拍子</label>
            <div class="flex justify-center space-x-2">
              <button
                v-for="signature in [2, 3, 4, 5, 6, 7, 8]"
                :key="signature"
                @click="metronome.setTimeSignature(signature)"
                :class="signature === metronome.timeSignature ? 'btn-primary' : 'btn-outline'"
                class="btn btn-sm btn-circle rounded-full"
              >
                {{ signature }}
              </button>
            </div>
          </div>
          
          <!-- 加速機能設定 -->
          <div class="space-y-4">
            <label class="text-sm font-medium">加速設定</label>
            
            <!-- 開始BPM → 目標BPM -->
            <div class="flex items-center space-x-3">
              <div class="flex-1">
                <label class="text-xs text-base-content/70">開始BPM</label>
                <input
                  type="number"
                  v-model.number="metronome.startBpm"
                  @input="metronome.updateAccelerationSettings"
                  :min="metronome.minBpm"
                  :max="metronome.maxBpm"
                  class="input input-bordered input-sm w-full"
                />
              </div>
              
              <!-- 矢印アイコン -->
              <div class="flex items-center justify-center">
                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5-5 5M6 12h12"></path>
                </svg>
              </div>
              
              <div class="flex-1">
                <label class="text-xs text-base-content/70">目標BPM</label>
                <input
                  type="number"
                  v-model.number="metronome.targetBpm"
                  @input="metronome.updateAccelerationSettings"
                  :min="metronome.minBpm"
                  :max="metronome.maxBpm"
                  class="input input-bordered input-sm w-full"
                />
              </div>
            </div>
            
            <!-- 間隔設定 -->
            <div>
              <label class="text-xs text-base-content/70">間隔 (小節)</label>
              <input
                type="number"
                v-model.number="metronome.accelerationInterval"
                @input="metronome.updateAccelerationSettings"
                :min="1"
                :max="16"
                class="input input-bordered input-sm w-full"
              />
            </div>
          </div>
        </div>
        
        <!-- 開始/停止ボタン -->
        <div class="pt-4">
          <button
            @click="toggleMetronome"
            :class="metronome.isPlaying ? 'btn-error' : 'btn-primary'"
            class="btn btn-lg w-full rounded-2xl"
          >
            <svg v-if="!metronome.isPlaying" class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            {{ metronome.isPlaying ? '停止' : '開始' }}
          </button>
        </div>
        
        <!-- 加速中インジケーター -->
        <div v-if="metronome.isAccelerating" class="text-center">
          <div class="badge badge-primary">加速中</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMetronomeStore } from '../stores/metronome'

const metronome = useMetronomeStore()

// BPM調整
const adjustBpm = (delta: number) => {
  metronome.setBpm(metronome.bpm + delta)
}

// メトロノームの開始/停止
const toggleMetronome = () => {
  if (metronome.isPlaying) {
    metronome.stop()
  } else {
    metronome.start()
  }
}

// 拍子ドットのクラス計算
const getBeatDotClass = (beatIndex: number) => {
  const isCurrentBeat = beatIndex === metronome.currentBeat
  const isFirstBeat = beatIndex === 0
  
  if (!metronome.isPlaying) {
    return 'bg-base-300' // 停止中はグレー
  }
  
  if (isCurrentBeat) {
    if (isFirstBeat) {
      return 'bg-red-500 animate-pulse scale-125' // 1拍目は赤色
    } else {
      return 'bg-green-500 animate-pulse scale-125' // その他の拍は緑色
    }
  }
  
  return 'bg-base-300' // 非アクティブはグレー
}
</script>