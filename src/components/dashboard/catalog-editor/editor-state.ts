import type { Database } from "@/lib/supabase/types";
import type { SectionConfig, SectionId } from "@/lib/domain/catalog-sections";
import { getCatalogTemplate, type TemplateId } from "@/lib/domain/catalog-templates";
import {
  createInstanceId,
  layoutToLegacySections,
  normalizeCatalogLayout,
  type CatalogBlock,
  type CatalogLayout,
} from "@/lib/catalog-builder/schema";
import { createTemplateLayout } from "@/lib/catalog-builder/template-layouts";
import { DEFAULT_CATALOG_FONT_PAIR_ID, getCatalogFontPair } from "@/lib/domain/catalog-fonts";
import type { AnimationPreset } from "@/components/catalog/CatalogSectionMotion";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export type MediaMode = "single_photo" | "before_after" | "gallery" | "youtube";

export type SalesBonus = { title: string; description: string };
export type SalesFaq = { question: string; answer: string };

export type ServiceDraft = {
  id: string;
  name: string;
  media_mode: MediaMode;
  image_url: string | null;
  before_image: string | null;
  after_image: string | null;
  gallery: string[];
  video_url: string | null;
  sales_page_enabled: boolean;
  sales_headline: string;
  sales_subheadline: string;
  sales_video_url: string;
  sales_gallery: string[];
  sales_bonuses: SalesBonus[];
  sales_cta_message: string;
  sales_guarantee_text: string;
  sales_faq: SalesFaq[];
  sales_urgency_text: string;
};

export type BusinessDraft = {
  template_id: string;
  theme: string;
  primary_color: string;
  secondary_color: string;
  bg_color_override: string;
  font_pair_id: string;
  animation_preset: AnimationPreset;
  logo_url: string;
  cover_url: string;
  about: string;
  headline: string;
  highlights: string[];
  branding_video_url: string;
  hero_show_city_badge: boolean;
  hero_show_price_badge: boolean;
  hero_show_whatsapp_badge: boolean;
  button_radius: number;
};

export type EditorState = {
  businessId: string;
  business: BusinessDraft;
  services: ServiceDraft[];
  sectionsConfig: SectionConfig[];
  layout: CatalogLayout;
  templateCustomized: boolean;
  dirty: boolean;
  saving: boolean;
  lastSavedAt: number | null;
  saveError: string | null;
};

