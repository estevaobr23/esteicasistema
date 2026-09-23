-- =========================================================================
-- Catálogo-Site para Estética Automotiva — schema inicial
-- =========================================================================

-- ---------------------------------------------------------------------
-- MOTOR DE ACESSO — compra (Cakto) -> conta -> tenant
-- deny-all RLS: só service_role toca essa tabela
-- ---------------------------------------------------------------------
create table purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plano text not null check (plano in ('essencial','profissional')),
  transaction_id text not null unique,
  valor numeric,
  status text not null,
  usado_em timestamptz,
  created_at timestamptz not null default now()
);
alter table purchases enable row level security;
-- sem nenhuma policy = deny-all (só service_role, que ignora RLS)

create index purchases_email_idx on purchases (email);

-- ---------------------------------------------------------------------
-- profiles — 1 linha por usuário autenticado
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

create policy "profiles: owner can select" on profiles
  for select using (auth.uid() = id);
create policy "profiles: owner can update" on profiles
  for update using (auth.uid() = id);
create policy "profiles: owner can insert" on profiles
  for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- businesses — o tenant
-- ---------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plano text not null check (plano in ('essencial','profissional')),

  logo_url text,
  cover_url text,

  whatsapp text,
  instagram text,
  email text,
  phone text,

  city text,
  address text,
  map_url text,

  about text,

  primary_color text not null default '#0EA5E9',
  secondary_color text not null default '#111827',
  theme text not null default 'premium_dark'
    check (theme in ('premium_dark','clean_detail','performance')),

  business_hours jsonb,

  published boolean not null default false,
  onboarding_completo boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_owner_id_idx on businesses (owner_id);
create index businesses_slug_idx on businesses (slug);

alter table businesses enable row level security;

create policy "businesses: owner full access" on businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "businesses: public can read published" on businesses
  for select using (published = true);

-- ---------------------------------------------------------------------
-- service_templates — catálogo global de serviços pré-cadastrados (seed)
-- read-only para todos os usuários autenticados
-- ---------------------------------------------------------------------
create table service_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  short_description text,
  description text,
  default_features text[] not null default '{}',
  sort_order int not null default 0
);

alter table service_templates enable row level security;
create policy "service_templates: anyone can read" on service_templates
  for select using (true);

-- ---------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------
create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,

  name text not null,
  slug text,
  category text,
  short_description text,
  description text,

  image_url text,
  gallery jsonb not null default '[]',
  video_url text,

  duration_minutes int,

  price_type text not null default 'fixed'
    check (price_type in ('fixed','from','vehicle','quote')),
  base_price numeric,

  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  cta_label text,

  created_at timestamptz not null default now()
);

create index services_business_id_idx on services (business_id);

alter table services enable row level security;

create policy "services: owner full access" on services
  for all using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "services: public can read from published business" on services
  for select using (
    active = true
    and exists (select 1 from businesses b where b.id = business_id and b.published = true)
  );

