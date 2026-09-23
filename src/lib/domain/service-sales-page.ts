type ServiceSalesFields = {
  slug: string | null;
  sales_page_enabled: boolean;
};

/**
 * Feature temporariamente desativada por pedido do usuário (2026-09-23):
 * todo CTA volta a ir 100% direto para o WhatsApp, mesmo em serviços com
 * sales_page_enabled=true. Nada foi apagado — dados, rota pública
 * (/[slug]/servico/[serviceSlug]) e o toggle por serviço continuam
 * intactos no banco. Para reativar, troque o `return false` abaixo por
 * `return service.sales_page_enabled`.
 */
export function hasSalesPage(service: ServiceSalesFields): boolean {
  void service;
  return false;
}

export function salesPageUrl(businessSlug: string, service: { slug: string | null; id: string }): string {
  return `/${businessSlug}/servico/${service.slug || service.id}`;
}
