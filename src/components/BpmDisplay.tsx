type BpmDisplayProps = {
  bpm: number;
  flashTick?: number;
  onClick?: () => void;
  showBorder?: boolean;
};

export default function BpmDisplay({
  bpm,
  flashTick = 0,
  onClick,
  showBorder = true,
}: BpmDisplayProps) {
  const interactive = typeof onClick === "function";
  const borderClass = showBorder ? "border border-primary/30" : "";
  return (
    <div
      className={`relative rounded-full ${borderClass} w-48 h-48 md:w-56 md:h-56 flex items-center justify-center shrink-0 ${interactive ? "cursor-pointer hover:bg-base-200 transition-colors" : ""}`}
      onClick={onClick}
    >
      <input
        key={`bpm-${flashTick}`}
        type="number"
        min={10}
        max={999}
        value={bpm}
        readOnly
        className={`pointer-events-none w-32 md:w-36 bg-transparent text-center text-5xl md:text-6xl font-mono font-bold text-primary focus:text-primary focus:outline-none ${flashTick > 0 ? "bpm-scale-flash" : ""}`}
        aria-label="テンポ"
      />
      <span className="pointer-events-none absolute bottom-14 md:bottom-16 text-xs text-base-content/50">
        BPM
      </span>
    </div>
  );
}
