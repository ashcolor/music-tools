import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSampler } from "./useSampler";
import type { AccidentalDisplay } from "./constants";

type Sampler = ReturnType<typeof useSampler>;

type ChordShareContextValue = {
  sampler: Sampler;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  activeChordIndex: number;
  setActiveChordIndex: (i: number) => void;
  accidentalDisplay: AccidentalDisplay;
  setAccidentalDisplay: (v: AccidentalDisplay) => void;
};

const ChordShareContext = createContext<ChordShareContextValue | null>(null);

const ACCIDENTAL_STORAGE_KEY = "chord-share:accidentalDisplay";

function loadAccidentalDisplay(): AccidentalDisplay {
  if (typeof window === "undefined") return "sharp";
  try {
    const raw = window.localStorage.getItem(ACCIDENTAL_STORAGE_KEY);
    return raw === "flat" ? "flat" : raw === "auto" ? "auto" : "sharp";
  } catch {
    return "sharp";
  }
}

export function ChordShareProvider({ children }: { children: ReactNode }) {
  const sampler = useSampler();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState(-1);
  const [accidentalDisplay, setAccidentalDisplayState] =
    useState<AccidentalDisplay>(loadAccidentalDisplay);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACCIDENTAL_STORAGE_KEY, accidentalDisplay);
    } catch {
      // ignore
    }
  }, [accidentalDisplay]);

  const setAccidentalDisplay = useCallback((v: AccidentalDisplay) => {
    setAccidentalDisplayState(v);
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
    }),
    [sampler, isPlaying, activeChordIndex, accidentalDisplay, setAccidentalDisplay],
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
