"use client";

import { useRef, useState } from "react";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  alt,
}: {
  beforeImage: string;
  afterImage: string;
  alt: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-xl"
      onMouseMove={(e) => e.buttons === 1 && updateFromClientX(e.clientX)}
      onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterImage} alt={`${alt} — depois`} className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0 h-full w-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeImage}
          alt={`${alt} — antes`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div
        className="absolute inset-y-0 w-0.5 bg-white"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg">
          <span className="text-xs">↔</span>
        </div>
      </div>

      <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
        Antes
      </span>
      <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
        Depois
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Comparar antes e depois"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
