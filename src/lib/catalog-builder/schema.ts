import { SECTION_IDS, type SectionConfig, type SectionId } from "@/lib/domain/catalog-sections";
import type { TemplateId } from "@/lib/domain/catalog-templates";

export const CUSTOM_BLOCK_TYPES = ["banner", "video", "text", "cta", "carrossel"] as const;
export type CustomBlockType = (typeof CUSTOM_BLOCK_TYPES)[number];
export type CatalogBlockType = SectionId | CustomBlockType;
export type BlockWidth = "full" | "wide" | "standard" | "compact";
export type BlockSpacing = "none" | "compact" | "comfortable" | "spacious";
export type BlockAlign = "left" | "center" | "right";
export type CatalogItemRef = { instanceId: string; sourceId: string; mediaMode?: string };
export type CatalogDataSource = { mode: "all" | "featured" | "selected"; items: CatalogItemRef[]; limit: number };

export type CatalogBlock = {
  instanceId: string;
  type: CatalogBlockType;
  visible: boolean;
  variant: string;
  content: Record<string, unknown>;
  dataSource: CatalogDataSource;
  style: {
    width: BlockWidth;
    spacing: BlockSpacing;
    align: BlockAlign;
    background: "auto" | "base" | "alternate" | "primary" | "custom";
    backgroundColor?: string;
    accentColor?: string;
  };
  responsive: {
    columns: { mobile: 1 | 2; tablet: 1 | 2 | 3; desktop: 1 | 2 | 3 | 4 };
    hideOnMobile: boolean;
    hideOnDesktop: boolean;
  };
};

export type CatalogLayout = {
  schemaVersion: 1;
  templateId: TemplateId;
  blocks: CatalogBlock[];
};

const ALL_BLOCK_TYPES = new Set<string>([...SECTION_IDS, ...CUSTOM_BLOCK_TYPES]);
const WIDTHS = new Set<BlockWidth>(["full", "wide", "standard", "compact"]);
const SPACINGS = new Set<BlockSpacing>(["none", "compact", "comfortable", "spacious"]);
const ALIGNS = new Set<BlockAlign>(["left", "center", "right"]);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
export const BLOCK_VARIANT_IDS: Record<CatalogBlockType, readonly string[]> = {
  servicos: ["grid", "list", "compact"],
  destaques: ["cards", "featured"],
  antes_depois: ["grid", "featured", "mosaic"],
  branding_video: ["centered", "wide"],
  pacotes: ["cards", "comparison", "compact"],
  horarios: ["chips", "list"],
  avaliacoes: ["grid", "carousel", "featured"],
  sobre: ["default", "split", "gallery"],
  localizacao: ["default", "contact"],
  banner: ["split", "announcement", "offer"],
  video: ["centered", "split", "wide"],
  text: ["default", "card", "split"],
  cta: ["full", "compact", "card"],
  carrossel: ["slides", "marquee"],
};
export const DEFAULT_BLOCK_VARIANTS: Record<CatalogBlockType, string> = Object.fromEntries(
  Object.entries(BLOCK_VARIANT_IDS).map(([type, variants]) => [type, variants[0]])
) as Record<CatalogBlockType, string>;
const CONTENT_KEYS: Record<CatalogBlockType, readonly string[]> = {
  servicos: ["eyebrow", "title", "description"],
  destaques: ["eyebrow", "title", "description"],
  antes_depois: ["eyebrow", "title", "description"],
  branding_video: ["eyebrow", "title", "description"],
  pacotes: ["eyebrow", "title", "description"],
  horarios: ["eyebrow", "title", "description"],
  avaliacoes: ["eyebrow", "title", "description"],
  sobre: ["eyebrow", "title", "description"],
  localizacao: ["eyebrow", "title", "description"],
  banner: ["eyebrow", "title", "description", "imageUrl", "buttonLabel", "buttonUrl"],
  video: ["title", "description", "videoUrl", "aspectRatio"],
  text: ["eyebrow", "title", "body", "buttonLabel", "buttonUrl"],
  cta: ["title", "description", "buttonLabel", "message"],
  carrossel: ["eyebrow", "title", "description", "mode"],
};

