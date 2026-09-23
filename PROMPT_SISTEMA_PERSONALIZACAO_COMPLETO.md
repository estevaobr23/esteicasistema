# Sistema completo de personalização visual do catálogo (fontes, cores, animações, carrossel)

Este é o maior conjunto de mudanças pedido até agora nesta sessão. Leia o
prompt inteiro antes de começar a codar — cada seção tem decisões já
fechadas com o usuário, não é para reabrir escopo nem simplificar sem
avisar. Trabalhe em fases (a ordem sugerida no final), commitando/validando
cada fase antes de seguir para a próxima, para não entregar tudo quebrado de
uma vez.

---

## Contexto e arquitetura atual (ler antes de codar)

- `src/lib/domain/catalog-templates.ts` — 3 templates fixos
  (`classico_dark`, `claro_premium`, `performance_gt`), cada um com
  `palette` (bg/bgDeep/textColor/textMuted/primaryColorDefault/
  secondaryColorDefault), `cardStyle` (borderRadius/borderWidth/shadow),
  `typography` (headingWeight/headingTracking) e `defaultSectionsConfig`.
  Isso é a base a estender, não substituir.
- `src/components/catalog/CatalogPresentation.tsx` — deriva `isDark`, `bg`,
  `bgDeep`, `textColor`, `textMuted`, `cardStyleProps`, `headingStyleProps`
  a partir de `getCatalogTemplate(business.template_id)`, e já lê
  `business.primary_color`/`secondary_color` como override por negócio
  (as cores já são editáveis hoje, globalmente, via 2 color pickers em
  `HeroMediaPanel.tsx`). Também já existe `--catalog-radius` (CSS var
  aplicada no wrapper raiz, controlando o arredondamento dos botões —
  ver `business.button_radius`, implementado recentemente).
- `src/components/dashboard/catalog-editor/editor-state.ts` — reducer com
  `BusinessDraft`, actions `SET_COLOR`, `APPLY_TEMPLATE_STYLE`,
  `APPLY_TEMPLATE`. `APPLY_TEMPLATE_STYLE` (linha ~350) já mostra o padrão
  de "aplicar só cor/identidade sem mexer na estrutura de seções" — use o
  mesmo padrão para as novas actions deste prompt.
