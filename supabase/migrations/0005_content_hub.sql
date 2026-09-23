-- Conteúdo enriquecido e relacionamentos entre módulos do catálogo

alter table packages
  add column media_mode text not null default 'single_photo'
    check (media_mode in ('single_photo','gallery','youtube')),
  add column gallery jsonb not null default '[]',
  add column video_url text,
  add column video_poster_url text,
  add column duration_minutes integer;

create table package_benefits (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references packages(id) on delete cascade,
  label text not null,
  icon_key text not null default 'sparkles',
  color_key text not null default 'cyan',
  sort_order integer not null default 0
);

create index package_benefits_package_id_idx on package_benefits (package_id);
alter table package_benefits enable row level security;

create policy "package_benefits: owner full access" on package_benefits
  for all using (
    package_id in (
      select p.id from packages p join businesses b on b.id = p.business_id
      where b.owner_id = auth.uid()
    )
  ) with check (
    package_id in (
      select p.id from packages p join businesses b on b.id = p.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "package_benefits: public read" on package_benefits
  for select using (
    package_id in (
      select p.id from packages p join businesses b on b.id = p.business_id
      where b.published = true and p.active = true
    )
  );

alter table portfolio_items
  alter column before_image drop not null,
  alter column after_image drop not null,
  add column media_type text not null default 'before_after'
    check (media_type in ('before_after','single_photo','gallery','youtube','instagram')),
  add column image_url text,
  add column gallery jsonb not null default '[]',
  add column video_url text,
  add column instagram_url text,
  add column vehicle_make text,
  add column vehicle_model text,
  add column vehicle_year integer,
  add column featured boolean not null default false;

alter table reviews
  add column service_id uuid references services(id) on delete set null,
  add column package_id uuid references packages(id) on delete set null,
  add column portfolio_item_id uuid references portfolio_items(id) on delete set null,
  add column source text not null default 'manual'
    check (source in ('manual','google','instagram','whatsapp')),
  add column customer_photo_url text,
  add column review_date date;

create index reviews_service_id_idx on reviews (service_id);
create index reviews_package_id_idx on reviews (package_id);
create index reviews_portfolio_item_id_idx on reviews (portfolio_item_id);

