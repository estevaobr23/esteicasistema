"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type AnimationPreset = "none" | "soft" | "dynamic";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useElementVisibility<T extends HTMLElement>(rootMargin = "80px") {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);
  return { ref, visible };
}

export default function CatalogSectionMotion({ preset, children, className = "", style }: { preset: AnimationPreset; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const reduced = useReducedMotion();
  const { ref, visible } = useElementVisibility<HTMLDivElement>();
  const shouldAnimate = preset !== "none" && !reduced;
  return (
    <div
      ref={ref}
      className={`${className} catalog-section-motion catalog-motion-${preset} ${!shouldAnimate || visible ? "is-visible" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

