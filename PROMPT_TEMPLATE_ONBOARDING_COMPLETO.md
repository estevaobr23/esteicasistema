# Todo lead novo nasce com um catálogo completo de exemplo, não vazio

## Contexto e o problema real

Hoje, quando um lead compra e cria a conta (`createBusiness` em
`src/app/app/onboarding/actions.ts`), o negócio nasce **vazio** — só
`owner_id`, `name`, `slug`, `plano`. O onboarding (`/app/onboarding`, etapas
`visual` → `contato` → `servicos` → `precos` → `publicar`) pede pra ele
preencher tudo manualmente, um campo de cada vez.

O template escolhido na tela `TemplateSelectorScreen.tsx`
(`Clássico Dark`/`Claro Premium`/`Performance GT`) hoje só define **estrutura
de seções e paleta de cores** (`createTemplateLayout` em
`src/lib/catalog-builder/template-layouts.ts`) — blocos como `destaques`,
`pacotes`, `antes_depois` ficam vazios até o lead cadastrar serviços/pacotes/
portfólio manualmente. Resultado: escolher um template hoje mostra uma
prévia bonita (porque o preview em `TemplateSelectorScreen.tsx` usa dados de
um negócio de demonstração pré-existente, não os dados reais do lead), mas
depois de aplicado o catálogo real fica esparso até muito trabalho manual.

**O que o usuário quer:** todo lead novo deve nascer com um catálogo **já
completo** — mesma estrutura rica e visual do negócio de referência
`clackcat`/`detail-teste` (hero com badges, 6-8 serviços com fotos/galeria,
3-4 pacotes com imagem e benefícios, portfólio antes/depois, avaliações com
foto de cliente) — só que com **conteúdo de exemplo genérico e editável**
("Seu Serviço Aqui", preços de exemplo, fotos placeholder de detalhamento
automotivo genéricas), não os dados reais de outro negócio. O lead edita a
partir disso, em vez de começar do zero.

## O que já existe e deve ser reaproveitado (não recriar do zero)

- `scripts/seed-detail-demo.mjs` (520 linhas) — já é um script completo de
  seed que popula `services`, `service_features`, `service_prices`,
  `packages`, `package_services`, `package_benefits`, `portfolio_items`,
  `availability_slots`, `reviews` para um negócio `--slug` já existente,
  usando as imagens de `public/images/demo-detail-teste/`. **A estrutura de
  dados que ele insere (nomes de campo, shape de cada tabela) é a
  referência de schema a seguir** — não reinvente o shape dos inserts, leia
  esse script primeiro.
- `public/images/demo-detail-teste/` — 12+ fotos reais de detalhamento
  automotivo (lavagem, polimento, vitrificação, interior, motor, etc.) mais
  banners, já usadas nos negócios de teste. **Reaproveitar essas mesmas
  imagens como fotos de exemplo do template** — são genéricas o suficiente
  (nenhuma marca/logo específica visível) para servir de placeholder em
  qualquer negócio novo do nicho de estética automotiva.
- `src/lib/catalog-builder/template-layouts.ts` — a estrutura de seções por
  template já existe e está correta, não mexer na ordem/composição das
  seções em si.
- `src/lib/domain/catalog-templates.ts` — paletas e tipografia por template,
  não mexer.

## O que fazer

### 1. Decidir e implementar o ponto de disparo do seed

Duas opções, escolha a que se encaixar melhor na arquitetura atual sem
duplicar lógica:

- **Opção A (recomendada a avaliar primeiro):** popular o conteúdo de
  exemplo no momento em que o lead **aplica um template** pela primeira vez
  (`APPLY_TEMPLATE` no reducer, `src/components/dashboard/catalog-editor/
  editor-state.ts`, ou o fluxo correspondente em
  `TemplateSelectorScreen.tsx`) — já que é o momento em que ele escolhe
  "Clássico Dark" vs "Performance GT" etc., faz sentido o conteúdo de
  exemplo vir junto com a escolha visual. Isso exigiria mover a lógica de
  seed do `scripts/seed-detail-demo.mjs` (hoje um script standalone Node)
  para uma Server Action reaproveitável, chamada tanto pelo script (para
  seed manual de demos) quanto pelo fluxo de aplicar template.
- **Opção B:** popular direto em `createBusiness`
  (`src/app/app/onboarding/actions.ts`), assim que o negócio é criado, antes
  mesmo de chegar na tela de templates — o lead já entra no editor vendo
  tudo preenchido com o template padrão (`classico_dark`), e ao trocar de
  template (se quiser) os dados de exemplo permanecem, só a paleta/estrutura
  de seção muda.

