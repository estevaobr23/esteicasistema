"use client";

/**
 * Anexa a query string da URL de entrada (utm_source, utm_medium, utm_campaign,
 * utm_term, utm_content, fbclid, gclid, sck, src, etc) a um link de checkout.
 *
 * A Cakto só registra UTM se ela vier anexada na URL do link de checkout no
 * clique — não puxa sozinha de referrer nem cookie. Sem isso, toda venda vinda
 * de anúncio pago chega à Cakto sem origem, e a UTMify não consegue atribuir
 * a venda a nenhuma campanha (bug real: pedido do Vitrine Detail sem UTM
 * nenhuma, comparado a outro produto que propaga e chega com utm_source="FB").
 */
export function withUtm(baseUrl: string): string {
  if (typeof window === "undefined") return baseUrl;

  const incoming = window.location.search;
  if (!incoming || incoming === "?") return baseUrl;

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${incoming.slice(1)}`;
}
