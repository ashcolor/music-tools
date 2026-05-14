import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useSampler } from "./useSampler";

type Sampler = ReturnType<typeof useSampler>;

type ChordShareContextValue = {
  sampler: Sampler;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  activeChordIndex: number;
  setActiveChordIndex: (i: number) => void;
};

const ChordShareContext = createContext<ChordShareContextValue | null>(null);

export function ChordShareProvider({ children }: { children: ReactNode }) {
  const sampler = useSampler();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState(-1);

  const value = useMemo(
    () => ({ sampler, isPlaying, setIsPlaying, activeChordIndex, setActiveChordIndex }),
    [sampler, isPlaying, activeChordIndex],
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
