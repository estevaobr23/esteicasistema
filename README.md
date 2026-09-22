# Catálogo-Site para Estética Automotiva

Plataforma multi-tenant onde donos de estética automotiva criam, sem código,
um catálogo-site público (`/[slug]`) para substituir o fluxo manual de
responder preço e serviço pelo WhatsApp.

Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres,
Auth, Storage, RLS).

## Setup local

### 1. Variáveis de ambiente

Copie `.env.local` (já existe neste repo, fora do git) e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://mretirumxiqnrahumipt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<já preenchida>

# Painel Supabase > Project Settings > API Keys > service_role (secret)
# NUNCA prefixar com NEXT_PUBLIC_ — essa chave ignora RLS totalmente.
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=Vitrine Detail

# Preenchido quando o produto for criado na Cakto (etapa final)
CAKTO_WEBHOOK_SECRET=
```

A `SUPABASE_SERVICE_ROLE_KEY` é obrigatória para o onboarding funcionar: é ela
que permite ao servidor conferir a compra aprovada (tabela `purchases`, que
tem RLS deny-all) antes de liberar a criação do negócio.

### 2. Instalar e rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

### 3. Banco de dados

O schema já está aplicado no projeto Supabase (`mretirumxiqnrahumipt`). A
migration fonte está em `supabase/migrations/0001_init.sql` — caso precise
recriar o banco em outro projeto, aplique esse arquivo via SQL editor ou
`supabase db push`.

## Como testar o fluxo de acesso sem uma compra real na Cakto

Antes do produto existir na Cakto, simule uma compra aprovada direto no
banco:

```sql
insert into purchases (email, plano, transaction_id, status, valor)
values ('seu-email-de-teste@gmail.com', 'profissional', 'test-txn-001', 'aprovado', 97.00);
```

Depois crie a conta em `/cadastro` com esse mesmo e-mail — o onboarding vai
reconhecer a compra e liberar o negócio automaticamente.

> Se o Supabase Auth exigir confirmação de e-mail e você não tiver SMTP
> configurado em dev, confirme manualmente via SQL:
> `update auth.users set email_confirmed_at = now() where email = '...';`

## Estrutura de rotas

```
/                        landing (venda da plataforma)
/login, /cadastro        auth — cadastro só funciona pós-compra
/app/onboarding          portão que valida a compra + wizard de 5 passos
/app/dashboard           painel do dono da estética (route group "(dashboard)")
/app/servicos, /pacotes,
/portfolio, /horarios,
/avaliacoes, /personalizar,
/configuracoes, /analytics
/[slug]                  catálogo público (sem autenticação)
/api/events               tracking de analytics (fire-and-forget)
```

`/app/onboarding` fica **fora** do route group `(dashboard)` de propósito:
o layout do dashboard chama `getCurrentBusiness()`, que redireciona para o
onboarding quando o usuário ainda não tem negócio — se o onboarding
estivesse sob esse mesmo layout, isso causaria um loop infinito de redirect.

## Planos

- **Essencial** (R$47 vitalício): até 3 serviços ativos, sem antes/depois, sem
  pacotes, sem analytics, com marca "criado com [produto]" no rodapé do
  catálogo público.
- **Profissional** (R$97 vitalício): tudo ilimitado, sem marca d'água.

Limites definidos em `src/lib/domain/plans.ts` e reforçados nas Server
Actions (nunca só na UI).

## Próximos passos (fora do MVP atual)

- Criar o produto na Cakto (skill `criar-produto-cakto`) e preencher os IDs
  de oferta reais em `supabase/functions/cakto-webhook/index.ts` (a publicar)
  e `CAKTO_WEBHOOK_SECRET`.
- Landing final com tangibilização (prints reais do produto).
