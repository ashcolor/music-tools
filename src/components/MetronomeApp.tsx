import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";
import BeatsInput from "./BeatsInput";
import BeatsDots from "./BeatsDots";
import BpmDisplay from "./BpmDisplay";
import PlaybackBar from "./PlaybackBar";
import TempoEditor from "./TempoEditor";
import VolumeControl from "./VolumeControl";
import Pendulum from "./Pendulum";

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

  return (
    <div className="flex-1 flex flex-col w-full max-w-xl mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 md:p-8">
        <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          {state.accelerationMode !== "off" && (
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="flex items-baseline gap-2 px-2 py-1 rounded hover:bg-base-200 transition-colors"
                onClick={() => bpmModalRef.current?.showModal()}
              >
                <span className="text-sm text-base-content/70">スタート</span>
                <span className="text-2xl md:text-3xl font-mono text-primary">
                  {state.accelerationStartBpm}
                </span>
              </button>
              <button
                type="button"
                className="flex items-baseline gap-1 text-sm text-base-content/70 px-2 py-1 rounded hover:bg-base-200 transition-colors"
                onClick={() => bpmModalRef.current?.showModal()}
              >
                <Icon
                  icon={
                    state.accelerationMode === "accel"
                      ? "material-symbols:trending-up-rounded"
                      : "material-symbols:trending-down-rounded"
                  }
                  width="16"
                  height="16"
                />
                <span className="font-bold text-lg md:text-xl">{state.accelerationStep}</span> BPM /{" "}
                <span className="font-bold text-lg md:text-xl">{state.accelerationInterval}</span> 小節
              </button>
              <Icon
                icon="material-symbols:keyboard-double-arrow-down-rounded"
                width="24"
                height="24"
                className="text-base-content/50"
              />
            </div>
          )}
          <BpmDisplay
            bpm={state.bpm}
            flashTick={bpmFlashTick}
            onClick={() => bpmModalRef.current?.showModal()}
          />
        </div>
        {state.showPendulum && <Pendulum />}
        <BeatsDots
          isPlaying={state.isPlaying}
          currentBeat={state.currentBeat}
          beatsPerMeasure={state.beatsPerMeasure}
          accentBeats={state.accentBeats}
          onClick={() => beatsModalRef.current?.showModal()}
        />
        </div>
      </div>

      <PlaybackBar
        isPlaying={state.isPlaying}
        isPaused={state.isPaused}
        onPlay={actions.start}
        onPause={actions.pause}
        onStop={actions.stop}
        leftSlot={<VolumeControl />}
      />

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
          <div className="flex flex-col gap-4">
            <BeatsDots
              isPlaying={state.isPlaying}
              currentBeat={state.currentBeat}
              beatsPerMeasure={state.beatsPerMeasure}
              accentBeats={state.accentBeats}
              onToggleAccent={actions.toggleAccentBeat}
            />
            <BeatsInput value={state.beatsPerMeasure} onChange={actions.setBeatsPerMeasure} />
          </div>
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
