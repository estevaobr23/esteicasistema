# Contexto do projeto — Vitrine Detail (Catálogo-Site para Estética Automotiva)

> Este arquivo existe para retomar o trabalho após um `/clear` do chat. Leia
> inteiro antes de continuar qualquer tarefa. Última atualização: 2026-09-22.

---

## 1. O que é o produto

Plataforma multi-tenant onde donos de **estética automotiva** (detailers)
criam, sem código, um **catálogo-site público** (`dominio.com/slug`) para
substituir o fluxo manual de responder preço/serviço repetidamente no
WhatsApp.

Frase-guia do produto (do brief original do usuário):

> "Coloque a vitrine digital da sua estética automotiva no ar em poucos
> minutos e envie apenas um link para seus clientes."

**Nome do produto:** Vitrine Detail (`NEXT_PUBLIC_PRODUCT_NAME` no `.env.local`).

**Regra de escopo que rege todas as decisões:** simplicidade > funcionalidades;
específico para estética automotiva > genérico; entregar algo bonito
automaticamente > liberdade total; melhorar o catálogo > virar ERP. Nunca
adicionar: financeiro, estoque, folha de pagamento, CRM completo, emissão
fiscal, pagamentos internos, fidelidade, agenda real, IA, marketplace.

---

## 2. Stack técnica

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS**
- **Supabase**: Postgres, Auth (email/senha), Storage, RLS
- Projeto criado do zero com `create-next-app`, depois achatado para a raiz
  do repositório (`C:\Users\Usuário\Desktop\CATALAGO SITE`)
- Git inicializado localmente, **sem remote configurado** (não há GitHub/PR)

### Projeto Supabase

- **Project ID:** `mretirumxiqnrahumipt`
- **URL:** `https://mretirumxiqnrahumipt.supabase.co`
- Região: `sa-east-1`
- Criado na organização "AREA DE MEMBROS TECNICOS" (mesma org de outros
  produtos do usuário: `gatos-membros`, `balletpro`, `acervo-3d-membros`).
  **`balletpro` foi pausado** para liberar cota do plano free (limite de 2
  projetos ativos) — reative manualmente no painel Supabase se for
  necessário voltar a usá-lo.

### `.env.local` (existe localmente, nunca commitado — está no `.gitignore`)

```
NEXT_PUBLIC_SUPABASE_URL=https://mretirumxiqnrahumipt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preenchida>
SUPABASE_SERVICE_ROLE_KEY=<preenchida — usuário forneceu no chat em 2026-09-22>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=Vitrine Detail
CAKTO_WEBHOOK_SECRET=  ← ainda vazio, produto não existe na Cakto
```

⚠️ Se este arquivo não existir mais (nova máquina, clone limpo), ele precisa
ser recriado com essas mesmas chaves antes de qualquer coisa funcionar. A
`SUPABASE_SERVICE_ROLE_KEY` é secreta — nunca prefixar com `NEXT_PUBLIC_`,
nunca commitar, nunca expor no client.

---

## 3. Modelo de acesso (compra → conta → tenant)

Este é o motor central, copiado do padrão validado na skill
`saas-padrao-pgv` (referência: `references/arquitetura-acesso.md` dessa
skill). Fluxo:

```
1. Landing (/) → visitante escolhe plano → checkout Cakto (AINDA NÃO EXISTE)
2. Webhook grava linha em `purchases` (email, plano, transaction_id, status)
3. Cliente cria conta em /cadastro com o MESMO e-mail da compra
4. /app/onboarding chama createBusiness() — o "portão":
   - busca em `purchases` uma linha com esse e-mail e status='aprovado'
   - SEM compra → bloqueia com mensagem clara
   - COM compra → cria o `business`, copia o plano, marca `usado_em`
5. Onboarding de 5 passos → publica → /app/dashboard
```

**Importante:** como o produto da Cakto ainda não existe, não há fluxo real
de compra. Para testar localmente, uma compra é **inserida manualmente** na
tabela `purchases` via SQL/REST API (ver seção 7 "Como testar localmente").

### As 3 camadas de proteção (defesa em profundidade)

