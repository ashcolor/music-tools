type Props = {
  value: number;
  onChange: (value: number) => void;
};

const MIN_STEP = 1;
const MAX_STEP = 20;
const STEP = 1;

export default function AccelerationStepInput({ value, onChange }: Props) {
  return (
    <input
      type="number"
      min={MIN_STEP}
      max={MAX_STEP}
      step={STEP}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input input-bordered max-w-16 text-center"
    />
  );
}
