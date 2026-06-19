import { useEffect, useRef, useState } from "react";
import { useMetronome } from "@/contexts/MetronomeContext";

const TRACK_WIDTH_REM = 12;
const INDICATOR_WIDTH_REM = 0.75;
const SWING_REM = (TRACK_WIDTH_REM - INDICATOR_WIDTH_REM) / 2;

export default function Pendulum() {
  const { state } = useMetronome();
  const { isPlaying, currentBeat, bpm } = state;

  const [tick, setTick] = useState(0);
  const prevBeatRef = useRef(0);

  useEffect(() => {
    if (currentBeat === 0) {
      prevBeatRef.current = 0;
      setTick(0);
      return;
    }
    if (currentBeat !== prevBeatRef.current) {
      prevBeatRef.current = currentBeat;
      setTick((n) => n + 1);
    }
  }, [currentBeat]);

  const isActive = isPlaying && tick > 0;
  const animationName = tick % 2 === 1 ? "pendulum-right" : "pendulum-left";
  const duration = 60 / bpm;

  return (
    <div
      className="relative flex items-center justify-center"
      style={
        {
          width: `${TRACK_WIDTH_REM}rem`,
          height: `${INDICATOR_WIDTH_REM * 2}rem`,
          ["--pendulum-swing" as string]: `${SWING_REM}rem`,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <div className="absolute inset-0 bg-base-content/10 rounded-full" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-base-content/40" />
      <div
        key={isActive ? `tick-${tick}` : "idle"}
        className="absolute left-1/2 top-0 bottom-0 bg-primary rounded-full"
        style={{
          width: `${INDICATOR_WIDTH_REM}rem`,
          animation: isActive ? `${animationName} ${duration}s linear` : "none",
          transform: isActive ? undefined : "translateX(-50%)",
        }}
      />
    </div>
  );
}