1. **Middleware** (`src/proxy.ts` — renomeado de `middleware.ts` por causa de
   uma migração do Next 16 que troca a convenção): redireciona `/app/*` sem
   sessão para `/login`; redireciona sessão logada saindo de `/login` ou
   `/cadastro` para `/app/dashboard`.
2. **Guard de página** (`src/lib/domain/business.ts` → `getCurrentBusiness()`):
   busca o `business` do usuário logado; redireciona para `/app/onboarding`
   se não existe ou se `onboarding_completo = false`.
3. **RLS no Postgres**: toda tabela de tenant tem policy
   `business_id in (select id from businesses where owner_id = auth.uid())`
   para o dono, mais uma policy de SELECT público restrita a
   `businesses.published = true`. A tabela `purchases` tem RLS **deny-all**
   (nenhuma policy) — só `service_role` a enxerga.

---

## 4. Estrutura de rotas

```
src/app/
  page.tsx                        → /                    LANDING (página de vendas)
  (auth)/
    login/page.tsx                → /login
    cadastro/page.tsx             → /cadastro             só funciona pós-compra
    actions.ts                    → signIn / signUp / signOut
  auth/callback/route.ts          → /auth/callback
  app/
    onboarding/                   → /app/onboarding       ⚠️ FORA do route group (dashboard)
      page.tsx, actions.ts, steps-actions.ts
    (dashboard)/                  → route group — NÃO aparece na URL
      layout.tsx                  → sidebar/bottom-nav, chama getCurrentBusiness()
      dashboard/page.tsx          → /app/dashboard         Home
      servicos/                  → /app/servicos          CRUD serviços + preço por veículo
      pacotes/                   → /app/pacotes           (Profissional apenas)
      portfolio/                 → /app/portfolio         antes/depois (Profissional apenas)
      horarios/                  → /app/horarios          disponibilidade recorrente semanal
      avaliacoes/                → /app/avaliacoes        (Profissional apenas)
      personalizar/              → /app/personalizar      template + cores
      configuracoes/             → /app/configuracoes     dados do negócio, slug, publicar
      analytics/                 → /app/analytics         (Profissional apenas)
  [slug]/
    page.tsx                      → /[slug]               CATÁLOGO PÚBLICO (sem auth)
  api/
    events/route.ts               → POST                 tracking de analytics
src/proxy.ts                      → middleware (Next 16 renomeou a convenção)
```

### ⚠️ Por que `/app/onboarding` está FORA do route group `(dashboard)`

Bug real já corrigido (commit `2a8fa35`): o layout do dashboard chama
`getCurrentBusiness()`, que redireciona para `/app/onboarding` quando o
usuário não tem negócio ainda. Se `/app/onboarding` estivesse sob esse mesmo
layout, isso causava um **loop infinito de redirect** (a página resolvia como
404). A correção foi mover todas as rotas protegidas para dentro de um route
group `(dashboard)` e manter só o onboarding fora dele. **Nunca mover
onboarding para dentro de `(dashboard)` de novo.**

---

## 5. Schema do banco (migration já aplicada em produção)

Arquivo fonte: `supabase/migrations/0001_init.sql`. Tabelas:

- **`purchases`** — motor de acesso. RLS deny-all. `transaction_id UNIQUE`
  (idempotência de webhook).
- **`profiles`** — 1 linha por usuário autenticado (`id = auth.users.id`).
- **`businesses`** — o tenant. Campos: `owner_id`, `name`, `slug` (unique),
  `plano` (`essencial`|`profissional`), `logo_url`, `cover_url`, `whatsapp`,
  `instagram`, `email`, `phone`, `city`, `address`, `map_url`, `about`,
  `primary_color`, `secondary_color`, `theme`, `business_hours` (jsonb),
  `published`, `onboarding_completo`.
- **`service_templates`** — seed global read-only com os **12 serviços
  pré-cadastrados** do brief (Lavagem Técnica, Lavagem Detalhada,
  Higienização Interna, Polimento Comercial, Polimento Técnico, Vitrificação,
  Cristalização de Vidros, Hidratação de Couro, Revitalização de Plásticos,
  Limpeza de Motor, Descontaminação de Pintura, Proteção de Pintura), cada um
  com `default_features` (checklist "o que está incluído").
