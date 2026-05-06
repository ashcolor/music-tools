import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

export type SoundType = "electronic" | "analog" | "woodfish";
export type ThemeMode = "light" | "dark";
export type AccelerationMode = "off" | "accel" | "decel";

const STORAGE_KEY = "music-tools:metronome-settings";
const MIN_BPM = 10;
const MAX_BPM = 999;
const MIN_BEATS_PER_MEASURE = 1;
const MAX_BEATS_PER_MEASURE = 12;
const MIN_ACCELERATION_INTERVAL = 1;
const MAX_ACCELERATION_INTERVAL = 16;
const MIN_ACCELERATION_STEP = 1;
const MAX_ACCELERATION_STEP = 20;

const SOUND_TYPES: SoundType[] = ["electronic", "analog", "woodfish"];
const ACCELERATION_MODES: AccelerationMode[] = ["off", "accel", "decel"];
const THEMES: ThemeMode[] = ["light", "dark"];

function clampBpm(bpm: number): number {
  return Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
}

function clampBeatsPerMeasure(beats: number): number {
  return Math.max(MIN_BEATS_PER_MEASURE, Math.min(MAX_BEATS_PER_MEASURE, beats));
}

function clampAccelerationInterval(interval: number): number {
  return Math.max(MIN_ACCELERATION_INTERVAL, Math.min(MAX_ACCELERATION_INTERVAL, interval));
}

function clampAccelerationStep(step: number): number {
  return Math.max(MIN_ACCELERATION_STEP, Math.min(MAX_ACCELERATION_STEP, step));
}

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

function isSoundType(value: unknown): value is SoundType {
  return typeof value === "string" && SOUND_TYPES.includes(value as SoundType);
}

function isAccelerationMode(value: unknown): value is AccelerationMode {
  return typeof value === "string" && ACCELERATION_MODES.includes(value as AccelerationMode);
}

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && THEMES.includes(value as ThemeMode);
}

type State = {
  bpm: number;
  isPlaying: boolean;
  isPaused: boolean;
  currentBeat: number;
  beatsPerMeasure: number;
  isAccelerating: boolean;
  accelerationMode: AccelerationMode;
  accelerationStartBpm: number;
  accelerationInterval: number;
  accelerationStep: number;
  volume: number;
  soundType: SoundType;
  theme: ThemeMode;
};

type PersistedSettings = Pick<
  State,
  | "bpm"
  | "beatsPerMeasure"
  | "accelerationMode"
  | "accelerationStartBpm"
  | "accelerationInterval"
  | "accelerationStep"
  | "volume"
  | "soundType"
  | "theme"
>;

type Action =
  | { type: "SET_BPM"; bpm: number }
  | { type: "SET_BEATS_PER_MEASURE"; beats: number }
  | { type: "SET_ACCELERATION_START_BPM"; bpm: number }
  | { type: "SET_ACCELERATION_INTERVAL"; value: number }
  | { type: "SET_ACCELERATION_STEP"; value: number }
  | { type: "SET_ACCELERATION_MODE"; value: AccelerationMode }
  | { type: "SET_CURRENT_BEAT"; value: number }
  | { type: "SET_VOLUME"; value: number }
  | { type: "SET_SOUND_TYPE"; value: SoundType }
  | { type: "SET_THEME"; value: ThemeMode }
  | { type: "START_FRESH" }
  | { type: "RESUME" }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "STOP_ACCELERATION" }
  | { type: "RESET" };

function accelerationBoundBpm(mode: AccelerationMode): number {
  return mode === "decel" ? MIN_BPM : MAX_BPM;
}

const initialState: State = {
  bpm: 120,
  isPlaying: false,
  isPaused: false,
  currentBeat: 0,
  beatsPerMeasure: 4,
  isAccelerating: false,
  accelerationMode: "off",
  accelerationStartBpm: 120,
  accelerationInterval: 1,
  accelerationStep: 1,
  volume: 0.3,
  soundType: "electronic",
  theme: "light",
};

