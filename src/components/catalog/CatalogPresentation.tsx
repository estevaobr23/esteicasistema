"use client";

import type { ReactNode } from "react";
import type { Database } from "@/lib/supabase/types";
import { proximosHorarios } from "@/lib/domain/availability";
import { VehicleProvider, VehicleSelector } from "@/components/catalog/VehicleSelector";
import ServicePrice from "@/components/catalog/ServicePrice";
import { formatBRL } from "@/lib/format";
import WhatsappButton from "@/components/catalog/WhatsappButton";
import BeforeAfterSlider from "@/components/catalog/BeforeAfterSlider";
import ServiceGallery from "@/components/catalog/ServiceGallery";
import YoutubeEmbed from "@/components/catalog/YoutubeEmbed";
import type { SectionConfig } from "@/lib/domain/catalog-sections";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServiceFeature = Database["public"]["Tables"]["service_features"]["Row"];
type ServicePriceRow = Database["public"]["Tables"]["service_prices"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"] & {
  service_features?: ServiceFeature[];
  service_prices?: ServicePriceRow[];
};
type Package = Database["public"]["Tables"]["packages"]["Row"] & {
  package_services?: { service_id: string }[];
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
};

function ServiceMedia({ service, isDark }: { service: Service; isDark: boolean }) {
  switch (service.media_mode) {
    case "before_after":
      return service.before_image && service.after_image ? (
        <BeforeAfterSlider beforeImage={service.before_image} afterImage={service.after_image} alt={service.name} />
      ) : null;
    case "gallery": {
      const images = Array.isArray(service.gallery) ? (service.gallery as string[]) : [];
      return images.length > 0 ? <ServiceGallery images={images} alt={service.name} /> : null;
    }
    case "youtube":
      return service.video_url ? <YoutubeEmbed url={service.video_url} title={service.name} /> : null;
    case "single_photo":
    default:
      return service.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={service.image_url} alt={service.name} className="h-40 w-full object-cover" />
      ) : null;
  }
  void isDark;
}