- `src/components/dashboard/catalog-editor/TemplateSelectorScreen.tsx` — a
  tela de entrada por templates (já corrigida nesta sessão para sempre
  aparecer ao entrar em `/app/catalogo`, com card "Personalizado →
  Continuar editando" quando o negócio já foi customizado). Os controles
  novos deste prompt (fontes, paleta de cores, animação) devem ficar
  acessíveis a partir do editor principal (mesmo lugar de
  `HeroMediaPanel.tsx`, onde já ficam as cores), não dentro dessa tela de
  seleção de template.
- `src/lib/catalog-builder/block-registry.ts` e `schema.ts` — sistema de
  blocos (`servicos`... na verdade já removido, `destaques`, `pacotes`,
  `antes_depois`, `avaliacoes`, `sobre`, `horarios`, `localizacao`,
  `banner`, `video`, `text`, `cta`, `branding_video`) — é aqui que entra o
  novo tipo de bloco de carrossel (Parte 4).

---

## Parte 1 — Fontes: catálogo curado de combinações prontas

**Decisão fechada com o usuário: catálogo curado, não escolha livre.**
6-8 pares de fontes (título + corpo) pré-testados para ficarem bons juntos —
sem lista aberta do Google Fonts, sem risco de combinação ruim.

### O que fazer

1. Criar `src/lib/domain/catalog-fonts.ts` com uma lista `CATALOG_FONT_PAIRS`
   (6-8 entradas), cada uma com: `id`, `nome` (ex: "Editorial", "Moderno",
   "Robusto"), `headingFont` e `bodyFont` (nome da fonte do Google Fonts +
   pesos necessários), e uma pequena descrição do clima que ela transmite.
   Curadoria sugerida (ajuste como achar melhor, mas mantenha nessa faixa de
   qualidade — combinações clássicas e seguras, não experimentais):
   - Um par sans-serif moderno e neutro (ex: Inter/Manrope ou similar) —
     "Moderno e limpo".
   - Um par com serifa no título para transmitir sofisticação (ex: Fraunces
     ou Playfair Display no heading + Inter no corpo) — "Editorial".
   - Um par mais condensado/impactante para nicho esportivo/performance
     (ex: Barlow Condensed ou Oswald no heading) — "Robusto".
   - Um par arredondado/amigável (ex: Poppins ou Quicksand) — "Amigável".
   - 2-4 combinações adicionais cobrindo variações de peso/personalidade.
2. Carregamento: usar `next/font/google` (já é Next.js 16 — confirme a API
   atual lendo `node_modules/next/dist/docs/` antes de implementar, pode ter
   mudado da sua base de treino) para pré-carregar as fontes de forma
   performática, ou `<link>` do Google Fonts se `next/font` não servir bem
   para troca dinâmica em runtime por negócio publicado — avalie qual
   abordagem funciona melhor considerando que cada negócio publicado usa
   uma combinação diferente (troca de fonte não pode exigir rebuild).
3. Novo campo `business.font_pair_id` (migration nova,
   `supabase/migrations/00XX_font_pairs.sql`, texto, default o par mais
   neutro do catálogo). Seguir o padrão de migrations já usado no projeto
   (ver `0009_button_radius.sql` como referência de estilo).
4. `getCatalogTemplate`/`CatalogPresentation.tsx`: aplicar `headingFont` nos
   headings (`headingStyleProps` já existe, estender) e `bodyFont` no resto
   do texto do catálogo via CSS var (mesmo padrão de `--catalog-radius`).
5. UI no editor: novo painel/seção (pode reaproveitar o padrão visual de
   `HeroMediaPanel.tsx` ou criar um painel dedicado) com os 6-8 pares em
   cards clicáveis, mostrando uma prévia real do par (heading + texto de
   corpo renderizados na própria fonte dentro do card de seleção, não só o
   nome escrito em fonte padrão).
6. Action nova no reducer (`SET_FONT_PAIR`), persistida no save
   (`src/app/app/(dashboard)/catalogo/actions.ts`).

---

## Parte 2 — Cores: wizard gamificado por perguntas visuais

**Decisão fechada com o usuário — ler com atenção, é a parte mais
específica deste prompt:** não é uma galeria de paletas prontas para
escolher com 1 clique. É um **wizard de 3-5 telas em sequência**, cada tela
uma pergunta visual (não um formulário de texto), que ao final gera a
paleta completa automaticamente a partir das respostas. Preview ao vivo do
catálogo mudando a cada passo (mesma técnica de preview em miniatura já
usada em `TemplateSelectorScreen.tsx`/`TemplateThumbnail`, ou o catálogo
real se a performance permitir).

### Estrutura sugerida do wizard (ajustar livremente, mas manter o formato
de "pergunta visual → escolha → avança", nunca um formulário de texto)

1. **Tela 1 — Clima/personalidade**: 3-5 opções visuais (não só texto,
   cada opção com uma amostra de cor/estilo já aplicada em miniatura) tipo
   "Sofisticado e escuro" / "Leve e clean" / "Vibrante e chamativo" /
   "Técnico e confiável". Essa escolha define se vai pro lado claro/escuro
   e a saturação geral.
2. **Tela 2 — Cor-base**: uma roda de cores ou uma grade de swatches (não
   um `<input type="color">` cru) para o lead escolher a cor-base da marca
   dele (a cor primária). Pode reaproveitar um color picker de roda de
   cores simples em canvas/SVG, ou uma grade curada de ~12-16 cores comuns
   de marca automotiva/serviço (vermelho, azul, verde, laranja, etc.) mais
   um botão "cor personalizada" que abre o picker livre para quem quiser
   fugir da grade.
3. **Tela 3 — Geração automática da paleta**: a partir da cor-base + o
   clima escolhido na tela 1, gerar automaticamente (algoritmo de cor —
   complementar, análoga, ou tríade, dependendo do clima escolhido) a cor
   secundária/de destaque e o fundo (claro ou escuro conforme a tela 1).
   Mostrar isso já aplicado no preview ao vivo.
4. **Tela 4 (opcional) — Ajuste fino**: permitir pequenos ajustes na
   paleta gerada (ainda visual — sliders de tom/saturação, não hex direto)
   antes de confirmar.