function normalizeContent(type: CatalogBlockType, raw: unknown, fallback: Record<string, unknown>) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
  const source = raw as Record<string, unknown>;
  const content: Record<string, unknown> = {};
  for (const key of CONTENT_KEYS[type]) {
    if (typeof source[key] !== "string") continue;
    const maxLength = key === "body" ? 4000 : key.toLowerCase().includes("url") ? 2000 : 600;
    content[key] = String(source[key]).slice(0, maxLength);
  }
  if (type === "sobre" && Array.isArray(source.galleryImages)) {
    content.galleryImages = source.galleryImages
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .slice(0, 12)
      .map((value) => value.slice(0, 2000));
  }
  if (type === "carrossel") {
    content.mode = source.mode === "reviews" ? "reviews" : "images";
    content.images = Array.isArray(source.images)
      ? source.images.filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, 12).map((value) => value.slice(0, 2000))
      : [];
    content.reviewIds = Array.isArray(source.reviewIds)
      ? source.reviewIds.filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, 20)
      : [];
    content.autoplaySeconds = Math.max(2, Math.min(15, Number(source.autoplaySeconds) || 5));
  }
  return { ...fallback, ...content };
}

export const BLOCK_LABELS: Record<CatalogBlockType, string> = {
  servicos: "Serviços",
  destaques: "Serviços em destaque",
  antes_depois: "Antes e depois",
  branding_video: "Vídeo de apresentação",
  pacotes: "Pacotes",
  horarios: "Horários",
  avaliacoes: "Avaliações",
  sobre: "Sobre o negócio",
  localizacao: "Localização",
  banner: "Banner promocional",
  video: "Vídeo",
  text: "Texto livre",
  cta: "Chamada para ação",
  carrossel: "Carrossel automático",
};

export const BLOCK_DESCRIPTIONS: Record<CatalogBlockType, string> = {
  servicos: "Mostre seus serviços, preços e formas de atendimento.",
  destaques: "Destaque os serviços marcados como mais procurados.",
  antes_depois: "Apresente resultados com comparação antes e depois.",
  branding_video: "Use o vídeo institucional já configurado.",
  pacotes: "Mostre ofertas que combinam vários serviços.",
  horarios: "Exiba as próximas disponibilidades para contato.",
  avaliacoes: "Reforce a confiança com avaliações de clientes.",
  sobre: "Conte a história e o posicionamento do negócio.",
  localizacao: "Mostre endereço, cidade e acesso ao mapa.",
  banner: "Divulgue uma promoção, novidade ou condição especial.",
  video: "Adicione um vídeo específico em qualquer ponto do catálogo.",
  text: "Crie uma seção editorial com título, texto e botão.",
  cta: "Convide o visitante a chamar no WhatsApp.",
  carrossel: "Alterne automaticamente imagens ou depoimentos para dar ritmo à página.",
};

export function isCatalogBlockType(value: unknown): value is CatalogBlockType {
  return typeof value === "string" && ALL_BLOCK_TYPES.has(value);
}