export default function CatalogPresentation({
  business,
  services,
  packages,
  portfolioItems,
  availabilitySlots,
  reviews,
  sectionsConfig,
}: CatalogPresentationProps) {
  const template = getCatalogTemplate(business.template_id);
  const isDark = template.isDark;
  const bg = template.palette.bg;
  const bgDeep = template.palette.bgDeep;
  const textColor = template.palette.textColor;
  const textMuted = template.palette.textMuted;

  const cardStyleProps: React.CSSProperties = {
    borderRadius: template.cardStyle.borderRadius,
    borderWidth: template.cardStyle.borderWidth,
    boxShadow: template.cardStyle.shadow,
  };
  const headingStyleProps: React.CSSProperties = {
    fontWeight: template.typography.headingWeight,
    letterSpacing: template.typography.headingTracking,
  };

  const destaques = services.filter((s) => s.featured).slice(0, 3);
  const categorias = Array.from(new Set(portfolioItems.map((p) => p.category).filter(Boolean)));
  const proximos = proximosHorarios(availabilitySlots);
  const whatsapp = business.whatsapp ?? "";
  const highlights = Array.isArray(business.highlights) ? (business.highlights as string[]) : [];

  const sectionRenderers: Partial<Record<SectionConfig["id"], (bgColor: string) => ReactNode>> = {
    servicos: (bgColor) =>
      services.length > 0 && (
        <section key="servicos" id="servicos" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-2 text-center text-2xl" style={headingStyleProps}>Serviços</h2>
          <p className="mb-6 text-center text-sm" style={{ color: textMuted }}>
            Selecione seu veículo para ver o preço.
          </p>
          <div className="mb-8 flex justify-center">
            <VehicleSelector />
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex flex-col overflow-hidden border"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", backgroundColor: bg, ...cardStyleProps }}
              >
                <ServiceMedia service={s} isDark={isDark} />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="text-base font-semibold">{s.name}</h3>
                    {s.short_description && (
                      <p className="mt-1 text-sm" style={{ color: textMuted }}>
                        {s.short_description}
                      </p>
                    )}
                  </div>

                  {s.service_features && s.service_features.length > 0 && (
                    <ul className="space-y-1 text-xs" style={{ color: textMuted }}>
                      {s.service_features.slice(0, 4).map((f) => (
                        <li key={f.id}>✓ {f.label}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-2">
                    <ServicePrice priceType={s.price_type} basePrice={s.base_price} prices={s.service_prices ?? []} />
                    {whatsapp && (
                      <WhatsappButton
                        numero={whatsapp}
                        businessId={business.id}
                        serviceId={s.id}
                        trackAs="service_view"
                        contexto={{ servico: s.name }}
                        className="mt-3 block rounded-lg py-2.5 text-center text-sm font-semibold text-white"
                        style={{ backgroundColor: business.primary_color } as React.CSSProperties}
                      >
                        Solicitar orçamento
                      </WhatsappButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ),

    destaques: (bgColor) =>
      destaques.length > 0 && (
        <section key="destaques" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-8 text-center text-2xl" style={headingStyleProps}>Mais procurados</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {destaques.map((s) => (
              <div key={s.id} className="border p-4 text-center" style={{ borderColor: business.primary_color, ...cardStyleProps }}>
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 text-xs" style={{ color: textMuted }}>
                  {s.short_description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ),

    antes_depois: (bgColor) =>
      portfolioItems.length > 0 && (
        <section key="antes_depois" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-2 text-center text-2xl" style={headingStyleProps}>Resultados</h2>
          <p className="mb-8 text-center text-sm" style={{ color: textMuted }}>
            Antes e depois dos nossos trabalhos.
          </p>
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
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {portfolioItems.map((p) => (
              <div key={p.id}>
                <BeforeAfterSlider beforeImage={p.before_image} afterImage={p.after_image} alt={p.title ?? "Resultado"} />
                {(p.title || p.vehicle) && (
                  <p className="mt-2 text-sm font-medium">
                    {p.title} {p.vehicle && <span style={{ color: textMuted }}>· {p.vehicle}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ),

    branding_video: () =>
      business.branding_video_url ? (
        <section key="branding_video" className="px-4 py-16" style={{ backgroundColor: "#ffffff", color: "#171717" }}>
          <h2 className="mb-8 text-center text-2xl" style={headingStyleProps}>Conheça nosso trabalho</h2>
          <div className="mx-auto max-w-md">
            <YoutubeEmbed url={business.branding_video_url} title={business.name} />
          </div>
        </section>
      ) : null,

    pacotes: (bgColor) =>
      packages.length > 0 && (
        <section key="pacotes" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-8 text-center text-2xl" style={headingStyleProps}>Pacotes</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {packages.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden border"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", ...cardStyleProps }}
              >
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {p.description && (
                    <p className="text-sm" style={{ color: textMuted }}>
                      {p.description}
                    </p>
                  )}
                  <div className="mt-auto">
                    <p className="text-xl font-bold">{formatBRL(p.promotional_price ?? p.price)}</p>
                    {whatsapp && (
                      <WhatsappButton
                        numero={whatsapp}
                        businessId={business.id}
                        trackAs="package_view"
                        contexto={{ pacote: p.name, preco: formatBRL(p.promotional_price ?? p.price) }}
                        className="mt-3 block rounded-lg py-2.5 text-center text-sm font-semibold text-white"
                        style={{ backgroundColor: business.primary_color } as React.CSSProperties}
                      >
                        {p.cta_label || "Quero este pacote"}
                      </WhatsappButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ),

    horarios: (bgColor) =>
      proximos.length > 0 && (
        <section key="horarios" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-8 text-center text-2xl" style={headingStyleProps}>Próximos horários</h2>
          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-3">
            {proximos.map((h, i) => (
              <WhatsappButton
                key={i}
                numero={whatsapp}
                businessId={business.id}
                trackAs="schedule_click"
                contexto={{ horario: h.dateLabel }}
                className="rounded-lg border px-4 py-3 text-sm font-medium"
                style={{ borderColor: business.primary_color } as React.CSSProperties}
              >
                {h.label} — {h.time.slice(0, 5)}
              </WhatsappButton>
            ))}
          </div>
        </section>
      ),

    avaliacoes: (bgColor) =>
      reviews.length > 0 && (
        <section key="avaliacoes" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-8 text-center text-2xl" style={headingStyleProps}>Avaliações</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border p-4"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", ...cardStyleProps }}
              >
                <p className="text-sm font-semibold">{r.customer_name}</p>
                <p className="text-amber-400">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                {r.text && (
                  <p className="mt-2 text-sm" style={{ color: textMuted }}>
                    {r.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ),

    sobre: (bgColor) =>
      business.about && (
        <section key="sobre" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-4 text-center text-2xl" style={headingStyleProps}>Sobre</h2>
          <p className="mx-auto max-w-2xl text-center text-sm" style={{ color: textMuted }}>
            {business.about}
          </p>
        </section>
      ),

    localizacao: (bgColor) =>
      (business.address || business.city) && (
        <section key="localizacao" className="px-4 py-16" style={{ backgroundColor: bgColor }}>
          <h2 className="mb-4 text-center text-2xl" style={headingStyleProps}>Localização</h2>
          <p className="text-center text-sm" style={{ color: textMuted }}>
            {business.address}
            {business.address && business.city && " — "}
            {business.city}
          </p>
          {business.map_url && (
            <div className="mt-4 text-center">
              <a
                href={business.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold underline"
                style={{ color: business.primary_color }}
              >
                Abrir no mapa
              </a>
            </div>
          )}
        </section>
      ),
  };

  return (
    <VehicleProvider>
      <div
        style={
          {
            "--catalog-primary": business.primary_color,
            "--catalog-secondary": business.secondary_color,
            backgroundColor: bg,
            color: textColor,
          } as React.CSSProperties
        }
        className="min-h-screen"
      >
        {/* HERO */}
        <section
          className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-4 py-20 text-center"
          style={{
            backgroundImage: business.cover_url ? `url(${business.cover_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {business.cover_url && <div className="absolute inset-0 bg-black/60" aria-hidden />}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
              />
            )}
            <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: business.cover_url ? "#fff" : textColor }}>
              {business.headline || business.name}
            </h1>
            {business.about && (
              <p className="max-w-md text-sm" style={{ color: business.cover_url ? "rgba(255,255,255,0.8)" : textMuted }}>
                {business.about}
              </p>
            )}
            {highlights.length > 0 && (
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {highlights.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-full border px-3 py-1 text-xs font-medium"
                    style={{
                      borderColor: business.cover_url ? "rgba(255,255,255,0.4)" : business.primary_color,
                      color: business.cover_url ? "#fff" : textColor,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <a
                href="#servicos"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                Ver serviços
              </a>
              {whatsapp && (
                <WhatsappButton
                  numero={whatsapp}
                  businessId={business.id}
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold"
                  style={{ color: business.cover_url ? "#fff" : textColor } as React.CSSProperties}
                >
                  Solicitar orçamento
                </WhatsappButton>
              )}
            </div>
          </div>
        </section>

        {sectionsConfig
          .filter((s) => s.visible)
          .map((s, i, visibleSections) => {
            const alternatingIndex = visibleSections.slice(0, i).filter((x) => x.id !== "branding_video").length;
            const bgColor = s.id === "branding_video" ? "" : alternatingIndex % 2 === 0 ? bg : bgDeep;
            return sectionRenderers[s.id]?.(bgColor);
          })}

        {/* CTA FINAL */}
        {whatsapp && (
          <section className="px-4 py-20 text-center" style={{ backgroundColor: business.secondary_color, color: "#fff" }}>
            <h2 className="mb-6 text-2xl" style={headingStyleProps}>Quer cuidar do seu carro?</h2>
            <WhatsappButton
              numero={whatsapp}
              businessId={business.id}
              className="inline-block rounded-full px-8 py-4 text-sm font-semibold text-white"
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
