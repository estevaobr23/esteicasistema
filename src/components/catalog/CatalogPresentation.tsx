"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { proximosHorarios } from "@/lib/domain/availability";
import { VehicleProvider, VehicleSelector } from "@/components/catalog/VehicleSelector";
import ServicePrice from "@/components/catalog/ServicePrice";
import { formatBRL } from "@/lib/format";
import { hasSalesPage, salesPageUrl } from "@/lib/domain/service-sales-page";
import WhatsappButton from "@/components/catalog/WhatsappButton";
import BeforeAfterSlider from "@/components/catalog/BeforeAfterSlider";
import PortfolioMedia from "@/components/catalog/PortfolioMedia";
import ServiceGallery from "@/components/catalog/ServiceGallery";
import YoutubeEmbed from "@/components/catalog/YoutubeEmbed";
import AdaptiveSquareImage from "@/components/AdaptiveSquareImage";
import type { SectionConfig } from "@/lib/domain/catalog-sections";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";
import type { EditableTarget } from "@/lib/domain/editable-target";
import {
  normalizeCatalogLayout,
  type CatalogBlock,
  type CatalogLayout,
  BLOCK_LABELS,
} from "@/lib/catalog-builder/schema";
import { CATALOG_FONT_VARIABLE_CLASSES } from "@/lib/domain/catalog-font-runtime";
import { getCatalogFontPair } from "@/lib/domain/catalog-fonts";
import { deriveSurfaceColor, isDarkCatalogColor } from "@/lib/domain/catalog-colors";
import CatalogSectionMotion, { type AnimationPreset } from "@/components/catalog/CatalogSectionMotion";
import AutoCarousel from "@/components/catalog/AutoCarousel";

const WHATSAPP_GREEN = "#25D366";

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 4.99L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.87 14.24c-.24.68-1.4 1.33-1.93 1.4-.5.07-1.06.1-3.15-.66-2.65-.97-4.36-3.62-4.5-3.79-.13-.17-1.08-1.44-1.08-2.75s.68-1.95.92-2.22c.24-.26.53-.33.7-.33h.5c.16 0 .38-.06.59.45.24.58.8 2 .87 2.15.07.15.11.32.02.5-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.94 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.27.37-.22.62-.13.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServiceFeature = Database["public"]["Tables"]["service_features"]["Row"];
type ServicePriceRow = Database["public"]["Tables"]["service_prices"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"] & {
  service_features?: ServiceFeature[];
  service_prices?: ServicePriceRow[];
};

function ServiceCta({
  service,
  businessSlug,
  whatsapp,
  businessId,
  label,
  className,
}: {
  service: Service;
  businessSlug: string;
  whatsapp: string;
  businessId: string;
  label: string;
  className: string;
}) {
  if (hasSalesPage(service)) {
    return (
      <Link href={salesPageUrl(businessSlug, service)} className={className} style={{ backgroundColor: WHATSAPP_GREEN }}>
        <WhatsappIcon />
        {label}
      </Link>
    );
  }
  if (!whatsapp) return null;
  return (
    <WhatsappButton
      numero={whatsapp}
      businessId={businessId}
      serviceId={service.id}
      trackAs="service_view"
      contexto={{ servico: service.name }}
      className={className}
      style={{ backgroundColor: WHATSAPP_GREEN }}
    >
      <WhatsappIcon />
      {label}
    </WhatsappButton>
  );
}

function EditSalesPageLink({ serviceId, onEditSalesPage }: { serviceId: string; onEditSalesPage?: (serviceId: string) => void }) {
  if (!onEditSalesPage) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEditSalesPage(serviceId);
      }}
      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-sky-400/60 py-2 text-center text-xs font-semibold text-sky-300 transition hover:border-sky-300 hover:text-sky-200"
    >
      ✎ Editar página de vendas
    </button>
  );
}
type Package = Database["public"]["Tables"]["packages"]["Row"] & {
  package_services?: { service_id: string }[];
  package_benefits?: Database["public"]["Tables"]["package_benefits"]["Row"][];
};
type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];
type AvailabilitySlot = Database["public"]["Tables"]["availability_slots"]["Row"];
type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type CatalogPresentationProps = {
  business: Business;
  services: Service[];
  packages: Package[];
  portfolioItems: PortfolioItem[];
  availabilitySlots: AvailabilitySlot[];
  reviews: Review[];
  sectionsConfig: SectionConfig[];
  catalogLayout?: CatalogLayout;
  editable?: boolean;
  onFieldTap?: (target: EditableTarget) => void;
  onMoveBlock?: (instanceId: string, direction: -1 | 1) => void;
  onAddBlockAfter?: (instanceId?: string) => void;
  onEditSalesPage?: (serviceId: string) => void;
  onRemoveHeroBadge?: (badge: "city" | "price" | "whatsapp") => void;
};

const WIDTH_CLASS: Record<CatalogBlock["style"]["width"], string> = {
  full: "w-full",
  wide: "mx-auto w-full max-w-7xl",
  standard: "mx-auto w-full max-w-5xl",
  compact: "mx-auto w-full max-w-3xl",
};

const SPACING_CLASS: Record<CatalogBlock["style"]["spacing"], string> = {
  none: "[&>section]:py-0",
  compact: "[&>section]:py-8",
  comfortable: "[&>section]:py-16",
  spacious: "[&>section]:py-24",
};

