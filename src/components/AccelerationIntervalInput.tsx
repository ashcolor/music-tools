import { useNumericInputDraft } from "@/hooks/useNumericInputDraft";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const MIN_INTERVAL = 1;
const MAX_INTERVAL = 16;
const STEP = 1;
const DEFAULT_INTERVAL = 1;

export default function AccelerationIntervalInput({ value, onChange }: Props) {
  const inputProps = useNumericInputDraft(
    value,
    (n) => {
      if (n !== null) onChange(n);
    },
    { fallbackOnBlur: DEFAULT_INTERVAL },
  );

  return (
    <input
      type="number"
      min={MIN_INTERVAL}
      max={MAX_INTERVAL}
      step={STEP}
      placeholder={String(DEFAULT_INTERVAL)}
      {...inputProps}
      className="input input-bordered max-w-16 text-center text-xl font-mono"
    />
  );
}