export function createInstanceId(prefix = "block") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultBlock(type: CatalogBlockType, instanceId = createInstanceId(type)): CatalogBlock {
  const customContent: Partial<Record<CatalogBlockType, Record<string, unknown>>> = {
    servicos: { eyebrow: "Escolha seu cuidado", title: "Serviços", description: "Compare opções, benefícios e valores para encontrar o cuidado ideal." },
    destaques: { eyebrow: "Mais escolhidos", title: "Comece por aqui", description: "Os serviços que mais entregam transformação, proteção e praticidade." },
    antes_depois: { eyebrow: "Resultados reais", title: "Veja a transformação", description: "Compare o estado inicial com o acabamento depois do nosso processo." },
    branding_video: { eyebrow: "Por dentro do processo", title: "Conheça nosso trabalho", description: "Veja o cuidado aplicado em cada etapa." },
    pacotes: { eyebrow: "Melhor custo-benefício", title: "Pacotes completos", description: "Combinações prontas para economizar e cuidar do veículo por inteiro." },
    horarios: { eyebrow: "Agenda", title: "Próximos horários", description: "Escolha uma opção e fale com a equipe para confirmar." },
    avaliacoes: { eyebrow: "Confiança", title: "Quem fez, recomenda", description: "Experiências de clientes que já cuidaram do carro com a gente." },
    sobre: { eyebrow: "Nossa forma de trabalhar", title: "Cuidado que aparece no resultado", description: "", galleryImages: [] },
    localizacao: { eyebrow: "Atendimento", title: "Onde estamos", description: "Consulte a localização e planeje sua visita." },
    banner: {
      eyebrow: "Oferta especial",
      title: "Destaque uma promoção importante",
      description: "Use este espaço para apresentar uma condição especial aos seus clientes.",
      imageUrl: "",
      buttonLabel: "Falar no WhatsApp",
      buttonUrl: "",
    },
    video: {
      title: "Veja nosso trabalho",
      description: "Apresente o processo, o ambiente ou o resultado do serviço.",
      videoUrl: "",
      aspectRatio: "16:9",
    },
    text: {
      eyebrow: "Nossa diferença",
      title: "Adicione um título para esta seção",
      body: "Conte algo importante sobre seu trabalho, atendimento ou processo.",
      buttonLabel: "",
      buttonUrl: "",
    },
    cta: {
      title: "Pronto para cuidar do seu carro?",
      description: "Fale com a nossa equipe e solicite seu orçamento.",
      buttonLabel: "Falar no WhatsApp",
      message: "Olá! Vim pelo catálogo e gostaria de solicitar um orçamento.",
    },
    carrossel: {
      eyebrow: "Resultados em movimento",
      title: "Veja mais do nosso trabalho",
      description: "Uma seleção automática de imagens e experiências de clientes.",
      mode: "images",
      images: [],
      reviewIds: [],
      autoplaySeconds: 5,
    },
  };

  return {
    instanceId,
    type,
    visible: true,
    variant: DEFAULT_BLOCK_VARIANTS[type],
    content: customContent[type as CustomBlockType] ?? {},
    dataSource: { mode: type === "destaques" ? "featured" : "all", items: [], limit: type === "destaques" ? 3 : 12 },
    style: {
      width: type === "banner" || type === "cta" || type === "carrossel" ? "wide" : "standard",
      spacing: "comfortable",
      align: "center",
      background: "auto",
    },
    responsive: {
      columns: { mobile: 1, tablet: 2, desktop: type === "servicos" ? 3 : 2 },
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  };
}

export function legacySectionsToCatalogLayout(
  sections: SectionConfig[],
  templateId: TemplateId
): CatalogLayout {
  return {
    schemaVersion: 1,
    templateId,
    blocks: sections.map((section) => ({
      ...createDefaultBlock(section.id, `legacy-${section.id}`),
      visible: section.visible,
    })),
  };
}

export function normalizeCatalogLayout(
  raw: unknown,
  fallbackSections: SectionConfig[],
  templateId: TemplateId
): CatalogLayout {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return legacySectionsToCatalogLayout(fallbackSections, templateId);
  }
  const source = raw as { schemaVersion?: unknown; templateId?: unknown; blocks?: unknown };
  if (!Array.isArray(source.blocks)) {
    return legacySectionsToCatalogLayout(fallbackSections, templateId);
  }

  // Um layout vazio com versão explícita representa um catálogo criado do zero.
  // Objetos antigos/incompletos continuam usando o fallback das seções legadas.
  if (source.schemaVersion === 1 && source.blocks.length === 0) {
    return { schemaVersion: 1, templateId, blocks: [] };
  }

  const blocks = source.blocks
    .slice(0, 30)
    .map((entry, index): CatalogBlock | null => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      const candidate = entry as Partial<CatalogBlock>;
      if (!isCatalogBlockType(candidate.type)) return null;
      const defaults = createDefaultBlock(candidate.type, `normalized-${candidate.type}-${index}`);
      const style = candidate.style && typeof candidate.style === "object" ? candidate.style : defaults.style;
      const responsive = candidate.responsive && typeof candidate.responsive === "object" ? candidate.responsive : defaults.responsive;
      const columns = responsive.columns && typeof responsive.columns === "object" ? responsive.columns : defaults.responsive.columns;
      return {
        ...defaults,
        instanceId: typeof candidate.instanceId === "string" && candidate.instanceId ? candidate.instanceId : defaults.instanceId,
        visible: candidate.visible !== false,
        variant: typeof candidate.variant === "string" && BLOCK_VARIANT_IDS[candidate.type].includes(candidate.variant)
          ? candidate.variant
          : defaults.variant,
        content: normalizeContent(candidate.type, candidate.content, defaults.content),
        dataSource: (() => {
          const source = candidate.dataSource && typeof candidate.dataSource === "object" ? candidate.dataSource : defaults.dataSource;
          const mode = ["all", "featured", "selected"].includes(String(source.mode)) ? source.mode as CatalogDataSource["mode"] : "all";
          const items = Array.isArray(source.items) ? source.items.slice(0, 30).flatMap((item, itemIndex) => {
            if (!item || typeof item !== "object") return [];
            const value = item as Partial<CatalogItemRef>;
            if (typeof value.sourceId !== "string" || !value.sourceId) return [];
            return [{ instanceId: typeof value.instanceId === "string" && value.instanceId ? value.instanceId : `item-${index}-${itemIndex}`, sourceId: value.sourceId, mediaMode: typeof value.mediaMode === "string" ? value.mediaMode : undefined }];
          }) : [];
          return { mode, items, limit: Math.max(1, Math.min(30, Number(source.limit) || 12)) };
        })(),
        style: {
          width: WIDTHS.has(style.width as BlockWidth) ? (style.width as BlockWidth) : defaults.style.width,
          spacing: SPACINGS.has(style.spacing as BlockSpacing) ? (style.spacing as BlockSpacing) : defaults.style.spacing,
          align: ALIGNS.has(style.align as BlockAlign) ? (style.align as BlockAlign) : defaults.style.align,
          background: ["auto", "base", "alternate", "primary", "custom"].includes(String(style.background))
            ? (style.background as CatalogBlock["style"]["background"])
            : defaults.style.background,
          backgroundColor: typeof style.backgroundColor === "string" ? style.backgroundColor : undefined,
          accentColor: typeof style.accentColor === "string" && HEX_COLOR.test(style.accentColor) ? style.accentColor : undefined,
        },
        responsive: {
          columns: {
            mobile: columns.mobile === 2 ? 2 : 1,
            tablet: [1, 2, 3].includes(Number(columns.tablet)) ? (columns.tablet as 1 | 2 | 3) : 2,
            desktop: [1, 2, 3, 4].includes(Number(columns.desktop)) ? (columns.desktop as 1 | 2 | 3 | 4) : 3,
          },
          hideOnMobile: responsive.hideOnMobile === true,
          hideOnDesktop: responsive.hideOnDesktop === true,
        },
      };
    })
    .filter((block): block is CatalogBlock => !!block);

  const usedIds = new Set<string>();
  for (const [index, block] of blocks.entries()) {
    if (usedIds.has(block.instanceId)) block.instanceId = `normalized-${block.type}-${index}`;
    usedIds.add(block.instanceId);
  }

  return blocks.length
    ? { schemaVersion: 1, templateId, blocks }
    : legacySectionsToCatalogLayout(fallbackSections, templateId);
}

export function layoutToLegacySections(layout: CatalogLayout): SectionConfig[] {
  const seen = new Set<SectionId>();
  const sections: SectionConfig[] = [];
  for (const block of layout.blocks) {
    if (SECTION_IDS.includes(block.type as SectionId) && !seen.has(block.type as SectionId)) {
      seen.add(block.type as SectionId);
      sections.push({ id: block.type as SectionId, visible: block.visible });
    }
  }
  for (const id of SECTION_IDS) {
    if (!seen.has(id)) sections.push({ id, visible: false });
  }
  return sections;
}
