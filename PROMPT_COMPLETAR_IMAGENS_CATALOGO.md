# Completar o catálogo de demonstração com imagens reais (logo + fotos de depoimento)

## Contexto

O catálogo de teste (`detail-teste`, e o gêmeo `clackcat`) já está quase
100% preenchido com fotos reais de detalhamento automotivo — serviços,
pacotes e portfólio já têm imagem principal, galeria e antes/depois onde
aplicável (confirmado consultando o banco: 8 serviços, 4 pacotes, 6 itens de
portfólio, todos com mídia). **Não mexer nisso, já está correto.**

Restam exatamente dois buracos visíveis, confirmados consultando o banco de
produção:

1. **Logo do negócio** (`businesses.logo_url`) — `null` nos dois negócios de
   teste. É o placeholder "Logo" vazio que aparece no hero do catálogo.
2. **Fotos de perfil dos depoimentos** (`reviews.customer_photo_url`) —
   `null` nas 10 avaliações do `detail-teste` (e provavelmente as mesmas do
   `clackcat`, confirmar).

## Fontes de imagem a usar (não gerar nem baixar nada da internet)

### Logo

Não existe um arquivo de logo pronto no projeto hoje. Criar um logo simples
e genérico para o negócio de demonstração "Detail Teste"/"clackcat" — pode
ser um monograma em SVG/texto estilizado gerado localmente (ex.: as
iniciais do nome do negócio num círculo ou badge, usando a cor primária do
negócio), sem depender de nenhuma API externa de geração de imagem. Depois
de gerado, fazer upload via o mesmo fluxo de upload já usado no projeto
(`uploadBusinessMedia`, bucket `business-media` do Supabase Storage — ver
`src/lib/storage/upload.ts`) e salvar em `businesses.logo_url`.

### Fotos de depoimento

**Já existem 9 fotos de rosto reais e prontas para uso** em:
```
C:\Users\Usuário\.claude\skills\padrao-lowticket\assets\padrao\provas-sociais\
```
(6 mulheres, 3 homens — banco de rostos oficial já usado em outros projetos
deste usuário). Copiar essas 9 imagens, fazer upload via
`uploadBusinessMedia` para o bucket de mídia do negócio, e distribuir uma
foto por depoimento em `reviews.customer_photo_url` — combinando o gênero
da foto com o nome do cliente em cada review (ex.: "Mariana Alves" recebe
foto de mulher, "Rafael Moreira" recebe foto de homem). Como há 10
depoimentos e 9 fotos, repetir uma das fotos (ou usar 2 rostos parecidos)
sem problema.

## O que fazer

1. Consultar o banco (REST API do Supabase, mesmo padrão já usado nesta
   sessão — `SUPABASE_SERVICE_ROLE_KEY` do `.env.local`) para confirmar o
   estado atual de **todos** os negócios existentes (não só `detail-teste`),
   e tratar qualquer outro buraco de imagem real que aparecer na consulta —
   este prompt cobre os dois buracos já identificados, mas confirme que não
   sobrou nenhum outro widget vazio (por exemplo, capa/cover ausente em
   algum negócio, o que já foi checado como preenchido para os 2 atuais mas
   pode não valer para negócios criados depois).
2. Gerar/preparar o logo (ver acima) e fazer upload, atualizando
   `businesses.logo_url` de cada negócio de teste.
3. Copiar as 9 fotos do banco de rostos, fazer upload, e preencher
   `reviews.customer_photo_url` de todas as avaliações sem foto.
4. **Não alterar a estrutura, layout, textos ou organização já existente**
   do catálogo — esta tarefa é exclusivamente sobre preencher campos de
   imagem vazios, não sobre redesenhar nada.
5. Depois de preencher os dados, verificar visualmente (Playwright, viewport
   390px, igual ao padrão já usado nesta sessão) que:
   - O logo aparece no hero do catálogo público, sem placeholder vazio.
   - Os cards de depoimento mostram a foto do cliente (checar se o
     componente que renderiza `avaliacoes` em
     `CatalogPresentation.tsx` já usa `customer_photo_url` — se não usar
     ainda, esse é o único ajuste de código necessário: exibir a foto
     redonda ao lado do nome, reaproveitando o padrão visual já usado em
     outros lugares do catálogo).

## Requisitos técnicos

- Reaproveitar `uploadBusinessMedia`/bucket já existentes — não criar
  pipeline de upload novo.
- Se for necessário tocar em `CatalogPresentation.tsx` para exibir
  `customer_photo_url` (caso ainda não esteja sendo renderizado), seguir o
  padrão visual já usado no projeto (foto redonda pequena, como a logo do
  hero).
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx`, `npm run build`
  limpos.
- Testar visualmente em mobile 390px.

## Critério de aceite

- Nenhum widget do catálogo de demonstração fica com placeholder vazio de
  imagem (logo preenchido, todos os depoimentos com foto).
- Todo o resto do catálogo (textos, layout, seções, cores) permanece
  exatamente como está — este prompt é só sobre completar imagens
  faltantes com material real (UGC), não sobre redesenhar.
