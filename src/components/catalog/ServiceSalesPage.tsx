"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";
import { VehicleProvider } from "@/components/catalog/VehicleSelector";
import ServicePrice from "@/components/catalog/ServicePrice";
import WhatsappButton from "@/components/catalog/WhatsappButton";
import YoutubeEmbed from "@/components/catalog/YoutubeEmbed";
import AdaptiveSquareImage from "@/components/AdaptiveSquareImage";
import BeforeAfterSlider from "@/components/catalog/BeforeAfterSlider";

const WHATSAPP_GREEN = "#25D366";

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 4.99L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.87 14.24c-.24.68-1.4 1.33-1.93 1.4-.5.07-1.06.1-3.15-.66-2.65-.97-4.36-3.62-4.5-3.79-.13-.17-1.08-1.44-1.08-2.75s.68-1.95.92-2.22c.24-.26.53-.33.7-.33h.5c.16 0 .38-.06.59.45.24.58.8 2 .87 2.15.07.15.11.32.02.5-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.94 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.27.37-.22.62-.13.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServicePriceRow = Database["public"]["Tables"]["service_prices"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"] & {
  service_prices?: ServicePriceRow[];
};
type Review = Database["public"]["Tables"]["reviews"]["Row"];
type Bonus = { title: string; description: string };
type Faq = { question: string; answer: string };

