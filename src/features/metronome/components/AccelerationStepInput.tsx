import { useNumericInputDraft } from "@/hooks/useNumericInputDraft";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const MIN_STEP = 1;
const MAX_STEP = 20;
const STEP = 1;
const DEFAULT_STEP = 1;

export default function AccelerationStepInput({ value, onChange }: Props) {
  const inputProps = useNumericInputDraft(
    value,
    (n) => {
      if (n !== null) onChange(n);
    },
    { fallbackOnBlur: DEFAULT_STEP },
  );

  return (
    <input
      type="number"
      min={MIN_STEP}
      max={MAX_STEP}
      step={STEP}
      placeholder={String(DEFAULT_STEP)}
      {...inputProps}
      className="input input-bordered max-w-20 text-center text-lg font-mono"
    />
  );
}
