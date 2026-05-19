import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMetronome } from "@/contexts/MetronomeContext";
import { useSampler } from "./useSampler";
import type { AccidentalDisplay, VoicingType } from "./constants";

type Sampler = ReturnType<typeof useSampler>;

type ChordShareContextValue = {
  sampler: Sampler;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  activeChordIndex: number;
  setActiveChordIndex: (i: number) => void;
  accidentalDisplay: AccidentalDisplay;
  setAccidentalDisplay: (v: AccidentalDisplay) => void;
  voicingType: VoicingType;
  setVoicingType: (v: VoicingType) => void;
};

const ChordShareContext = createContext<ChordShareContextValue | null>(null);

const ACCIDENTAL_STORAGE_KEY = "chord-share:accidentalDisplay";
const VOICING_TYPE_STORAGE_KEY = "chord-share:voicingType";

function loadAccidentalDisplay(): AccidentalDisplay {
  if (typeof window === "undefined") return "sharp";
  try {
    const raw = window.localStorage.getItem(ACCIDENTAL_STORAGE_KEY);
    return raw === "flat" ? "flat" : raw === "auto" ? "auto" : "sharp";
  } catch {
    return "sharp";
  }
}

function loadVoicingType(): VoicingType {
  if (typeof window === "undefined") return "stackFromRoot";
  try {
    const raw = window.localStorage.getItem(VOICING_TYPE_STORAGE_KEY);
    return raw === "compact" ? "compact" : "stackFromRoot";
  } catch {
    return "stackFromRoot";
  }
}

export function ChordShareProvider({ children }: { children: ReactNode }) {
  const { state } = useMetronome();
  const sampler = useSampler(state.volume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState(-1);
  const [accidentalDisplay, setAccidentalDisplayState] =
    useState<AccidentalDisplay>(loadAccidentalDisplay);
  const [voicingType, setVoicingTypeState] =
    useState<VoicingType>(loadVoicingType);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACCIDENTAL_STORAGE_KEY, accidentalDisplay);
    } catch {
      // ignore
    }
  }, [accidentalDisplay]);

  useEffect(() => {
    try {
      window.localStorage.setItem(VOICING_TYPE_STORAGE_KEY, voicingType);
    } catch {
      // ignore
    }
  }, [voicingType]);

  const setAccidentalDisplay = useCallback((v: AccidentalDisplay) => {
    setAccidentalDisplayState(v);
  }, []);

  const setVoicingType = useCallback((v: VoicingType) => {
    setVoicingTypeState(v);
  }, []);

  const value = useMemo(
    () => ({
      sampler,
      isPlaying,
      setIsPlaying,
      activeChordIndex,
      setActiveChordIndex,
      accidentalDisplay,
      setAccidentalDisplay,
      voicingType,
      setVoicingType,
    }),
    [sampler, isPlaying, activeChordIndex, accidentalDisplay, setAccidentalDisplay, voicingType, setVoicingType],
  );

  return (
    <ChordShareContext.Provider value={value}>{children}</ChordShareContext.Provider>
  );
}

export function useChordShare() {
  const ctx = useContext(ChordShareContext);
  if (!ctx) throw new Error("useChordShare must be used inside ChordShareProvider");
  return ctx;
}
