-- ---------------------------------------------------------------------
-- Builder de catálogo baseado em blocos, compatível com sections_config
-- ---------------------------------------------------------------------

alter table businesses
  add column catalog_layout jsonb not null default '{}',
  add column catalog_layout_version integer not null default 1,
  add column catalog_updated_at timestamptz;

comment on column businesses.catalog_layout is
  'Documento versionado do builder. Quando vazio, a aplicação converte sections_config em blocos.';

