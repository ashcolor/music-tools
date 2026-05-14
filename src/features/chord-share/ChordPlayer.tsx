import { Icon } from "@iconify/react";
import { Chord, Note } from "tonal";
import { useChordShare } from "./ChordShareContext";

type Props = {
  chord: string;
};

export function ChordPlayer({ chord }: Props) {
  const { sampler, isPlaying, setIsPlaying } = useChordShare();
  const [tonic] = Chord.tokenize(chord || "");
  const intervals = Chord.get(chord || "").intervals;
  const baseRoot = `${tonic}3`;
  const notes = intervals
    .map((iv) => Note.transpose(baseRoot, iv))
    .filter((n): n is string => Boolean(n));

  const onClick = async () => {
    if (isPlaying) {
      sampler.stopAll();
      setIsPlaying(false);
      return;
    }
    await sampler.resume();
    setIsPlaying(true);
    notes.forEach((note) => {
      sampler.triggerAttackRelease(note, 2, 0);
    });
    window.setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <button
      type="button"
      className={`btn btn-circle btn-sm ${isPlaying ? "btn-error" : "btn-secondary"}`}
      onClick={onClick}
    >
      <Icon icon={isPlaying ? "bi:stop-fill" : "bi:volume-up-fill"} className="size-4" />
    </button>
  );
}