- **`services`** — por tenant. `price_type`: `fixed` | `from` | `vehicle` |
  `quote`. `gallery` (jsonb, reservado para galeria de fotos — **UI ainda não
  implementada**).
- **`service_features`** — checklist "o que está incluído" por serviço.
- **`service_prices`** — preço por `vehicle_type` (`hatch`|`sedan`|`suv`|
  `pickup`|`custom`), com `promotional_price` opcional.
- **`packages`** + **`package_services`** — pacotes/combos de serviços.
- **`portfolio_items`** — antes/depois (`before_image`, `after_image`,
  `vehicle`, `category`).
- **`availability_slots`** — disponibilidade **recorrente semanal**
  (`weekday` 0-6 + `time`), NÃO é agenda real com datas específicas — decisão
  deliberada para bater com "não é agenda real, é intenção via WhatsApp" do
  brief.
- **`reviews`** — avaliações manuais (nome, rating 1-5, texto).
- **`analytics_events`** — `event_type` em (`page_view`, `service_view`,
  `package_view`, `whatsapp_click`, `schedule_click`, `portfolio_view`). Sem
  nenhum dado de identificação do visitante (sem IP, sem user agent).

Bucket de Storage: **`business-media`** (público), convenção de path
`{business_id}/{pasta}/{arquivo}`, policies restringem escrita ao dono via
`storage.foldername(name)[1]`.

---

## 6. Planos: Essencial vs Profissional

Definido em `src/lib/domain/plans.ts` (`PLAN_LIMITS`), enforced em Server
Actions (nunca só na UI) — todas seguem o padrão
`assertXPermitido()` → `redirect()` com mensagem clara se bloqueado.

| Recurso | Essencial (R$47 vitalício) | Profissional (R$97 vitalício) |
|---|---|---|
| Serviços ativos | até 3 | ilimitado |
| Preço por veículo | ✓ | ✓ |
| WhatsApp inteligente | ✓ | ✓ |
| Horários | ✓ | ✓ |
| Paleta (2 cores) | ✓ | ✓ |
| Antes/depois | ✕ | ✓ |
| Galeria de fotos por serviço | ✕ (não implementado ainda) | ✕ (não implementado ainda) |
| Vídeos | ✕ (não implementado ainda) | ✕ (não implementado ainda) |
| Pacotes | ✕ | ✓ |
| Avaliações | ✕ | ✓ |
| Analytics | ✕ | ✓ |
| Marca d'água "criado com Vitrine Detail" | tem | não tem |

**Pendente de implementar (prometido na landing, ainda não existe no
produto):** galeria de fotos avulsas por serviço (fotos soltas, não
pareadas — diferente do antes/depois) e vídeos (schema já tem `video_url`
em `services`, falta UI de edição + exibição no catálogo público).

---

## 7. Como rodar e testar localmente

### Rodar o dev server

```bash
cd "C:\Users\Usuário\Desktop\CATALAGO SITE"
npm run dev
# abre em http://localhost:3000
```

⚠️ **`localhost` só funciona na própria máquina onde o servidor está
rodando** — não é um link compartilhável. Se o usuário pedir "me manda o
link", a resposta é: abra você mesmo `http://localhost:3000` nesta máquina,
ou fazemos deploy real (Vercel) para gerar um link público.

### Simular uma compra aprovada (sem Cakto real)

Inserir direto via SQL ou REST API do Supabase (usando a
`SUPABASE_SERVICE_ROLE_KEY`):

```sql
insert into purchases (email, plano, transaction_id, status, valor)
values ('email-de-teste@gmail.com', 'profissional', 'algum-id-unico', 'aprovado', 97.00);
```

Ou via REST:
```bash
curl -X POST 'https://mretirumxiqnrahumipt.supabase.co/rest/v1/purchases' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"email":"...", "plano":"profissional", "transaction_id":"...", "status":"aprovado", "valor":97.00}'
```

Depois criar a conta em `/cadastro` com **o mesmo e-mail**.

### Confirmação de e-mail obrigatória

O Supabase Auth exige confirmação de e-mail por padrão. Sem SMTP configurado,
o link de confirmação não chega. Login falha com "E-mail ou senha inválidos"
(mensagem genérica, esconde o motivo real). Resolver confirmando manualmente
via Admin API:

