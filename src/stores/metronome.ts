import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMetronomeStore = defineStore('metronome', () => {
  // 基本設定
  const bpm = ref(120)
  const isPlaying = ref(false)
  const timeSignature = ref(4) // 拍子
  const currentBeat = ref(0) // 現在の拍 (0から開始)
  
  // 加速機能設定
  const startBpm = ref(120)
  const targetBpm = ref(300)
  const accelerationInterval = ref(4) // 小節単位
  const isAccelerating = ref(false)
  
  // 内部状態
  let audioContext: AudioContext | null = null
  let nextNoteTime = 0.0
  const lookahead = 25.0 // 25msの先読み
  const scheduleAheadTime = 0.1 // 0.1秒先までスケジュール
  let timerID: number | null = null
  let beatCount = 0 // 合計拍数カウント
  
  // BPM制限
  const minBpm = 40
  const maxBpm = 300
  
  // 加速関連の計算
  const accelerationStep = computed(() => {
    if (startBpm.value >= targetBpm.value) return 0
    const totalMeasures = Math.ceil((targetBpm.value - startBpm.value) / 5) // 5BPM刻みで計算
    return Math.max(1, Math.ceil((targetBpm.value - startBpm.value) / totalMeasures))
  })
  
  const beatsPerMeasure = computed(() => timeSignature.value)
  const accelerationBeats = computed(() => accelerationInterval.value * beatsPerMeasure.value)
  
  // Web Audio APIの初期化
  const initAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContext
  }
  
  // クリック音の生成
  const playClick = (time: number, isAccent: boolean = false) => {
    const context = initAudioContext()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    // 1拍目はアクセント (高い音)、その他は通常音
    oscillator.frequency.value = isAccent ? 800 : 400
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.1, time)
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
    
    oscillator.start(time)
    oscillator.stop(time + 0.1)
  }
  
  // 次の音符のスケジューリング
  const scheduleNote = (beatNumber: number, time: number) => {
    const isAccent = beatNumber === 0 // 1拍目はアクセント
    playClick(time, isAccent)
    
    // 現在の拍を更新
    currentBeat.value = beatNumber
  }
  
  // 次の音符時間の計算
  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpm.value
    nextNoteTime += secondsPerBeat
    
    beatCount++
    
    // 拍子に応じて拍をリセット
    currentBeat.value = (currentBeat.value + 1) % timeSignature.value
    
    // 加速処理
    if (isAccelerating.value && accelerationBeats.value > 0) {
      if (beatCount % accelerationBeats.value === 0) {
        if (bpm.value < targetBpm.value) {
          bpm.value = Math.min(targetBpm.value, bpm.value + accelerationStep.value)
          if (bpm.value >= targetBpm.value) {
            isAccelerating.value = false
          }
        }
      }
    }
  }
  
  // スケジューラー
  const scheduler = () => {
    if (!audioContext) return
    
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
      scheduleNote(currentBeat.value, nextNoteTime)
      nextNote()
    }
    
    if (isPlaying.value) {
      timerID = window.setTimeout(scheduler, lookahead)
    }
  }
  
  // メトロノーム開始
  const start = () => {
    if (isPlaying.value) return
    
    const context = initAudioContext()
    if (context.state === 'suspended') {
      context.resume()
    }
    
    // 加速設定の確認
    if (startBpm.value !== bpm.value && startBpm.value < targetBpm.value) {
      bpm.value = startBpm.value
      isAccelerating.value = true
    } else {
      isAccelerating.value = false
    }
    
    isPlaying.value = true
    currentBeat.value = 0
    beatCount = 0
    nextNoteTime = context.currentTime
    scheduler()
  }
  
  // メトロノーム停止
  const stop = () => {
    isPlaying.value = false
    isAccelerating.value = false
    if (timerID) {
      clearTimeout(timerID)
      timerID = null
    }
    currentBeat.value = 0
    beatCount = 0
  }
  
  // BPM設定
  const setBpm = (newBpm: number) => {
    bpm.value = Math.max(minBpm, Math.min(maxBpm, newBpm))
  }
  
  // 拍子設定
  const setTimeSignature = (newTimeSignature: number) => {
    timeSignature.value = Math.max(2, Math.min(8, newTimeSignature))
    currentBeat.value = 0
  }
  
  // 加速設定の更新
  const updateAccelerationSettings = () => {
    // 設定値のバリデーション
    startBpm.value = Math.max(minBpm, Math.min(maxBpm, startBpm.value))
    targetBpm.value = Math.max(minBpm, Math.min(maxBpm, targetBpm.value))
    accelerationInterval.value = Math.max(1, Math.min(16, accelerationInterval.value))
    
    // 開始BPMが目標BPM以上の場合は調整
    if (startBpm.value >= targetBpm.value) {
      targetBpm.value = Math.min(maxBpm, startBpm.value + 20)
    }
  }
  
  return {
    // 状態
    bpm,
    isPlaying,
    timeSignature,
    currentBeat,
    startBpm,
    targetBpm,
    accelerationInterval,
    isAccelerating,
    minBpm,
    maxBpm,
    
    // 計算プロパティ
    beatsPerMeasure,
    accelerationBeats,
    
    // アクション
    start,
    stop,
    setBpm,
    setTimeSignature,
    updateAccelerationSettings
  }
})