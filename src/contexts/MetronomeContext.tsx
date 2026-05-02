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

type State = {
  bpm: number;
  isPlaying: boolean;
  isPaused: boolean;
  currentBeat: number;
  beatsPerMeasure: number;
  isAccelerating: boolean;
  accelerationEnabled: boolean;
  accelerationStartBpm: number;
  accelerationTargetBpm: number;
  accelerationInterval: number;
  accelerationStep: number;
  volume: number;
  soundType: SoundType;
  theme: ThemeMode;
};

type Action =
  | { type: "SET_BPM"; bpm: number }
  | { type: "SET_BEATS_PER_MEASURE"; beats: number }
  | { type: "SET_ACCELERATION_START_BPM"; bpm: number }
  | { type: "SET_ACCELERATION_TARGET_BPM"; bpm: number }
  | { type: "SET_ACCELERATION_INTERVAL"; value: number }
  | { type: "SET_ACCELERATION_STEP"; value: number }
  | { type: "SET_ACCELERATION_ENABLED"; value: boolean }
  | { type: "SET_CURRENT_BEAT"; value: number }
  | { type: "SET_VOLUME"; value: number }
  | { type: "SET_SOUND_TYPE"; value: SoundType }
  | { type: "SET_THEME"; value: ThemeMode }
  | { type: "START_FRESH" }
  | { type: "RESUME" }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "STOP_ACCELERATION" };

const computeStep = (startBpm: number, targetBpm: number): number | null => {
  if (startBpm >= targetBpm) return null;
  const totalChange = targetBpm - startBpm;
  let step: number;
  if (totalChange <= 10) {
    step = 1;
  } else if (totalChange <= 30) {
    step = 2;
  } else if (totalChange <= 60) {
    step = Math.ceil(totalChange / 15);
  } else {
    step = Math.ceil(totalChange / 20);
  }
  return Math.max(1, Math.min(10, step));
};

const initialAccelerationStep = computeStep(120, 160) ?? 1;

const initialState: State = {
  bpm: 120,
  isPlaying: false,
  isPaused: false,
  currentBeat: 0,
  beatsPerMeasure: 4,
  isAccelerating: false,
  accelerationEnabled: true,
  accelerationStartBpm: 120,
  accelerationTargetBpm: 160,
  accelerationInterval: 1,
  accelerationStep: initialAccelerationStep,
  volume: 0.3,
  soundType: "electronic",
  theme: "light",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BPM":
      return { ...state, bpm: Math.max(0, Math.min(600, action.bpm)) };
    case "SET_BEATS_PER_MEASURE":
      return { ...state, beatsPerMeasure: action.beats };
    case "SET_ACCELERATION_START_BPM":
      return { ...state, accelerationStartBpm: action.bpm };
    case "SET_ACCELERATION_TARGET_BPM":
      return { ...state, accelerationTargetBpm: action.bpm };
    case "SET_ACCELERATION_INTERVAL":
      return { ...state, accelerationInterval: action.value };
    case "SET_ACCELERATION_STEP":
      return { ...state, accelerationStep: action.value };
    case "SET_ACCELERATION_ENABLED":
      return { ...state, accelerationEnabled: action.value };
    case "SET_CURRENT_BEAT":
      return { ...state, currentBeat: action.value };
    case "SET_VOLUME":
      return { ...state, volume: Math.max(0, Math.min(1, action.value)) };
    case "SET_SOUND_TYPE":
      return { ...state, soundType: action.value };
    case "SET_THEME":
      return { ...state, theme: action.value };
    case "START_FRESH": {
      const shouldAccelerate =
        state.accelerationEnabled && state.accelerationStartBpm < state.accelerationTargetBpm;
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
        bpm: state.accelerationStartBpm,
      };
    case "STOP_ACCELERATION":
      return { ...state, isAccelerating: false };
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
  setAccelerationTargetBpm: (n: number) => void;
  setAccelerationInterval: (n: number) => void;
  setAccelerationStep: (n: number) => void;
  setAccelerationEnabled: (v: boolean) => void;
  setVolume: (n: number) => void;
  setSoundType: (v: SoundType) => void;
  setTheme: (v: ThemeMode) => void;
};

