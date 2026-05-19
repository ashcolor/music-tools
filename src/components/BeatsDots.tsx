type Props = {
  isPlaying?: boolean;
  beatsPerMeasure?: number;
  currentBeat?: number;
  accentBeats?: number[];
  onClick?: () => void;
  onToggleAccent?: (beat: number) => void;
};

function BeatDot({
  isCurrent,
  isAccent,
}: {
  isCurrent: boolean;
  isAccent: boolean;
}) {
  const baseClass = "size-4 rounded-full transition-all duration-100";
  if (isAccent) {
    const borderColor = isCurrent ? "border-accent" : "border-accent/70";
    const fillColor = isCurrent ? "bg-accent" : "bg-accent/70";
    const animClass = isCurrent ? "beat-pulse scale-150" : "";
    return (
      <div
        className={`rounded-full border p-1 transition-all duration-100 ${borderColor} ${animClass}`}
      >
        <div className={`${baseClass} ${fillColor}`} />
      </div>
    );
  }
  const cls = isCurrent
    ? "bg-success ring-2 ring-success/25 beat-pulse scale-150"
    : "bg-base-content/30 ring-1 ring-base-content/15";
  return <div className={`${baseClass} ${cls}`} />;
}

export default function BeatsDots({
  beatsPerMeasure = 1,
  currentBeat = 1,
  accentBeats = [],
  onClick,
  onToggleAccent,
}: Props) {
  const beats = Array.from({ length: beatsPerMeasure }, (_, i) => i + 1);
  const dots = beats.map((beat) => {
    const dot = (
      <BeatDot isCurrent={currentBeat === beat} isAccent={accentBeats.includes(beat)} />
    );
    if (onToggleAccent) {
      return (
        <button
          key={beat}
          type="button"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAccent(beat);
          }}
          aria-label={`${beat}拍目のアクセント切り替え`}
        >
          {dot}
        </button>
      );
    }
    return <span key={beat}>{dot}</span>;
  });

  return (
    <div className="flex justify-center">
      {onClick && !onToggleAccent ? (
        <button
          type="button"
          className="flex items-center gap-4 cursor-pointer rounded-lg hover:bg-base-200 transition-colors"
          onClick={onClick}
        >
          {dots}
        </button>
      ) : (
        <div className="flex items-center gap-4">{dots}</div>
      )}
    </div>
  );
}