function columnsClass(block: CatalogBlock) {
  const mobile = block.responsive.columns.mobile === 2 ? "grid-cols-2" : "grid-cols-1";
  const tablet = ({ 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const)[block.responsive.columns.tablet];
  const desktop = ({ 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const)[block.responsive.columns.desktop];
  return `${mobile} ${tablet} ${desktop}`;
}

function contentText(block: CatalogBlock, key: string) {
  return typeof block.content[key] === "string" ? String(block.content[key]) : "";
}

function contentStringArray(block: CatalogBlock, key: string) {
  return Array.isArray(block.content[key])
    ? block.content[key].filter((value): value is string => typeof value === "string")
    : [];
}

function colorWithAlpha(color: string, alpha: number) {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return `rgba(255,255,255,${alpha})`;
  const value = match[1];
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}

function safeHref(value: string, fallback = "#") {
  const trimmed = value.trim();
  if (trimmed.startsWith("#") || /^(https:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return fallback;
}

function EditableText({
  editable,
  onTap,
  children,
  as: Tag = "span",
  className,
  style,
}: {
  editable?: boolean;
  onTap?: () => void;
  children: ReactNode;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!editable) {
    const El = Tag;
    return <El className={className} style={style}>{children}</El>;
  }
  const El = Tag;
  return (
    <El
      className={`${className ?? ""} cursor-pointer rounded outline-dashed outline-1 outline-offset-4 outline-white/40 transition hover:outline-white/70`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onTap?.();
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </El>
  );
}

function EditableMedia({
  editable,
  onTap,
  children,
}: {
  editable?: boolean;
  onTap?: () => void;
  children: ReactNode;
}) {
  if (!editable) return <>{children}</>;
  return (
    <div
      className="relative cursor-pointer rounded outline-dashed outline-1 outline-offset-2 outline-white/40 transition hover:outline-white/70"
      onClick={(e) => {
        e.stopPropagation();
        onTap?.();
      }}
      role="button"
      tabIndex={0}
    >
      {children}
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
        Editar
      </span>
    </div>
  );
}

function AutoBadge({ editable, onRemove, children }: { editable?: boolean; onRemove?: () => void; children: ReactNode }) {
  if (!editable) return <>{children}</>;
  return (
    <span className="relative inline-flex">
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        aria-label="Ocultar este badge"
        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[9px] font-bold text-white ring-1 ring-white/40 hover:bg-red-600"
      >
        ✕
      </button>
    </span>
  );
}

function ServiceMedia({ service, isDark, mode, presentation = "square" }: { service: Service; isDark: boolean; mode?: string; presentation?: "square" | "compact" | "featured" }) {
  switch (mode === "auto" || !mode ? service.media_mode : mode) {
    case "before_after":
      return service.before_image && service.after_image ? (
        <BeforeAfterSlider beforeImage={service.before_image} afterImage={service.after_image} alt={service.name} aspect={presentation === "featured" ? "landscape" : "square"} />
      ) : null;
    case "gallery": {
      const images = Array.isArray(service.gallery) ? (service.gallery as string[]) : [];
      if (presentation === "compact") return images[0] ? <AdaptiveSquareImage src={images[0]} alt={service.name} className="w-full rounded-none" /> : null;
      return images.length > 0 ? <ServiceGallery images={images} alt={service.name} aspect={presentation === "featured" ? "landscape" : "square"} /> : null;
    }
    case "youtube":
      return service.video_url ? <YoutubeEmbed url={service.video_url} title={service.name} aspect={presentation === "featured" ? "video" : "square"} /> : null;
    case "single_photo":
    default:
      return service.image_url && presentation === "featured" ? (
        <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
        </div>
      ) : service.image_url ? (
        <AdaptiveSquareImage src={service.image_url} alt={service.name} className="w-full rounded-none" />
      ) : null;
  }
  void isDark;
}

function resolveBlockEntries<T extends { id: string }>(block: CatalogBlock, items: T[], isFeatured: (item: T) => boolean = () => false) {
  if (block.dataSource.mode === "selected") {
    const byId = new Map(items.map((item) => [item.id, item]));
    return block.dataSource.items.flatMap((ref) => {
      const item = byId.get(ref.sourceId);
      return item ? [{ item, ref, key: ref.instanceId }] : [];
    }).slice(0, block.dataSource.limit);
  }
  const source = block.dataSource.mode === "featured" ? items.filter(isFeatured) : items;
  return source.slice(0, block.dataSource.limit).map((item) => ({ item, ref: undefined, key: item.id }));
}

const PACKAGE_CHECK_COLOR = "#34d399";

function PackageMedia({ item, compact = false }: { item: Package; compact?: boolean }) {
  if (item.media_mode === "youtube" && item.video_url) return <YoutubeEmbed url={item.video_url} title={item.name} aspect="square" />;
  if (item.media_mode === "gallery") {
    const images = Array.isArray(item.gallery) ? item.gallery as string[] : [];
    if (compact && images[0]) return <AdaptiveSquareImage src={images[0]} alt={item.name} className="w-full rounded-none" />;
    if (images.length) return <ServiceGallery images={images} alt={item.name} aspect="square" />;
  }
  if (!item.image_url) return null;
  if (compact) return <AdaptiveSquareImage src={item.image_url} alt={item.name} className="w-full rounded-none" />;
  return (
    <div className="aspect-square w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
    </div>
  );
}

function CarouselImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-[4/3] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

export default function CatalogPresentation({
  business,
  services,
  packages,
  portfolioItems,
  availabilitySlots,
  reviews,
  sectionsConfig,
  catalogLayout,
  editable,
  onFieldTap,
  onMoveBlock,
  onAddBlockAfter,
  onEditSalesPage,
  onRemoveHeroBadge,
}: CatalogPresentationProps) {
  const template = getCatalogTemplate(business.template_id);
  const backgroundOverride = business.bg_color_override && /^#[0-9a-f]{6}$/i.test(business.bg_color_override) ? business.bg_color_override : null;
  const bg = backgroundOverride ?? template.palette.bg;
  const isDark = backgroundOverride ? isDarkCatalogColor(backgroundOverride) : template.isDark;
  const bgDeep = backgroundOverride ? deriveSurfaceColor(backgroundOverride, isDark) : template.palette.bgDeep;
  const textColor = backgroundOverride ? (isDark ? "#f8fafc" : "#111827") : template.palette.textColor;
  const textMuted = backgroundOverride ? (isDark ? "rgba(248,250,252,0.68)" : "rgba(17,24,39,0.68)") : template.palette.textMuted;
  const fontPair = getCatalogFontPair(business.font_pair_id);
  const animationPreset = (["none", "soft", "dynamic"].includes(business.animation_preset) ? business.animation_preset : "soft") as AnimationPreset;

  const cardStyleProps: React.CSSProperties = {
    borderRadius: template.cardStyle.borderRadius,
    borderWidth: template.cardStyle.borderWidth,
    boxShadow: template.cardStyle.shadow,
  };
  const headingStyleProps: React.CSSProperties = {
    fontWeight: template.typography.headingWeight,
    letterSpacing: template.typography.headingTracking,
    fontFamily: `var(${fontPair.headingFont.variable})`,
  };

  const categorias = Array.from(new Set(portfolioItems.map((p) => p.category).filter(Boolean)));
  const proximos = proximosHorarios(availabilitySlots);
  const whatsapp = business.whatsapp ?? "";
  const highlights = Array.isArray(business.highlights) ? (business.highlights as string[]) : [];
  const layout = catalogLayout ?? normalizeCatalogLayout(business.catalog_layout, sectionsConfig, template.id);
  const blockAccent = (block: CatalogBlock) => block.style.accentColor || business.primary_color;

  const menorPreco = (() => {
    const valores: number[] = [];
    for (const s of services) {
      if ((s.price_type === "fixed" || s.price_type === "from") && s.base_price) valores.push(s.base_price);
      if (s.price_type === "vehicle" && s.service_prices) {
        for (const p of s.service_prices) {
          if (p.active) valores.push(p.promotional_price ?? p.price);
        }
      }
    }
    return valores.length > 0 ? Math.min(...valores) : null;
  })();

  function sectionIntro(block: CatalogBlock, fallbackTitle: string, fallbackDescription = "") {
    const eyebrow = contentText(block, "eyebrow");
    const title = contentText(block, "title") || fallbackTitle;
    const description = contentText(block, "description") || fallbackDescription;
    return (
      <EditableMedia editable={editable} onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}>
        <div className="mx-auto mb-8 max-w-2xl">
          {eyebrow && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: blockAccent(block) }}>{eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl" style={headingStyleProps}>{title}</h2>
          {description && <p className="mt-2 text-sm leading-6" style={{ color: textMuted }}>{description}</p>}
        </div>
      </EditableMedia>
    );
  }

  function reviewCard(review: Review) {
    return (
      <div className="h-full border p-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", ...cardStyleProps }}>
        <div className="flex items-center gap-3">
          {review.customer_photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.customer_photo_url}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/10"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{review.customer_name}</p>
            <p className="text-amber-400">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
          </div>
        </div>
        {review.text && <p className="mt-2 text-sm" style={{ color: textMuted }}>{review.text}</p>}
      </div>
    );
  }

  const sectionRenderers: Partial<Record<SectionConfig["id"], (bgColor: string, block: CatalogBlock) => ReactNode>> = {
    servicos: (bgColor, block) => {
      const entries = resolveBlockEntries(block, services, (service) => service.featured);
      return entries.length > 0 && (
        <section key="servicos" id="servicos" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Serviços", "Compare opções, benefícios e valores para encontrar o cuidado ideal.")}
          <div className="mb-8 flex justify-center">
            <VehicleSelector />
          </div>

          <div className={`mx-auto grid max-w-5xl gap-4 ${block.variant === "list" ? "grid-cols-1" : columnsClass(block)}`}>
            {entries.map(({ item: s, ref, key }) => (
              <div
                key={key}
                className="min-w-0 overflow-hidden border"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", backgroundColor: bg, ...cardStyleProps }}
              >
                <div className="flex min-w-0 items-start justify-between gap-2 border-b p-3" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{s.name}</h3>
                    <p className="mt-0.5 truncate text-[10px] uppercase tracking-wide" style={{ color: textMuted }}>{s.category || "Serviço"}</p>
                  </div>
                  {s.duration_minutes && <span className="shrink-0 rounded-full border px-2 py-1 text-[9px]" style={{ borderColor: isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)", color: textMuted }}>{s.duration_minutes} min</span>}
                </div>
                <div className={`min-w-0 ${block.variant === "list" ? "grid grid-cols-[42%_minmax(0,1fr)] sm:grid-cols-[220px_minmax(0,1fr)]" : "flex flex-col"}`}>
                  <EditableMedia editable={editable} onTap={() => onFieldTap?.({ kind: "service_media", serviceId: s.id })}>
                    <div
                      className={`h-full w-full overflow-hidden ${block.variant === "list" ? "border-r" : "border-b"}`}
                      style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
                    >
                      <ServiceMedia service={s} isDark={isDark} mode={ref?.mediaMode} presentation={block.variant === "list" ? "compact" : "square"} />
                    </div>
                  </EditableMedia>
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    {block.variant !== "compact" && s.short_description && <p className="line-clamp-2 text-[11px] leading-4" style={{ color: textMuted }}>{s.short_description}</p>}
                    {!!s.service_features?.length && block.variant !== "compact" && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.service_features.slice(0, 2).map((feature) => <span key={feature.id} className="rounded bg-white/[0.05] px-1.5 py-1 text-[9px]" style={{ color: textMuted }}>{feature.label}</span>)}
                      </div>
                    )}
                    <div className="mt-auto pt-3">
                      <ServicePrice priceType={s.price_type} basePrice={s.base_price} prices={s.service_prices ?? []} />
                      <ServiceCta
                        service={s}
                        businessSlug={business.slug}
                        whatsapp={whatsapp}
                        businessId={business.id}
                        label="Ver serviço"
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[var(--catalog-radius)] px-2 py-2 text-center text-[11px] font-semibold text-white transition hover:brightness-90"
                      />
                      {editable && <EditSalesPageLink serviceId={s.id} onEditSalesPage={onEditSalesPage} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    },

    destaques: (bgColor, block) => {
      const entries = resolveBlockEntries(block, services, (service) => service.featured).slice(0, block.dataSource.limit || 3);
      const accentColor = blockAccent(block);
      return entries.length > 0 && (
        <section key="destaques" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Mais procurados", "Os serviços que mais entregam transformação, proteção e praticidade.")}
          <div className={`mx-auto grid max-w-5xl gap-5 ${block.variant === "featured" ? "grid-cols-1" : columnsClass(block)}`}>
            {entries.map(({ item: s, ref, key }) => {
              const serviceReviews = reviews.filter((review) => review.service_id === s.id);
              const average = serviceReviews.length ? serviceReviews.reduce((total, review) => total + review.rating, 0) / serviceReviews.length : null;
              return (
              <EditableMedia key={key} editable={editable} onTap={() => onFieldTap?.({ kind: "service_media", serviceId: s.id })}>
                <article className={`overflow-hidden border text-left ${block.variant === "featured" ? "md:grid md:grid-cols-[1.15fr_.85fr]" : "flex h-full flex-col"}`} style={{ borderColor: colorWithAlpha(accentColor, 0.5), backgroundColor: bg, ...cardStyleProps }}>
                  <div className="relative min-w-0 overflow-hidden">
                    <ServiceMedia service={s} isDark={isDark} mode={ref?.mediaMode} presentation="featured" />
                    <span className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-white shadow-lg" style={{ backgroundColor: accentColor }}>Mais escolhido</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                    <p className="text-lg font-semibold sm:text-xl">{s.name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-amber-400">{average ? `★ ${average.toFixed(1)}` : "★ Recomendado"}</span>
                      <span style={{ color: textMuted }}>{serviceReviews.length > 0 ? `${serviceReviews.length} avaliação(ões)` : "Seleção da equipe"}</span>
                    </div>
                    {s.short_description && <p className="mt-3 text-sm leading-6" style={{ color: textMuted }}>{s.short_description}</p>}
                    <div className="mt-auto pt-5">
                      <ServicePrice priceType={s.price_type} basePrice={s.base_price} prices={s.service_prices ?? []} />
                      <ServiceCta
                        service={s}
                        businessSlug={business.slug}
                        whatsapp={whatsapp}
                        businessId={business.id}
                        label="Quero conhecer"
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--catalog-radius)] py-3 text-center text-sm font-semibold text-white transition hover:brightness-90"
                      />
                      {editable && <EditSalesPageLink serviceId={s.id} onEditSalesPage={onEditSalesPage} />}
                    </div>
                  </div>
                </article>
              </EditableMedia>
              );
            })}
          </div>
        </section>
      );
    },

    antes_depois: (bgColor, block) => {
      const entries = resolveBlockEntries(block, portfolioItems, (item) => item.featured);
      return entries.length > 0 && (
        <section key="antes_depois" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Resultados", "Antes e depois dos nossos trabalhos.")}
          {categorias.length > 0 && (
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categorias.map((c) => (
                <span
                  key={c}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          <div className={`mx-auto grid max-w-4xl gap-6 ${block.variant === "featured" ? "grid-cols-1" : columnsClass(block)}`}>
            {entries.map(({ item: p, key }) => (
              <EditableMedia key={key} editable={editable} onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}>
                <div>
                  <PortfolioMedia item={p} />
                  {(p.title || p.vehicle) && (
                    <p className="mt-2 text-sm font-medium">
                      {p.title} {p.vehicle && <span style={{ color: textMuted }}>· {p.vehicle}</span>}
                    </p>
                  )}
                </div>
              </EditableMedia>
            ))}
          </div>
        </section>
      );
    },

    branding_video: (bgColor, block) =>
      business.branding_video_url ? (
        <section key="branding_video" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Conheça nosso trabalho", "Veja o cuidado aplicado em cada etapa.")}
          <div className="mx-auto max-w-md">
            <YoutubeEmbed url={business.branding_video_url} title={business.name} />
          </div>
        </section>
      ) : null,

    pacotes: (bgColor, block) => {
      const entries = resolveBlockEntries(block, packages, (item) => item.featured);
      const accentColor = blockAccent(block);
      const recommendedPackageId = entries.find(({ item }) => item.featured)?.item.id
        ?? (block.variant === "comparison" ? entries[Math.min(1, entries.length - 1)]?.item.id : undefined);
      return entries.length > 0 && (
        <section key="pacotes" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Pacotes", "Combinações prontas para economizar e cuidar do veículo por inteiro.")}
          {(() => {
            const isSingleColumn = block.variant !== "compact" && block.responsive.columns.desktop === 1 && block.responsive.columns.mobile === 1;
            return (
          <div className={`mx-auto grid items-start gap-4 ${isSingleColumn ? "max-w-3xl" : "max-w-5xl"} ${block.variant === "compact" ? "grid-cols-1" : columnsClass(block)}`}>
            {entries.map(({ item: p, key }) => {
              const serviceNames = (p.package_services ?? []).flatMap((relation) => {
                const service = services.find((item) => item.id === relation.service_id);
                return service ? [service.name] : [];
              });
              const seenIncludedLabels = new Set<string>();
              const includedItems = [
                ...serviceNames.map((label, index) => ({ id: `${p.id}-service-${index}`, label })),
                ...(p.package_benefits ?? []).map((benefit) => ({ id: benefit.id, label: benefit.label })),
              ].filter((item) => {
                const normalizedLabel = item.label.trim().toLocaleLowerCase("pt-BR");
                if (!normalizedLabel || seenIncludedLabels.has(normalizedLabel)) return false;
                seenIncludedLabels.add(normalizedLabel);
                return true;
              });
              const finalPrice = p.promotional_price ?? p.price;
              const hasDiscount = Boolean(p.promotional_price && p.promotional_price < p.price);
              const isRecommended = p.id === recommendedPackageId;
              const hasMedia = Boolean(p.image_url || p.video_url || (Array.isArray(p.gallery) && p.gallery.length > 0));
              return (
              <EditableMedia key={key} editable={editable} onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}>
                <article
                  className={`relative flex h-full min-w-0 flex-col border p-5 ${isRecommended ? "pt-8 md:-translate-y-2 md:px-6 md:pb-7 md:pt-9" : ""} ${isSingleColumn && hasMedia ? "sm:grid sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start sm:gap-6" : ""}`}
                  style={{
                    borderColor: isRecommended ? accentColor : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                    backgroundColor: bg,
                    backgroundImage: isRecommended ? `linear-gradient(180deg, ${colorWithAlpha(accentColor, 0.16)} 0%, transparent 42%)` : undefined,
                    ...cardStyleProps,
                    boxShadow: isRecommended ? `0 24px 60px ${colorWithAlpha(accentColor, 0.2)}` : cardStyleProps.boxShadow,
                  }}
                >
                  {isRecommended && <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-4 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-white shadow-lg" style={{ backgroundColor: accentColor, borderColor: bg }}>Melhor escolha</span>}

                  {hasMedia && (
                    <div className={isSingleColumn ? "-mx-5 -mt-5 sm:col-start-1 sm:mx-0 sm:mt-0 sm:self-stretch" : "-mx-5 mt-5 w-[calc(100%+2.5rem)]"}>
                      <PackageMedia item={p} />
                    </div>
                  )}

                  <div className={isSingleColumn && hasMedia ? "sm:col-start-2" : "contents"}>
                  <div className="min-w-0 text-center">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[.14em]" style={{ color: accentColor }}>Pacote completo</p>
                      <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
                    </div>
                  </div>

                  <div className="mt-5 border-y py-4 text-center" style={{ borderColor: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)" }}>
                    {hasDiscount ? (
                      <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs" style={{ color: textMuted }}>De <span className="line-through">{formatBRL(p.price)}</span> por apenas</span>
                        <span className="rounded-full px-2 py-1 text-[9px] font-bold text-white" style={{ backgroundColor: accentColor }}>Economize {Math.round(((p.price - finalPrice) / p.price) * 100)}%</span>
                      </div>
                    ) : isRecommended ? <p className="mb-1 text-xs" style={{ color: textMuted }}>Por apenas</p> : null}
                    <p className={`${isRecommended ? "text-4xl" : "text-3xl"} font-black tracking-tight`}>{formatBRL(finalPrice)}</p>
                    {isRecommended && <p className="mt-1 text-xs font-medium" style={{ color: textMuted }}>ou 12x de {formatBRL(finalPrice / 12)}</p>}
                    <p className="mt-1 text-[10px]" style={{ color: textMuted }}>{includedItems.length} cuidado(s) em uma única escolha</p>
                  </div>

                  {p.description && <p className="mt-4 text-center text-xs leading-5" style={{ color: textMuted }}>{p.description}</p>}

                  <div className="mt-5 flex-1 text-left">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[.12em]">O que está incluso</p>
                    {includedItems.length > 0 ? (
                      <ul className="space-y-2.5">
                        {includedItems.map((item) => (
                          <li key={item.id} className="flex items-start gap-2 text-xs leading-5" style={{ color: textMuted }}>
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ color: PACKAGE_CHECK_COLOR, backgroundColor: `${PACKAGE_CHECK_COLOR}20` }}>✓</span>
                            <span>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-xs" style={{ color: textMuted }}>Confira a descrição completa com nossa equipe.</p>}
                  </div>

                  <div className="mt-6">
                    {whatsapp && (
                      <WhatsappButton
                        numero={whatsapp}
                        businessId={business.id}
                        trackAs="package_view"
                        contexto={{ pacote: p.name, preco: formatBRL(finalPrice) }}
                        className="flex w-full items-center justify-center gap-2 rounded-[var(--catalog-radius)] py-3 text-center text-sm font-semibold text-white transition hover:brightness-90"
                        style={{ backgroundColor: WHATSAPP_GREEN }}
                      >
                        <WhatsappIcon />
                        {p.cta_label || "Quero este pacote"}
                      </WhatsappButton>
                    )}
                    {whatsapp && isRecommended && (
                      <div className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-1 text-center text-[9px] leading-4" style={{ color: textMuted }}>
                        <span>● Atendimento direto</span>
                        <span>● Agendamento combinado</span>
                        <span>● Conversa pelo WhatsApp</span>
                      </div>
                    )}
                  </div>
                  </div>
                </article>
              </EditableMedia>
              );
            })}
          </div>
            );
          })()}
        </section>
      );
    },

    horarios: (bgColor, block) =>
      proximos.length > 0 && (
        <section key="horarios" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Próximos horários", "Escolha uma opção e fale com a equipe para confirmar.")}
          <div className={`mx-auto max-w-2xl gap-3 ${block.variant === "list" ? "grid grid-cols-1" : "flex flex-wrap justify-center"}`}>
            {proximos.map((h, i) => (
              <WhatsappButton
                key={i}
                numero={whatsapp}
                businessId={business.id}
                trackAs="schedule_click"
                contexto={{ horario: h.dateLabel }}
                className="rounded-lg border px-4 py-3 text-sm font-medium"
                style={{ borderColor: blockAccent(block) } as React.CSSProperties}
              >
                {h.label} — {h.time.slice(0, 5)}
              </WhatsappButton>
            ))}
          </div>
        </section>
      ),

    avaliacoes: (bgColor, block) => {
      const entries = resolveBlockEntries(block, reviews, (item) => item.rating === 5);
      return entries.length > 0 && (
        <section key="avaliacoes" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Avaliações", "Experiências de clientes que já cuidaram do carro com a gente.")}
          <div className={`mx-auto max-w-4xl gap-4 ${block.variant === "carousel" ? "flex snap-x overflow-x-auto pb-3 [&>*]:min-w-[280px] [&>*]:snap-start" : `grid ${block.variant === "featured" ? "grid-cols-1" : columnsClass(block)}`}`}>
            {entries.map(({ item: r, key }) => (
              <EditableMedia key={key} editable={editable} onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}>
                {reviewCard(r)}
              </EditableMedia>
            ))}
          </div>
        </section>
      );
    },

    sobre: (bgColor, block) => {
      const gallery = contentStringArray(block, "galleryImages");
      const accentColor = blockAccent(block);
      const hasText = Boolean(business.about?.trim());
      if (!hasText && gallery.length === 0 && !editable) return null;

      const aboutText = (
        <EditableText
          as="p"
          editable={editable}
          onTap={() => onFieldTap?.({ kind: "section_text", field: "about" })}
          className="whitespace-pre-line text-sm leading-7"
          style={{ color: textMuted }}
        >
          {business.about || "Nenhum texto sobre o negócio adicionado ainda. Toque para escrever sua história."}
        </EditableText>
      );

      const emptyGallery = editable ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center" style={{ borderColor: isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.16)" }}>
          <span className="text-2xl opacity-50">+</span>
          <p className="mt-2 text-xs font-semibold">Nenhuma foto adicionada ainda.</p>
          <p className="mt-1 text-[10px]" style={{ color: textMuted }}>Toque para mostrar equipe, espaço e bastidores.</p>
        </div>
      ) : null;

      return (
        <section key="sobre" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Sobre")}

          {block.variant === "gallery" ? (
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:items-center">
              <div className="rounded-2xl border p-5 sm:p-7" style={{ borderColor: isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)", backgroundColor: bgDeep }}>
                <p className="mb-3 text-4xl leading-none opacity-20" style={{ color: accentColor }}>“</p>
                {aboutText}
                <div className="mt-5 h-1 w-14 rounded-full" style={{ backgroundColor: accentColor }} />
              </div>
              <EditableMedia editable={editable} onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}>
                {gallery.length > 0 ? (
                  <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                    {gallery.map((url, index) => (
                      <div key={`${url}-${index}`} className="min-w-[82%] snap-center overflow-hidden rounded-2xl sm:min-w-[46%]">
                        <AdaptiveSquareImage src={url} alt={`${business.name} — foto ${index + 1}`} className="w-full rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : emptyGallery}
              </EditableMedia>
            </div>
          ) : block.variant === "split" ? (
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-center">
              <EditableMedia editable={editable} onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}>
                {gallery[0] ? <AdaptiveSquareImage src={gallery[0]} alt={`${business.name} — nosso espaço`} className="w-full rounded-2xl" /> : emptyGallery}
              </EditableMedia>
              <div className="rounded-2xl border p-5 sm:p-8" style={{ borderColor: isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)" }}>
                {aboutText}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl rounded-2xl border p-6 sm:p-10" style={{ borderColor: isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)", backgroundColor: bgDeep }}>
              <p className="mb-4 text-5xl leading-none opacity-20" style={{ color: accentColor }}>“</p>
              {aboutText}
            </div>
          )}
        </section>
      );
    },

    localizacao: (bgColor, block) => {
      if (!business.address && !business.city) return null;
      const mapQuery = business.address || business.city || "";
      const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
      return (
        <section key="localizacao" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Localização", "Consulte a localização e planeje sua visita.")}
          <div className="mx-auto max-w-2xl">
            <EditableText
              as="p"
              editable={editable}
              onTap={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}
              className="text-sm"
              style={{ color: textMuted }}
            >
              {business.address}
              {business.address && business.city && " — "}
              {business.city}
            </EditableText>

            <div
              className="mt-4 overflow-hidden rounded-xl border"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
            >
              <iframe
                src={embedSrc}
                title={`Mapa — ${business.name}`}
                width="100%"
                height="280"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {business.map_url && (
              <div className="mt-4 text-center">
                <a
                  href={business.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold underline"
                  style={{ color: blockAccent(block) }}
                >
                  Abrir no mapa
                </a>
              </div>
            )}
          </div>
        </section>
      );
    },
  };

  function renderCustomBlock(block: CatalogBlock, bgColor: string): ReactNode {
    const title = contentText(block, "title");
    const description = contentText(block, "description");
    const buttonLabel = contentText(block, "buttonLabel");
    const accentColor = blockAccent(block);

    if (block.type === "carrossel") {
      const mode = contentText(block, "mode") === "reviews" ? "reviews" : "images";
      const images = contentStringArray(block, "images");
      const reviewIds = contentStringArray(block, "reviewIds");
      const selectedReviews = reviewIds.length ? reviewIds.flatMap((id) => {
        const review = reviews.find((item) => item.id === id);
        return review ? [review] : [];
      }) : reviews.slice(0, 8);
      const items: ReactNode[] = mode === "images"
        ? images.map((url, index) => <div key={`${url}-${index}`} className="overflow-hidden border" style={{ borderColor: isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)", ...cardStyleProps }}><CarouselImage src={url} alt={`${title || "Galeria"} ${index + 1}`} /></div>)
        : selectedReviews.map((review) => <div key={review.id}>{reviewCard(review)}</div>);
      if (!items.length && !editable) return null;
      return (
        <section className="overflow-hidden px-4 py-16" style={{ backgroundColor: bgColor }}>
          {sectionIntro(block, "Veja mais do nosso trabalho", "Resultados e experiências que ajudam você a escolher com confiança.")}
          <div className="mx-auto max-w-5xl">
            {items.length ? <AutoCarousel items={items} variant={block.variant === "marquee" ? "marquee" : "slides"} autoplaySeconds={Math.max(2, Math.min(15, Number(block.content.autoplaySeconds) || 5))} ariaLabel={title || "Carrossel automático"} /> : <div className="rounded-2xl border border-dashed border-white/20 px-5 py-10 text-center text-sm opacity-60">Adicione imagens ou selecione avaliações para iniciar o carrossel.</div>}
          </div>
        </section>
      );
    }

    if (block.type === "banner") {
      const eyebrow = contentText(block, "eyebrow");
      const imageUrl = contentText(block, "imageUrl");
      const buttonUrl = safeHref(contentText(block, "buttonUrl"), "#servicos");
      const split = block.variant === "split" && imageUrl;
      return (
        <section className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <div
            className={`mx-auto overflow-hidden border ${split ? "grid items-center md:grid-cols-2" : "relative"}`}
            style={{ borderColor: isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)", ...cardStyleProps }}
          >
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className={split ? "h-full min-h-64 w-full object-cover" : "absolute inset-0 h-full w-full object-cover"} />
            )}
            {imageUrl && !split && <div className="absolute inset-0 bg-black/65" />}
            <div className="relative z-10 p-8 sm:p-12">
              {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.2em]" style={{ color: accentColor }}>{eyebrow}</p>}
              <h2 className="text-2xl sm:text-3xl" style={{ ...headingStyleProps, color: imageUrl && !split ? "#fff" : undefined }}>{title}</h2>
              {description && <p className="mt-3 max-w-xl text-sm" style={{ color: imageUrl && !split ? "rgba(255,255,255,.8)" : textMuted }}>{description}</p>}
              {buttonLabel && <a href={buttonUrl} className="mt-6 inline-flex rounded-[var(--catalog-radius)] px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accentColor }}>{buttonLabel}</a>}
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "video") {
      const videoUrl = contentText(block, "videoUrl");
      const aspectRatio = contentText(block, "aspectRatio");
      return (
        <section className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl" style={headingStyleProps}>{title}</h2>
            {description && <p className="mt-2 text-sm" style={{ color: textMuted }}>{description}</p>}
            <div className={`mt-6 overflow-hidden ${aspectRatio === "9:16" ? "mx-auto max-w-sm" : aspectRatio === "1:1" ? "mx-auto max-w-xl" : ""}`}>
              {videoUrl ? (
                <YoutubeEmbed url={videoUrl} title={title || business.name} />
              ) : editable ? (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/25 text-sm text-white/50">Adicione o link do vídeo</div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "text") {
      const eyebrow = contentText(block, "eyebrow");
      const body = contentText(block, "body");
      const buttonUrl = safeHref(contentText(block, "buttonUrl"));
      return (
        <section className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <div className="mx-auto max-w-3xl">
            {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.2em]" style={{ color: accentColor }}>{eyebrow}</p>}
            <h2 className="text-2xl sm:text-3xl" style={headingStyleProps}>{title}</h2>
            {body && <p className="mt-4 whitespace-pre-line text-sm leading-7" style={{ color: textMuted }}>{body}</p>}
            {buttonLabel && buttonUrl && <a href={buttonUrl} className="mt-6 inline-flex rounded-[var(--catalog-radius)] px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accentColor }}>{buttonLabel}</a>}
          </div>
        </section>
      );
    }

    if (block.type === "cta") {
      const message = contentText(block, "message");
      const digits = whatsapp.replace(/\D/g, "");
      const phone = digits.startsWith("55") ? digits : `55${digits}`;
      const href = whatsapp ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : "#servicos";
      return (
        <section className="px-4 py-16" style={{ backgroundColor: block.style.background === "auto" ? business.secondary_color : bgColor, color: block.style.background === "auto" ? "#fff" : undefined }}>
          <h2 className="text-2xl sm:text-3xl" style={headingStyleProps}>{title}</h2>
          {description && <p className="mx-auto mt-3 max-w-xl text-sm opacity-80">{description}</p>}
          {buttonLabel && <a href={href} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noopener noreferrer" : undefined} className="mt-6 inline-flex rounded-[var(--catalog-radius)] px-7 py-3 text-sm font-semibold text-white" style={{ backgroundColor: accentColor }}>{buttonLabel}</a>}
        </section>
      );
    }

    return null;
  }

  function blockBackground(block: CatalogBlock, alternatingIndex: number) {
    if (block.style.background === "base") return bg;
    if (block.style.background === "alternate") return bgDeep;
    if (block.style.background === "primary") return blockAccent(block);
    if (block.style.background === "custom" && block.style.backgroundColor) return block.style.backgroundColor;
    return alternatingIndex % 2 === 0 ? bg : bgDeep;
  }

  return (
    <VehicleProvider>
      <div
        style={
          {
            "--catalog-primary": business.primary_color,
            "--catalog-secondary": business.secondary_color,
            "--catalog-radius": `${business.button_radius ?? 8}px`,
            "--catalog-heading-font": `var(${fontPair.headingFont.variable})`,
            "--catalog-body-font": `var(${fontPair.bodyFont.variable})`,
            backgroundColor: bg,
            color: textColor,
            fontFamily: `var(${fontPair.bodyFont.variable})`,
          } as React.CSSProperties
        }
        className={`${CATALOG_FONT_VARIABLE_CLASSES} catalog-font-scope min-h-screen`}
      >
        {/* HERO */}
        <section
          className="relative flex flex-col items-center justify-center gap-5 overflow-hidden px-4 py-16 text-center sm:py-20"
          style={{
            backgroundImage: business.cover_url ? `url(${business.cover_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {business.cover_url && <div className="absolute inset-0 bg-black/60" aria-hidden />}
          {editable && (
            <button
              type="button"
              onClick={() => onFieldTap?.({ kind: "hero_media", field: "cover_url" })}
              className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-dashed border-white/50 bg-black/60 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white hover:bg-black/80"
            >
              🖼️ {business.cover_url ? "Trocar foto de fundo" : "Adicionar foto de fundo"}
            </button>
          )}
          <div className="relative z-10 flex flex-col items-center gap-5">
            <EditableText
              as="h1"
              editable={editable}
              onTap={() => onFieldTap?.({ kind: "section_text", field: "headline" })}
              className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl"
              style={{ color: business.cover_url ? "#fff" : textColor }}
            >
              {business.headline || `Sua estética automotiva${business.city ? ` em ${business.city}` : ""}`}
            </EditableText>

            {(business.logo_url || editable) && (
              <EditableMedia editable={editable} onTap={() => onFieldTap?.({ kind: "hero_media", field: "logo_url" })}>
                {business.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-white/20 sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-white/40 text-xs text-white/60 sm:h-32 sm:w-32">
                    Logo
                  </div>
                )}
              </EditableMedia>
            )}

            {(business.about || editable) && (
              <EditableText
                as="p"
                editable={editable}
                onTap={() => onFieldTap?.({ kind: "section_text", field: "about" })}
                className="max-w-md text-sm"
                style={{ color: business.cover_url ? "rgba(255,255,255,0.8)" : textMuted }}
              >
                {business.about || "Toque para adicionar um texto sobre o seu negócio"}
              </EditableText>
            )}

            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {business.hero_show_city_badge && business.city && (
                <AutoBadge editable={editable} onRemove={() => onRemoveHeroBadge?.("city")}>
                  <span
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderColor: business.cover_url ? "rgba(255,255,255,0.4)" : business.primary_color,
                      color: business.cover_url ? "#fff" : textColor,
                      backgroundColor: business.cover_url ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                  >
                    📍 {business.city}
                  </span>
                </AutoBadge>
              )}
              {business.hero_show_price_badge && menorPreco !== null && (
                <AutoBadge editable={editable} onRemove={() => onRemoveHeroBadge?.("price")}>
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: business.primary_color }}
                  >
                    💰 Serviços a partir de {formatBRL(menorPreco)}
                  </span>
                </AutoBadge>
              )}
              {business.hero_show_whatsapp_badge && whatsapp && (
                <AutoBadge editable={editable} onRemove={() => onRemoveHeroBadge?.("whatsapp")}>
                  <span
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderColor: business.cover_url ? "rgba(255,255,255,0.4)" : business.primary_color,
                      color: business.cover_url ? "#fff" : textColor,
                      backgroundColor: business.cover_url ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                  >
                    📲 Chame no WhatsApp
                  </span>
                </AutoBadge>
              )}
              <EditableMedia
                editable={editable}
                onTap={() => onFieldTap?.({ kind: "section_text", field: "highlights" })}
              >
                <div className="flex flex-wrap justify-center gap-2">
                {highlights.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={{
                      borderColor: business.cover_url ? "rgba(255,255,255,0.4)" : business.primary_color,
                      color: business.cover_url ? "#fff" : textColor,
                    }}
                  >
                    {h}
                  </span>
                ))}
                {editable && highlights.length === 0 && (
                  <span
                    className="rounded-full border border-dashed px-3 py-1.5 text-xs font-medium"
                    style={{ borderColor: business.cover_url ? "rgba(255,255,255,0.4)" : business.primary_color }}
                  >
                    + Frase de destaque
                  </span>
                )}
                </div>
              </EditableMedia>
            </div>

            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <a
                href="#servicos"
                className="rounded-[var(--catalog-radius)] px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                Ver serviços
              </a>
              {whatsapp && (
                <WhatsappButton
                  numero={whatsapp}
                  businessId={business.id}
                  className="rounded-[var(--catalog-radius)] border border-white/40 px-6 py-3 text-sm font-semibold"
                  style={{ color: business.cover_url ? "#fff" : textColor } as React.CSSProperties}
                >
                  Solicitar orçamento
                </WhatsappButton>
              )}
            </div>
          </div>
        </section>

        {editable && layout.blocks.length === 0 && (
          <section className="px-4 py-14" style={{ backgroundColor: bgDeep }}>
            <div
              className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center"
              style={{ borderColor: isDark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.16)", backgroundColor: bg }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-light text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                +
              </span>
              <h2 className="mt-5 text-xl" style={headingStyleProps}>Seu catálogo começa aqui</h2>
              <p className="mt-2 max-w-md text-sm leading-6" style={{ color: textMuted }}>
                Adicione a primeira seção e construa a página na ordem que fizer sentido para a sua oferta.
              </p>
              <button
                type="button"
                onClick={() => onAddBlockAfter?.()}
                className="mt-6 rounded-[var(--catalog-radius)] px-5 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                + Adicionar primeira seção
              </button>
              <p className="mt-3 text-[11px]" style={{ color: textMuted }}>
                Seus serviços, pacotes, fotos e avaliações continuam disponíveis.
              </p>
            </div>
          </section>
        )}

        {layout.blocks
          .filter((block) => editable || block.visible)
          .map((block, i, visibleBlocks) => {
            const bgColor = blockBackground(block, i);
            const renderer = sectionRenderers[block.type as SectionConfig["id"]];
            const rendered = renderer?.(bgColor, block) ?? renderCustomBlock(block, bgColor);
            const fallback = editable && !rendered ? (
              <section className="px-4 py-10 text-center" style={{ backgroundColor: bgColor }}>
                <p className="text-sm font-semibold">{BLOCK_LABELS[block.type]}</p>
                <p className="mt-1 text-xs opacity-60">Adicione conteúdo a esta seção para exibi-la.</p>
              </section>
            ) : null;
            if (!rendered && !fallback) return null;
            const responsiveVisibility = editable
              ? ""
              : `${block.responsive.hideOnMobile ? "hidden sm:block" : ""} ${block.responsive.hideOnDesktop ? "sm:hidden" : ""}`;
            const wrapperClass = `${WIDTH_CLASS[block.style.width]} ${SPACING_CLASS[block.style.spacing]} ${responsiveVisibility}`;
            if (!editable) return <CatalogSectionMotion key={block.instanceId} preset={animationPreset} className={wrapperClass} style={{ textAlign: block.style.align }}>{rendered}</CatalogSectionMotion>;
            return (
              <CatalogSectionMotion key={block.instanceId} preset={animationPreset} className={`${wrapperClass} mb-6`} style={{ textAlign: block.style.align }}>
              <div
                className={`group relative cursor-pointer outline-dashed outline-1 outline-offset-[-2px] transition hover:outline-white/40 ${block.visible ? "outline-transparent" : "opacity-50 outline-white/30"}`}
                onClick={() => onFieldTap?.({ kind: "catalog_block", instanceId: block.instanceId })}
                role="button"
                tabIndex={0}
              >
                <span className="pointer-events-none absolute left-2 top-2 z-30 max-w-[calc(100%-4rem)] truncate rounded-full border border-white/15 bg-black/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white shadow-lg backdrop-blur">
                  Seção · {BLOCK_LABELS[block.type]}
                </span>
                {!block.visible && <span className="absolute left-2 top-10 z-20 rounded-full bg-amber-500/90 px-2 py-1 text-[9px] font-semibold text-black">Oculta</span>}
                {onMoveBlock && (
                  <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock?.(block.instanceId, -1);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white disabled:opacity-30"
                      aria-label={`Mover ${BLOCK_LABELS[block.type]} para cima`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === visibleBlocks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock?.(block.instanceId, 1);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white disabled:opacity-30"
                      aria-label={`Mover ${BLOCK_LABELS[block.type]} para baixo`}
                    >
                      ↓
                    </button>
                  </div>
                )}
                {rendered ?? fallback}
                {onAddBlockAfter && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddBlockAfter(block.instanceId);
                    }}
                    className="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:border-neutral-500 md:opacity-0"
                  >
                    + Adicionar seção
                  </button>
                )}
              </div>
              </CatalogSectionMotion>
            );
          })}

        {/* CTA FINAL */}
        {layout.blocks.length > 0 && whatsapp && !layout.blocks.some((block) => block.type === "cta" && block.visible) && (
          <section className="px-4 py-20 text-center" style={{ backgroundColor: business.secondary_color, color: "#fff" }}>
            <h2 className="mb-6 text-2xl" style={headingStyleProps}>Quer cuidar do seu carro?</h2>
            <WhatsappButton
              numero={whatsapp}
              businessId={business.id}
              className="inline-block rounded-[var(--catalog-radius)] px-8 py-4 text-sm font-semibold text-white"
              style={{ backgroundColor: business.primary_color } as React.CSSProperties}
            >
              Falar no WhatsApp
            </WhatsappButton>
          </section>
        )}

        {/* FOOTER */}
        <footer className="px-4 py-6 text-center text-xs" style={{ color: textMuted }}>
          {business.plano === "essencial" && (
            <p>
              Catálogo criado com{" "}
              <a href={process.env.NEXT_PUBLIC_APP_URL} className="underline">
                {process.env.NEXT_PUBLIC_PRODUCT_NAME}
              </a>
            </p>
          )}
        </footer>
      </div>
    </VehicleProvider>
  );
}