function sanitizePersistedSettings(value: unknown): PersistedSettings | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;

  return {
    bpm: clampBpm(
      typeof candidate.bpm === "number" && Number.isFinite(candidate.bpm)
        ? candidate.bpm
        : initialState.bpm,
    ),
    beatsPerMeasure: clampBeatsPerMeasure(
      typeof candidate.beatsPerMeasure === "number" && Number.isFinite(candidate.beatsPerMeasure)
        ? candidate.beatsPerMeasure
        : initialState.beatsPerMeasure,
    ),
    accelerationMode: isAccelerationMode(candidate.accelerationMode)
      ? candidate.accelerationMode
      : initialState.accelerationMode,
    accelerationStartBpm: clampBpm(
      typeof candidate.accelerationStartBpm === "number" &&
        Number.isFinite(candidate.accelerationStartBpm)
        ? candidate.accelerationStartBpm
        : initialState.accelerationStartBpm,
    ),
    accelerationInterval: clampAccelerationInterval(
      typeof candidate.accelerationInterval === "number" &&
        Number.isFinite(candidate.accelerationInterval)
        ? candidate.accelerationInterval
        : initialState.accelerationInterval,
    ),
    accelerationStep: clampAccelerationStep(
      typeof candidate.accelerationStep === "number" && Number.isFinite(candidate.accelerationStep)
        ? candidate.accelerationStep
        : initialState.accelerationStep,
    ),
    volume: clampVolume(
      typeof candidate.volume === "number" && Number.isFinite(candidate.volume)
        ? candidate.volume
        : initialState.volume,
    ),
    soundType: isSoundType(candidate.soundType) ? candidate.soundType : initialState.soundType,
    theme: isThemeMode(candidate.theme) ? candidate.theme : initialState.theme,
  };
}

function loadInitialState(): State {
  if (typeof window === "undefined") return initialState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    const persisted = sanitizePersistedSettings(parsed);
    if (!persisted) return initialState;
    return {
      ...initialState,
      ...persisted,
    };
  } catch {
    return initialState;
  }
}

function toPersistedSettings(state: State): PersistedSettings {
  return {
    bpm: state.bpm,
    beatsPerMeasure: state.beatsPerMeasure,
    accelerationMode: state.accelerationMode,
    accelerationStartBpm: state.accelerationStartBpm,
    accelerationInterval: state.accelerationInterval,
    accelerationStep: state.accelerationStep,
    volume: state.volume,
    soundType: state.soundType,
    theme: state.theme,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BPM":
      return { ...state, bpm: clampBpm(action.bpm) };
    case "SET_BEATS_PER_MEASURE":
      return { ...state, beatsPerMeasure: clampBeatsPerMeasure(action.beats) };
    case "SET_ACCELERATION_START_BPM":
      return { ...state, accelerationStartBpm: clampBpm(action.bpm) };
    case "SET_ACCELERATION_INTERVAL":
      return { ...state, accelerationInterval: clampAccelerationInterval(action.value) };
    case "SET_ACCELERATION_STEP":
      return { ...state, accelerationStep: clampAccelerationStep(action.value) };
    case "SET_ACCELERATION_MODE":
      return { ...state, accelerationMode: action.value };
    case "SET_CURRENT_BEAT":
      return { ...state, currentBeat: action.value };
    case "SET_VOLUME":
      return { ...state, volume: clampVolume(action.value) };
    case "SET_SOUND_TYPE":
      return { ...state, soundType: action.value };
    case "SET_THEME":
      return { ...state, theme: action.value };
    case "START_FRESH": {
      const shouldAccelerate = state.accelerationMode !== "off";
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        currentBeat: 0,
        isAccelerating: shouldAccelerate,
        bpm: shouldAccelerate ? state.accelerationStartBpm : state.bpm,
      };
    }
    case "RESUME":
      return { ...state, isPlaying: true, isPaused: false };
    case "PAUSE":
      return { ...state, isPlaying: false, isPaused: true };
    case "STOP":
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        currentBeat: 0,
        isAccelerating: false,
        bpm: state.accelerationMode !== "off" ? state.accelerationStartBpm : state.bpm,
      };
    case "STOP_ACCELERATION":
      return { ...state, isAccelerating: false };
    case "RESET":
      return {
        ...initialState,
        isPlaying: state.isPlaying,
        isPaused: state.isPaused,
        currentBeat: state.currentBeat,
        isAccelerating: false,
        theme: state.theme,
      };
  }
}

