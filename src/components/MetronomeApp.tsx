import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome, effectiveTargetBpm } from "@/contexts/MetronomeContext";
import BeatsInput from "./BeatsInput";
import BeatsDots from "./BeatsDots";
import TempoEditor from "./TempoEditor";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullscreenButton";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export default function MetronomeApp() {
  const { state, actions } = useMetronome();
  const beatsModalRef = useRef<HTMLDialogElement>(null);
  const bpmModalRef = useRef<HTMLDialogElement>(null);
  const lastNonZeroVolumeRef = useRef(state.volume > 0 ? state.volume : 0.3);
  const previousBpmRef = useRef(state.bpm);
  const [bpmFlashTick, setBpmFlashTick] = useState(0);

  useEffect(() => {
    if (state.volume > 0) {
      lastNonZeroVolumeRef.current = state.volume;
    }
  }, [state.volume]);

  useEffect(() => {
    if (state.bpm > previousBpmRef.current) {
      setBpmFlashTick((tick) => tick + 1);
    }
    previousBpmRef.current = state.bpm;
  }, [state.bpm]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isEditableTarget(event.target)) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (state.isPlaying) {
          actions.pause();
        } else {
          void actions.start();
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "r") {
        event.preventDefault();
        actions.stop();
        return;
      }

      if (key === "m") {
        event.preventDefault();
        if (state.volume > 0) {
          actions.setVolume(0);
        } else {
          actions.setVolume(lastNonZeroVolumeRef.current);
        }
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        actions.setBpm(state.bpm + 1);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        actions.setBpm(state.bpm - 1);
        return;
      }

      if (/^[1-9]$/.test(event.key)) {
        event.preventDefault();
        actions.setBeatsPerMeasure(Number(event.key));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions, state.bpm, state.isPlaying, state.volume]);

  const playPauseButton =
    state.isPlaying && !state.isPaused ? (
      <button className="btn btn-circle btn-secondary size-20" onClick={actions.pause}>
        <Icon icon="material-symbols:pause-rounded" width="q48" height="48" />
      </button>
    ) : (
      <button className="btn btn-circle btn-primary size-20" onClick={actions.start}>
        <Icon icon="material-symbols:play-arrow-rounded" width="48" height="48" />
      </button>
    );

  const resetButton = (
    <button className="btn btn-circle btn-secondary btn-outline" onClick={actions.stop} aria-label="停止">
      <Icon icon="material-symbols:stop-rounded" width="24" height="24" />
    </button>
  );

  const isIdle = !state.isPlaying && !state.isPaused;

  const playbackBar = (
    <div className="grid grid-cols-3 items-center w-full max-w-xl px-4 py-2">
      <div className="flex justify-start">
        <VolumeControl />
      </div>
      <div className="flex justify-center">
        <div className="relative">
          {!isIdle && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4">
              {resetButton}
            </div>
          )}
          {playPauseButton}
        </div>
      </div>
      <div className="flex justify-end">
        <FullscreenButton />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col w-full max-w-xl mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-6">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:gap-4">
          <div className="flex justify-self-end items-center gap-2 md:gap-4">
            {state.accelerationMode !== "off" && (
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
          </div>
          <div
            className="relative rounded-full border border-primary/30 w-48 h-48 md:w-56 md:h-56 flex items-center justify-center shrink-0 cursor-pointer hover:bg-base-200 transition-colors"
            onClick={() => bpmModalRef.current?.showModal()}
          >
            <input
              key={`bpm-${bpmFlashTick}`}
              type="number"
              min={10}
              max={999}
              value={state.bpm}
              readOnly
              className={`pointer-events-none w-32 md:w-36 bg-transparent text-center text-5xl md:text-6xl font-mono font-bold text-primary focus:text-primary focus:outline-none ${bpmFlashTick > 0 ? "bpm-scale-flash" : ""}`}
              aria-label="テンポ"
            />
            <button
              type="button"
              className="pointer-events-none absolute bottom-6 md:bottom-8 text-lg text-base-content/50"
            >
              BPM
            </button>
          </div>
          <div className="flex justify-self-start items-center gap-2 md:gap-4">
            {state.accelerationMode !== "off" && (
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
                  {effectiveTargetBpm(state)}
                </button>
              </>
            )}
          </div>
        </div>
        <BeatsDots
          isPlaying={state.isPlaying}
          currentBeat={state.currentBeat}
          beatsPerMeasure={state.beatsPerMeasure}
          onClick={() => beatsModalRef.current?.showModal()}
        />
        </div>
      </div>

      <div className="border-t border-base-300 flex justify-center">{playbackBar}</div>

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