5. **Tela final — Confirmar**: aplica a paleta gerada em
   `business.primary_color`/`secondary_color`/e o novo campo de fundo (ver
   abaixo), fecha o wizard, volta pro editor.

### O que fazer tecnicamente

1. Decidir se o "fundo" (hoje fixo por template, `palette.bg`/`bgDeep`)
   passa a ser também customizável por negócio a partir do wizard (campo
   novo `business.bg_color_override`, opcional — nulo usa o `bg` do
   template como hoje) ou se o wizard só gera primária/secundária dentro
   dos limites do template escolhido. Ambos são válidos — se optar por
   permitir customizar o fundo também, precisa de migration nova e ajuste
   em `CatalogPresentation.tsx` para usar o override quando presente.
2. Um algoritmo de geração de paleta simples (client-side, sem lib nova
   necessária — conversão HSL é suficiente: pegar a cor-base em HSL, girar
   o hue pra complementar/análoga conforme o clima escolhido, ajustar
   lightness pro fundo claro/escuro).
3. Componente novo `ColorPaletteWizard.tsx` (ou nome equivalente) dentro de
   `src/components/dashboard/catalog-editor/`, acessível a partir de um
   botão destacado no editor (ex.: substituindo ou complementando os 2
   color pickers simples que já existem em `HeroMediaPanel.tsx` — decida se
   os pickers simples continuam como atalho rápido "ajuste fino" depois do
   wizard, ou se o wizard é o único caminho; recomendo manter os pickers
   simples como atalho pós-wizard, já que às vezes o lead só quer trocar
   uma cor rapidinho sem repetir o wizard inteiro).
4. Reducer: pode reaproveitar `SET_COLOR` para o resultado final (já
   dispara `templateCustomized: true`), não precisa de action nova
   necessariamente — a UI do wizard só despacha `SET_COLOR` (e o novo
   campo de fundo, se implementado) ao confirmar a última tela.

---

## Parte 3 — Animações: preset global único

**Decisão fechada: um único seletor global, não por seção.**

1. Novo campo `business.animation_preset` (migration, texto, valores
   `"none" | "soft" | "dynamic"`, default `"soft"`).
2. `CatalogPresentation.tsx`: implementar animação de entrada por seção via
   `IntersectionObserver` (não há lib de animação no projeto hoje — manter
   assim, CSS + JS simples, sem adicionar dependência nova) que adiciona
   uma classe quando a seção entra no viewport:
   - `"none"`: sem animação nenhuma (acessibilidade/performance).
   - `"soft"`: fade-in + leve translate-y (8-12px), duração curta
     (~400-500ms), easing suave.
   - `"dynamic"`: fade-in + translate-y maior (20-24px) com leve escala,
     duração um pouco maior, mais perceptível.
   Aplicar em cada `<section>` do `sectionRenderers`/`renderCustomBlock`
   (envolver de forma centralizada — um wrapper ou hook reutilizável, não
   repetir a lógica em cada renderer).
3. **Obrigatório**: respeitar `prefers-reduced-motion: reduce` — desabilitar
   a animação (aplicar o resultado final direto, sem transição) independente
   do preset escolhido, se o sistema operacional do visitante pedir menos
   movimento.
4. UI no editor: 3 opções visuais simples (miniatura mostrando a diferença
   de movimento, ou apenas texto claro + talvez um preview ao vivo rolando
   a página de demo) — pode ficar no mesmo painel de estilo onde já fica o
   seletor de arredondamento de botão (`HeroMediaPanel.tsx`).
5. Action `SET_ANIMATION_PRESET` no reducer, persistida no save.

---

## Parte 4 — Novo bloco: Carrossel automático (imagens/depoimentos)

**Decisão fechada: novo tipo de bloco no sistema de seções já existente**
(igual `banner`/`video`/`text`/`cta`), não uma feature separada.

1. `src/lib/catalog-builder/schema.ts`: adicionar `"carrossel"` (ou nome em
   inglês consistente com os outros tipos custom, ver como `banner`/`video`
   estão nomeados — seguir o padrão) à união de `CatalogBlockType`. Conteúdo
   do bloco: `{ mode: "images" | "reviews", images: string[], reviewIds:
   string[], autoplaySeconds: number, title, eyebrow, description }` —
   ajustar aos campos que fizerem sentido seguindo o padrão de `content`
   dos outros blocos custom.
