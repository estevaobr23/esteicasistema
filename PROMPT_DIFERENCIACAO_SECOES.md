# Diferenciação visual e funcional das seções do catálogo

## Contexto

O catálogo (Vitrine Detail) usa um sistema de blocos (`CatalogBlock`, tipo
`SectionId`) renderizado em `src/components/catalog/CatalogPresentation.tsx`,
função `sectionRenderers`. Cada tipo de bloco (`servicos`, `destaques`,
`pacotes`, `sobre`, etc.) tem sua própria função de renderização nesse objeto,
entre as linhas ~333 e ~600 do arquivo.

**Problema real, confirmado lendo o código:** `servicos` (linha 333),
`destaques` (linha 384) e `pacotes` (linha 465) renderizam praticamente o
mesmo card — imagem quadrada no topo, nome, descrição curta, preço, botão
verde de WhatsApp — mudando só detalhes cosméticos:

- `servicos`: nome **acima** da imagem, sem badge.
- `destaques`: nome **abaixo** da imagem, com badge fixo "Mais escolhido".
- `pacotes`: igual a `destaques`, mas troca o badge por "Economize X%" e
  adiciona uma lista de bullets de benefícios.

Não há diferença estrutural, de layout, de hierarquia visual ou de proporção
entre elas. Um lead que adiciona as três seções no catálogo (como no
screenshot que motivou este prompt) vê três blocos visualmente idênticos, sem
noção do porquê cada um existe.

Além disso, `sobre` (linha 580) é hoje só um `<EditableText as="p">` — um
parágrafo de texto solto, sem nenhum suporte visual (foto, galeria, ambiente
de trabalho). É a seção mais "morta" do catálogo apesar de ser onde o lead
teria mais espaço para gerar conexão emocional (mostrar a oficina, a equipe,
as ferramentas).

**Segundo problema, também real:** nenhuma seção no modo de edição (`editable
= true`) tem um indicador visual de "que tipo de seção é esta". O lead vê o
mesmo conjunto de contornos pontilhados em toda seção, e só descobre o tipo
lendo o texto do miolo — não há badge/etiqueta clara tipo "SEÇÃO: Destaques"
no canto de cada bloco quando em modo de edição.

## O que fazer

Este é um trabalho de **design system para os blocos do catálogo**, não uma
correção pontual. Antes de escrever código, proponha e valide comigo (ou
documente na resposta) uma tabela de diferenciação como esta, uma linha por
tipo de bloco, preenchendo a coluna "Função visual/persuasiva":

| Bloco | Função visual/persuasiva | Layout distinto proposto |
|---|---|---|
| `servicos` | Catálogo completo, comparável, para quem já decidiu que quer contratar algo e está comparando opções | Grid denso, card compacto, foco em comparação lado a lado (preço e specs alinhados) |
| `destaques` | Vitrine de entrada, primeira impressão, "prova social embutida" do que mais vende | Card maior, menos denso, com prova social visível (nº de avaliações, selo), pensado para 1-3 itens, não uma lista longa |
| `pacotes` | Oferta combinada, ancoragem de valor (preço riscado vs. preço final), decisão de "tudo em um" | Layout que comunica "combo": preço com âncora clara, lista de itens inclusos com check, sem foto tão dominante — o valor da oferta é o herói, não a foto |
| `sobre` | Conexão emocional/confiança — "conheça quem vai cuidar do seu carro" | Layout com **galeria/carrossel de fotos do espaço, equipe, ferramentas** ao lado ou acima do texto — nunca só texto solto |

Ajuste essa tabela livremente (você tem mais contexto de produto do que eu
tenho aqui), mas **não implemente nada até a tabela existir e fizer sentido
visualmente** — o risco real deste prompt é "resolver" trocando só cores/
paddings e manter os três cards estruturalmente idênticos.

### Requisitos técnicos obrigatórios

