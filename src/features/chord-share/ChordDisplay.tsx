import { parseChord } from "./constants";

type Props = {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
};

export function ChordDisplay({ value, onClick, isActive }: Props) {
  const { root, type, bass } = parseChord(value);
  return (
    <div
      className={`flex flex-row items-end cursor-pointer rounded px-2 py-1 transition-colors ${
        isActive ? "bg-primary/20" : ""
      }`}
      onClick={onClick}
    >
      <span className="text-xl font-bold">{root}</span>
      <span className="text-lg">{type}</span>
      {root !== bass && (
        <>
          <span>/</span>
          <span className="text-xl font-bold">{bass}</span>
        </>
      )}
    </div>
  );
}
