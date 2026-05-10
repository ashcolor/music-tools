import { useEffect, useRef } from "react";
import type { Pitch, RhythmSettings } from "./RhythmSettings";

const PITCH_COLOR: Record<Pitch, string> = {
  low: "oklch(0.72 0.15 240)",
  mid: "oklch(0.78 0.16 150)",
  high: "oklch(0.80 0.17 60)",
};

type Props = {
  bpm: number;
  rhythms: RhythmSettings[];
  isPlaying: boolean;
  isPaused: boolean;
  getPlayheadTime: () => number | null;
};

export default function PolyrhythmVisualizer({
  bpm,
  rhythms,
  isPlaying,
  isPaused,
  getPlayheadTime,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ bpm, rhythms, isPlaying, isPaused, getPlayheadTime });

  useEffect(() => {
    stateRef.current = { bpm, rhythms, isPlaying, isPaused, getPlayheadTime };
  }, [bpm, rhythms, isPlaying, isPaused, getPlayheadTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf = 0;
    const draw = () => {
      const s = stateRef.current;
      const w = container.clientWidth;
      const h = container.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = (Math.min(w, h) / 2) * 0.78;

      const active = s.isPlaying && !s.isPaused;
      const t = active ? s.getPlayheadTime() ?? 0 : 0;
      const cycle = 60 / s.bpm;
      const phase = active ? (t / cycle) - Math.floor(t / cycle) : 0;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "oklch(0.6 0 0 / 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const sizeMax = 10;
      const sizeMin = 2;

      s.rhythms.forEach((rhythm) => {
        const size =
          sizeMax - ((sizeMax - sizeMin) * (rhythm.beats - 1)) / 11;
        const color = PITCH_COLOR[rhythm.pitch];
        const dim = rhythm.volume <= 0 ? 0.25 : 1;

        const beatPhase = phase * rhythm.beats;
        const currentBeat = Math.floor(beatPhase);
        const sinceTrigger = beatPhase - currentBeat;

        for (let b = 0; b < rhythm.beats; b++) {
          const angle = -Math.PI / 2 + (Math.PI * 2 * b) / rhythm.beats;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;

          const pulse =
            active && b === currentBeat ? Math.max(0, 1 - sinceTrigger * 5) : 0;
          const drawSize = size + size * 0.6 * pulse;

          ctx.beginPath();
          ctx.arc(x, y, drawSize, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = dim * (0.7 + 0.3 * pulse);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (active) {
          const angle = -Math.PI / 2 + Math.PI * 2 * phase;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = dim;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[10rem] aspect-square mx-auto">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
