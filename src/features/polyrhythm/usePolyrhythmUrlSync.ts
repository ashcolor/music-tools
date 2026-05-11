import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { SOUNDS, type RhythmSettings, type Sound } from "./RhythmSettings";

const LEGACY_PITCH_MAP: Record<string, Sound> = {
  low: "electronicLow",
  mid: "electronicMid",
  high: "electronicHigh",
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function parseNumber(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseSound(v: string): Sound | null {
  if ((SOUNDS as string[]).includes(v)) return v as Sound;
  if (v in LEGACY_PITCH_MAP) return LEGACY_PITCH_MAP[v];
  return null;
}

function serializeRhythms(rhythms: RhythmSettings[]): string {
  return rhythms
    .map(
      (r) =>
        `${r.sound}_${r.beats}_${Math.round(r.volume * 100)}_${Math.round(r.pan * 100)}`,
    )
    .join(",");
}

function parseRhythms(value: string | null): RhythmSettings[] | null {
  if (value === null) return null;
  if (value === "") return [];
  const result: RhythmSettings[] = [];
  for (const token of value.split(",")) {
    const parts = token.split("_");
    if (parts.length !== 4) return null;
    const [soundStr, beatsStr, volStr, panStr] = parts;
    const sound = parseSound(soundStr);
    if (!sound) return null;
    const beats = Number(beatsStr);
    const vol = Number(volStr);
    const pan = Number(panStr);
    if (!Number.isFinite(beats) || !Number.isFinite(vol) || !Number.isFinite(pan)) {
      return null;
    }
    result.push({
      sound,
      beats: clamp(Math.round(beats), 1, 12),
      volume: clamp(vol / 100, 0, 1),
      pan: clamp(pan / 100, -1, 1),
    });
  }
  return result;
}

type Args = {
  bpm: number;
  rhythms: RhythmSettings[];
  setBpm: (n: number) => void;
  setRhythms: (rhythms: RhythmSettings[]) => void;
};

export function usePolyrhythmUrlSync({ bpm, rhythms, setBpm, setRhythms }: Args) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const urlBpm = parseNumber(searchParams.get("bpm"));
    const urlRhythms = parseRhythms(searchParams.get("rhythms"));

    if (urlBpm !== null) {
      setBpm(clamp(Math.round(urlBpm), 10, 999));
    }
    if (urlRhythms !== null) {
      setRhythms(urlRhythms);
    }
  }, [searchParams, setBpm, setRhythms]);

  useEffect(() => {
    if (!initializedRef.current) return;

    const next = new URLSearchParams(searchParams);
    next.set("bpm", String(bpm));
    next.set("rhythms", serializeRhythms(rhythms));

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [bpm, rhythms, searchParams, setSearchParams]);
}
