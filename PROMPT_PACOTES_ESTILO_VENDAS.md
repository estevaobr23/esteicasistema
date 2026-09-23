# Card de "Pacote Completo" no padrão de oferta de página de vendas

## Contexto

O card de pacote (`pacotes` em `sectionRenderers`,
`src/components/catalog/CatalogPresentation.tsx`, linhas ~493-566) já evoluiu
bastante: tem badge "Pacote completo", badge "Melhor escolha" no destaque,
preço riscado com % de desconto, checklist colorida do que está incluso, e
CTA verde. Isso já está bom — **não reescreva do zero**, evolua o que existe.

O que falta para esse card ter o nível de conversão de uma oferta de página
de vendas de verdade é inspirado no padrão documentado na skill
`padrao-lowticket` (seção "8. Oferta", ordem interna do "PLANO COMPLETO
(VIP)"), adaptado para serviço com CTA de WhatsApp (sem checkout, sem
decoy/downsell — isso não se aplica aqui, é só a estrutura visual do card
premiado que interessa).

## O que já existe (não reimplementar)

- `p.name`, badge "Pacote completo" — linha 516-517
- Badge "Melhor escolha" no `isRecommended` — linha 513
- `hasDiscount` com riscado + badge "Economize X%" — linha 523
- Preço grande — linha 524
- Checklist com `includedItems` (de `package_benefits` ou serviços incluídos)
  com ✓ colorido — linhas 531-541
- CTA WhatsApp verde com `cta_label` customizável — linhas 545-557
- `PackageMedia` já existe como componente de mídia (imagem/galeria/vídeo do
  pacote) — hoje usado só como thumbnail 16x16 no canto (linha 519)

## O que falta (ordem interna a seguir, adaptada do padrão VIP)

Siga esta ordem dentro do card, só para o pacote marcado como `isRecommended`
(ou para todos, se fizer mais sentido visual — julgue, mas o destaque
"recomendado" precisa continuar claramente mais chamativo que os outros):

1. **Pill de destaque encaixada na borda superior** (já existe como
   "Melhor escolha" — só ajustar posição/estilo pra ficar "encaixada" na
   borda do card, não flutuando acima dela).
2. **Header centralizado**: nome do pacote + badge "Pacote completo" — hoje
   está alinhado à esquerda (linha 514-518), mudar para centralizado no
   card recomendado.
3. **Mockup/imagem do pacote, centralizada e maior** — hoje `PackageMedia`
   aparece como thumbnail pequeno de 64px no canto superior direito (linha
   519). No card recomendado, promover para uma imagem central, maior
   (reaproveitar `PackageMedia`, ajustar props/tamanho), abaixo do header.
4. **Bloco de preço centralizado**:
   - Âncora "De ~~R$ X~~ por apenas" (o riscado já existe, só reorganizar
     texto/posição)
   - Preço grande (já existe)
   - **Adicionar parcelamento**: "ou 12x de R$ X,XX" — calcular a partir do
     preço final (`p.promotional_price ?? p.price`) dividido por 12,
     formatado com `formatBRL`. Se o negócio não configurar parcelamento em
     lugar nenhum do schema hoje, adicionar como texto fixo calculado (não
     precisa virar campo editável nesta rodada, mas deixe fácil de
     transformar em editável depois).
5. **"O que está incluso"** — lista já existe (linhas 531-541), mas
   **alinhada à esquerda** mesmo com o resto do card centralizado (é a regra
   documentada no padrão: card centralizado, lista sempre à esquerda —
   confirma que fica mais legível).
6. **CTA verde** (já existe).
7. **Linha de segurança/confiança abaixo do CTA**: adicionar uma linha
   pequena com 3 itens: 🔒 Atendimento verificado · 🛡️ Garantia de
   satisfação · ⚡ Resposta rápida no WhatsApp (ajuste o texto para fazer
   sentido no contexto de serviço presencial, não produto digital — não
   copie "garantia de 15 dias / devolução de dinheiro" do padrão lowticket,
   isso não se aplica aqui).

## Diferenciação visual do card recomendado vs. os outros

No padrão de referência, o card VIP tem borda de destaque na cor de accent e
avança visualmente sobre os outros. Hoje isso já existe parcialmente
(`md:-translate-y-2`, borda na cor primária). Reforce isso:

- Sombra mais pronunciada no card recomendado (`shadow-xl` ou similar) para
  ele "flutuar" sobre os outros.
- Fundo do card recomendado ligeiramente diferente dos outros (ex.: um tom
  levemente mais claro/mais escuro que o `bg` padrão, ou um leve gradiente
  sutil usando `business.primary_color` em baixa opacidade) — sem exagerar,
  o objetivo é ele se destacar não ficar "gritando".

## Requisitos técnicos

- Mobile-first, testar em 390px. A referência do padrão-lowticket explicita
  que no mobile os planos empilham na mesma ordem — aqui é só um grid de
  pacotes, então garanta que o card recomendado continua legível e com
  hierarquia clara empilhado no mobile (não depende de translate/z-index
  para funcionar, já que não há comparação lado a lado nesse breakpoint).
- Continuar 100% editável: `EditableMedia`/`onFieldTap` já envolve o card
  inteiro (linha 508), manter isso.
- Reaproveitar `formatBRL` (`src/lib/format.ts`), `PackageMedia`,
  `BENEFIT_COLORS`, `WhatsappButton`, `WHATSAPP_GREEN`/`WhatsappIcon` já
  existentes no arquivo — não recriar.
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx`, `npm run build`
  limpos.
- Print antes/depois em 390px e desktop.

## Critério de aceite

- O pacote marcado como recomendado se parece visivelmente com uma "oferta
  de página de vendas" — mockup em destaque, preço ancorado com
  parcelamento, checklist legível, linha de confiança — não só um card de
  produto com um badge a mais.
- Os pacotes não-recomendados continuam com boa leitura, mas claramente
  "um degrau abaixo" visualmente do recomendado.
- Nada quebra no mobile 390px.
