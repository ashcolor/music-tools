import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMetronomeStore = defineStore('metronome', () => {
  // 状態
  const bpm = ref(120)
  const isPlaying = ref(false)
  const currentBeat = ref(0)
  const beatsPerMeasure = ref(4)

  // 加速機能の状態
  const isAccelerating = ref(false)
  const accelerationStartBpm = ref(120)
  const accelerationTargetBpm = ref(160)
  const accelerationInterval = ref(4) // 何小節ごとに加速するか
  const accelerationStep = ref(1) // 1回の加速でのBPM増加量
  const accelerationBeatCount = ref(0) // 加速用の拍カウンター

  // Web Audio Context
  let audioContext: AudioContext | null = null
  let intervalId: number | null = null

  // 計算されたプロパティ
  const intervalMs = computed(() => 60000 / bpm.value)

  // Audio Contextの初期化
  const initAudioContext = async () => {
    if (!audioContext) {
      audioContext = new AudioContext()
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
    }
  }

  // クリック音を生成する関数
  const playClick = (isAccent = false) => {
    if (!audioContext) return

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // アクセント（1拍目）は高い音、その他は低い音
    oscillator.frequency.setValueAtTime(isAccent ? 800 : 400, audioContext.currentTime)
    oscillator.type = 'square'

    // 音量の設定
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  // メトロノームを開始
  const start = async () => {
    if (isPlaying.value) return

    await initAudioContext()
    isPlaying.value = true
    currentBeat.value = 0
    accelerationBeatCount.value = 0

    // 開始BPMが現在のBPMと異なる場合は開始BPMに設定し、加速を有効化
    if (
      accelerationStartBpm.value !== bpm.value &&
      accelerationStartBpm.value < accelerationTargetBpm.value
    ) {
      setBpm(accelerationStartBpm.value)
      isAccelerating.value = true
    }

    const tick = () => {
      currentBeat.value = (currentBeat.value % beatsPerMeasure.value) + 1
      const isAccent = currentBeat.value === 1
      playClick(isAccent)

      // 加速機能：1拍目がなった後に加速処理を実行
      if (isAccelerating.value && isAccent) {
        accelerationBeatCount.value++
        // 小節単位での計算：間隔 × 拍子数 = 必要な拍数 (実際は小節数のカウント)
        if (accelerationBeatCount.value >= accelerationInterval.value) {
          accelerationBeatCount.value = 0
          if (bpm.value < accelerationTargetBpm.value) {
            const newBpm = Math.min(bpm.value + accelerationStep.value, accelerationTargetBpm.value)
            setBpm(newBpm)
          } else {
            // 目標BPMに到達したら加速停止
            isAccelerating.value = false
          }
        }
      }
    }

    // 最初の音をすぐに再生
    tick()

    // インターバルを設定
    intervalId = window.setInterval(tick, intervalMs.value)
  }

  // メトロノームを停止
  const stop = () => {
    if (!isPlaying.value) return

    isPlaying.value = false
    currentBeat.value = 0
    isAccelerating.value = false
    accelerationBeatCount.value = 0

    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // BPMを設定
  const setBpm = (newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(200, newBpm))
    bpm.value = clampedBpm

    // 再生中の場合はインターバルを更新
    if (isPlaying.value && intervalId !== null) {
      clearInterval(intervalId)

      const tick = () => {
        currentBeat.value = (currentBeat.value % beatsPerMeasure.value) + 1
        const isAccent = currentBeat.value === 1
        playClick(isAccent)

        // 加速機能：1拍目がなった後に加速処理を実行
        if (isAccelerating.value && isAccent) {
          accelerationBeatCount.value++
          // 小節単位での計算：間隔 × 拍子数 = 必要な拍数 (実際は小節数のカウント)
          if (accelerationBeatCount.value >= accelerationInterval.value) {
            accelerationBeatCount.value = 0
            if (bpm.value < accelerationTargetBpm.value) {
              const newBpm = Math.min(
                bpm.value + accelerationStep.value,
                accelerationTargetBpm.value,
              )
              setBpm(newBpm)
            } else {
              // 目標BPMに到達したら加速停止
              isAccelerating.value = false
            }
          }
        }
      }

      intervalId = window.setInterval(tick, intervalMs.value)
    }
  }

  // 拍子を設定
  const setBeatsPerMeasure = (beats: number) => {
    beatsPerMeasure.value = Math.max(1, Math.min(8, beats))
    currentBeat.value = 0
  }

  // トグル（再生/停止）
  const toggle = () => {
    if (isPlaying.value) {
      stop()
    } else {
      start()
    }
  }

  // 加速設定
  const setAccelerationSettings = (
    startBpm: number,
    targetBpm: number,
    intervalMeasures: number,
  ) => {
    accelerationStartBpm.value = Math.max(40, Math.min(200, startBpm))
    accelerationTargetBpm.value = Math.max(40, Math.min(200, targetBpm))
    accelerationInterval.value = Math.max(1, Math.min(16, intervalMeasures)) // 1-16小節の範囲

    // 開始BPMが目標BPMより大きい場合はエラー
    if (accelerationStartBpm.value >= accelerationTargetBpm.value) {
      accelerationTargetBpm.value = accelerationStartBpm.value + 10
    }

    // ステップサイズを計算（総変化量を約20等分）
    const totalChange = accelerationTargetBpm.value - accelerationStartBpm.value
    accelerationStep.value = Math.max(1, Math.min(10, Math.ceil(totalChange / 20)))
  }

  // 加速パラメータを個別に設定
  const setAccelerationStartBpm = (startBpm: number) => {
    accelerationStartBpm.value = Math.max(40, Math.min(200, startBpm))
    updateAccelerationStep()
  }

  const setAccelerationTargetBpm = (targetBpm: number) => {
    accelerationTargetBpm.value = Math.max(40, Math.min(200, targetBpm))
    updateAccelerationStep()
  }

  const setAccelerationInterval = (intervalMeasures: number) => {
    accelerationInterval.value = Math.max(1, Math.min(16, intervalMeasures))
  }

  // ステップサイズを更新
  const updateAccelerationStep = () => {
    if (accelerationStartBpm.value < accelerationTargetBpm.value) {
      const totalChange = accelerationTargetBpm.value - accelerationStartBpm.value
      accelerationStep.value = Math.max(1, Math.min(10, Math.ceil(totalChange / 20)))
    }
  }

  // 加速開始
  const startAcceleration = (startBpm: number, targetBpm: number, intervalMeasures: number) => {
    setAccelerationSettings(startBpm, targetBpm, intervalMeasures)

    // 初期BPMに設定
    setBpm(accelerationStartBpm.value)

    isAccelerating.value = true
    accelerationBeatCount.value = 0
  }

  // 加速停止
  const stopAcceleration = () => {
    isAccelerating.value = false
    accelerationBeatCount.value = 0
  }

  return {
    // 状態
    bpm,
    isPlaying,
    currentBeat,
    beatsPerMeasure,
    intervalMs,

    // 加速機能の状態
    isAccelerating,
    accelerationStartBpm,
    accelerationTargetBpm,
    accelerationInterval,
    accelerationStep,

    // アクション
    start,
    stop,
    toggle,
    setBpm,
    setBeatsPerMeasure,

    // 加速機能のアクション
    setAccelerationSettings,
    setAccelerationStartBpm,
    setAccelerationTargetBpm,
    setAccelerationInterval,
    stopAcceleration,
  }
})
