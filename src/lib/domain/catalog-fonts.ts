export type CatalogFontPairId =
  | "modern_clean"
  | "editorial"
  | "performance"
  | "friendly"
  | "precision"
  | "elegant"
  | "confident";

export type CatalogFontPair = {
  id: CatalogFontPairId;
  nome: string;
  descricao: string;
  headingFont: { name: string; weights: readonly number[]; variable: string };
  bodyFont: { name: string; weights: readonly number[]; variable: string };
};

export const DEFAULT_CATALOG_FONT_PAIR_ID: CatalogFontPairId = "modern_clean";

export const CATALOG_FONT_PAIRS: readonly CatalogFontPair[] = [
  {
    id: "modern_clean",
    nome: "Moderno",
    descricao: "Limpo, atual e fácil de ler em qualquer tela.",
    headingFont: { name: "Manrope", weights: [600, 700, 800], variable: "--catalog-font-manrope" },
    bodyFont: { name: "Inter", weights: [400, 500, 600], variable: "--catalog-font-inter" },
  },
  {
    id: "editorial",
    nome: "Editorial",
    descricao: "Sofisticação com títulos marcantes e corpo neutro.",
    headingFont: { name: "Fraunces", weights: [600, 700, 800], variable: "--catalog-font-fraunces" },
    bodyFont: { name: "Inter", weights: [400, 500, 600], variable: "--catalog-font-inter" },
  },
  {
    id: "performance",
    nome: "Performance",
    descricao: "Condensado, forte e direto para uma estética esportiva.",
    headingFont: { name: "Barlow Condensed", weights: [600, 700, 800], variable: "--catalog-font-barlow" },
    bodyFont: { name: "Inter", weights: [400, 500, 600], variable: "--catalog-font-inter" },
  },
  {
    id: "friendly",
    nome: "Amigável",
    descricao: "Formas arredondadas para marcas próximas e acolhedoras.",
    headingFont: { name: "Poppins", weights: [600, 700], variable: "--catalog-font-poppins" },
    bodyFont: { name: "Manrope", weights: [400, 500, 600], variable: "--catalog-font-manrope" },
  },
  {
    id: "precision",
    nome: "Precisão",
    descricao: "Geometria contemporânea com sensação técnica e premium.",
    headingFont: { name: "Space Grotesk", weights: [600, 700], variable: "--catalog-font-space" },
    bodyFont: { name: "DM Sans", weights: [400, 500, 600], variable: "--catalog-font-dm" },
  },
  {
    id: "elegant",
    nome: "Elegante",
    descricao: "Contraste clássico para serviços de alto valor.",
    headingFont: { name: "Playfair Display", weights: [600, 700, 800], variable: "--catalog-font-playfair" },
    bodyFont: { name: "Manrope", weights: [400, 500, 600], variable: "--catalog-font-manrope" },
  },
  {
    id: "confident",
    nome: "Confiante",
    descricao: "Tipografia sólida, clara e comercial sem exageros.",
    headingFont: { name: "DM Sans", weights: [600, 700, 800], variable: "--catalog-font-dm" },
    bodyFont: { name: "DM Sans", weights: [400, 500, 600], variable: "--catalog-font-dm" },
  },
];

export function getCatalogFontPair(id: string | null | undefined): CatalogFontPair {
  return CATALOG_FONT_PAIRS.find((pair) => pair.id === id) ?? CATALOG_FONT_PAIRS[0];
}