export type EditorAction =
  | { type: "SET_COLOR"; key: "primary" | "secondary"; value: string }
  | { type: "SET_BACKGROUND_COLOR"; value: string }
  | { type: "APPLY_PALETTE"; primary: string; secondary: string; background: string }
  | { type: "SET_FONT_PAIR"; value: string }
  | { type: "SET_ANIMATION_PRESET"; value: AnimationPreset }
  | { type: "SET_LOGO_URL"; url: string }
  | { type: "SET_COVER_URL"; url: string }
  | { type: "SET_ABOUT"; value: string }
  | { type: "SET_HEADLINE"; value: string }
  | { type: "SET_HIGHLIGHTS"; values: string[] }
  | { type: "SET_BRANDING_VIDEO"; url: string }
  | { type: "SET_HERO_BADGE"; badge: "city" | "price" | "whatsapp"; visible: boolean }
  | { type: "SET_BUTTON_RADIUS"; value: number }
  | { type: "REORDER_SECTIONS"; ids: SectionId[] }
  | { type: "TOGGLE_SECTION"; id: SectionId; visible: boolean }
  | { type: "SET_SERVICE_MEDIA_MODE"; serviceId: string; mode: MediaMode }
  | {
      type: "SET_SERVICE_MEDIA_FIELD";
      serviceId: string;
      field: "image_url" | "before_image" | "after_image" | "video_url";
      value: string;
    }
  | { type: "SET_SERVICE_GALLERY"; serviceId: string; urls: string[] }
  | {
      type: "SET_SERVICE_SALES_FIELD";
      serviceId: string;
      field:
        | "sales_headline"
        | "sales_subheadline"
        | "sales_video_url"
        | "sales_cta_message"
        | "sales_guarantee_text"
        | "sales_urgency_text";
      value: string;
    }
  | { type: "SET_SERVICE_SALES_ENABLED"; serviceId: string; enabled: boolean }
  | { type: "SET_SERVICE_SALES_GALLERY"; serviceId: string; urls: string[] }
  | { type: "SET_SERVICE_SALES_BONUSES"; serviceId: string; bonuses: SalesBonus[] }
  | { type: "SET_SERVICE_SALES_FAQ"; serviceId: string; faq: SalesFaq[] }
  | { type: "ADD_BLOCK"; block: CatalogBlock; afterInstanceId?: string }
  | { type: "REMOVE_BLOCK"; instanceId: string }
  | { type: "DUPLICATE_BLOCK"; instanceId: string }
  | { type: "MOVE_BLOCK"; instanceId: string; direction: -1 | 1 }
  | { type: "TOGGLE_BLOCK"; instanceId: string; visible: boolean }
  | { type: "SET_BLOCK_VARIANT"; instanceId: string; variant: string }
  | { type: "UPDATE_BLOCK_CONTENT"; instanceId: string; content: Record<string, unknown> }
  | { type: "UPDATE_BLOCK_STYLE"; instanceId: string; style: Partial<CatalogBlock["style"]> }
  | { type: "UPDATE_BLOCK_RESPONSIVE"; instanceId: string; responsive: Partial<CatalogBlock["responsive"]> }
  | { type: "UPDATE_BLOCK_DATA_SOURCE"; instanceId: string; dataSource: Partial<CatalogBlock["dataSource"]> }
  | { type: "APPLY_TEMPLATE_STYLE"; templateId: TemplateId }
  | { type: "APPLY_TEMPLATE"; templateId: TemplateId; permiteRecursosPro?: boolean }
  | { type: "START_FROM_SCRATCH" }
  | { type: "SAVING"; saving: boolean }
  | { type: "SAVE_SUCCESS"; savedAt: number }
  | { type: "SAVE_ERROR"; message: string };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_COLOR":
      return {
        ...state,
        business: {
          ...state.business,
          [action.key === "primary" ? "primary_color" : "secondary_color"]: action.value,
        },
        templateCustomized: true,
        dirty: true,
      };
    case "SET_BACKGROUND_COLOR":
      return { ...state, business: { ...state.business, bg_color_override: action.value }, templateCustomized: true, dirty: true };
    case "APPLY_PALETTE":
      return {
        ...state,
        business: {
          ...state.business,
          primary_color: action.primary,
          secondary_color: action.secondary,
          bg_color_override: action.background,
        },
        templateCustomized: true,
        dirty: true,
      };
    case "SET_FONT_PAIR":
      return { ...state, business: { ...state.business, font_pair_id: getCatalogFontPair(action.value).id }, templateCustomized: true, dirty: true };
    case "SET_ANIMATION_PRESET":
      return { ...state, business: { ...state.business, animation_preset: action.value }, templateCustomized: true, dirty: true };
    case "SET_LOGO_URL":
      return { ...state, business: { ...state.business, logo_url: action.url }, dirty: true };
    case "SET_COVER_URL":
      return { ...state, business: { ...state.business, cover_url: action.url }, dirty: true };
    case "SET_ABOUT":
      return { ...state, business: { ...state.business, about: action.value }, dirty: true };
    case "SET_HEADLINE":
      return { ...state, business: { ...state.business, headline: action.value }, dirty: true };
    case "SET_HIGHLIGHTS":
      return { ...state, business: { ...state.business, highlights: action.values }, dirty: true };
    case "SET_BRANDING_VIDEO":
      return { ...state, business: { ...state.business, branding_video_url: action.url }, dirty: true };
    case "SET_HERO_BADGE": {
      const key = action.badge === "city" ? "hero_show_city_badge" : action.badge === "price" ? "hero_show_price_badge" : "hero_show_whatsapp_badge";
      return { ...state, business: { ...state.business, [key]: action.visible }, dirty: true };
    }
    case "SET_BUTTON_RADIUS":
      return { ...state, business: { ...state.business, button_radius: action.value }, dirty: true };
    case "REORDER_SECTIONS": {
      const byId = new Map(state.sectionsConfig.map((s) => [s.id, s]));
      const reordered = action.ids.map((id) => byId.get(id)).filter((s): s is SectionConfig => !!s);
      const order = new Map(action.ids.map((id, index) => [id, index]));
      const legacy = state.layout.blocks.filter((block) => order.has(block.type as SectionId));
      const custom = state.layout.blocks.filter((block) => !order.has(block.type as SectionId));
      legacy.sort((a, b) => (order.get(a.type as SectionId) ?? 99) - (order.get(b.type as SectionId) ?? 99));
      return {
        ...state,
        sectionsConfig: reordered,
        layout: { ...state.layout, blocks: [...legacy, ...custom] },
        templateCustomized: true,
        dirty: true,
      };
    }
    case "TOGGLE_SECTION":
      return {
        ...state,
        sectionsConfig: state.sectionsConfig.map((s) => (s.id === action.id ? { ...s, visible: action.visible } : s)),
        layout: {
          ...state.layout,
          blocks: state.layout.blocks.map((block) =>
            block.type === action.id ? { ...block, visible: action.visible } : block
          ),
        },
        templateCustomized: true,
        dirty: true,
      };
    case "SET_SERVICE_MEDIA_MODE":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.serviceId ? { ...s, media_mode: action.mode } : s)),
        dirty: true,
      };
    case "SET_SERVICE_MEDIA_FIELD":
      return {
        ...state,
        services: state.services.map((s) =>
          s.id === action.serviceId ? { ...s, [action.field]: action.value } : s
        ),
        dirty: true,
      };
    case "SET_SERVICE_GALLERY":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.serviceId ? { ...s, gallery: action.urls } : s)),
        dirty: true,
      };
    case "SET_SERVICE_SALES_FIELD":
      return {
        ...state,
        services: state.services.map((s) =>
          s.id === action.serviceId ? { ...s, [action.field]: action.value } : s
        ),
        dirty: true,
      };
    case "SET_SERVICE_SALES_GALLERY":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.serviceId ? { ...s, sales_gallery: action.urls } : s)),
        dirty: true,
      };
    case "SET_SERVICE_SALES_BONUSES":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.serviceId ? { ...s, sales_bonuses: action.bonuses } : s)),
        dirty: true,
      };
    case "SET_SERVICE_SALES_ENABLED":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.serviceId ? { ...s, sales_page_enabled: action.enabled } : s)),
        dirty: true,
      };
    case "SET_SERVICE_SALES_FAQ":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.serviceId ? { ...s, sales_faq: action.faq } : s)),
        dirty: true,
      };
    case "ADD_BLOCK": {
      if (state.layout.blocks.length >= 30) return state;
      const blocks = [...state.layout.blocks];
      const afterIndex = action.afterInstanceId
        ? blocks.findIndex((block) => block.instanceId === action.afterInstanceId)
        : -1;
      const index = afterIndex >= 0 ? afterIndex + 1 : blocks.length;
      blocks.splice(Math.max(0, index), 0, action.block);
      const layout = { ...state.layout, blocks };
      return { ...state, layout, sectionsConfig: layoutToLegacySections(layout), templateCustomized: true, dirty: true };
    }
    case "REMOVE_BLOCK": {
      const layout = { ...state.layout, blocks: state.layout.blocks.filter((block) => block.instanceId !== action.instanceId) };
      return { ...state, layout, sectionsConfig: layoutToLegacySections(layout), templateCustomized: true, dirty: true };
    }
    case "DUPLICATE_BLOCK": {
      if (state.layout.blocks.length >= 30) return state;
      const index = state.layout.blocks.findIndex((block) => block.instanceId === action.instanceId);
      if (index < 0) return state;
      const source = state.layout.blocks[index];
      const duplicate: CatalogBlock = {
        ...source,
        instanceId: createInstanceId(source.type),
        content: { ...source.content },
        dataSource: { ...source.dataSource, items: source.dataSource.items.map((item) => ({ ...item, instanceId: createInstanceId("item") })) },
        style: { ...source.style },
        responsive: { ...source.responsive, columns: { ...source.responsive.columns } },
      };
      const blocks = [...state.layout.blocks];
      blocks.splice(index + 1, 0, duplicate);
      const layout = { ...state.layout, blocks };
      return { ...state, layout, sectionsConfig: layoutToLegacySections(layout), templateCustomized: true, dirty: true };
    }
    case "MOVE_BLOCK": {
      const index = state.layout.blocks.findIndex((block) => block.instanceId === action.instanceId);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= state.layout.blocks.length) return state;
      const blocks = [...state.layout.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      const layout = { ...state.layout, blocks };
      return { ...state, layout, sectionsConfig: layoutToLegacySections(layout), templateCustomized: true, dirty: true };
    }
    case "TOGGLE_BLOCK": {
      const layout = {
        ...state.layout,
        blocks: state.layout.blocks.map((block) =>
          block.instanceId === action.instanceId ? { ...block, visible: action.visible } : block
        ),
      };
      return { ...state, layout, sectionsConfig: layoutToLegacySections(layout), templateCustomized: true, dirty: true };
    }
    case "SET_BLOCK_VARIANT":
      return {
        ...state,
        layout: {
          ...state.layout,
          blocks: state.layout.blocks.map((block) =>
            block.instanceId === action.instanceId ? { ...block, variant: action.variant } : block
          ),
        },
        templateCustomized: true,
        dirty: true,
      };
    case "UPDATE_BLOCK_CONTENT":
      return {
        ...state,
        layout: {
          ...state.layout,
          blocks: state.layout.blocks.map((block) =>
            block.instanceId === action.instanceId
              ? { ...block, content: { ...block.content, ...action.content } }
              : block
          ),
        },
        templateCustomized: true,
        dirty: true,
      };
    case "UPDATE_BLOCK_STYLE":
      return {
        ...state,
        layout: {
          ...state.layout,
          blocks: state.layout.blocks.map((block) =>
            block.instanceId === action.instanceId
              ? { ...block, style: { ...block.style, ...action.style } }
              : block
          ),
        },
        templateCustomized: true,
        dirty: true,
      };
    case "UPDATE_BLOCK_RESPONSIVE":
      return {
        ...state,
        layout: {
          ...state.layout,
          blocks: state.layout.blocks.map((block) =>
            block.instanceId === action.instanceId
              ? { ...block, responsive: { ...block.responsive, ...action.responsive } }
              : block
          ),
        },
        templateCustomized: true,
        dirty: true,
      };
    case "UPDATE_BLOCK_DATA_SOURCE":
      return {
        ...state,
        layout: {
          ...state.layout,
          blocks: state.layout.blocks.map((block) => block.instanceId === action.instanceId ? { ...block, dataSource: { ...block.dataSource, ...action.dataSource } } : block),
        },
        templateCustomized: true,
        dirty: true,
      };
    case "APPLY_TEMPLATE_STYLE": {
      const template = getCatalogTemplate(action.templateId);
      return {
        ...state,
        business: {
          ...state.business,
          template_id: action.templateId,
          theme: template.isDark ? "premium_dark" : "clean_detail",
          primary_color: template.palette.primaryColorDefault,
          secondary_color: template.palette.secondaryColorDefault,
          bg_color_override: "",
        },
        layout: { ...state.layout, templateId: action.templateId },
        templateCustomized: true,
        dirty: true,
      };
    }
    case "APPLY_TEMPLATE": {
      const template = getCatalogTemplate(action.templateId);
      const templateLayout = createTemplateLayout(action.templateId);
      const professionalTypes = new Set(["antes_depois", "branding_video", "pacotes", "avaliacoes", "video"]);
      const layout = action.permiteRecursosPro === false
        ? { ...templateLayout, blocks: templateLayout.blocks.filter((block) => !professionalTypes.has(block.type)) }
        : templateLayout;
      return {
        ...state,
        business: {
          ...state.business,
          template_id: action.templateId,
          theme: template.isDark ? "premium_dark" : "clean_detail",
          primary_color: template.palette.primaryColorDefault,
          secondary_color: template.palette.secondaryColorDefault,
          bg_color_override: "",
        },
        sectionsConfig: layoutToLegacySections(layout),
        layout,
        templateCustomized: false,
        dirty: true,
      };
    }
    case "START_FROM_SCRATCH": {
      const templateId = getCatalogTemplate(state.business.template_id).id;
      const layout: CatalogLayout = {
        schemaVersion: 1,
        templateId,
        blocks: [],
      };
      return {
        ...state,
        layout,
        sectionsConfig: layoutToLegacySections(layout),
        templateCustomized: true,
        dirty: true,
      };
    }
    case "SAVING":
      return { ...state, saving: action.saving, saveError: null };
    case "SAVE_SUCCESS":
      return { ...state, saving: false, dirty: false, lastSavedAt: action.savedAt, saveError: null };
    case "SAVE_ERROR":
      return { ...state, saving: false, saveError: action.message };
    default:
      return state;
  }
}