function SectionHead({
  eyebrow,
  title,
  accent,
}: {
  eyebrow?: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="mb-6 text-center">
      {eyebrow && (
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mx-auto mt-3 h-0.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

function EditableBlock({
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
      className="relative cursor-pointer rounded outline-dashed outline-1 outline-offset-4 outline-white/40 transition hover:outline-white/70"
      onClick={(e) => {
        e.stopPropagation();
        onTap?.();
      }}
      role="button"
      tabIndex={0}
    >
      {children}
      <span className="pointer-events-none absolute -top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
        Editar
      </span>
    </div>
  );
}

export default function ServiceSalesPage({
  business,
  service,
  reviews,
  editable,
  onEditTap,
}: {
  business: Business;
  service: Service;
  reviews: Review[];
  editable?: boolean;
  onEditTap?: () => void;
}) {
  const template = getCatalogTemplate(business.template_id);
  const isDark = template.isDark;
  const bg = template.palette.bg;
  const bgDeep = template.palette.bgDeep;
  const textColor = template.palette.textColor;
  const textMuted = template.palette.textMuted;
  const accent = business.primary_color || template.palette.primaryColorDefault;
  const whatsapp = business.whatsapp ?? "";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const headline = service.sales_headline?.trim() || service.name;
  const subheadline = service.sales_subheadline?.trim() || service.short_description || "";
  const gallery = Array.isArray(service.sales_gallery) ? (service.sales_gallery as unknown as string[]) : [];
  const bonuses = Array.isArray(service.sales_bonuses) ? (service.sales_bonuses as unknown as Bonus[]) : [];
  const faq = Array.isArray(service.sales_faq) ? (service.sales_faq as unknown as Faq[]) : [];
  const ctaLabel = service.sales_cta_message?.trim() || service.cta_label || "Solicitar orçamento";
  const guaranteeText = service.sales_guarantee_text?.trim();
  const urgencyText = service.sales_urgency_text?.trim();
  const hasBeforeAfter = Boolean(service.before_image && service.after_image);
  const reviewCount = reviews.length;

  const ctaButton = whatsapp ? (
    <WhatsappButton
      numero={whatsapp}
      businessId={business.id}
      serviceId={service.id}
      trackAs="service_view"
      contexto={{ servico: service.name }}
      className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-center text-base font-semibold text-white transition hover:brightness-90"
      style={{ backgroundColor: WHATSAPP_GREEN }}
    >
      <WhatsappIcon />
      {ctaLabel}
    </WhatsappButton>
  ) : null;

  return (
    <VehicleProvider>
      <main style={{ backgroundColor: bg, color: textColor }} className="min-h-screen">
        <div className="sticky top-0 z-20 border-b px-4 py-3" style={{ backgroundColor: bg, borderColor }}>
          <Link href={`/${business.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: textMuted }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Voltar para {business.name}
          </Link>
        </div>

        {/* Hero: headline -> sub -> mídia -> prova social rápida -> CTA */}
        <EditableBlock editable={editable} onTap={onEditTap}>
          <section className="px-4 pb-8 pt-10 text-center">
            <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">{headline}</h1>
            {subheadline && (
              <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: textMuted }}>
                {subheadline}
              </p>
            )}
          </section>
        </EditableBlock>

        {(service.sales_video_url || service.image_url) && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            {service.sales_video_url ? (
              <section className="mx-auto max-w-2xl px-4 pb-6">
                <YoutubeEmbed url={service.sales_video_url} title={service.name} />
              </section>
            ) : (
              <section className="mx-auto max-w-md px-4 pb-6">
                <AdaptiveSquareImage src={service.image_url!} alt={service.name} className="w-full rounded-xl" />
              </section>
            )}
          </EditableBlock>
        )}

        {reviewCount > 0 && (
          <section className="px-4 pb-10 text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor, color: textMuted }}
            >
              <span className="text-amber-400">★★★★★</span>
              {reviewCount === 1 ? "1 cliente avaliou este serviço" : `${reviewCount} clientes avaliaram este serviço`}
            </span>
          </section>
        )}

        <section className="mx-auto max-w-md px-4 pb-14">{ctaButton}</section>

        {/* Antes/depois — substitui a "vitrine de desejo" quando o serviço tem mídia comparativa */}
        {hasBeforeAfter && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            <section className="px-4 py-14" style={{ backgroundColor: bgDeep }}>
              <SectionHead eyebrow="Resultado real" title="Veja a transformação" accent={accent} />
              <div className="mx-auto max-w-md">
                <BeforeAfterSlider beforeImage={service.before_image!} afterImage={service.after_image!} alt={service.name} aspect="square" />
              </div>
            </section>
          </EditableBlock>
        )}

        {(gallery.length > 0 || editable) && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            <section className="px-4 py-14">
              <SectionHead eyebrow="Galeria" title="Mais detalhes do trabalho" accent={accent} />
              {gallery.length > 0 ? (
                <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((url, i) => (
                    <AdaptiveSquareImage key={`${url}-${i}`} src={url} alt={`${service.name} ${i + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs" style={{ color: textMuted }}>
                  Nenhuma foto extra adicionada ainda.
                </p>
              )}
            </section>
          </EditableBlock>
        )}

        {service.description && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            <section className="px-4 py-14" style={{ backgroundColor: gallery.length > 0 ? bgDeep : bg }}>
              <div className="mx-auto max-w-2xl">
                <SectionHead eyebrow="Como funciona" title="O que está incluído no processo" accent={accent} />
                <p className="whitespace-pre-line text-center text-sm leading-7" style={{ color: textMuted }}>
                  {service.description}
                </p>
              </div>
            </section>
          </EditableBlock>
        )}

        {(bonuses.length > 0 || editable) && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            <section className="px-4 py-14" style={{ backgroundColor: bgDeep }}>
              <div className="mx-auto max-w-2xl">
                <SectionHead eyebrow="Valor extra" title="O que está incluso" accent={accent} />
                {bonuses.length > 0 ? (
                  <div className="space-y-3">
                    {bonuses.map((b, i) => (
                      <div key={`${b.title}-${i}`} className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor, backgroundColor: bg }}>
                        <span
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: WHATSAPP_GREEN }}
                        >
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold">{b.title}</p>
                          {b.description && (
                            <p className="mt-1 text-sm" style={{ color: textMuted }}>
                              {b.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs" style={{ color: textMuted }}>
                    Nenhum bônus adicionado ainda.
                  </p>
                )}
              </div>
            </section>
          </EditableBlock>
        )}

        {reviews.length > 0 && (
          <section className="px-4 py-14">
            <div className="mx-auto max-w-2xl">
              <SectionHead eyebrow="Prova social" title="Quem contratou, aprovou" accent={accent} />
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border p-4" style={{ borderColor, backgroundColor: bgDeep }}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{r.customer_name}</p>
                      <span className="text-amber-400">{"★".repeat(Math.max(1, Math.min(5, r.rating ?? 5)))}</span>
                    </div>
                    {r.text && (
                      <p className="mt-2 text-sm leading-6" style={{ color: textMuted }}>
                        {r.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {(guaranteeText || editable) && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            <section className="px-4 py-14" style={{ backgroundColor: bgDeep }}>
              <div className="mx-auto max-w-lg text-center">
                <span
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                >
                  🛡️
                </span>
                <h2 className="text-xl font-bold">Sua garantia</h2>
                <p className="mt-3 text-sm leading-7" style={{ color: textMuted }}>
                  {guaranteeText || "Nenhum texto de garantia adicionado ainda."}
                </p>
              </div>
            </section>
          </EditableBlock>
        )}

        {(faq.length > 0 || editable) && (
          <EditableBlock editable={editable} onTap={onEditTap}>
            <section className="px-4 py-14">
              <div className="mx-auto max-w-2xl">
                <SectionHead eyebrow="Dúvidas" title="Perguntas frequentes" accent={accent} />
                {faq.length > 0 ? (
                  <div className="space-y-2">
                    {faq.map((f, i) => (
                      <details key={`${f.question}-${i}`} className="rounded-xl border p-4" style={{ borderColor, backgroundColor: bgDeep }}>
                        <summary className="cursor-pointer text-sm font-semibold">{f.question}</summary>
                        <p className="mt-2 text-sm leading-6" style={{ color: textMuted }}>
                          {f.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs" style={{ color: textMuted }}>
                    Nenhuma pergunta adicionada ainda.
                  </p>
                )}
              </div>
            </section>
          </EditableBlock>
        )}

        {/* Oferta final: preço + CTA grande, com urgência opcional */}
        <EditableBlock editable={editable} onTap={onEditTap}>
          <section className="px-4 py-14 text-center" style={{ backgroundColor: bgDeep }}>
            <div className="mx-auto max-w-md">
              {urgencyText && (
                <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor, color: accent }}>
                  ⏳ {urgencyText}
                </p>
              )}
              <div className="mb-6">
                <ServicePrice priceType={service.price_type} basePrice={service.base_price} prices={service.service_prices ?? []} />
              </div>
              {ctaButton}
            </div>
          </section>
        </EditableBlock>
      </main>
    </VehicleProvider>
  );
}
