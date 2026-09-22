export const SECTION_IDS = [
  "servicos",
  "destaques",
  "antes_depois",
  "branding_video",
  "pacotes",
  "horarios",
  "avaliacoes",
  "sobre",
  "localizacao",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export type SectionConfig = { id: SectionId; visible: boolean };

export const SECTION_LABELS: Record<SectionId, string> = {
  servicos: "Serviços",
  destaques: "Mais procurados",
  antes_depois: "Resultados (antes/depois)",
  branding_video: "Vídeo de apresentação",
  pacotes: "Pacotes",
  horarios: "Próximos horários",
  avaliacoes: "Avaliações",
  sobre: "Sobre",
  localizacao: "Localização",
};

// Ordem/visibilidade atual do catálogo público antes da config existir —
// serve de fallback para negócios sem `sections_config` preenchido, mantendo
// o comportamento hoje hardcoded em [slug]/page.tsx sem regressão visual.
const DEFAULT_SECTIONS_CONFIG: SectionConfig[] = SECTION_IDS.map((id) => ({
  id,
  visible: id !== "branding_video",
}));

export function normalizeSectionsConfig(raw: unknown): SectionConfig[] {
  const parsed = Array.isArray(raw) ? (raw as Partial<SectionConfig>[]) : [];
  const byId = new Map<string, boolean>();
  for (const entry of parsed) {
    if (entry && typeof entry.id === "string" && SECTION_IDS.includes(entry.id as SectionId)) {
      byId.set(entry.id, entry.visible !== false);
    }
  }

  if (byId.size === 0) return DEFAULT_SECTIONS_CONFIG;

  const ordered: SectionConfig[] = parsed
    .filter((entry): entry is SectionConfig => !!entry && SECTION_IDS.includes(entry.id as SectionId))
    .map((entry) => ({ id: entry.id, visible: entry.visible !== false }));

  // Garante que qualquer id novo (adicionado depois que o negócio salvou a
  // config pela primeira vez) apareça no fim, visível por padrão.
  for (const id of SECTION_IDS) {
    if (!ordered.some((s) => s.id === id)) {
      ordered.push({ id, visible: id !== "branding_video" });
    }
  }

  return ordered;
}
