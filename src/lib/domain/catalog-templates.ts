import { SECTION_IDS, type SectionConfig } from "./catalog-sections";

export const TEMPLATE_IDS = ["classico_dark", "claro_premium", "performance_gt"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type CardStyle = {
  borderRadius: string;
  borderWidth: string;
  shadow: string;
};

export type Typography = {
  headingWeight: string;
  headingTracking: string;
};

export type CatalogTemplate = {
  id: TemplateId;
  nome: string;
  descricao: string;
  isDark: boolean;
  palette: {
    bg: string;
    bgDeep: string;
    textColor: string;
    textMuted: string;
    primaryColorDefault: string;
    secondaryColorDefault: string;
  };
  cardStyle: CardStyle;
  typography: Typography;
  defaultSectionsConfig: SectionConfig[];
};

const ALL_VISIBLE_EXCEPT_VIDEO: SectionConfig[] = SECTION_IDS.map((id) => ({
  id,
  visible: id !== "branding_video",
}));

export const CATALOG_TEMPLATES: Record<TemplateId, CatalogTemplate> = {
  classico_dark: {
    id: "classico_dark",
    nome: "Clássico Dark",
    descricao: "Preto, grafite, elegante — o padrão da estética automotiva premium.",
    isDark: true,
    palette: {
      bg: "#0a0a0a",
      bgDeep: "#141414",
      textColor: "#ffffff",
      textMuted: "rgba(255,255,255,0.6)",
      primaryColorDefault: "#e11d2a",
      secondaryColorDefault: "#111827",
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      shadow: "none",
    },
    typography: {
      headingWeight: "700",
      headingTracking: "normal",
    },
    defaultSectionsConfig: ALL_VISIBLE_EXCEPT_VIDEO,
  },
  claro_premium: {
    id: "claro_premium",
    nome: "Claro Premium",
    descricao: "Claro, clean, sofisticado — para quem quer transmitir leveza e cuidado.",
    isDark: false,
    palette: {
      bg: "#fafaf9",
      bgDeep: "#f0f0ef",
      textColor: "#171717",
      textMuted: "rgba(23,23,23,0.6)",
      primaryColorDefault: "#0EA5E9",
      secondaryColorDefault: "#111827",
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      shadow: "none",
    },
    typography: {
      headingWeight: "700",
      headingTracking: "normal",
    },
    defaultSectionsConfig: ALL_VISIBLE_EXCEPT_VIDEO,
  },
  performance_gt: {
    id: "performance_gt",
    nome: "Performance GT",
    descricao: "Esportivo, mais agressivo — para quem quer destacar potência e velocidade.",
    isDark: true,
    palette: {
      bg: "#0a0a0a",
      bgDeep: "#141414",
      textColor: "#ffffff",
      textMuted: "rgba(255,255,255,0.6)",
      primaryColorDefault: "#dc2626",
      secondaryColorDefault: "#111827",
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      shadow: "none",
    },
    typography: {
      headingWeight: "800",
      headingTracking: "tight",
    },
    defaultSectionsConfig: ALL_VISIBLE_EXCEPT_VIDEO,
  },
};

export function getCatalogTemplate(id: string): CatalogTemplate {
  return CATALOG_TEMPLATES[id as TemplateId] ?? CATALOG_TEMPLATES.classico_dark;
}
