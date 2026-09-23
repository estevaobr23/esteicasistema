import { BLOCK_DESCRIPTIONS, BLOCK_LABELS, type CatalogBlockType } from "./schema";

export type BlockCategory = "Conteúdo" | "Prova" | "Conversão" | "Estrutura";

type BlockDefinition = {
  type: CatalogBlockType;
  category: BlockCategory;
  icon: string;
  label: string;
  description: string;
  variants: { id: string; label: string }[];
  professional?: boolean;
};

const definitions: BlockDefinition[] = [
  { type: "destaques", category: "Conteúdo", icon: "★", label: BLOCK_LABELS.destaques, description: BLOCK_DESCRIPTIONS.destaques, variants: [{ id: "cards", label: "Cards" }, { id: "featured", label: "Destaque" }] },
  { type: "pacotes", category: "Conteúdo", icon: "◇", label: BLOCK_LABELS.pacotes, description: BLOCK_DESCRIPTIONS.pacotes, variants: [{ id: "cards", label: "Cards" }, { id: "comparison", label: "Comparação" }, { id: "compact", label: "Compacto" }], professional: true },
  { type: "antes_depois", category: "Prova", icon: "◐", label: BLOCK_LABELS.antes_depois, description: BLOCK_DESCRIPTIONS.antes_depois, variants: [{ id: "grid", label: "Grade" }, { id: "featured", label: "Destaque" }, { id: "mosaic", label: "Mosaico" }], professional: true },
  { type: "avaliacoes", category: "Prova", icon: "✦", label: BLOCK_LABELS.avaliacoes, description: BLOCK_DESCRIPTIONS.avaliacoes, variants: [{ id: "grid", label: "Grade" }, { id: "carousel", label: "Faixa" }, { id: "featured", label: "Depoimento em destaque" }], professional: true },
  { type: "carrossel", category: "Prova", icon: "⇄", label: BLOCK_LABELS.carrossel, description: BLOCK_DESCRIPTIONS.carrossel, variants: [{ id: "slides", label: "Slides automáticos" }, { id: "marquee", label: "Faixa contínua" }] },
  { type: "sobre", category: "Conteúdo", icon: "¶", label: BLOCK_LABELS.sobre, description: BLOCK_DESCRIPTIONS.sobre, variants: [{ id: "default", label: "Editorial" }, { id: "split", label: "Foto + texto" }, { id: "gallery", label: "Galeria" }] },
  { type: "horarios", category: "Conversão", icon: "◷", label: BLOCK_LABELS.horarios, description: BLOCK_DESCRIPTIONS.horarios, variants: [{ id: "chips", label: "Botões" }, { id: "list", label: "Lista" }] },
  { type: "localizacao", category: "Conversão", icon: "⌖", label: BLOCK_LABELS.localizacao, description: BLOCK_DESCRIPTIONS.localizacao, variants: [{ id: "default", label: "Simples" }, { id: "contact", label: "Contato" }] },
  { type: "banner", category: "Conversão", icon: "▰", label: BLOCK_LABELS.banner, description: BLOCK_DESCRIPTIONS.banner, variants: [{ id: "split", label: "Imagem e texto" }, { id: "announcement", label: "Faixa" }, { id: "offer", label: "Oferta" }] },
  { type: "video", category: "Prova", icon: "▶", label: BLOCK_LABELS.video, description: BLOCK_DESCRIPTIONS.video, variants: [{ id: "centered", label: "Centralizado" }, { id: "split", label: "Vídeo e texto" }, { id: "wide", label: "Largura ampla" }], professional: true },
  { type: "branding_video", category: "Prova", icon: "▣", label: BLOCK_LABELS.branding_video, description: BLOCK_DESCRIPTIONS.branding_video, variants: [{ id: "centered", label: "Centralizado" }, { id: "wide", label: "Amplo" }], professional: true },
  { type: "text", category: "Estrutura", icon: "T", label: BLOCK_LABELS.text, description: BLOCK_DESCRIPTIONS.text, variants: [{ id: "default", label: "Editorial" }, { id: "card", label: "Card" }, { id: "split", label: "Duas colunas" }] },
  { type: "cta", category: "Conversão", icon: "↗", label: BLOCK_LABELS.cta, description: BLOCK_DESCRIPTIONS.cta, variants: [{ id: "full", label: "Faixa" }, { id: "compact", label: "Compacto" }, { id: "card", label: "Card" }] },
];

export const BLOCK_DEFINITIONS = definitions;
export const BLOCK_CATEGORIES: BlockCategory[] = ["Conteúdo", "Prova", "Conversão", "Estrutura"];

export function getBlockDefinition(type: CatalogBlockType) {
  return definitions.find((definition) => definition.type === type) ?? definitions[0];
}