2. `src/lib/catalog-builder/block-registry.ts`: nova entrada na lista
   `definitions`, categoria "Prova" (mesma dos blocos de depoimento/antes-
   depois), com variantes de exibição (ex.: "Faixa contínua" — scroll
   infinito tipo os `marquee` já vistos em referências de outras skills
   deste projeto — e "Slides com autoplay" — troca a cada X segundos).
3. Renderização em `CatalogPresentation.tsx` (`renderCustomBlock` ou um
   novo case em `sectionRenderers`, seguir o padrão já usado pros outros
   blocos custom): 
   - Modo `images`: carrossel automático das imagens enviadas, sem
     controles de scroll manual visíveis (rotação automática por
     `autoplaySeconds`, pausar no hover/touch).
   - Modo `reviews`: mesma mecânica, mas rotacionando cards de depoimentos
     (reaproveitar o componente/estilo de card já usado no bloco
     `avaliacoes`, não recriar).
4. Painel de edição no `BlockEditorPanel.tsx` (mesmo arquivo que já edita
   os outros blocos custom) com: upload múltiplo de imagens OU seleção de
   reviews existentes (dependendo do `mode`), campo de segundos de
   autoplay, e as variantes visuais.
5. Performance: pausar a rotação automática quando a seção não está
   visível no viewport (`IntersectionObserver`, mesmo mecanismo da Parte 3
   pode ser reaproveitado/compartilhado).
6. Acessibilidade: `prefers-reduced-motion` também desabilita o autoplay
   aqui (para em uma imagem/review fixa, sem rotação).

---

## Ordem de implementação sugerida (fases testáveis)

1. **Fase 1 — Fontes.** Menor risco, isolado, fácil de validar visualmente.
2. **Fase 2 — Animações.** Também isolado, adiciona a infraestrutura de
   `IntersectionObserver` que a Fase 4 (carrossel) também usa.
3. **Fase 3 — Carrossel.** Reaproveita a infraestrutura da Fase 2.
4. **Fase 4 — Wizard de cores.** A mais trabalhosa e a que mais precisa de
   cuidado de UX (múltiplas telas, geração de paleta, preview ao vivo) —
   fazer por último, com mais tempo disponível, e testar exaustivamente em
   mobile 390px (é um fluxo com várias telas, cada uma precisa caber bem).

## Requisitos técnicos gerais (valem para as 4 partes)

- Seguir o padrão de migration já estabelecido (ver
  `supabase/migrations/0009_button_radius.sql` como referência de estilo:
  `alter table businesses add column ... default ...`, sempre com valor
  default seguro para não quebrar negócios já publicados).
- Depois de cada migration: `supabase gen types typescript --linked`
  redirecionando **sem** capturar avisos do CLI no arquivo de saída (já
  aconteceu um bug real nesta sessão onde o aviso "nova versão do CLI
  disponível" foi parar dentro do `types.ts` e quebrou o build — usar
  `2>/dev/null` ao gerar).
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx`, `npm run build`
  limpos ao final de cada fase.
- Testar em mobile 390px — é a prioridade #1 estabelecida nesta sessão.
- Manter tudo editável via o sistema de tap-to-edit já existente
  (`EditableMedia`/`EditableText`/`onFieldTap`) onde fizer sentido — não
  reintroduzir abas ou formulários separados do catálogo real.
- Negócios já publicados não podem quebrar visualmente: todo campo novo
  precisa de fallback seguro (fonte padrão, animação "soft" padrão, sem
  carrossel até o lead adicionar um).

## Critério de aceite

- Fontes: 6-8 combinações reais, aplicadas corretamente em heading/corpo,
  preview real na hora de escolher.
- Cores: wizard de múltiplas telas, cada uma uma pergunta visual, termina
  gerando e aplicando uma paleta coerente, com preview ao vivo mudando a
  cada passo.
- Animações: 1 seletor global, 3 opções, `prefers-reduced-motion` respeitado.
- Carrossel: novo bloco funcional, autoplay pausável, reaproveita
  componentes de review/imagem já existentes.
- Nada quebra em catálogos já publicados; tudo com fallback seguro.
- Todos os checks (tsc/eslint/build) limpos, testado em 390px.
