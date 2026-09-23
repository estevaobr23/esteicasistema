"use client";

import type { ReactNode } from "react";
import type { CatalogBlockType } from "@/lib/catalog-builder/schema";

export function VisualChoice({
  label,
  description,
  selected,
  onClick,
  children,
  disabled,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`group relative min-w-0 rounded-xl border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border-white bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,.12)]"
          : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-600 hover:bg-neutral-900"
      }`}
    >
      <span className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${selected ? "border-white bg-white text-neutral-950" : "border-neutral-700 text-transparent"}`}>
        ✓
      </span>
      <span className="block overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">{children}</span>
      <span className="mt-2 block pr-4 text-xs font-semibold text-white">{label}</span>
      {description && <span className="mt-0.5 block text-[10px] leading-4 text-neutral-500">{description}</span>}
    </button>
  );
}

function Tile({ className = "" }: { className?: string }) {
  return <span className={`block rounded-[3px] border border-white/10 bg-white/10 ${className}`} />;
}

function Line({ className = "" }: { className?: string }) {
  return <span className={`block h-1 rounded-full bg-white/20 ${className}`} />;
}

export function VariantMiniature({ type, variant }: { type: CatalogBlockType; variant: string }) {
  const base = "relative flex h-16 w-full overflow-hidden p-2.5";

  if (variant === "list") {
    return <span className={`${base} flex-col gap-1.5`}>{[0, 1, 2].map((item) => <span key={item} className="flex h-3.5 items-center gap-1.5"><Tile className="h-3.5 w-5 shrink-0" /><Line className="w-full" /></span>)}</span>;
  }
  if (variant === "compact") {
    return <span className={`${base} flex-col justify-center gap-1`}>{[0, 1, 2].map((item) => <span key={item} className="flex items-center justify-between rounded border border-white/10 px-1.5 py-1"><Line className="w-10" /><Line className="w-4 bg-red-400/60" /></span>)}</span>;
  }
  if (variant === "featured") {
    return <span className={`${base} gap-1.5`}><Tile className="w-3/5 bg-red-500/20" /><span className="flex w-2/5 flex-col gap-1.5"><Tile className="h-1/2" /><Tile className="h-1/2" /></span></span>;
  }
  if (variant === "mosaic") {
    return <span className={`${base} gap-1`}><Tile className="w-1/2" /><span className="grid w-1/2 grid-cols-2 gap-1"><Tile /><Tile /><Tile /><Tile /></span></span>;
  }
  if (variant === "gallery") {
    return <span className={`${base} gap-1.5`}><span className="flex w-2/5 flex-col justify-center gap-1.5"><Line className="w-10" /><Line className="w-full" /><Line className="w-4/5" /></span><span className="grid w-3/5 grid-cols-2 gap-1"><Tile /><Tile /><Tile /><Tile /></span></span>;
  }
  if (variant === "carousel") {
    return <span className={`${base} items-center gap-1.5 pl-5`}><Tile className="h-10 w-14 shrink-0" /><Tile className="h-10 w-14 shrink-0 bg-red-500/20" /><Tile className="h-10 w-14 shrink-0" /></span>;
  }
  if (variant === "chips") {
    return <span className={`${base} flex-wrap content-center justify-center gap-1.5`}>{["w-12", "w-9", "w-14", "w-10"].map((width, item) => <span key={item} className={`h-4 rounded-full border border-white/15 bg-white/10 ${width}`} />)}</span>;
  }
  if (["split", "comparison"].includes(variant)) {
    return <span className={`${base} items-stretch gap-1.5`}><Tile className="w-1/2 bg-red-500/15" /><span className="flex w-1/2 flex-col justify-center gap-1.5"><Line className="w-10" /><Line className="w-full" /><Line className="w-4/5" /></span></span>;
  }
  if (["announcement", "full"].includes(variant)) {
    return <span className={`${base} items-center`}><span className="flex h-7 w-full items-center justify-between rounded bg-red-500/25 px-2"><Line className="w-12 bg-white/50" /><span className="h-3 w-7 rounded-full bg-white/70" /></span></span>;
  }
  if (variant === "offer") {
    return <span className={`${base} items-center justify-center`}><span className="relative flex h-12 w-4/5 items-center rounded border border-red-400/30 bg-red-500/10 px-2"><span className="absolute -top-1.5 right-2 h-3 w-6 rounded-full bg-red-500" /><span className="space-y-1"><Line className="w-12" /><Line className="w-8" /></span></span></span>;
  }
  if (["centered", "wide"].includes(variant) || type === "video" || type === "branding_video") {
    return <span className={`${base} items-center justify-center`}><span className={`${variant === "wide" ? "w-full" : "w-4/5"} flex h-11 items-center justify-center rounded bg-white/10`}><span className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-red-400" /></span></span>;
  }
  if (variant === "contact") {
    return <span className={`${base} items-center gap-2`}><span className="flex h-10 w-10 items-center justify-center rounded bg-red-500/15 text-red-400">◎</span><span className="flex-1 space-y-1.5"><Line className="w-3/4" /><Line className="w-full" /><Line className="w-1/2" /></span></span>;
  }
  if (variant === "card") {
    return <span className={`${base} items-center justify-center`}><span className="w-4/5 rounded border border-white/15 bg-white/[0.06] p-2"><Line className="w-1/2" /><Line className="mt-1.5 w-full" /><Line className="mt-1 w-3/4" /></span></span>;
  }

  return <span className={`${base} items-center gap-1.5`}><Tile className="h-11 flex-1" /><Tile className="h-11 flex-1 bg-red-500/15" /><Tile className="h-11 flex-1" /></span>;
}

export function WidthMiniature({ width }: { width: "full" | "wide" | "standard" | "compact" }) {
  const widths = { full: "w-full", wide: "w-5/6", standard: "w-2/3", compact: "w-1/2" } as const;
  return <span className="flex h-12 items-center justify-center p-2"><span className={`h-7 rounded border border-red-400/30 bg-red-500/20 ${widths[width]}`} /></span>;
}

export function SpacingMiniature({ spacing }: { spacing: "none" | "compact" | "comfortable" | "spacious" }) {
  const gaps = { none: "gap-0", compact: "gap-1", comfortable: "gap-2", spacious: "gap-3" } as const;
  return <span className={`flex h-12 flex-col justify-center px-3 ${gaps[spacing]}`}><Line className="w-2/3" /><Line className="w-full" /><Line className="w-4/5" /></span>;
}

export function AlignMiniature({ align }: { align: "left" | "center" | "right" }) {
  const alignment = { left: "items-start", center: "items-center", right: "items-end" } as const;
  return <span className={`flex h-12 flex-col justify-center gap-1.5 px-3 ${alignment[align]}`}><Line className="w-1/2" /><Line className="w-4/5" /><Line className="w-2/3" /></span>;
}

export function BackgroundMiniature({ background, primaryColor }: { background: string; primaryColor: string }) {
  const style = background === "primary" ? { backgroundColor: primaryColor } : undefined;
  const classes = background === "base" ? "bg-neutral-800" : background === "alternate" ? "bg-neutral-900" : background === "custom" ? "bg-gradient-to-br from-fuchsia-900/50 to-cyan-900/50" : background === "auto" ? "bg-gradient-to-r from-neutral-800 to-neutral-950" : "";
  return <span className={`flex h-12 items-center justify-center ${classes}`} style={style}><span className="h-5 w-3/5 rounded border border-white/20 bg-white/10" /></span>;
}

export function ColumnsMiniature({ columns }: { columns: number }) {
  return <span className="grid h-12 items-center gap-1 p-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }).map((_, index) => <Tile key={index} className="h-7" />)}</span>;
}

export function AspectMiniature({ ratio }: { ratio: "16:9" | "9:16" | "1:1" }) {
  const size = ratio === "16:9" ? "h-7 w-12" : ratio === "9:16" ? "h-10 w-6" : "h-9 w-9";
  return <span className="flex h-14 items-center justify-center"><span className={`flex items-center justify-center rounded border border-white/15 bg-white/10 ${size}`}><span className="ml-0.5 block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-red-400" /></span></span>;
}

export function SourceMiniature({ mode }: { mode: "all" | "featured" | "selected" }) {
  return (
    <span className="flex h-14 items-center justify-center gap-1.5 p-2">
      {[0, 1, 2].map((item) => (
        <span key={item} className={`relative h-8 flex-1 rounded border ${mode === "selected" && item === 1 ? "border-red-400 bg-red-500/20" : mode === "featured" && item === 0 ? "border-amber-400/60 bg-amber-500/20" : "border-white/10 bg-white/[0.06]"}`}>
          {mode === "featured" && item === 0 && <span className="absolute -right-1 -top-1 text-[9px] text-amber-300">★</span>}
          {mode === "selected" && item === 1 && <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white">✓</span>}
        </span>
      ))}
    </span>
  );
}

export function SectionMiniature({ type }: { type: CatalogBlockType }) {
  const variantByType: Partial<Record<CatalogBlockType, string>> = {
    servicos: "grid",
    destaques: "featured",
    pacotes: "comparison",
    antes_depois: "split",
    avaliacoes: "carousel",
    sobre: "card",
    horarios: "chips",
    localizacao: "contact",
    banner: "offer",
    video: "centered",
    branding_video: "wide",
    text: "card",
    cta: "full",
  };
  return (
    <span className="block bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,.16),transparent_48%)] p-3">
      <span className="mb-2 flex items-center gap-1.5"><span className="h-1.5 w-8 rounded-full bg-red-400/70" /><span className="h-1.5 w-12 rounded-full bg-white/15" /></span>
      <VariantMiniature type={type} variant={variantByType[type] ?? "default"} />
    </span>
  );
}