type ContextValue = {
  state: State;
  actions: Actions;
  intervalMs: number;
};

const MetronomeContext = createContext<ContextValue | null>(null);

export function MetronomeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef(state);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const accelerationBeatCountRef = useRef(0);

  // stateRef を reducer 経由で常に同期する
  const syncDispatch = useCallback((action: Action) => {
    stateRef.current = reducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const playClick = useCallback((isAccent = false) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const { volume, soundType } = stateRef.current;
    if (volume <= 0) return;
    const t = ctx.currentTime;

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

  const setBpmRef = useRef<(n: number) => void>(() => {});

  const tick = useCallback(() => {
    const s = stateRef.current;
    const nextBeat = (s.currentBeat % s.beatsPerMeasure) + 1;
    const isAccent = nextBeat === 1;
    syncDispatch({ type: "SET_CURRENT_BEAT", value: nextBeat });
    playClick(isAccent);

    // 加速機能：1拍目がなった後に加速処理を実行
    // ただし、開始直後の最初の1拍目はスキップ
    if (s.isAccelerating && isAccent && accelerationBeatCountRef.current > 0) {
      if (accelerationBeatCountRef.current >= s.accelerationInterval) {
        accelerationBeatCountRef.current = 0;
        if (s.bpm < s.accelerationTargetBpm) {
          const newBpm = Math.min(s.bpm + s.accelerationStep, s.accelerationTargetBpm);
          setBpmRef.current(newBpm);
        } else {
          syncDispatch({ type: "STOP_ACCELERATION" });
        }
      }
    }

    // 1拍目でカウントを増加（加速処理の後に行う）
    if (stateRef.current.isAccelerating && isAccent) {
      accelerationBeatCountRef.current++;
    }
  }, [playClick, syncDispatch]);

  const setBpm = useCallback(
    (newBpm: number) => {
      const clamped = Math.max(0, Math.min(600, newBpm));
      syncDispatch({ type: "SET_BPM", bpm: clamped });

      if (stateRef.current.isPlaying && intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = window.setInterval(tick, 60000 / clamped);
      }
    },
    [syncDispatch, tick],
  );

  useEffect(() => {
    setBpmRef.current = setBpm;
  }, [setBpm]);

  const start = useCallback(async () => {
    if (stateRef.current.isPlaying) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
    }

    const wasPaused = stateRef.current.isPaused;

    if (wasPaused) {
      syncDispatch({ type: "RESUME" });
    } else {
      syncDispatch({ type: "START_FRESH" });
      accelerationBeatCountRef.current = 0;
    }

    tick();

    intervalIdRef.current = window.setInterval(tick, 60000 / stateRef.current.bpm);
  }, [syncDispatch, tick]);

  const stop = useCallback(() => {
    if (!stateRef.current.isPlaying) return;

    syncDispatch({ type: "STOP" });
    accelerationBeatCountRef.current = 0;

    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, [syncDispatch]);

  const pause = useCallback(() => {
    if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

    syncDispatch({ type: "PAUSE" });

    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, [syncDispatch]);

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

  const setAccelerationTargetBpm = useCallback(
    (n: number) => syncDispatch({ type: "SET_ACCELERATION_TARGET_BPM", bpm: n }),
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

  const setAccelerationEnabled = useCallback(
    (v: boolean) => syncDispatch({ type: "SET_ACCELERATION_ENABLED", value: v }),
    [syncDispatch],
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

  useEffect(() => {
    const themeName = state.theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeName);
  }, [state.theme]);

  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
      }
    };
  }, []);

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
        setAccelerationTargetBpm,
        setAccelerationInterval,
        setAccelerationStep,
        setAccelerationEnabled,
        setVolume,
        setSoundType,
        setTheme,
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
      setAccelerationTargetBpm,
      setAccelerationInterval,
      setAccelerationStep,
      setAccelerationEnabled,
      setVolume,
      setSoundType,
      setTheme,
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
