type Props = {
  isPlaying?: boolean;
  beatsPerMeasure?: number;
  currentBeat?: number;
  onClick?: () => void;
};

const getBeatDotClass = (beat: number, currentBeat: number) => {
  if (currentBeat === beat) {
    if (beat === 1) {
      return "bg-accent beat-pulse scale-150";
    } else {
      return "bg-success beat-pulse scale-150";
    }
  } else {
    return "bg-neutral-content";
  }
};

export default function BeatsDots({ beatsPerMeasure = 1, currentBeat = 1, onClick }: Props) {
  const beats = Array.from({ length: beatsPerMeasure }, (_, i) => i + 1);

  return (
    <div className="flex justify-center">
      <button
        type="button"
        className="flex items-center gap-4 cursor-pointer px-6 py-4"
        onClick={onClick}
      >
        {beats.map((beat) => (
          <div
            key={beat}
            className={`w-4 h-4 rounded-full transition-all duration-100 ${getBeatDotClass(beat, currentBeat)}`}
          />
        ))}
      </button>
    </div>
  );
}
