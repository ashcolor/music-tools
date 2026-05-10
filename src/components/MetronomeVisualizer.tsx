import { useEffect, useRef } from "react";

const COLOR = "oklch(0.72 0.13 250)";

type Props = {
  beatsPerMeasure: number;
  accentBeats: number[];
  isPlaying: boolean;
  isPaused: boolean;
  getMeasurePhase: () => number;
};

export default function MetronomeVisualizer({
  beatsPerMeasure,
  accentBeats,
  isPlaying,
  isPaused,
  getMeasurePhase,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    beatsPerMeasure,
    accentBeats,
    isPlaying,
    isPaused,
    getMeasurePhase,
  });

  useEffect(() => {
    stateRef.current = {
      beatsPerMeasure,
      accentBeats,
      isPlaying,
      isPaused,
      getMeasurePhase,
    };
  }, [beatsPerMeasure, accentBeats, isPlaying, isPaused, getMeasurePhase]);

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
      const sizeMax = 10;
      const padding = sizeMax * 1.6 + 12;
      const radius = Math.min(w, h) / 2 - padding;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "oklch(0.6 0 0 / 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const active = s.isPlaying && !s.isPaused;
      const phase = active ? s.getMeasurePhase() : 0;
      const beats = s.beatsPerMeasure;
      const beatPhase = phase * beats;
      const currentBeat = Math.floor(beatPhase);
      const sinceTrigger = beatPhase - currentBeat;

      for (let b = 0; b < beats; b++) {
        const angle = -Math.PI / 2 + (Math.PI * 2 * b) / beats;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const isAccent = s.accentBeats.includes(b + 1);

        const pulse =
          active && b === currentBeat ? Math.max(0, 1 - sinceTrigger * 5) : 0;
        const drawSize = sizeMax + sizeMax * 0.6 * pulse;

        ctx.strokeStyle = COLOR;
        ctx.globalAlpha = 0.7 + 0.3 * pulse;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(x, y, drawSize, 0, Math.PI * 2);
        ctx.stroke();

        if (isAccent) {
          ctx.beginPath();
          ctx.arc(x, y, drawSize + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      if (active) {
        const angle = -Math.PI / 2 + Math.PI * 2 * phase;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, sizeMax, 0, Math.PI * 2);
        ctx.fillStyle = COLOR;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
