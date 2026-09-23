export type PaletteClimateId = "sophisticated" | "clean" | "vibrant" | "technical";

export const PALETTE_CLIMATES = [
  { id: "sophisticated", nome: "Sofisticado e escuro", descricao: "Contraste profundo e acabamento premium.", dark: true, hueShift: 28 },
  { id: "clean", nome: "Leve e clean", descricao: "Fundo claro, respiro e aparência organizada.", dark: false, hueShift: 24 },
  { id: "vibrant", nome: "Vibrante e chamativo", descricao: "Contraste complementar para promoções fortes.", dark: true, hueShift: 180 },
  { id: "technical", nome: "Técnico e confiável", descricao: "Cores controladas com linguagem profissional.", dark: false, hueShift: 205 },
] as const;

type Hsl = { h: number; s: number; l: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function hexToHsl(hex: string): Hsl {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "dc2626";
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const delta = max - min;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return { h: (h + 360) % 360, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: Hsl) {
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const match = lightness - chroma / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g] = [chroma, x];
  else if (h < 120) [r, g] = [x, chroma];
  else if (h < 180) [g, b] = [chroma, x];
  else if (h < 240) [g, b] = [x, chroma];
  else if (h < 300) [r, b] = [x, chroma];
  else [r, b] = [chroma, x];
  return `#${[r, g, b].map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, "0")).join("")}`;
}

export function isDarkCatalogColor(hex: string) {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "111111";
  const [r, g, b] = [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 145;
}

export function deriveSurfaceColor(hex: string, dark: boolean) {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, s: clamp(hsl.s * 0.78, 4, 55), l: clamp(hsl.l + (dark ? 6 : -4), 3, 97) });
}

export function generateCatalogPalette(
  climateId: PaletteClimateId,
  baseColor: string,
  saturationAdjustment = 0,
  contrastAdjustment = 0
) {
  const climate = PALETTE_CLIMATES.find((item) => item.id === climateId) ?? PALETTE_CLIMATES[0];
  const base = hexToHsl(baseColor);
  const primary = hslToHex({
    h: base.h,
    s: clamp(base.s + saturationAdjustment, 35, 96),
    l: clamp(base.l + (climate.id === "vibrant" ? 4 : 0), 36, 62),
  });
  const secondary = hslToHex({
    h: (base.h + climate.hueShift) % 360,
    s: clamp(base.s + saturationAdjustment * 0.6 + (climate.id === "vibrant" ? 10 : -12), 24, 90),
    l: clamp((climate.dark ? 18 : 24) - contrastAdjustment * 0.12, 10, 38),
  });
  const background = hslToHex({
    h: base.h,
    s: climate.dark ? clamp(base.s * 0.18, 5, 18) : clamp(base.s * 0.12, 3, 12),
    l: climate.dark
      ? clamp(8 - contrastAdjustment * 0.08, 4, 14)
      : clamp(97 + contrastAdjustment * 0.04, 93, 99),
  });
  return { primary, secondary, background, dark: climate.dark };
}

