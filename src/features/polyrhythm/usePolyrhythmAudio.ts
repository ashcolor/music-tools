import { useCallback, useEffect, useRef } from "react";
import type { Pitch, SideSettings } from "./PolyrhythmSideSettings";

const SCHEDULER_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_TIME = 0.1;

const PITCH_FREQ: Record<Pitch, number> = {
  low: 300,
  mid: 500,
  high: 800,
};

type Args = {
  bpm: number;
  sides: SideSettings[];
};

export function usePolyrhythmAudio({ bpm, sides }: Args) {
  const stateRef = useRef({ bpm, sides });
  useEffect(() => {
    stateRef.current = { bpm, sides };
  }, [bpm, sides]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerIdRef = useRef<number | null>(null);
  const nextTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const lastBpmRef = useRef(0);
  const lastBeatsRef = useRef<number[]>([]);

  const playSound = useCallback(
    (time: number, pitch: Pitch, volume: number, pan: number) => {
      const ctx = audioContextRef.current;
      if (!ctx || volume <= 0) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(PITCH_FREQ[pitch], time);
      panner.pan.setValueAtTime(pan, time);
      gain.gain.setValueAtTime(volume * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
    },
    [],
  );

  const advanceScheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const horizon = ctx.currentTime + SCHEDULE_AHEAD_TIME;
    const { bpm: curBpm, sides: curSides } = stateRef.current;
    const startTime = startTimeRef.current;

    if (nextTimesRef.current.length < curSides.length) {
      const now = ctx.currentTime;
      while (nextTimesRef.current.length < curSides.length) {
        nextTimesRef.current.push(now);
        lastBeatsRef.current.push(0);
      }
    } else if (nextTimesRef.current.length > curSides.length) {
      nextTimesRef.current.length = curSides.length;
      lastBeatsRef.current.length = curSides.length;
    }

    const bpmChanged = lastBpmRef.current !== curBpm;
    lastBpmRef.current = curBpm;

    curSides.forEach((side, i) => {
      const interval = 60 / (curBpm * side.beats);
      if (bpmChanged || lastBeatsRef.current[i] !== side.beats) {
        const k = Math.ceil((ctx.currentTime - startTime) / interval - 1e-6);
        nextTimesRef.current[i] = startTime + Math.max(0, k) * interval;
        lastBeatsRef.current[i] = side.beats;
      }
      while (nextTimesRef.current[i] < horizon) {
        playSound(nextTimesRef.current[i], side.pitch, side.volume, side.pan);
        nextTimesRef.current[i] += interval;
      }
    });
  }, [playSound]);

  const stopAudioClock = useCallback(() => {
    if (schedulerIdRef.current !== null) {
      window.clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    const startTime = audioContextRef.current.currentTime;
    startTimeRef.current = startTime;
    lastBpmRef.current = 0;
    lastBeatsRef.current = stateRef.current.sides.map(() => 0);
    nextTimesRef.current = stateRef.current.sides.map(() => startTime);

    advanceScheduler();
    if (schedulerIdRef.current === null) {
      schedulerIdRef.current = window.setInterval(advanceScheduler, SCHEDULER_INTERVAL_MS);
    }
  }, [advanceScheduler]);

  const pause = useCallback(() => {
    stopAudioClock();
  }, [stopAudioClock]);

  const stop = useCallback(() => {
    stopAudioClock();
  }, [stopAudioClock]);

  useEffect(() => {
    return () => {
      stopAudioClock();
    };
  }, [stopAudioClock]);

  return { start, pause, stop };
}
