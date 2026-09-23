-- Toggle individual dos 3 badges automáticos do hero (cidade, preço a
-- partir de, WhatsApp). Ligados por padrão para não mudar catálogos já
-- publicados.

alter table businesses
  add column hero_show_city_badge boolean not null default true,
  add column hero_show_price_badge boolean not null default true,
  add column hero_show_whatsapp_badge boolean not null default true;
