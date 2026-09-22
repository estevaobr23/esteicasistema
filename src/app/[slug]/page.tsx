import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedBusinessBySlug } from "@/lib/domain/catalog-data";
import { proximosHorarios } from "@/lib/domain/availability";
import { VehicleProvider, VehicleSelector } from "@/components/catalog/VehicleSelector";
import ServicePrice from "@/components/catalog/ServicePrice";
import WhatsappButton from "@/components/catalog/WhatsappButton";
import BeforeAfterSlider from "@/components/catalog/BeforeAfterSlider";
import PageViewTracker from "@/components/catalog/PageViewTracker";
import { formatBRL } from "@/components/catalog/ServicePrice";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedBusinessBySlug(slug);
  if (!data) return {};

  return {
    title: `${data.business.name} — Catálogo de Serviços`,
    description: data.business.about ?? `Conheça os serviços de estética automotiva de ${data.business.name}.`,
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublishedBusinessBySlug(slug);
  if (!data) notFound();

  const { business, services, packages, portfolioItems, availabilitySlots, reviews } = data;

  const isDark = business.theme !== "clean_detail";
  const bg = isDark ? "#0a0a0a" : "#fafaf9";
  const bgDeep = isDark ? "#141414" : "#f0f0ef";
  const textColor = isDark ? "#ffffff" : "#171717";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(23,23,23,0.6)";

  const destaques = services.filter((s) => s.featured).slice(0, 3);
  const categorias = Array.from(new Set(portfolioItems.map((p) => p.category).filter(Boolean)));
  const proximos = proximosHorarios(availabilitySlots);

  const whatsapp = business.whatsapp ?? "";

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
        <PageViewTracker businessId={business.id} />

        {/* HERO */}
        <section
          className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-4 py-20 text-center"
          style={{
            backgroundImage: business.cover_url ? `url(${business.cover_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {business.cover_url && (
            <div className="absolute inset-0 bg-black/60" aria-hidden />
          )}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
              />
            )}
            <h1
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: business.cover_url ? "#fff" : textColor }}
            >
              {business.name}
            </h1>
            {business.about && (
              <p
                className="max-w-md text-sm"
                style={{ color: business.cover_url ? "rgba(255,255,255,0.8)" : textMuted }}
              >
                {business.about}
              </p>
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

        {/* SERVIÇOS */}
        {services.length > 0 && (
          <section id="servicos" className="px-4 py-16" style={{ backgroundColor: bgDeep }}>
            <h2 className="mb-2 text-center text-2xl font-bold">Serviços</h2>
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
                  className="flex flex-col overflow-hidden rounded-xl border"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", backgroundColor: bg }}
                >
                  {s.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image_url} alt={s.name} className="h-40 w-full object-cover" />
                  )}
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
                      <ServicePrice
                        priceType={s.price_type}
                        basePrice={s.base_price}
                        prices={s.service_prices ?? []}
                      />
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
        )}

        {/* MAIS PROCURADOS */}
        {destaques.length > 0 && (
          <section className="px-4 py-16">
            <h2 className="mb-8 text-center text-2xl font-bold">Mais procurados</h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {destaques.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border p-4 text-center"
                  style={{ borderColor: business.primary_color }}
                >
                  <p className="font-semibold">{s.name}</p>
                  <p className="mt-1 text-xs" style={{ color: textMuted }}>
                    {s.short_description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ANTES E DEPOIS */}
        {portfolioItems.length > 0 && (
          <section className="px-4 py-16" style={{ backgroundColor: bgDeep }}>
            <h2 className="mb-2 text-center text-2xl font-bold">Resultados</h2>
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
                  <BeforeAfterSlider
                    beforeImage={p.before_image}
                    afterImage={p.after_image}
                    alt={p.title ?? "Resultado"}
                  />
                  {(p.title || p.vehicle) && (
                    <p className="mt-2 text-sm font-medium">
                      {p.title} {p.vehicle && <span style={{ color: textMuted }}>· {p.vehicle}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PACOTES */}
        {packages.length > 0 && (
          <section className="px-4 py-16">
            <h2 className="mb-8 text-center text-2xl font-bold">Pacotes</h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {packages.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-xl border"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
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
        )}

        {/* HORÁRIOS */}
        {proximos.length > 0 && (
          <section className="px-4 py-16" style={{ backgroundColor: bgDeep }}>
            <h2 className="mb-8 text-center text-2xl font-bold">Próximos horários</h2>
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
        )}

        {/* AVALIAÇÕES */}
        {reviews.length > 0 && (
          <section className="px-4 py-16">
            <h2 className="mb-8 text-center text-2xl font-bold">Avaliações</h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
                >
                  <p className="text-sm font-semibold">{r.customer_name}</p>
                  <p className="text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  {r.text && (
                    <p className="mt-2 text-sm" style={{ color: textMuted }}>
                      {r.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SOBRE */}
        {business.about && (
          <section className="px-4 py-16" style={{ backgroundColor: bgDeep }}>
            <h2 className="mb-4 text-center text-2xl font-bold">Sobre</h2>
            <p className="mx-auto max-w-2xl text-center text-sm" style={{ color: textMuted }}>
              {business.about}
            </p>
          </section>
        )}

        {/* LOCALIZAÇÃO */}
        {(business.address || business.city) && (
          <section className="px-4 py-16">
            <h2 className="mb-4 text-center text-2xl font-bold">Localização</h2>
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
        )}

        {/* CTA FINAL */}
        {whatsapp && (
          <section
            className="px-4 py-20 text-center"
            style={{ backgroundColor: business.secondary_color, color: "#fff" }}
          >
            <h2 className="mb-6 text-2xl font-bold">Quer cuidar do seu carro?</h2>
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
