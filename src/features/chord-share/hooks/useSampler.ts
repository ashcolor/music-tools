import { useCallback, useEffect, useRef } from "react";
import { Note } from "tonal";

type SampleMap = Record<string, string>;

export type InstrumentType = "piano" | "guitar" | "synth";

export const INSTRUMENT_OPTIONS: { value: InstrumentType; label: string; icon: string }[] = [
  { value: "piano", label: "ピアノ", icon: "mdi:piano" },
  { value: "guitar", label: "ギター", icon: "mdi:guitar-acoustic" },
  { value: "synth", label: "電子音", icon: "mdi:sine-wave" },
];

export const PIANO_SAMPLES: SampleMap = {
  C2: "/audio/piano-c2.mp3",
  C3: "/audio/piano-c3.mp3",
  C4: "/audio/piano-c4.mp3",
  C5: "/audio/piano-c5.mp3",
};

// chord-dictionary のマッピングを踏襲（ギターは記譜が実音より1オクターブ高い慣習に合わせる）
export const GUITAR_SAMPLES: SampleMap = {
  E3: "/audio/guitar-e2.mp3",
  C4: "/audio/guitar-c3.mp3",
  C5: "/audio/guitar-c4.mp3",
};

const SAMPLE_MAPS: Record<Exclude<InstrumentType, "synth">, SampleMap> = {
  piano: PIANO_SAMPLES,
  guitar: GUITAR_SAMPLES,
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

export function useSampler(initialMasterVolume = 1, instrument: InstrumentType = "piano") {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const samplesRef = useRef<LoadedSample[]>([]);
  const loadedInstrumentRef = useRef<InstrumentType | null>(null);
  const instrumentRef = useRef(instrument);
  const sampleCacheRef = useRef(new Map<InstrumentType, LoadedSample[]>());
  const loadPromisesRef = useRef(new Map<InstrumentType, Promise<LoadedSample[]>>());
  const activeSourcesRef = useRef<Set<AudioScheduledSourceNode>>(new Set());

  instrumentRef.current = instrument;

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      const gain = audioContextRef.current.createGain();
      gain.gain.value = Math.max(0, Math.min(1, initialMasterVolume));
      gain.connect(audioContextRef.current.destination);
      masterGainRef.current = gain;
    }
    return audioContextRef.current;
  }, [initialMasterVolume]);

  const loadSamples = useCallback(async () => {
    const requestedInstrument = instrumentRef.current;
    if (requestedInstrument === "synth") return;
    if (loadedInstrumentRef.current === requestedInstrument && samplesRef.current.length > 0)
      return;
    const cached = sampleCacheRef.current.get(requestedInstrument);
    if (cached) {
      samplesRef.current = cached;
      loadedInstrumentRef.current = requestedInstrument;
      return;
    }
    const ctx = ensureContext();
    const entries = Object.entries(SAMPLE_MAPS[requestedInstrument]);
    let loading = loadPromisesRef.current.get(requestedInstrument);
    if (!loading) {
      loading = Promise.all(
        entries.map(async ([noteName, url]) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to load sample: ${url}`);
          const arrayBuffer = await res.arrayBuffer();
          const buffer = await ctx.decodeAudioData(arrayBuffer);
          const midi = Note.midi(noteName);
          if (midi === null) throw new Error(`Invalid sample note: ${noteName}`);
          return { buffer, midi };
        }),
      ).then((loaded) => loaded.sort((a, b) => a.midi - b.midi));
      loadPromisesRef.current.set(requestedInstrument, loading);
      const clearLoading = () => {
        if (loadPromisesRef.current.get(requestedInstrument) === loading) {
          loadPromisesRef.current.delete(requestedInstrument);
        }
      };
      void loading.then(clearLoading, clearLoading);
    }
    const loaded = await loading;
    sampleCacheRef.current.set(requestedInstrument, loaded);
    if (instrumentRef.current === requestedInstrument) {
      samplesRef.current = loaded;
      loadedInstrumentRef.current = requestedInstrument;
    }
  }, [ensureContext]);

  const triggerAttackRelease = useCallback(
    (note: string, durationSec: number, when: number = 0) => {
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master) return;
      const targetMidi = Note.midi(note);
      if (targetMidi === null) return;
      const startTime = ctx.currentTime + Math.max(0, when);
      const stopTime = startTime + durationSec;

      if (instrumentRef.current === "synth") {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = 440 * 2 ** ((targetMidi - 69) / 12);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, Math.min(stopTime, startTime + 0.025));
        gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(startTime);
        oscillator.stop(stopTime + 0.05);
        activeSourcesRef.current.add(oscillator);
        oscillator.onended = () => activeSourcesRef.current.delete(oscillator);
        return;
      }

      if (loadedInstrumentRef.current !== instrumentRef.current || samplesRef.current.length === 0)
        return;
      const sample = findNearestSample(samplesRef.current, targetMidi);
      const playbackRate = 2 ** ((targetMidi - sample.midi) / 12);

      const source = ctx.createBufferSource();
      source.buffer = sample.buffer;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      const peakGain = 0.7;
      const attackSec = 0.01;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, Math.min(stopTime, startTime + attackSec));
      gain.gain.setValueAtTime(peakGain, Math.max(startTime, stopTime - 0.05));
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
    stopAll();
    samplesRef.current = sampleCacheRef.current.get(instrument) ?? [];
    loadedInstrumentRef.current = sampleCacheRef.current.has(instrument) ? instrument : null;
    if (audioContextRef.current) void loadSamples();
  }, [instrument, loadSamples, stopAll]);

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
