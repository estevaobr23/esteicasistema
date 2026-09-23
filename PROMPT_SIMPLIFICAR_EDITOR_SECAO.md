# Simplificar o painel de edição de seção: tirar layout estrutural, priorizar estética

## Contexto

Hoje, ao tocar em qualquer bloco do catálogo em modo de edição, o painel que
abre (`BlockEditorPanel.tsx`, roteado por `BottomSheet.tsx` para
`target.kind === "catalog_block"`) mostra, entre outros grupos:

- **"Formato da seção"** (linha ~306) — escolhe `variant` (grade/lista/
  compacto)
- **"Tamanho e respiro"** (linha ~321) — escolhe `width` (tela inteira/
  ampla/padrão/compacta) e `spacing` (sem espaço/compacto/confortável/amplo)
- **"Composição visual"** (linha ~351) — tem DOIS controles: alinhamento
  (esquerda/centro/direita) e fundo (automático/principal/alternativo/
  marca/personalizado, com color picker)
- **"Colunas por dispositivo"** (linha ~388) — grid de quantas colunas
  aparecem em mobile/tablet/desktop

**Feedback do usuário, testando de verdade:** esses controles de layout
estrutural (largura, espaçamento, colunas, alinhamento) fazem a edição
parecer mais complicada sem deixar o catálogo mais bonito na prática — na
experiência real de uso, esse tipo de ajuste "quebra" o visual em vez de
refinar. O valor percebido está em outro lugar: fonte, cor, estilo visual e
animações.

## O que fazer

### 1. Remover 3 grupos inteiros do `BlockEditorPanel.tsx`

- **"Formato da seção"** (variant) — remover o grupo inteiro (linhas
  ~306-319).
- **"Tamanho e respiro"** (width + spacing) — remover o grupo inteiro
  (linhas ~321-349).
- **"Colunas por dispositivo"** (responsive.columns) — remover o grupo
  inteiro (linhas ~388-~410, confirmar onde termina lendo o arquivo).

**Não remova os toggles de visibilidade** ("Mostrar seção", "Ocultar no
celular", "Ocultar no desktop", mais abaixo no mesmo arquivo) — isso é
controle funcional (o que aparece ou não), não estético, e continua
necessário.

### 2. Do grupo "Composição visual", manter só o controle de fundo

Dentro de "Composição visual" (linha ~351-379):
- **Remover** o sub-bloco "Alinhamento" (linhas ~352-363).
- **Manter** o sub-bloco "Fundo" (linhas ~365-378) e o color picker
  condicional logo abaixo (linhas ~381-386) — isso é estética de verdade
  (cor de fundo da seção) e deve continuar.
- Pode renomear o grupo de "Composição visual" para algo mais direto tipo
  "Fundo da seção", já que só resta um controle nele.

### 3. Decidir o destino de `variant`, `width`, `spacing`, `responsive.columns` nos dados

Essas propriedades continuam existindo no schema (`CatalogBlock["style"]`,
`CatalogBlock["responsive"]`) e em `editor-state.ts`/`schema.ts` — **não
remova do tipo/schema**, só da UI. Ao remover os controles, os valores
existentes (já salvos em catálogos publicados) devem continuar funcionando
sem quebrar nada — apenas não ficam mais editáveis pela UI. Se algum desses
campos for essencial para o funcionamento de algum tipo de bloco específico
(por exemplo, `variant` pode mudar completamente o layout de `pacotes` —
"compact" vs "comparison" no código atual), avalie: talvez `variant` precise
continuar editável só nos blocos onde ele muda a estrutura de forma
significativa (ex. pacotes), enquanto os outros 3 grupos (width/spacing/
columns) saem para todos os blocos sem exceção. Use seu critério e documente
a decisão na resposta.

### 4. Adicionar controles de estética real no lugar

O espaço que sobra no painel deve priorizar isto (crie um novo grupo, ex.
"Estilo visual" ou "Aparência"):

- **Cor de destaque/marca por seção** (não é a cor global do negócio — já
  existe `SET_COLOR` editando `business.primary_color`/`secondary_color`
  globalmente via `HeroMediaPanel.tsx`; aqui é uma cor *por bloco*, que
  sobrescreve a cor primária só dentro daquela seção específica quando o
  lead quiser destacar uma seção com uma cor diferente do resto do
  catálogo). Isso é uma feature nova: adicionar um campo tipo
  `style.accentColor?: string` no `CatalogBlock["style"]` (opcional,
  fallback para `business.primary_color` quando ausente), com color picker
  no painel.
- **Estilo tipográfico do heading da seção**: hoje `typography` já existe a
  nível de TEMPLATE (`src/lib/domain/catalog-templates.ts`,
  `headingWeight`/`headingTracking`) mas não por seção. Avalie se faz
  sentido um controle simples de peso da fonte do título da seção (normal/
  negrito/extra negrito) por bloco — reaproveitando o padrão de
  `Typography` já existente no template, não inventando um sistema
  paralelo.
- **Transição/animação de entrada da seção**: um controle simples (ex.:
  nenhuma / fade / slide-up) que adiciona uma classe de animação CSS quando
  a seção entra em viewport (pode usar `IntersectionObserver` simples, sem
  biblioteca nova — o projeto não usa animação lib nenhuma hoje, mantenha
  assim, CSS puro com `@media (prefers-reduced-motion: reduce)` desabilitando).

Não implemente as três de uma vez se ficar complexo demais — comece pela cor
de destaque por seção (é a que mais se conecta com o sistema de cores já
existente), documente as outras duas como próximo passo se não der tempo.

## Arquivos relevantes

- `src/components/dashboard/catalog-editor/BlockEditorPanel.tsx` — painel a
  simplificar.
- `src/lib/catalog-builder/schema.ts` — `CatalogBlock["style"]`, tipos
  `BlockWidth`/`BlockSpacing`/`BlockAlign` (mantidos no schema mesmo sem UI).
- `src/lib/domain/catalog-templates.ts` — `Typography`, já existe a nível de
  template, referência para não duplicar sistema.
- `src/components/dashboard/catalog-editor/panels/HeroMediaPanel.tsx` — onde
  `SET_COLOR` já edita cor global, referência de padrão de color picker já
  usado no projeto.
- `src/components/dashboard/catalog-editor/CatalogMiniatures.tsx` — tem os
  componentes de miniatura (`WidthMiniature`, `SpacingMiniature`,
  `ColumnsMiniature`, `AlignMiniature`) que ficam órfãos após a remoção —
  pode deixá-los sem uso (não quebra nada) ou remover se preferir limpeza,
  sua escolha.

## Requisitos técnicos

- Não remover os toggles de visibilidade (mostrar seção / ocultar mobile /
  ocultar desktop).
- Não remover `variant`/`width`/`spacing`/`responsive.columns` do
  schema/tipos — só da UI (a menos que `variant` precise continuar editável
  em blocos específicos conforme decisão do item 3).
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx`, `npm run build`
  limpos.
- Testar em 390px: o painel precisa continuar caber bem, sem elementos
  cortados, com o novo grupo de estética visível e funcional.

## Critério de aceite

- Painel de edição de seção mais curto e direto: sem "Formato da seção",
  sem "Tamanho e respiro", sem "Colunas por dispositivo", sem sub-bloco de
  alinhamento.
- Painel ganha pelo menos um controle de estética real (cor de destaque por
  seção, no mínimo) que produz uma mudança visual perceptível no catálogo.
- Catálogos já publicados continuam renderizando exatamente como antes
  (nenhuma seção muda de largura/espaçamento/colunas sozinha ao remover a
  UI).