type Actions = {
  start: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  setBpm: (n: number) => void;
  setBeatsPerMeasure: (n: number) => void;
  setAccelerationStartBpm: (n: number) => void;
  setAccelerationInterval: (n: number) => void;
  setAccelerationStep: (n: number) => void;
  setAccelerationMode: (v: AccelerationMode) => void;
  setVolume: (n: number) => void;
  setSoundType: (v: SoundType) => void;
  setTheme: (v: ThemeMode) => void;
  reset: () => void;
};

type ContextValue = {
  state: State;
  actions: Actions;
  intervalMs: number;
};

const MetronomeContext = createContext<ContextValue | null>(null);

export function MetronomeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadInitialState);

  const stateRef = useRef(state);
  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerIdRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const nextBeatNumberRef = useRef(0);
  const scheduledQueueRef = useRef<{ beat: number; time: number }[]>([]);
  const accelerationBeatCountRef = useRef(0);

  const SCHEDULER_INTERVAL_MS = 25;
  const SCHEDULE_AHEAD_TIME = 0.1;

  const syncDispatch = useCallback((action: Action) => {
    stateRef.current = reducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const playClick = useCallback((time: number, isAccent = false) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const { volume, soundType } = stateRef.current;
    if (volume <= 0) return;
    const t = time;

    if (soundType === "analog") {
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = isAccent ? 4000 : 2500;
      filter.Q.value = 5;
      const gain = ctx.createGain();
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      noise.start(t);
      noise.stop(t + 0.05);
      return;
    }

    if (soundType === "woodfish") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const startFreq = isAccent ? 500 : 300;
      const endFreq = isAccent ? 100 : 60;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(isAccent ? 800 : 400, t);
    osc.type = "square";
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  }, []);

  const stopAudioClock = useCallback(() => {
    if (schedulerIdRef.current !== null) {
      window.clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    scheduledQueueRef.current = [];
  }, []);

  const advanceScheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      const s = stateRef.current;
      const beatNumber = nextBeatNumberRef.current;
      const isAccent = beatNumber === 1;
      const time = nextNoteTimeRef.current;

      playClick(time, isAccent);
      scheduledQueueRef.current.push({ beat: beatNumber, time });

      if (s.isAccelerating && isAccent && accelerationBeatCountRef.current > 0) {
        if (accelerationBeatCountRef.current >= s.accelerationInterval) {
          accelerationBeatCountRef.current = 0;
          const bound = accelerationBoundBpm(s.accelerationMode);
          if (s.accelerationMode === "accel" && s.bpm < bound) {
            const newBpm = Math.min(s.bpm + s.accelerationStep, bound);
            syncDispatch({ type: "SET_BPM", bpm: newBpm });
          } else if (s.accelerationMode === "decel" && s.bpm > bound) {
            const newBpm = Math.max(s.bpm - s.accelerationStep, bound);
            syncDispatch({ type: "SET_BPM", bpm: newBpm });
          } else {
            syncDispatch({ type: "STOP_ACCELERATION" });
          }
        }
      }
      if (stateRef.current.isAccelerating && isAccent) {
        accelerationBeatCountRef.current++;
      }

      const secondsPerBeat = 60.0 / stateRef.current.bpm;
      nextNoteTimeRef.current += secondsPerBeat;
      nextBeatNumberRef.current =
        (nextBeatNumberRef.current % stateRef.current.beatsPerMeasure) + 1;
    }
  }, [playClick, syncDispatch]);

  const uiTick = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx) {
      const queue = scheduledQueueRef.current;
      while (queue.length > 0 && queue[0].time <= ctx.currentTime) {
        const note = queue.shift()!;
        if (stateRef.current.currentBeat !== note.beat) {
          syncDispatch({ type: "SET_CURRENT_BEAT", value: note.beat });
        }
      }
    }
    rafIdRef.current = window.requestAnimationFrame(uiTick);
  }, [syncDispatch]);

  const setBpm = useCallback(
    (newBpm: number) => {
      syncDispatch({ type: "SET_BPM", bpm: clampBpm(newBpm) });
    },
    [syncDispatch],
  );

  const start = useCallback(async () => {
    if (stateRef.current.isPlaying) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    const wasPaused = stateRef.current.isPaused;

    if (wasPaused) {
      syncDispatch({ type: "RESUME" });
    } else {
      syncDispatch({ type: "START_FRESH" });
      accelerationBeatCountRef.current = 0;
    }

    const s = stateRef.current;
    nextBeatNumberRef.current = (s.currentBeat % s.beatsPerMeasure) + 1;
    nextNoteTimeRef.current = audioContextRef.current.currentTime;
    scheduledQueueRef.current = [];

    advanceScheduler();
    schedulerIdRef.current = window.setInterval(advanceScheduler, SCHEDULER_INTERVAL_MS);
    rafIdRef.current = window.requestAnimationFrame(uiTick);
  }, [syncDispatch, advanceScheduler, uiTick]);

  const stop = useCallback(() => {
    if (!stateRef.current.isPlaying && !stateRef.current.isPaused) return;

    syncDispatch({ type: "STOP" });
    accelerationBeatCountRef.current = 0;
    stopAudioClock();
  }, [syncDispatch, stopAudioClock]);

  const pause = useCallback(() => {
    if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

    syncDispatch({ type: "PAUSE" });
    stopAudioClock();
  }, [syncDispatch, stopAudioClock]);

  const toggle = useCallback(() => {
    if (stateRef.current.isPlaying) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const setBeatsPerMeasure = useCallback(
    (n: number) => syncDispatch({ type: "SET_BEATS_PER_MEASURE", beats: n }),
    [syncDispatch],
  );

  const setAccelerationStartBpm = useCallback(
    (n: number) => syncDispatch({ type: "SET_ACCELERATION_START_BPM", bpm: n }),
    [syncDispatch],
  );

  const setAccelerationInterval = useCallback(
    (n: number) => syncDispatch({ type: "SET_ACCELERATION_INTERVAL", value: n }),
    [syncDispatch],
  );

  const setAccelerationStep = useCallback(
    (n: number) => syncDispatch({ type: "SET_ACCELERATION_STEP", value: n }),
    [syncDispatch],
  );

  const setAccelerationMode = useCallback(
    (v: AccelerationMode) => {
      if (stateRef.current.isPlaying || stateRef.current.isPaused) {
        syncDispatch({ type: "STOP" });
        accelerationBeatCountRef.current = 0;
        stopAudioClock();
      }
      syncDispatch({ type: "SET_ACCELERATION_MODE", value: v });
    },
    [syncDispatch, stopAudioClock],
  );

  const setVolume = useCallback(
    (n: number) => syncDispatch({ type: "SET_VOLUME", value: n }),
    [syncDispatch],
  );

  const setSoundType = useCallback(
    (v: SoundType) => syncDispatch({ type: "SET_SOUND_TYPE", value: v }),
    [syncDispatch],
  );

  const setTheme = useCallback(
    (v: ThemeMode) => syncDispatch({ type: "SET_THEME", value: v }),
    [syncDispatch],
  );

  const reset = useCallback(() => {
    accelerationBeatCountRef.current = 0;
    syncDispatch({ type: "RESET" });
  }, [syncDispatch]);

  const persistedSettings = useMemo(() => toPersistedSettings(state), [
    state.bpm,
    state.beatsPerMeasure,
    state.accelerationMode,
    state.accelerationStartBpm,
    state.accelerationInterval,
    state.accelerationStep,
    state.volume,
    state.soundType,
    state.theme,
  ]);

  useEffect(() => {
    const themeName = state.theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeName);
  }, [state.theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedSettings));
    } catch {
      // noop
    }
  }, [persistedSettings]);

  useEffect(() => {
    return () => {
      stopAudioClock();
    };
  }, [stopAudioClock]);

  const value = useMemo<ContextValue>(
    () => ({
      state,
      intervalMs: 60000 / state.bpm,
      actions: {
        start,
        pause,
        stop,
        toggle,
        setBpm,
        setBeatsPerMeasure,
        setAccelerationStartBpm,
        setAccelerationInterval,
        setAccelerationStep,
        setAccelerationMode,
        setVolume,
        setSoundType,
        setTheme,
        reset,
      },
    }),
    [
      state,
      start,
      pause,
      stop,
      toggle,
      setBpm,
      setBeatsPerMeasure,
      setAccelerationStartBpm,
      setAccelerationInterval,
      setAccelerationStep,
      setAccelerationMode,
      setVolume,
      setSoundType,
      setTheme,
      reset,
    ],
  );

  return <MetronomeContext.Provider value={value}>{children}</MetronomeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMetronome() {
  const ctx = useContext(MetronomeContext);
  if (!ctx) {
    throw new Error("useMetronome must be used within MetronomeProvider");
  }
  return ctx;
}
