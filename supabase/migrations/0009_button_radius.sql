-- Estilo global de arredondamento dos botões do catálogo (CTA), editável
-- pelo lead. Guarda um valor em pixels aplicado via CSS custom property.

alter table businesses
  add column button_radius integer not null default 8;

comment on column businesses.button_radius is 'Raio de borda (px) aplicado nos botões/CTAs do catálogo público. 0 = quadrado, valores altos = pill.';
