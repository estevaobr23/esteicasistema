-- Personalização global do catálogo. Defaults seguros preservam a aparência
-- dos negócios existentes até que o lead escolha novas opções no editor.

alter table businesses
  add column font_pair_id text not null default 'modern_clean'
    check (font_pair_id in ('modern_clean','editorial','performance','friendly','precision','elegant','confident')),
  add column animation_preset text not null default 'soft'
    check (animation_preset in ('none','soft','dynamic')),
  add column bg_color_override text;

comment on column businesses.font_pair_id is 'Par curado de fontes aplicado aos títulos e ao corpo do catálogo.';
comment on column businesses.animation_preset is 'Preset global de entrada das seções: none, soft ou dynamic.';
comment on column businesses.bg_color_override is 'Cor de fundo global gerada pelo wizard. Nulo usa o fundo padrão do template.';
