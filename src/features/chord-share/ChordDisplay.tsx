import { useEffect, useState } from "react";
import { Chord } from "tonal";
import { ChordSelectModal } from "./ChordSelectModal";

type Props = {
  value: string;
  onChange: (next: string) => void;
  isActive?: boolean;
};

export function ChordDisplay({ value, onChange, isActive }: Props) {
  const [tokRoot, tokType] = Chord.tokenize(value || "");
  const [root, setRoot] = useState(tokRoot || "C");
  const [type, setType] = useState(tokType || "");
  const [bass, setBass] = useState(tokRoot || "C");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onChange(`${root}${type}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, type]);

  return (
    <>
      <div
        className={`flex flex-row items-end cursor-pointer rounded px-2 py-1 transition-colors ${
          isActive ? "bg-primary/20" : ""
        }`}
        onClick={() => setOpen(true)}
      >
        <span className="text-xl font-bold">{root}</span>
        <span className="text-lg">{type}</span>
        {root !== bass && (
          <>
            {bass && <span>/</span>}
            <span className="text-xl font-bold">{bass}</span>
          </>
        )}
      </div>
      <ChordSelectModal
        open={open}
        root={root}
        type={type}
        bass={bass}
        onRootChange={setRoot}
        onTypeChange={setType}
        onBassChange={setBass}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
