import type { Database } from "@/lib/supabase/types";
import type { SectionConfig, SectionId } from "@/lib/domain/catalog-sections";
import { getCatalogTemplate, type TemplateId } from "@/lib/domain/catalog-templates";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export type MediaMode = "single_photo" | "before_after" | "gallery" | "youtube";

export type ServiceDraft = {
  id: string;
  name: string;
  media_mode: MediaMode;
  image_url: string | null;
  before_image: string | null;
  after_image: string | null;
  gallery: string[];
  video_url: string | null;
};

export type BusinessDraft = {
  template_id: string;
  theme: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  cover_url: string;
  about: string;
  headline: string;
  highlights: string[];
  branding_video_url: string;
};

export type EditorState = {
  businessId: string;
  business: BusinessDraft;
  services: ServiceDraft[];
  sectionsConfig: SectionConfig[];
  templateCustomized: boolean;
  dirty: boolean;
  saving: boolean;
  lastSavedAt: number | null;
  saveError: string | null;
};

export type EditorAction =
  | { type: "SET_COLOR"; key: "primary" | "secondary"; value: string }
  | { type: "SET_LOGO_URL"; url: string }
  | { type: "SET_COVER_URL"; url: string }
  | { type: "SET_ABOUT"; value: string }
  | { type: "SET_HEADLINE"; value: string }
  | { type: "SET_HIGHLIGHTS"; values: string[] }
  | { type: "SET_BRANDING_VIDEO"; url: string }
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
  | { type: "APPLY_TEMPLATE"; templateId: TemplateId }
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
    case "REORDER_SECTIONS": {
      const byId = new Map(state.sectionsConfig.map((s) => [s.id, s]));
      const reordered = action.ids.map((id) => byId.get(id)).filter((s): s is SectionConfig => !!s);
      return { ...state, sectionsConfig: reordered, templateCustomized: true, dirty: true };
    }
    case "TOGGLE_SECTION":
      return {
        ...state,
        sectionsConfig: state.sectionsConfig.map((s) => (s.id === action.id ? { ...s, visible: action.visible } : s)),
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
    case "APPLY_TEMPLATE": {
      const template = getCatalogTemplate(action.templateId);
      return {
        ...state,
        business: {
          ...state.business,
          template_id: action.templateId,
          theme: template.isDark ? "premium_dark" : "clean_detail",
          primary_color: template.palette.primaryColorDefault,
          secondary_color: template.palette.secondaryColorDefault,
        },
        sectionsConfig: template.defaultSectionsConfig,
        templateCustomized: false,
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
  const templateCustomized =
    business.primary_color !== template.palette.primaryColorDefault ||
    business.secondary_color !== template.palette.secondaryColorDefault ||
    !sectionsConfigMatches(sectionsConfig, template.defaultSectionsConfig);

  return {
    businessId: business.id,
    business: {
      template_id: business.template_id,
      theme: business.theme,
      primary_color: business.primary_color,
      secondary_color: business.secondary_color,
      logo_url: business.logo_url ?? "",
      cover_url: business.cover_url ?? "",
      about: business.about ?? "",
      headline: business.headline ?? "",
      highlights: Array.isArray(business.highlights) ? (business.highlights as string[]) : [],
      branding_video_url: business.branding_video_url ?? "",
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
    })),
    sectionsConfig,
    templateCustomized,
    dirty: false,
    saving: false,
    lastSavedAt: null,
    saveError: null,
  };
}