1. **Badge de identificação da seção em modo edição.** Todo bloco renderizado
   com `editable = true` precisa mostrar, de forma clara e sem precisar ler o
   texto do conteúdo, qual tipo de seção é aquele — ex.: um chip pequeno no
   canto superior do bloco (`SEÇÃO · Destaques`, `SEÇÃO · Pacotes`, `SEÇÃO ·
   Sobre`) usando o `label` já existente em `BLOCK_LABELS`
   (`src/lib/catalog-builder/schema.ts`). Isso é independente do badge
   "Editar" que já existe em `EditableMedia`/`EditableText` — são dois
   elementos diferentes com propósitos diferentes (um identifica o tipo de
   seção, o outro indica "isto é clicável").

2. **Cada tipo de bloco precisa de um card/layout estruturalmente distinto**,
   não uma variação de cor ou badge. Estruturalmente distinto significa:
   posição relativa dos elementos (imagem/título/preço/CTA), densidade do
   grid, presença ou ausência de elementos (lista de benefícios só em
   pacotes, por exemplo), proporção da imagem. Reaproveite os hooks e
   componentes que já existem (`ServicePrice`, `ServiceCta`,
   `AdaptiveSquareImage`, `EditableMedia`, `resolveBlockEntries`) — não
   reescreva a lógica de dados, só o layout/JSX de cada renderer.

3. **`sobre` precisa de um variant com galeria.** O tipo de bloco `sobre` já
   tem um `variant` no schema (`BlockEditorPanel.tsx` usa
   `definition.variants`) — hoje provavelmente só existe a variante de texto.
   Adicione uma variante que aceite múltiplas imagens (reaproveitar o padrão
   de upload de `ServicoMediaEditor.tsx`, campo `sales_gallery`, como
   referência de como já fazemos upload de galeria) e renderize um carrossel
   simples ao lado ou acima do texto. Se `business.about` ou a galeria
   estiverem vazios, mostrar um estado vazio claro em modo edição (igual ao
   padrão já usado em `ServiceSalesPage.tsx` — "Nenhuma foto adicionada
   ainda"), nunca sumir a seção sem explicação para quem está editando.

4. **100% responsivo mobile-first.** Este projeto tem uma regra de sessão:
   sempre testar em viewport 390px antes de considerar pronto — já tivemos
   bugs reais de overflow horizontal nesse breakpoint. Teste cada novo layout
   de card em 390px de largura antes de dar como concluído.

5. **Continuar 100% editável.** Nenhuma dessas mudanças pode remover ou
   quebrar o sistema de tap-to-edit já existente (`EditableMedia`,
   `EditableText`, `onFieldTap`, `BottomSheet`). O objetivo é diferenciar o
   *layout renderizado*, mantendo os mesmos pontos de edição (ou adicionando
   novos, como o upload de galeria do `sobre`).

### Arquivos relevantes (para não reimplementar o que já existe)

- `src/components/catalog/CatalogPresentation.tsx` — `sectionRenderers`
  (linhas ~333-600), onde ficam os 3 renderers a diferenciar + `sobre`.
- `src/lib/catalog-builder/schema.ts` — `BLOCK_LABELS`, tipos de `variant`
  por bloco, `CatalogBlock`.
- `src/components/dashboard/catalog-editor/BlockEditorPanel.tsx` — painel de
  edição de cada bloco, incluindo seletor de `variant` (linha ~236,
  "Formato da seção") — se adicionar variantes novas, elas precisam aparecer
  aqui também, com miniatura em `CatalogMiniatures.tsx`.
- `src/components/dashboard/catalog-editor/panels/ServicoMediaEditor.tsx` —
  padrão já validado de upload de galeria múltipla, reaproveitar para a
  galeria do `sobre`.
- `src/components/catalog/ServiceSalesPage.tsx` — padrão já validado de
  estado vazio em modo edição ("Nenhum ___ adicionado ainda").

### Critério de aceite

- As seções `servicos`, `destaques` e `pacotes`, lado a lado no mesmo
  catálogo, são visualmente reconhecíveis como diferentes **sem ler o
  texto** — só pela forma do card.
- Em modo de edição, cada bloco mostra um badge com o nome do tipo de seção,
  visível sem precisar clicar em nada.
- `sobre` tem uma opção de galeria de fotos funcional (upload, preview,
  remoção), não só texto.
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx` e `npm run build`
  limpos.
- Testado visualmente em 390px (mobile) e desktop, print antes/depois de
  cada seção.
