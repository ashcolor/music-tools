import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import FullscreenButton from "./FullscreenButton";

type PlaybackBarProps = {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export default function PlaybackBar({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  leftSlot,
  rightSlot = <FullscreenButton />,
}: PlaybackBarProps) {
  const isIdle = !isPlaying && !isPaused;
  const playPauseButton =
    isPlaying && !isPaused ? (
      <button className="btn btn-circle btn-secondary size-20" onClick={onPause}>
        <Icon icon="material-symbols:pause-rounded" width="48" height="48" />
      </button>
    ) : (
      <button className="btn btn-circle btn-primary size-20" onClick={onPlay}>
        <Icon icon="material-symbols:play-arrow-rounded" width="48" height="48" />
      </button>
    );

  return (
    <div className="sticky bottom-0 z-10 border-t border-base-300 bg-base-100 flex justify-center">
      <div className="grid grid-cols-3 items-center w-full max-w-xl px-4 py-2">
        <div className="flex justify-start">{leftSlot}</div>
        <div className="flex justify-center">
          <div className="relative">
            {!isIdle && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4">
                <button
                  className="btn btn-circle btn-secondary btn-outline"
                  onClick={onStop}
                  aria-label="停止"
                >
                  <Icon icon="material-symbols:stop-rounded" width="24" height="24" />
                </button>
              </div>
            )}
            {playPauseButton}
          </div>
        </div>
        <div className="flex justify-end">{rightSlot}</div>
      </div>
    </div>
  );
}
