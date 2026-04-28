type Props = {
  value: number;
  onChange: (value: number) => void;
};

const MIN_BPM = 0;
const MAX_BPM = 600;

export default function BPMInput({ value, onChange }: Props) {
  return (
    <input
      type="number"
      min={MIN_BPM}
      max={MAX_BPM}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input input-ghost input-lg w-16 md:w-24 px-1 text-center text-lg md:text-xl font-mono text-primary-content focus:text-primary-content focus:outline-none"
    />
  );
}