-- ---------------------------------------------------------------------
-- service_features — "o que está incluído"
-- ---------------------------------------------------------------------
create table service_features (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create index service_features_service_id_idx on service_features (service_id);

alter table service_features enable row level security;

create policy "service_features: owner full access" on service_features
  for all using (
    service_id in (
      select s.id from services s
      join businesses b on b.id = s.business_id
      where b.owner_id = auth.uid()
    )
  )
  with check (
    service_id in (
      select s.id from services s
      join businesses b on b.id = s.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "service_features: public can read from published business" on service_features
  for select using (
    service_id in (
      select s.id from services s
      join businesses b on b.id = s.business_id
      where b.published = true and s.active = true
    )
  );

-- ---------------------------------------------------------------------
-- service_prices — preço por tipo de veículo
-- ---------------------------------------------------------------------
create table service_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  vehicle_type text not null check (vehicle_type in ('hatch','sedan','suv','pickup','custom')),
  price numeric not null,
  promotional_price numeric,
  active boolean not null default true,
  unique (service_id, vehicle_type)
);

create index service_prices_service_id_idx on service_prices (service_id);

alter table service_prices enable row level security;

create policy "service_prices: owner full access" on service_prices
  for all using (
    service_id in (
      select s.id from services s
      join businesses b on b.id = s.business_id
      where b.owner_id = auth.uid()
    )
  )
  with check (
    service_id in (
      select s.id from services s
      join businesses b on b.id = s.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "service_prices: public can read from published business" on service_prices
  for select using (
    active = true
    and service_id in (
      select s.id from services s
      join businesses b on b.id = s.business_id
      where b.published = true and s.active = true
    )
  );

-- ---------------------------------------------------------------------
-- packages (bloqueado no plano Essencial via enforcement na aplicação)
-- ---------------------------------------------------------------------
create table packages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,

  name text not null,
  description text,
  image_url text,

  price numeric not null,
  promotional_price numeric,

  featured boolean not null default false,
  active boolean not null default true,
  cta_label text,
  sort_order int not null default 0
);

create index packages_business_id_idx on packages (business_id);

alter table packages enable row level security;

create policy "packages: owner full access" on packages
  for all using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "packages: public can read from published business" on packages
  for select using (
    active = true
    and exists (select 1 from businesses b where b.id = business_id and b.published = true)
  );

-- ---------------------------------------------------------------------
-- package_services — join
-- ---------------------------------------------------------------------
create table package_services (
  package_id uuid not null references packages(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (package_id, service_id)
);

alter table package_services enable row level security;

create policy "package_services: owner full access" on package_services
  for all using (
    package_id in (
      select p.id from packages p
      join businesses b on b.id = p.business_id
      where b.owner_id = auth.uid()
    )
  )
  with check (
    package_id in (
      select p.id from packages p
      join businesses b on b.id = p.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "package_services: public can read from published business" on package_services
  for select using (
    package_id in (
      select p.id from packages p
      join businesses b on b.id = p.business_id
      where b.published = true and p.active = true
    )
  );

-- ---------------------------------------------------------------------
-- portfolio_items — antes/depois (bloqueado no plano Essencial)
-- ---------------------------------------------------------------------
create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  service_id uuid references services(id) on delete set null,

  title text,
  before_image text not null,
  after_image text not null,
  vehicle text,
  description text,
  category text,

  active boolean not null default true,
  sort_order int not null default 0
);

create index portfolio_items_business_id_idx on portfolio_items (business_id);

alter table portfolio_items enable row level security;

create policy "portfolio_items: owner full access" on portfolio_items
  for all using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "portfolio_items: public can read from published business" on portfolio_items
  for select using (
    active = true
    and exists (select 1 from businesses b where b.id = business_id and b.published = true)
  );

-- ---------------------------------------------------------------------
-- availability_slots — disponibilidade recorrente semanal (não é agenda real)
-- ---------------------------------------------------------------------
create table availability_slots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0 = domingo
  time time not null,
  active boolean not null default true
);

create index availability_slots_business_id_idx on availability_slots (business_id);

alter table availability_slots enable row level security;

create policy "availability_slots: owner full access" on availability_slots
  for all using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "availability_slots: public can read from published business" on availability_slots
  for select using (
    active = true
    and exists (select 1 from businesses b where b.id = business_id and b.published = true)
  );

-- ---------------------------------------------------------------------
-- reviews — avaliações cadastradas manualmente
-- ---------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  text text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_business_id_idx on reviews (business_id);

alter table reviews enable row level security;

create policy "reviews: owner full access" on reviews
  for all using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "reviews: public can read from published business" on reviews
  for select using (
    active = true
    and exists (select 1 from businesses b where b.id = business_id and b.published = true)
  );

-- ---------------------------------------------------------------------
-- analytics_events — eventos simples, sem dado sensível de visitante
-- INSERT público é feito via API route com service_role (não client direto)
-- ---------------------------------------------------------------------
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  event_type text not null check (event_type in (
    'page_view','service_view','package_view',
    'whatsapp_click','schedule_click','portfolio_view'
  )),
  created_at timestamptz not null default now()
);

create index analytics_events_business_created_idx on analytics_events (business_id, created_at);

alter table analytics_events enable row level security;

create policy "analytics_events: owner can read" on analytics_events
  for select using (business_id in (select id from businesses where owner_id = auth.uid()));
-- sem policy de insert: só service_role grava (via /api/events)

-- ---------------------------------------------------------------------
-- updated_at automático em businesses
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_set_updated_at
  before update on businesses
  for each row execute function set_updated_at();

-- =========================================================================
-- SEED — 12 serviços pré-cadastrados do brief
-- =========================================================================
insert into service_templates (name, category, short_description, default_features, sort_order) values
  ('Lavagem Técnica', 'lavagem', 'Lavagem externa completa com técnica de baixo risco de dano à pintura.',
    array['Pré-lavagem', 'Lavagem externa', 'Rodas', 'Caixa de roda', 'Aspiração', 'Acabamento'], 1),
  ('Lavagem Detalhada', 'lavagem', 'Lavagem externa e interna com atenção a detalhes.',
    array['Lavagem externa', 'Aspiração completa', 'Painel e console', 'Vidros internos e externos', 'Pneus e acabamento'], 2),
  ('Higienização Interna', 'higienizacao', 'Limpeza profunda de bancos, carpetes e forros.',
    array['Aspiração profunda', 'Limpeza de bancos', 'Limpeza de carpetes', 'Limpeza de forro', 'Eliminação de odores'], 3),
  ('Polimento Comercial', 'polimento', 'Polimento de manutenção para realçar o brilho da pintura.',
    array['Descontaminação leve', 'Polimento de uma etapa', 'Remoção de marcas leves de lavagem'], 4),
  ('Polimento Técnico', 'polimento', 'Polimento corretivo multietapas para remoção de riscos e defeitos.',
    array['Descontaminação', 'Polimento multietapas', 'Remoção de riscos e hologramas', 'Acabamento de alto brilho'], 5),
  ('Vitrificação', 'protecao', 'Proteção de pintura de longa duração com selante vítreo.',
    array['Descontaminação', 'Polimento prévio', 'Aplicação de vitrificação', 'Camada de proteção de longa duração'], 6),
  ('Cristalização de Vidros', 'protecao', 'Tratamento repelente de água para melhor visibilidade em chuva.',
    array['Limpeza de vidros', 'Aplicação de cristalizador', 'Repelência à água'], 7),
  ('Hidratação de Couro', 'interior', 'Limpeza e hidratação de bancos e acabamentos em couro.',
    array['Limpeza de couro', 'Hidratação', 'Proteção contra ressecamento'], 8),
  ('Revitalização de Plásticos', 'interior', 'Renovação de plásticos internos e externos desbotados.',
    array['Limpeza profunda', 'Aplicação de revitalizador', 'Proteção UV'], 9),
  ('Limpeza de Motor', 'motor', 'Limpeza e desengraxe do compartimento do motor.',
    array['Desengraxe', 'Lavagem controlada', 'Proteção de componentes elétricos'], 10),
  ('Descontaminação de Pintura', 'protecao', 'Remoção de contaminantes aderidos à pintura antes de proteção.',
    array['Descontaminação química', 'Descontaminação física (clay bar)', 'Pintura pronta para proteção'], 11),
  ('Proteção de Pintura', 'protecao', 'Camada de proteção para preservar o brilho e facilitar manutenção.',
    array['Aplicação de selante ou cera', 'Proteção contra intempéries', 'Facilidade de manutenção'], 12);
;
