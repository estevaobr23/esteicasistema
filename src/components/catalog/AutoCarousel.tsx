"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useElementVisibility, useReducedMotion } from "./CatalogSectionMotion";

export default function AutoCarousel({ items, variant, autoplaySeconds, ariaLabel }: { items: ReactNode[]; variant: "slides" | "marquee"; autoplaySeconds: number; ariaLabel: string }) {
  const reduced = useReducedMotion();
  const { ref, visible } = useElementVisibility<HTMLDivElement>("0px");
  const [paused, setPaused] = useState(false);
  const [activeRaw, setActive] = useState(0);
  const active = items.length ? activeRaw % items.length : 0;
  const canMove = visible && !paused && !reduced && items.length > 1;

  useEffect(() => {
    if (!canMove || variant !== "slides") return;
    const interval = window.setInterval(() => setActive((index) => (index + 1) % items.length), Math.max(2, autoplaySeconds) * 1000);
    return () => window.clearInterval(interval);
  }, [autoplaySeconds, canMove, items.length, variant]);

  if (!items.length) return null;
  if (variant === "marquee") {
    const renderedItems = reduced || items.length === 1 ? items : [...items, ...items];
    return (
      <div ref={ref} role="region" aria-label={ariaLabel} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} className="overflow-hidden">
        <div
          className={`catalog-marquee-track flex w-max gap-4 ${canMove ? "is-running" : "is-paused"}`}
          style={{ animationDuration: `${Math.max(8, autoplaySeconds * items.length * 1.8)}s` }}
        >
          {renderedItems.map((item, index) => <div key={index} className="w-[78vw] max-w-sm shrink-0 sm:w-80">{item}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} role="region" aria-label={ariaLabel} aria-live="off" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} className="relative overflow-hidden">
      <div className="grid">
        {items.map((item, index) => (
          <div key={index} aria-hidden={index !== active} className={`col-start-1 row-start-1 transition duration-500 ${index === active ? "z-10 translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"}`}>
            {item}
          </div>
        ))}
      </div>
      {items.length > 1 && <div className="mt-4 flex justify-center gap-1.5" aria-hidden>{items.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-current" : "w-1.5 bg-current opacity-25"}`} />)}</div>}
    </div>
  );
}

