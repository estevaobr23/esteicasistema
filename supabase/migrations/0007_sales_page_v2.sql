-- Mini página de vendas v2: toggle explícito + seções de persuasão completas
-- (antes/depois, garantia/confiança, FAQ, urgência), inspirada na estrutura
-- do padrão de página de vendas, adaptada para serviço com CTA de WhatsApp
-- (sem checkout, sem decoy/downsell).

alter table services
  add column sales_page_enabled boolean not null default true,
  add column sales_guarantee_text text,
  add column sales_faq jsonb not null default '[]',
  add column sales_urgency_text text;

comment on column services.sales_page_enabled is 'Toggle explícito do lead. Quando true, o CTA do card leva para a mini página (mesmo com campos vazios, ela usa fallback dos dados do serviço). Quando false, o CTA volta a ir direto para o WhatsApp.';
comment on column services.sales_faq is 'Array de { question: string, answer: string } exibidos como FAQ na mini página.';
