import { useEffect, useRef, useState, type ChangeEvent } from "react";

type Options = {
  allowEmpty?: boolean;
  fallbackOnBlur?: number;
  minOnBlur?: number;
  maxOnBlur?: number;
};

export function useNumericInputDraft(
  value: number | null,
  onCommit: (n: number | null) => void,
  options: Options = {},
) {
  const { allowEmpty = false, fallbackOnBlur, minOnBlur, maxOnBlur } = options;
  const [draft, setDraft] = useState<string>(() => (value === null ? "" : String(value)));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    if (draft === "" && (allowEmpty || value === null)) return;
    if (draft !== "" && Number(draft) === value) return;
    setDraft(value === null ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === "") {
      if (allowEmpty) onCommit(null);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) onCommit(n);
  };

  const onFocus = () => {
    isFocusedRef.current = true;
  };

  const onBlur = () => {
    isFocusedRef.current = false;
    if (draft === "") {
      if (fallbackOnBlur !== undefined) {
        setDraft(String(fallbackOnBlur));
        onCommit(fallbackOnBlur);
        return;
      }
      if (!allowEmpty) {
        setDraft(value === null ? "" : String(value));
      }
      return;
    }
    const n = Number(draft);
    if (!Number.isFinite(n)) {
      setDraft(value === null ? "" : String(value));
      return;
    }
    let clamped = n;
    if (minOnBlur !== undefined && clamped < minOnBlur) clamped = minOnBlur;
    if (maxOnBlur !== undefined && clamped > maxOnBlur) clamped = maxOnBlur;
    if (clamped !== value) {
      setDraft(String(clamped));
      onCommit(clamped);
    } else {
      setDraft(String(clamped));
    }
  };

  return { value: draft, onChange, onFocus, onBlur };
}
