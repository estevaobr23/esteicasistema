# Imagem de validação — tangibilização "Seu catálogo geral"

## Passo obrigatório antes de codar

Carregue a skill `padrao-imagens-saas` (`$padrao-imagens-saas` no Codex) e
siga o fluxo de produção dela (seção 3, "Fluxo de produção") e o checklist
de validação (seção 5) antes de considerar esta imagem pronta. Este prompt
cobre **só a primeira seção** ("Seu catálogo geral") como piloto de
validação — as outras 7 tangibilizações da página (`src/app/page.tsx`) só
devem ser produzidas depois que esta primeira for aprovada, para confirmar
o estilo antes de replicar 7 vezes.

## Contexto

`src/app/page.tsx`, seção "TANGIBILIZAÇÃO 1 — Catálogo geral" (linha
~113-131), referencia hoje uma imagem que **não existe no projeto**:
`/images/sections/catalogo-geral.png`. É um placeholder a preencher do
zero, não uma substituição de arquivo existente.

```
Seção → "Seu catálogo" (eyebrow)
Título → "Seu catálogo, do jeito que seu cliente vê."
Texto → "Um site profissional, com a cara da sua marca, pronto pra receber
         quem chega pelo link — sem parecer fotos soltas no WhatsApp."
Moldura de destino → aspect-[9/16], max-w-[280px], object-cover
```

## Família de imagem (skill, seção 2)

**Família A — Tangibilização de funcionalidade**: mockup de iPhone em
primeiro plano + arte contextual ao fundo. É exatamente o padrão pedido:
"moldura do iPhone 100% realista + imagem real do produto dentro + arte
lifestyle atrás".

## Passo 1 — Tela real a usar dentro do mockup

**Não inventar uma tela nova.** Seguindo a regra inegociável da skill
("use telas reais, protótipos aprovados ou screenshots fornecidos — nunca
substitua a prova do produto por um dashboard genérico"):

1. Rode o catálogo local (`npm run dev`) e capture um screenshot real do
   catálogo público em viewport mobile 390px — use o negócio de
   demonstração `detail-teste` (`http://localhost:3000/detail-teste`),
   scrollado até mostrar o hero + início da seção de serviços (a visão
   "geral" do catálogo, coerente com a promessa "do jeito que seu cliente
   vê").
2. Esse screenshot é a "Image 1" (tela real a preservar) do prompt de
   geração — a IA deve colocá-lo dentro da moldura do iPhone sem redesenhar
   texto ou UI, só compor a moldura e a arte ao redor.

## Passo 2 — Arte contextual (lifestyle)

Especificações do usuário, seguir à risca:

- **Cena**: uma pessoa entregando o carro para o dono de uma estética
  automotiva — o contexto direto da promessa "seu catálogo, do jeito que
  seu cliente vê" (o momento em que o cliente chega e é atendido).
- **Estilo**: ilustração digital detalhada, **não fotorrealista, não
  desenho infantil/cartoon, não estilo animação** — referência explícita
  dada pelo usuário: linguagem visual parecida com a Airbnb usa em
  ilustrações editoriais (traço limpo, formas humanas estilizadas mas
  adultas/maduras, composição rica em detalhe, não simplificada).
- **Paleta**: **cores vivas e reais da cena** (tons de pele, cores de
  roupa, cores do ambiente de oficina/estética automotiva) — explicitamente
  **não** restringir à paleta da marca do produto (preto/vermelho/branco).
  A arte contextual tem identidade cromática própria, separada da UI do
  produto que aparece dentro do mockup.

## Passo 3 — Mockup do dispositivo

- iPhone realista, moldura limpa, bordas coerentes (skill, seção 5: "o
  dispositivo parece conter a tela, sem bordas cortadas ou perspectiva
  incoerente?").
- Composição vertical (formato do destino é 9:16, `max-w-[280px]`):
  telefone ocupando 45–60% da altura da composição (tabela de escala da
  skill), arte contextual visível ocupando o resto do quadro, se
  sobrepondo ao telefone sem escondê-lo.
- Fundo: transparente ou cor sólida neutra que combine com o `LIGHT_BG`
  (`#f2efec`) ou o preto (`#0a0a0a`) da seção onde a imagem será usada —
  confirmar qual das duas cores de fundo da seção fica melhor visualmente
  antes de gerar (a seção atual não define `backgroundColor` explícito, o
  que significa fundo padrão `#0a0a0a` do body — considerar isso ao
  escolher o fundo do PNG).

## Passo 4 — Gerar e validar

1. Montar o prompt de geração seguindo o template da skill (seção 4,
   "Prompt base para imagem gerada"), preenchendo:
   - `Use case: product-mockup`
   - `Asset type: 3:4 (ou 9:16) landing-page feature visual`
   - `Product: Vitrine Detail, catálogo-site para estética automotiva`
   - `Input images: Image 1 = screenshot real do catálogo detail-teste
     (mobile); Image 2 = referência de estilo ilustrativo Airbnb-like`
   - `Primary request:` colocar a tela real dentro de um iPhone realista,
     camada frontal, ocupando ~52% do visual
   - `Contextual art:` pessoa entregando o carro pro dono da estética
     automotiva, cena de atendimento/confiança
   - `Composition:` telefone de um lado, arte do outro, sobreposição sem
     esconder a tela
   - `Identity:` cores vivas e reais da cena (não a paleta da marca)
   - `Avoid: generic dashboards, random screens, childlike decoration,
     logos of other brands, unreadable text, watermark`
2. Usar a skill `imagegen` (mencionada na seção 1 do `padrao-imagens-saas`
   como a ferramenta correta para artes raster novas) para gerar.
3. Salvar em `public/images/sections/catalogo-geral.png` — **não
   sobrescrever** nada existente, esse é um arquivo novo.
4. Rodar o checklist de validação da skill (seção 5) linha por linha antes
   de considerar pronta:
   - Em 1 segundo dá pra entender que é um software e qual resultado ele
     entrega?
   - A tela é a real do produto, ainda legível no tamanho final de uso?
   - O iPhone parece conter a tela de verdade, sem corte/perspectiva
     estranha?
   - A arte de fundo reforça a promessa específica desta seção (não é
     decoração genérica)?
   - Só um protagonista visual — a arte contextual não disputa atenção com
     o mockup?
   - Em mobile (390px), a imagem final continua legível, sem a tela virar
     um detalhe ilegível?
5. Implementar em `src/app/page.tsx`, mantendo a estrutura de moldura já
   existente (`aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl
   border`), só trocando/confirmando o `src` da imagem. Adicionar `alt`
   descritivo real (não genérico) — hoje já existe um `alt`, confirmar que
   ele descreve a imagem final gerada.

## Critério de aceite deste piloto

- Uma única imagem nova em `public/images/sections/catalogo-geral.png`,
  com tela real do catálogo dentro de um iPhone realista + arte lifestyle
  no estilo ilustrativo Airbnb-like, cores vivas, contexto de entrega do
  carro na estética automotiva.
- Passa nos 6 pontos do checklist de validação da skill.
- Renderiza corretamente na seção já existente da página, em mobile e
  desktop.
- **Não seguir para as outras 7 tangibilizações ainda** — esta é a
  validação de estilo. Reporte o resultado (imagem final, onde foi salva,
  se passou no checklist) antes de replicar o padrão nas demais seções.