```bash
# 1. Achar o user_id
curl "https://mretirumxiqnrahumipt.supabase.co/auth/v1/admin/users?email=EMAIL" \
  -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"

# 2. Confirmar
curl -X PUT "https://mretirumxiqnrahumipt.supabase.co/auth/v1/admin/users/USER_ID" \
  -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" -d '{"email_confirm": true}'
```

Contas de teste já usadas nesta sessão (podem já estar confirmadas):
- `teste.detailer@gmail.com` — confirmada, tem compra `profissional` de teste
- `micaelestevao735@gmail.com` — confirmada em 2026-09-22, tem compra
  `profissional` de teste (`transaction_id: teste-manual-001`)

### Checklist antes de considerar qualquer mudança "pronta"

```bash
npx tsc --noEmit
npx eslint src --ext .ts,.tsx
npm run build
```
Todos devem passar limpos. Testado repetidamente ao longo do projeto — nunca
pular essa etapa.

---

## 8. Estado atual da Landing Page (`src/app/page.tsx`)

A landing já passou por **muitas iterações** guiadas pelo usuário. Estrutura
atual, de cima para baixo:

1. **`FloatingHeader`** (`src/components/landing/FloatingHeader.tsx`) — client
   component. Comportamento final acordado: **fixo na tela** (`position:
   fixed`), **some ao rolar para baixo**, **reaparece ao rolar para cima**.
   Sem "cápsula" (isso foi tentado e removido a pedido do usuário). Logo
   centralizada.
2. **Hero** — headline sobre parar de explicar serviço no WhatsApp, CTA
   "Quero minha vitrine no ar" → `#planos`.
3. **Seção "O que muda no seu dia a dia"** (`id="recursos"`) — 8 cards com
   **imagens reais** já adicionadas em `public/images/day-to-day/*.png`
   (ícones 72×72px, não fotos grandes — ajustado pelo usuário/outra sessão em
   paralelo). Copy reescrita em linguagem de **benefício/dor resolvida**, não
   recurso técnico, na ordem: dor central → prova social → operacional. Lista
   completa e ordem foram **aprovadas explicitamente pelo usuário** antes de
   aplicar — não reescrever sem novo pedido.
4. **8 seções de "tangibilização"** (uma por parte do produto, cada uma
   com placeholder de imagem em `/images/sections/*.png`, exceto a 7ª que é
   vídeo):
   1. Catálogo geral
   2. Preço por veículo
   3. WhatsApp personalizado
   4. Antes/depois
   5. Portfólio/galeria
   6. Provas sociais
   7. **Mini VSL** — `<video>` em **formato vertical 9:16**, **bloco com
      fundo branco puro** (pedido explícito do usuário, revertido de um
      fundo vermelho escuro que eu tinha usado antes). Placeholder:
      `/videos/sections/mini-vsl-sistema.mp4` +
      `/images/sections/mini-vsl-poster.png`.
   8. Personalização de marca (cores + template)
   
   Alternância de fundo escuro/claro entre elas, seguindo o padrão de cor da
   skill `saas-padrao-pgv` (nunca branco puro exceto onde pedido
   explicitamente, off-white dessaturado `#f2efec` como "LIGHT_BG").
5. **Seção "Planos"** (`id="planos"`) — fundo **preto** (`#0a0a0a`). Card
   Essencial em preto **texturizado** (radial-gradient sutil de pontos, não
   liso). Card Profissional é o **único branco** da seção, com borda
   vermelha e selo "⭐ Mais escolhido" — pedido explícito e específico do
   usuário, não inferir de novo esse padrão sem confirmar.
   Botões de compra ainda **desabilitados** ("em breve") — não há checkout
   Cakto real ainda, então não simulamos um que não existe.
6. **Garantia** — selo de **15 dias** (`public/assets/garantia-15-dias.png`),
   copiado da skill `padrao-lowticket`
   (`assets/padrao/garantia-15-dias.webp`, que na verdade é um AVIF mal
   nomeado). ⚠️ Se precisar reconverter esse asset no futuro: o AVIF guarda
   o canal alpha como um **segundo stream de vídeo em escala de cinza**
   separado do stream de cor — usar
   `ffmpeg -i input -filter_complex "[0:v:0][0:v:1]alphamerge" -update 1 -frames:v 1 output.png`,
   nunca só extrair o primeiro stream (dá fundo preto sólido, bug já caçado
   e corrigido nesta sessão).