Avalie qual opção gera menos duplicação de código e decida — documente a
escolha na resposta. Em ambos os casos, a lógica de "quais dados de exemplo
inserir" deve ficar numa função/módulo compartilhado (ex.:
`src/lib/domain/seed-demo-content.ts`), não duplicada em dois lugares.

### 2. Conteúdo de exemplo — genérico, não cópia do clackcat

Adaptar os dados que `scripts/seed-detail-demo.mjs` insere, trocando nomes/
textos específicos de "Detail Teste"/"clackcat" por conteúdo claramente de
exemplo/placeholder, mas ainda realista o suficiente pra não parecer lorem
ipsum — mantendo a mesma variedade de tipos de serviço (foto única, antes/
depois, galeria, vídeo) para o lead ver todos os modos de mídia disponíveis
desde o início. Sugestão de tom (ajustar como achar melhor):
- Nomes de serviço genéricos mas específicos do nicho: "Lavagem Completa",
  "Polimento Técnico", "Proteção Cerâmica", etc. (não "Serviço 1", "Serviço
  2" — isso não ajuda o lead a entender o que editar).
- Preços de exemplo redondos e plausíveis (não os mesmos valores exatos do
  clackcat, para não parecer copiado 1:1 caso dois leads comparem).
- 1-2 depoimentos de exemplo claramente marcados como tal no texto ou
  reconhecíveis como placeholder (ex.: nomes genéricos "Cliente Exemplo"),
  com fotos do banco de rostos já usado
  (`C:\Users\Usuário\.claude\skills\padrao-lowticket\assets\padrao\provas-sociais\`
  — mesmo banco já usado para os depoimentos do clackcat/detail-teste).
- Texto "Sobre o negócio" e headline do hero com placeholders claros do
  tipo "Edite este texto para falar sobre o seu negócio" combinados com um
  exemplo de frase real, para o lead entender o padrão esperado sem ficar
  achando que é obrigatório manter aquele texto.

### 3. Logo e capa (cover)

Gerar/reaproveitar um logo genérico (monograma simples, sem marca
específica) e usar uma das fotos de `public/images/demo-detail-teste/` como
capa (`cover_url`) padrão — igual ao que já foi feito para os negócios de
teste nesta mesma sessão (ver commit mais recente do histórico do projeto,
que já resolveu esse exato problema para `detail-teste`/`clackcat`).

### 4. Deixar claro para o lead que é conteúdo de exemplo

Considerar (avaliar se cabe no escopo, não é bloqueante): algum indicador
visual sutil no editor — não necessariamente no catálogo público — avisando
que aquele conteúdo é de exemplo e precisa ser revisado antes de publicar
de verdade. Pode ser um banner discreto no topo do editor ("Este catálogo
tem conteúdo de exemplo — edite antes de publicar") que desaparece quando o
lead edita qualquer campo, ou um item no checklist de publicação se um
existir. Não é o foco principal deste prompt, mas evita o risco real de um
lead publicar sem perceber que os textos são placeholder.

## Requisitos técnicos

- Reaproveitar exatamente o shape de dados de
  `scripts/seed-detail-demo.mjs` — ler esse arquivo inteiro antes de
  escrever os novos inserts, para manter consistência de schema (nomes de
  campo, `media_mode` por serviço, estrutura de `package_benefits`, etc.).
- Upload de imagens: usar o mesmo padrão de upload já usado no projeto
  (`uploadBusinessMedia` ou equivalente do lado servidor, já que isso roda
  em Server Action, não em client) — as imagens de
  `public/images/demo-detail-teste/` precisam ser copiadas para o bucket do
  Supabase Storage do **negócio novo** (não reaproveitar a URL do bucket de
  outro negócio, cada negócio tem seu próprio espaço de mídia).
- Idempotência: se o lead já tem conteúdo (por exemplo, reaplicando um
  template depois de já ter editado), não duplicar os dados de exemplo por
  cima do que ele já tem — seguir o padrão de "update se já existe, insert
  se não" que `scripts/seed-detail-demo.mjs` já usa (procura por nome antes
  de inserir).
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx`, `npm run build`
  limpos.
- Testar de ponta a ponta: criar uma conta de teste nova do zero (fluxo
  real de onboarding), confirmar que ao final ela tem um catálogo completo
  e visualmente rico, publicado e acessível, em mobile 390px.

## Critério de aceite

- Um lead novo, ao terminar o onboarding e escolher um template, tem um
  catálogo público completo — não vazio, não com blocos faltando — com
  conteúdo de exemplo realista e editável.
- Os 3 templates (`classico_dark`, `claro_premium`, `performance_gt`)
  funcionam igualmente bem com o conteúdo de exemplo.
- Nenhum negócio já existente e já personalizado (`detail-teste`,
  `clackcat`) é afetado por este trabalho — o seed de exemplo só se aplica
  a negócios novos ou que ainda não têm conteúdo próprio.
