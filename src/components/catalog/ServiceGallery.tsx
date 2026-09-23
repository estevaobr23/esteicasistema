"use client";

import { useState } from "react";

export default function ServiceGallery({ images, alt, aspect = "landscape" }: { images: string[]; alt: string; aspect?: "landscape" | "square" }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="w-full">
      {aspect === "square" ? (
        <div className="aspect-square w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
        </div>
      )}

      {images.length > 1 && (
        <div className="relative mt-2">
          <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === active ? "border-white" : "border-transparent opacity-60"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/40 to-transparent" aria-hidden />
        </div>
      )}
    </div>
  );
}
