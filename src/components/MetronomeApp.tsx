import { useRef } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";
import BeatsInput from "./BeatsInput";
import BeatsDots from "./BeatsDots";
import TempoEditor from "./TempoEditor";

export default function MetronomeApp() {
  const { state, actions } = useMetronome();
  const beatsModalRef = useRef<HTMLDialogElement>(null);
  const bpmModalRef = useRef<HTMLDialogElement>(null);

  const playPauseButton =
    state.isPlaying && !state.isPaused ? (
      <button className="btn btn-circle btn-primary w-16 h-16" onClick={actions.pause}>
        <Icon icon="material-symbols:pause-rounded" width="48" height="48" />
      </button>
    ) : (
      <button className="btn btn-circle btn-primary w-16 h-16" onClick={actions.start}>
        <Icon icon="material-symbols:play-arrow-rounded" width="48" height="48" />
      </button>
    );

  const resetButton = (
    <button className="btn btn-circle btn-ghost" onClick={actions.stop} aria-label="リセット">
      <Icon icon="material-symbols:replay-rounded" width="24" height="24" />
    </button>
  );

  const isIdle = !state.isPlaying && !state.isPaused;

  const playbackBar = (
    <div className="grid grid-cols-3 items-center w-full max-w-xl px-4">
      <div className="flex justify-start">{!isIdle && resetButton}</div>
      <div className="flex justify-center">{playPauseButton}</div>
      <div />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 gap-8 flex flex-col items-center">
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
          {state.accelerationEnabled && (
            <>
              <button
                type="button"
                className="text-2xl md:text-3xl font-mono text-primary px-2 py-1 rounded hover:bg-base-200 transition-colors"
                onClick={() => bpmModalRef.current?.showModal()}
              >
                {state.accelerationStartBpm}
              </button>
              <Icon
                icon="material-symbols:double-arrow-rounded"
                width="24"
                height="24"
                className="text-base-content/50"
              />
            </>
          )}
          <button
            type="button"
            className="relative rounded-full border border-primary/30 w-48 h-48 md:w-56 md:h-56 flex items-center justify-center shrink-0 hover:bg-base-200 transition-colors cursor-pointer"
            onClick={() => bpmModalRef.current?.showModal()}
          >
            <span className="text-5xl md:text-6xl font-mono font-bold text-primary">
              {state.bpm}
            </span>
            <span className="absolute bottom-8 md:bottom-10 text-lg text-base-content/50">
              BPM
            </span>
          </button>
          {state.accelerationEnabled && (
            <>
              <Icon
                icon="material-symbols:double-arrow-rounded"
                width="24"
                height="24"
                className="text-base-content/50"
              />
              <button
                type="button"
                className="text-2xl md:text-3xl font-mono text-primary px-2 py-1 rounded hover:bg-base-200 transition-colors"
                onClick={() => bpmModalRef.current?.showModal()}
              >
                {state.accelerationTargetBpm}
              </button>
            </>
          )}
        </div>
        <BeatsDots
          isPlaying={state.isPlaying}
          currentBeat={state.currentBeat}
          beatsPerMeasure={state.beatsPerMeasure}
          onClick={() => beatsModalRef.current?.showModal()}
        />
      </div>

      <div className="hidden md:flex justify-center pt-4 w-full">{playbackBar}</div>

      <div className="md:hidden fixed bottom-0 inset-x-0 bg-base-100 border-t border-base-300 flex justify-center py-3 z-20">
        {playbackBar}
      </div>

      <dialog ref={bpmModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">テンポ</h3>
          <TempoEditor />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog ref={beatsModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">拍子</h3>
          <BeatsInput value={state.beatsPerMeasure} onChange={actions.setBeatsPerMeasure} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