7. **FAQ** (accordion nativo `<details>`).
8. **CTA final** → `#planos`.
9. **Footer**.

### Seção removida a pedido do usuário

Uma seção de "agulhada" (comparação "Do jeito antigo" PDF vs "Com o Vitrine
Detail", 2 colunas) foi criada e depois **removida** — o usuário decidiu
manter o fluxo direto de Mini VSL/Personalização → Planos, sem bloco de
comparação no meio. **Não recriar essa seção sem novo pedido explícito.**

### Regras de design que se consolidaram ao longo da conversa

- Cor de ação primária do produto: `#e11d2a` (vermelho), `PRIMARY_DEEP =
  #b8121e` para fundos escuros com a cor.
- Off-white dessaturado `LIGHT_BG = #f2efec` — **nunca branco puro**, exceto
  no card do plano Profissional e no bloco da Mini VSL (pedidos explícitos).
- Header **nunca** deve ter link de login/cadastro visível — só quem já
  comprou acessa via link do e-mail (regra da skill `saas-padrao-pgv`,
  confirmada pelo usuário).
- Todos os CTAs espalhados pela página apontam para `#planos` (âncora); só
  os botões dentro dos cards de plano (quando existirem de verdade)
  disparariam o checkout.

---

## 9. Pendências conhecidas (em ordem de provável prioridade)

1. **Criar o produto na Cakto de verdade** (skill `criar-produto-cakto`),
   ligar os botões de plano ao checkout real, publicar o webhook
   (`supabase/functions/cakto-webhook/` — **ainda não criado**, só
   documentado no README) e preencher `CAKTO_WEBHOOK_SECRET`.
2. **Implementar galeria de fotos por serviço** (upload múltiplo + exibição
   no catálogo público) — prometido na landing, falta UI.
3. **Implementar vídeos por serviço** (schema já suporta `video_url`, falta
   UI de edição no dashboard + exibição no catálogo público).
4. **Gerar os assets reais** para as 8 seções de tangibilização e o vídeo da
   Mini VSL (usuário disse que vai gerar via GPT/gravação própria) —
   substituir os placeholders em `public/images/sections/` e
   `public/videos/sections/`.
5. Controle de mostrar/ocultar seções do catálogo público pelo dono (pedido
   mencionado, ainda não especificado em detalhe nem implementado).
6. Deploy real (Vercel) se o usuário quiser um link público de verdade em
   algum momento, em vez de só `localhost`.

---

## 10. Convenções de trabalho já validadas nesta conversa

- **Sempre rodar `tsc --noEmit`, `eslint`, `npm run build` limpos** antes de
  considerar uma mudança pronta.
- **Sempre confirmar visualmente** mudanças de UI com Playwright (viewport
  mobile 390px é o padrão usado, já que o público é majoritariamente mobile)
  antes de reportar como concluído — vários bugs reais (loop de redirect,
  header com lógica de scroll invertida, IDOR cross-tenant, selo com fundo
  preto) só foram pegos assim.
- **Perguntar antes de assumir** decisões de produto/copy que afetam
  escopo, preço ou hierarquia de conteúdo — o usuário prefere revisar listas
  de texto/ordem antes da implementação em várias ocasiões nesta conversa.
- **Nunca inventar dado de compra real** — toda simulação de compra é
  claramente uma inserção manual de teste, nunca fingir que o checkout Cakto
  já existe.
- Usuário escreve em CAPS LOCK com erros de digitação frequentes — não é
  ênfase agressiva, é estilo de digitação; responder normalmente.
- Commits em português, mensagens descritivas explicando o "porquê", com a
  linha de atribuição `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Working directory correto: `C:\Users\Usuário\Desktop\CATALAGO SITE`
  (também aparece como `c:\Users\Usuário\Desktop\CATALAGO SITE` — mesma
  pasta, variação de capitalização do drive letter é normal no Windows).