function sectionsConfigMatches(a: SectionConfig[], b: SectionConfig[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((entry, i) => entry.id === b[i]?.id && entry.visible === b[i]?.visible);
}

export function buildInitialState(
  business: Business,
  services: ServiceRow[],
  sectionsConfig: SectionConfig[]
): EditorState {
  const template = getCatalogTemplate(business.template_id);
  const layout = normalizeCatalogLayout(business.catalog_layout, sectionsConfig, template.id);
  const templateCustomized =
    business.primary_color !== template.palette.primaryColorDefault ||
    business.secondary_color !== template.palette.secondaryColorDefault ||
    Boolean(business.bg_color_override) ||
    (business.font_pair_id ?? DEFAULT_CATALOG_FONT_PAIR_ID) !== DEFAULT_CATALOG_FONT_PAIR_ID ||
    (business.animation_preset ?? "soft") !== "soft" ||
    !sectionsConfigMatches(sectionsConfig, template.defaultSectionsConfig);

  return {
    businessId: business.id,
    business: {
      template_id: business.template_id,
      theme: business.theme,
      primary_color: business.primary_color,
      secondary_color: business.secondary_color,
      bg_color_override: business.bg_color_override ?? "",
      font_pair_id: business.font_pair_id ?? DEFAULT_CATALOG_FONT_PAIR_ID,
      animation_preset: (["none", "soft", "dynamic"].includes(business.animation_preset) ? business.animation_preset : "soft") as AnimationPreset,
      logo_url: business.logo_url ?? "",
      cover_url: business.cover_url ?? "",
      about: business.about ?? "",
      headline: business.headline ?? "",
      highlights: Array.isArray(business.highlights) ? (business.highlights as string[]) : [],
      branding_video_url: business.branding_video_url ?? "",
      hero_show_city_badge: business.hero_show_city_badge ?? true,
      hero_show_price_badge: business.hero_show_price_badge ?? true,
      hero_show_whatsapp_badge: business.hero_show_whatsapp_badge ?? true,
      button_radius: business.button_radius ?? 8,
    },
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      media_mode: s.media_mode as MediaMode,
      image_url: s.image_url,
      before_image: s.before_image,
      after_image: s.after_image,
      gallery: Array.isArray(s.gallery) ? (s.gallery as string[]) : [],
      video_url: s.video_url,
      sales_page_enabled: s.sales_page_enabled ?? true,
      sales_headline: s.sales_headline ?? "",
      sales_subheadline: s.sales_subheadline ?? "",
      sales_video_url: s.sales_video_url ?? "",
      sales_gallery: Array.isArray(s.sales_gallery) ? (s.sales_gallery as string[]) : [],
      sales_bonuses: Array.isArray(s.sales_bonuses) ? (s.sales_bonuses as unknown as SalesBonus[]) : [],
      sales_cta_message: s.sales_cta_message ?? "",
      sales_guarantee_text: s.sales_guarantee_text ?? "",
      sales_faq: Array.isArray(s.sales_faq) ? (s.sales_faq as unknown as SalesFaq[]) : [],
      sales_urgency_text: s.sales_urgency_text ?? "",
    })),
    layout,
    sectionsConfig,
    templateCustomized,
    dirty: false,
    saving: false,
    lastSavedAt: null,
    saveError: null,
  };
}
