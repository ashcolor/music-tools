type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function BeatsInput({ value, onChange, min = 2, max = 12 }: Props) {
  const beats = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {beats.map((b) => (
        <button
          key={b}
          className={`btn btn-sm rounded-full btn-neutral ${value !== b ? "btn-soft" : ""}`}
          onClick={() => onChange(b)}
        >
          {b}
        </button>
      ))}
    </div>
  );
}
