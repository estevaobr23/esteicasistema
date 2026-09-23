"use client";

import { useMemo, useState } from "react";
import { CATALOG_FONT_VARIABLE_CLASSES } from "@/lib/domain/catalog-font-runtime";
import { getCatalogFontPair } from "@/lib/domain/catalog-fonts";
import {
  generateCatalogPalette,
  PALETTE_CLIMATES,
  type PaletteClimateId,
} from "@/lib/domain/catalog-colors";

const BRAND_COLORS = [
  "#dc2626", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#16a34a", "#059669",
  "#0891b2", "#0284c7", "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#db2777",
];

export default function ColorPaletteWizard({ initialPrimary, fontPairId, onApply, onClose }: { initialPrimary: string; fontPairId: string; onApply: (palette: { primary: string; secondary: string; background: string }) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [climate, setClimate] = useState<PaletteClimateId>("sophisticated");
  const [baseColor, setBaseColor] = useState(initialPrimary);
  const [customColor, setCustomColor] = useState(initialPrimary);
  const [saturation, setSaturation] = useState(0);
  const [contrast, setContrast] = useState(0);
  const palette = useMemo(() => generateCatalogPalette(climate, baseColor, saturation, contrast), [baseColor, climate, contrast, saturation]);
  const fontPair = getCatalogFontPair(fontPairId);

  const titles = ["Qual clima combina com a sua marca?", "Escolha a cor-base", "Sua paleta foi criada", "Ajuste a intensidade", "Pronto para aplicar"];

  return (
    <div className={`${CATALOG_FONT_VARIABLE_CLASSES} space-y-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">Paleta guiada · {step + 1} de 5</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{titles[step]}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg border border-neutral-800 px-3 py-2 text-xs text-neutral-400">Fechar</button>
      </div>

      <div className="grid grid-cols-5 gap-1" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => <span key={index} className={`h-1.5 rounded-full ${index <= step ? "bg-red-500" : "bg-neutral-800"}`} />)}
      </div>

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {PALETTE_CLIMATES.map((item) => {
            const sample = generateCatalogPalette(item.id, baseColor);
            return (
              <button key={item.id} type="button" onClick={() => { setClimate(item.id); setStep(1); }} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 text-left transition hover:border-neutral-600">
                <span className="grid h-16 grid-cols-[1fr_34%_20%]" style={{ backgroundColor: sample.background }}><span /><span style={{ backgroundColor: sample.primary }} /><span style={{ backgroundColor: sample.secondary }} /></span>
                <span className="block p-3"><strong className="block text-sm text-white">{item.nome}</strong><span className="mt-1 block text-xs leading-5 text-neutral-500">{item.descricao}</span></span>
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {BRAND_COLORS.map((color) => <button key={color} type="button" aria-label={`Usar cor ${color}`} onClick={() => { setBaseColor(color); setCustomColor(color); setStep(2); }} className="aspect-square rounded-xl border-2 border-white/10 shadow-inner transition hover:scale-105 hover:border-white" style={{ backgroundColor: color }} />)}
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs font-semibold text-white">Cor personalizada</p>
            <div className="mt-3 flex items-center gap-3">
              <input type="color" value={customColor} onChange={(event) => setCustomColor(event.target.value)} className="h-11 w-14 cursor-pointer rounded-lg bg-transparent" aria-label="Escolher cor personalizada" />
              <span className="min-w-0 flex-1 text-sm uppercase text-neutral-400">{customColor}</span>
              <button type="button" onClick={() => { setBaseColor(customColor); setStep(2); }} className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-neutral-950">Usar esta cor</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <PaletteSwatches palette={palette} />
          <p className="text-sm leading-6 text-neutral-400">Criamos uma combinação coerente entre marca, destaque e fundo com base no clima escolhido.</p>
          <button type="button" onClick={() => setStep(3)} className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950">Ajustar detalhes</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <RangeField label="Vivacidade das cores" value={saturation} onChange={setSaturation} />
          <RangeField label="Contraste do fundo" value={contrast} onChange={setContrast} />
          <button type="button" onClick={() => setStep(4)} className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950">Ver resultado final</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <PaletteSwatches palette={palette} />
          <button type="button" onClick={() => { onApply(palette); onClose(); }} className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-neutral-950">Aplicar paleta no catálogo</button>
        </div>
      )}

      {step > 0 && <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="text-xs font-medium text-neutral-400 underline underline-offset-4">← Voltar uma etapa</button>}

      <div className="overflow-hidden rounded-2xl border border-white/10 p-5" style={{ backgroundColor: palette.background, color: palette.dark ? "#f8fafc" : "#111827", fontFamily: `var(${fontPair.bodyFont.variable})` }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.primary }}>Prévia ao vivo</p>
        <h4 className="mt-3 text-2xl leading-tight" style={{ fontFamily: `var(${fontPair.headingFont.variable})`, fontWeight: 700 }}>Seu cuidado merece destaque.</h4>
        <p className="mt-2 text-xs leading-5 opacity-70">Veja como títulos, textos, fundo e chamada trabalham juntos.</p>
        <span className="mt-4 inline-flex rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: palette.primary }}>Quero solicitar orçamento</span>
      </div>
    </div>
  );
}

function PaletteSwatches({ palette }: { palette: { primary: string; secondary: string; background: string } }) {
  return <div className="grid grid-cols-3 gap-2">{([['Marca', palette.primary], ['Destaque', palette.secondary], ['Fundo', palette.background]] as const).map(([label, color]) => <div key={label} className="rounded-xl border border-white/10 p-2" style={{ backgroundColor: color }}><span className="rounded bg-black/55 px-1.5 py-1 text-[9px] font-bold uppercase text-white">{label}</span><span className="mt-7 block text-[9px] uppercase text-white/80">{color}</span></div>)}</div>;
}

function RangeField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="mb-2 flex justify-between text-xs font-medium text-neutral-300"><span>{label}</span><span className="text-neutral-500">{value > 0 ? `+${value}` : value}</span></span><input type="range" min={-20} max={20} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-red-500" /></label>;
}

