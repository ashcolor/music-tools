type Props = {
  value: number;
  onChange: (value: number) => void;
};

const BEATS = Array.from({ length: 11 }, (_, i) => i + 2);

export default function BeatsInput({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {BEATS.map((beats) => (
        <button
          key={beats}
          className={`btn btn-sm rounded-full btn-neutral ${value !== beats ? "btn-soft" : ""}`}
          onClick={() => onChange(beats)}
        >
          {beats}
        </button>
      ))}
    </div>
  );
}
