import { useCallback, useEffect, useRef } from "react";
import { Note } from "tonal";

type SampleMap = Record<string, string>;

export const PIANO_SAMPLES: SampleMap = {
  C2: "/audio/piano-c2.mp3",
  C3: "/audio/piano-c3.mp3",
  C4: "/audio/piano-c4.mp3",
  C5: "/audio/piano-c5.mp3",
};

type LoadedSample = {
  buffer: AudioBuffer;
  midi: number;
};

function findNearestSample(samples: LoadedSample[], targetMidi: number) {
  let nearest = samples[0];
  let minDiff = Math.abs(samples[0].midi - targetMidi);
  for (let i = 1; i < samples.length; i++) {
    const diff = Math.abs(samples[i].midi - targetMidi);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = samples[i];
    }
  }
  return nearest;
}

export function useSampler(sampleMap: SampleMap = PIANO_SAMPLES) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const samplesRef = useRef<LoadedSample[]>([]);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      const gain = audioContextRef.current.createGain();
      gain.gain.value = 1;
      gain.connect(audioContextRef.current.destination);
      masterGainRef.current = gain;
    }
    return audioContextRef.current;
  }, []);

  const loadSamples = useCallback(async () => {
    if (loadPromiseRef.current) return loadPromiseRef.current;
    const ctx = ensureContext();
    const entries = Object.entries(sampleMap);
    loadPromiseRef.current = (async () => {
      const loaded: LoadedSample[] = await Promise.all(
        entries.map(async ([noteName, url]) => {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          const buffer = await ctx.decodeAudioData(arrayBuffer);
          const midi = Note.midi(noteName);
          if (midi === null) throw new Error(`Invalid sample note: ${noteName}`);
          return { buffer, midi };
        }),
      );
      samplesRef.current = loaded.sort((a, b) => a.midi - b.midi);
    })();
    return loadPromiseRef.current;
  }, [ensureContext, sampleMap]);

  const triggerAttackRelease = useCallback(
    (note: string, durationSec: number, when: number = 0) => {
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master || samplesRef.current.length === 0) return;
      const targetMidi = Note.midi(note);
      if (targetMidi === null) return;
      const sample = findNearestSample(samplesRef.current, targetMidi);
      const playbackRate = 2 ** ((targetMidi - sample.midi) / 12);

      const source = ctx.createBufferSource();
      source.buffer = sample.buffer;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0.7;

      const startTime = ctx.currentTime + Math.max(0, when);
      const stopTime = startTime + durationSec;

      gain.gain.setValueAtTime(0.7, stopTime - 0.05);
      gain.gain.linearRampToValueAtTime(0, stopTime);

      source.connect(gain);
      gain.connect(master);

      source.start(startTime);
      source.stop(stopTime + 0.1);

      activeSourcesRef.current.add(source);
      source.onended = () => {
        activeSourcesRef.current.delete(source);
      };
    },
    [],
  );

  const stopAll = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    });
    activeSourcesRef.current.clear();
  }, []);

  const resume = useCallback(async () => {
    const ctx = ensureContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    await loadSamples();
  }, [ensureContext, loadSamples]);

  const suspend = useCallback(async () => {
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "running") {
      await ctx.suspend();
    }
  }, []);

  const setMasterVolume = useCallback((v: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, v));
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    return audioContextRef.current?.currentTime ?? 0;
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    triggerAttackRelease,
    stopAll,
    resume,
    suspend,
    setMasterVolume,
    getCurrentTime,
  };
}
