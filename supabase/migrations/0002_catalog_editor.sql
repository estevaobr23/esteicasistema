-- ---------------------------------------------------------------------
-- Editor visual ao vivo do catálogo: novas colunas em businesses/services
-- ---------------------------------------------------------------------

alter table businesses
  add column sections_config jsonb not null default '[]',
  add column branding_video_url text,
  add column headline text,
  add column highlights jsonb not null default '[]';

alter table services
  add column media_mode text not null default 'single_photo'
    check (media_mode in ('single_photo','before_after','gallery','youtube')),
  add column before_image text,
  add column after_image text;
