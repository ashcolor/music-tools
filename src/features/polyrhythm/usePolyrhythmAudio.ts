import { useCallback, useEffect, useRef } from "react";
import type { RhythmSettings, Sound } from "./RhythmSettings";

const SCHEDULER_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_TIME = 0.1;

const ELECTRONIC_FREQ: Record<"electronicLow" | "electronicMid" | "electronicHigh", number> = {
  electronicLow: 300,
  electronicMid: 500,
  electronicHigh: 800,
};

type Args = {
  bpm: number;
  rhythms: RhythmSettings[];
};

export function usePolyrhythmAudio({ bpm, rhythms }: Args) {
  const stateRef = useRef({ bpm, rhythms });
  useEffect(() => {
    stateRef.current = { bpm, rhythms };
  }, [bpm, rhythms]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const schedulerIdRef = useRef<number | null>(null);
  const nextTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const lastBpmRef = useRef(0);
  const lastBeatsRef = useRef<number[]>([]);

  const ensureNoiseBuffer = useCallback((ctx: AudioContext) => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const length = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = buffer;
    return buffer;
  }, []);

  const playElectronic = useCallback(
    (
      ctx: AudioContext,
      destination: AudioNode,
      time: number,
      sound: "electronicLow" | "electronicMid" | "electronicHigh",
      volume: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(ELECTRONIC_FREQ[sound], time);
      gain.gain.setValueAtTime(volume * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
    },
    [],
  );

  const playBassDrum = useCallback(
    (ctx: AudioContext, destination: AudioNode, time: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
      gain.gain.setValueAtTime(volume * 1.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.start(time);
      osc.stop(time + 0.25);
    },
    [],
  );

  const playSnare = useCallback(
    (ctx: AudioContext, destination: AudioNode, time: number, volume: number) => {
      const noise = ctx.createBufferSource();
      noise.buffer = ensureNoiseBuffer(ctx);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(1000, time);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.7, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(destination);
      noise.start(time);
      noise.stop(time + 0.2);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, time);
      oscGain.gain.setValueAtTime(volume * 0.4, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.connect(oscGain);
      oscGain.connect(destination);
      osc.start(time);
      osc.stop(time + 0.15);
    },
    [ensureNoiseBuffer],
  );

  const playHiHat = useCallback(
    (ctx: AudioContext, destination: AudioNode, time: number, volume: number) => {
      const noise = ctx.createBufferSource();
      noise.buffer = ensureNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(7000, time);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      noise.start(time);
      noise.stop(time + 0.08);
    },
    [ensureNoiseBuffer],
  );

  const playSound = useCallback(
    (time: number, sound: Sound, volume: number, pan: number) => {
      const ctx = audioContextRef.current;
      if (!ctx || volume <= 0) return;
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, time);
      panner.connect(ctx.destination);

      switch (sound) {
        case "electronicLow":
        case "electronicMid":
        case "electronicHigh":
          playElectronic(ctx, panner, time, sound, volume);
          break;
        case "bassDrum":
          playBassDrum(ctx, panner, time, volume);
          break;
        case "snare":
          playSnare(ctx, panner, time, volume);
          break;
        case "hiHat":
          playHiHat(ctx, panner, time, volume);
          break;
      }
    },
    [playElectronic, playBassDrum, playSnare, playHiHat],
  );

  const advanceScheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const horizon = ctx.currentTime + SCHEDULE_AHEAD_TIME;
    const { bpm: curBpm, rhythms: curRhythms } = stateRef.current;
    const startTime = startTimeRef.current;

    if (nextTimesRef.current.length < curRhythms.length) {
      const now = ctx.currentTime;
      while (nextTimesRef.current.length < curRhythms.length) {
        nextTimesRef.current.push(now);
        lastBeatsRef.current.push(0);
      }
    } else if (nextTimesRef.current.length > curRhythms.length) {
      nextTimesRef.current.length = curRhythms.length;
      lastBeatsRef.current.length = curRhythms.length;
    }

    const bpmChanged = lastBpmRef.current !== curBpm;
    lastBpmRef.current = curBpm;

    curRhythms.forEach((rhythm, i) => {
      const interval = 60 / (curBpm * rhythm.beats);
      if (bpmChanged || lastBeatsRef.current[i] !== rhythm.beats) {
        const k = Math.ceil((ctx.currentTime - startTime) / interval - 1e-6);
        nextTimesRef.current[i] = startTime + Math.max(0, k) * interval;
        lastBeatsRef.current[i] = rhythm.beats;
      }
      while (nextTimesRef.current[i] < horizon) {
        playSound(nextTimesRef.current[i], rhythm.sound, rhythm.volume, rhythm.pan);
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
    lastBeatsRef.current = stateRef.current.rhythms.map(() => 0);
    nextTimesRef.current = stateRef.current.rhythms.map(() => startTime);

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

  const getPlayheadTime = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return null;
    return ctx.currentTime - startTimeRef.current;
  }, []);

  return { start, pause, stop, getPlayheadTime };
}
