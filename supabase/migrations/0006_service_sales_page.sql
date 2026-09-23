-- Mini página de vendas por serviço: template fixo, opcional por serviço.
-- Quando nenhum campo abaixo tem conteúdo, a aplicação trata como "sem
-- página de vendas" e o CTA do card mantém o comportamento atual (WhatsApp
-- direto). Assim que qualquer campo é preenchido, o CTA passa a levar para
-- /[slug]/servico/[serviceSlug].

alter table services
  add column sales_headline text,
  add column sales_subheadline text,
  add column sales_video_url text,
  add column sales_gallery jsonb not null default '[]',
  add column sales_bonuses jsonb not null default '[]',
  add column sales_cta_message text;

comment on column services.sales_gallery is 'Array de URLs de imagem (string[]) exibidas na galeria da mini página.';
comment on column services.sales_bonuses is 'Array de { title: string, description: string } exibidos como bônus na mini página.';
