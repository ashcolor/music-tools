import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { useMetronome, type AccelerationMode } from "@/contexts/MetronomeContext";

const ACCELERATION_MODES: AccelerationMode[] = ["off", "accel", "decel"];

function parseMode(value: string | null): AccelerationMode | null {
  if (value === null) return null;
  return ACCELERATION_MODES.includes(value as AccelerationMode)
    ? (value as AccelerationMode)
    : null;
}

function parseNumber(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseAccents(value: string | null): number[] | null {
  if (value === null) return null;
  if (value === "") return [];
  return value
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && Number.isInteger(n));
}

export function useMetronomeUrlSync() {
  const { state, actions } = useMetronome();
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const mode = parseMode(searchParams.get("mode"));
    const bpm = parseNumber(searchParams.get("bpm"));
    const interval = parseNumber(searchParams.get("interval"));
    const step = parseNumber(searchParams.get("step"));
    const beats = parseNumber(searchParams.get("beats"));
    const accents = parseAccents(searchParams.get("accents"));

    const effectiveMode = mode ?? state.accelerationMode;
    if (mode !== null && mode !== state.accelerationMode) {
      actions.setAccelerationMode(mode);
    }
    if (bpm !== null) {
      if (effectiveMode === "off") {
        actions.setBpm(bpm);
      } else {
        actions.setAccelerationStartBpm(bpm);
      }
    }
    if (interval !== null) actions.setAccelerationInterval(interval);
    if (step !== null) actions.setAccelerationStep(step);
    if (beats !== null) actions.setBeatsPerMeasure(beats);
    if (accents !== null) actions.setAccentBeats(accents);
  }, [actions, searchParams, state.accelerationMode]);

  useEffect(() => {
    if (!initializedRef.current) return;

    const isOff = state.accelerationMode === "off";
    const bpm = isOff ? state.bpm : state.accelerationStartBpm;

    const next = new URLSearchParams(searchParams);
    next.set("bpm", String(bpm));
    next.set("beats", String(state.beatsPerMeasure));
    next.set("accents", state.accentBeats.join(","));
    if (isOff) {
      next.delete("mode");
      next.delete("interval");
      next.delete("step");
    } else {
      next.set("mode", state.accelerationMode);
      next.set("interval", String(state.accelerationInterval));
      next.set("step", String(state.accelerationStep));
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [
    state.accelerationMode,
    state.bpm,
    state.accelerationStartBpm,
    state.accelerationInterval,
    state.accelerationStep,
    state.beatsPerMeasure,
    state.accentBeats,
    searchParams,
    setSearchParams,
  ]);
}
