import { useMetronome } from '@/contexts/MetronomeContext'
import BPMInput from './BPMInput'
import BeatsInput from './BeatsInput'
import BeatsDots from './BeatsDots'
import DoubleArrowIcon from './Icons/DoubleArrowIcon'
import PlayIcon from './Icons/PlayIcon'
import StopIcon from './Icons/StopIcon'
import PauseIcon from './Icons/PauseIcon'
import AccelerationStepInput from './AccelerationStepInput'
import AccelerationIntervalInput from './AccelerationIntervalInput'

export default function MetronomeApp() {
  const { state, actions } = useMetronome()

  return (
    <div className="bg-base-100 max-w-xl mx-auto p-8 rounded-lg shadow-lg gap-8 flex flex-col items-center">
      <div className="indicator">
        <span className="indicator-item indicator-center badge badge-secondary">加速機能付き</span>
        <h1 className="text-3xl font-bold mt-4">メトロノーム</h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-primary-content">{state.bpm}</div>
          <div className="text-lg text-neutral">BPM</div>
        </div>
        <BeatsDots
          isPlaying={state.isPlaying}
          currentBeat={state.currentBeat}
          beatsPerMeasure={state.beatsPerMeasure}
        />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <label className="label-text text-sm">テンポ</label>
          <div className="flex flex-row gap-4 items-center">
            <div className="col-span-2">
              <div className="text-center font-bold text-sm">START</div>
              <BPMInput
                value={state.accelerationStartBpm}
                onChange={actions.setAccelerationStartBpm}
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <DoubleArrowIcon />
            </div>
            <div className="col-span-2">
              <div className="text-center font-bold text-sm">GOAL</div>
              <BPMInput
                value={state.accelerationTargetBpm}
                onChange={actions.setAccelerationTargetBpm}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="label-text text-sm">加速</label>
          <div className="flex flex-row gap-1 items-center justify-center">
            <AccelerationIntervalInput
              value={state.accelerationInterval}
              onChange={actions.setAccelerationInterval}
            />
            <span className="shrink-0">小節ごとに</span>
            <AccelerationStepInput
              value={state.accelerationStep}
              onChange={actions.setAccelerationStep}
            />
            <span className="shrink-0">BPM変化</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="label-text text-sm">拍子</label>
          <BeatsInput value={state.beatsPerMeasure} onChange={actions.setBeatsPerMeasure} />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        {(!state.isPlaying || state.isPaused) && (
          <button className="btn btn-lg rounded-2xl btn-primary" onClick={actions.start}>
            <PlayIcon />
          </button>
        )}

        {state.isPlaying && (
          <button className="btn btn-lg rounded-2xl btn-primary" onClick={actions.pause}>
            <PauseIcon />
          </button>
        )}

        {state.isPlaying && (
          <button className="btn btn-lg rounded-2xl btn-accent" onClick={actions.stop}>
            <StopIcon />
          </button>
        )}
      </div>
    </div>
  )
}
