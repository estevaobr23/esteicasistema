# Formulários de cadastro: mídia reativa (serviço/pacote) + benefícios do pacote unificados com serviços incluídos

Dois problemas reais, encontrados testando o app de verdade, nos formulários
de **cadastro/edição de serviço e pacote** (`/app/servicos/novo`,
`/app/servicos/[id]`, `/app/pacotes/novo`, `/app/pacotes/[id]`) — **não
confundir com o editor inline do catálogo** (`/app/catalogo`), que já
funciona corretamente e serve de referência de como fazer certo.

---

## Problema 1 — Seletor "Apresentação padrão" não reage à seleção

### Onde

- `src/components/dashboard/ServicoForm.tsx`, linha 134-141 (select) e
  143-172 (campos de mídia).
- `src/components/dashboard/PacoteForm.tsx`, mesmo padrão por volta da
  linha 105 (select) — ler o arquivo para achar os campos de mídia
  correspondentes (imagem, galeria, vídeo).

### O bug, com causa raiz confirmada lendo o código

O `<select name="media_mode">` usa `defaultValue` (não-controlado) **sem**
`value`/`onChange`:

```tsx
<select name="media_mode" defaultValue={initial?.media_mode ?? "single_photo"} className="...">
  <option value="single_photo">Foto única</option>
  <option value="before_after">Antes e depois</option>
  <option value="gallery">Galeria</option>
  <option value="youtube">Vídeo do YouTube</option>
</select>
```

Como não é controlado, o React nunca re-renderiza quando o usuário troca a
opção. E os campos abaixo — `MediaField` "Foto principal", "Antes",
"Depois", bloco de "Galeria", campo de "Vídeo demonstrativo" — são todos
renderizados **incondicionalmente**, sem nenhum `if (mediaMode === "x")`
envolvendo cada um. Resultado: trocar o select não muda nada na tela, todos
os campos de upload aparecem sempre juntos, sem indicar qual é relevante
para o modo escolhido — exatamente o comportamento relatado ("antes e
depois" não muda nada, "galeria" não dá feedback visual de onde
implementar as imagens).

### A referência de como já está certo

`src/components/dashboard/catalog-editor/panels/ServicoMediaEditor.tsx` já
resolve exatamente este problema no editor inline do catálogo: usa
`useState` para o modo de mídia e um grupo de botões (não um `<select>`)
que, ao clicar, muda o estado e condiciona quais campos aparecem:

```tsx
{service.media_mode === "single_photo" && (
  <MediaUploadField label="Foto" ... />
)}
{service.media_mode === "before_after" && (
  <div className="grid grid-cols-2 gap-3">
    <MediaUploadField label="Antes" ... />
    <MediaUploadField label="Depois" ... />
  </div>
)}
{service.media_mode === "gallery" && permiteGaleriaFotos && ( ... )}
{service.media_mode === "youtube" && permiteVideos && ( ... )}
```

**Reproduza esse padrão** em `ServicoForm.tsx` e `PacoteForm.tsx`: transforme
o select de `media_mode` num estado controlado (`useState`, pode manter
`<select>` com `value`/`onChange` ou trocar pelo grupo de botões do
`ServicoMediaEditor.tsx` — mantenha consistência visual com o resto do
formulário, sua escolha), e envolva cada bloco de campo de mídia
(`MediaField`/`UploadBox` "Foto principal", "Antes"/"Depois", "Galeria",
"Vídeo") num `if (mediaMode === "...")` correspondente, escondendo os que
não se aplicam ao modo selecionado.

### Requisitos

- Ao trocar a seleção, os campos de upload mudam **imediatamente** (sem
  submit, sem reload) para mostrar só o que é relevante àquele modo.
- O valor inicial (`initial?.media_mode`) continua sendo respeitado ao
  editar um serviço/pacote existente — o formulário abre já mostrando os
  campos certos para o modo salvo.
- O campo hidden/name `media_mode` continua sendo enviado corretamente no
  submit do form (confirme que a Server Action correspondente,
  `src/app/app/(dashboard)/servicos/actions.ts` e
  `.../pacotes/actions.ts`, continua recebendo o valor certo — não deve
  precisar mudar a action, só o client).
- Não perder dados já preenchidos ao trocar de modo e voltar (ex.: se o
  lead already fez upload de "Antes"/"Depois", trocar pra "Galeria" e
  voltar não deve apagar essas imagens do estado, mesmo que fiquem
  ocultas).
- Testar em mobile 390px — os campos precisam continuar bem organizados
  ao aparecer/sumir.

---

## Problema 2 — Unificar "Serviços incluídos" e "Benefícios visuais" do pacote num único bloco padronizado

### Onde

`src/components/dashboard/PacoteForm.tsx`:
- Bloco "Serviços incluídos" (linha ~158-174): checkboxes de
  `package_services`, os serviços que realmente compõem o pacote.
- Bloco "Benefícios visuais" (linha ~176-189): lista separada e
  independente de `package_benefits` — cada item tem um campo de texto
  livre + um `<select>` de ícone (`ICONS`) + um `<select>` de cor
  (`COLORS`), tudo digitado/escolhido manualmente pelo lead, **sem nenhuma
  relação com os serviços marcados acima**.

### O problema, como o usuário descreveu testando

Hoje o lead precisa: (1) marcar os serviços que o pacote inclui, e depois
(2) digitar de novo, à mão, o texto de cada "benefício visual", escolhendo
um ícone dentre 5 opções (`shield`/`sparkles`/`droplets`/`wand`/`car`) e uma
cor dentre 5 (`cyan`/`violet`/`emerald`/`amber`/`orange`) — um trabalho
redundante e confuso, já que o card final do pacote no catálogo público só
precisa mostrar uma lista com check do que está incluído, não ícones
coloridos variados por item.

### O que já existe e resolve boa parte disso (não reinventar)

`src/components/catalog/CatalogPresentation.tsx`, dentro do renderer
`pacotes` (~linha 544), **já tem um fallback pronto**: quando
`package_benefits` está vazio, ele monta a lista de exibição a partir dos
nomes dos serviços incluídos (`serviceNames`, derivado de
`package_services`), com cor fixa `BENEFIT_COLORS.emerald`:

```tsx
const includedItems = p.package_benefits?.length
  ? p.package_benefits.slice(0, 6).map((benefit) => ({ id: benefit.id, label: benefit.label, color: BENEFIT_COLORS[benefit.color_key] ?? BENEFIT_COLORS.emerald }))
  : serviceNames.slice(0, 6).map((label, index) => ({ id: `${p.id}-${index}`, label, color: BENEFIT_COLORS.emerald }));
```

Ou seja: a lógica de "gerar a lista automaticamente a partir dos serviços
marcados" já existe no código de renderização — só o **formulário de
cadastro** está complicando desnecessariamente, oferecendo uma segunda
forma manual e paralela.

### O que fazer

1. **Remover o bloco "Benefícios visuais" (ícone/cor por item) do
   formulário.** Não precisa mais escolher ícone nem cor — padronizar
   sempre com o emoji/ícone de check ✅ (verde), sem seletor.
2. **Um único bloco visual** no formulário, algo como "O que está incluído
   no pacote" (renomeie como fizer sentido), que:
   - Lista os serviços do negócio como checkboxes (reaproveitar a UI que já
     existe em "Serviços incluídos", linha ~158-174) — marcar um serviço
     já o inclui automaticamente na lista de "incluído" exibida no card do
     pacote no catálogo, com ✅ check verde, sem passo extra.
   - Mantenha um campo opcional de texto livre abaixo (ou dentro do mesmo
     bloco) para o lead adicionar até 2-3 itens extras que não são
     "serviços" cadastrados por si só (ex.: "Prioridade no agendamento",
     "Brinde de boas-vindas") — também sempre com ✅, sem ícone/cor
     configurável. Avalie se isso é necessário ou se remover
     `package_benefits`/ícones/cores por completo e derivar 100% dos
     serviços marcados já resolve — se optar por manter um campo de texto
     livre extra, ele deve ser bem mais simples que o bloco atual (só
     texto, sem select de ícone/cor).
3. **No banco/schema**: `package_benefits` (tabela) tem colunas
   `icon_key`/`color_key` hoje usadas. Não é obrigatório fazer migration
   removendo essas colunas nesta rodada — mais seguro manter a tabela como
   está e simplesmente parar de oferecer a escolha de ícone/cor no
   formulário, sempre salvando com um `icon_key`/`color_key` fixo (ex.:
   `"check"`/`"emerald"`) quando o lead usa o campo de texto livre extra.
   Se decidir simplificar o schema também, documente a migration
   claramente e confirme que não quebra pacotes já publicados.
4. **Em `CatalogPresentation.tsx`** (renderer `pacotes`, ~linha 544): ajuste
   para que o ✓ exibido seja sempre a cor de check verde padrão (já é o
   fallback `BENEFIT_COLORS.emerald` quando `package_benefits` está vazio
   — confirme que isso continua valendo mesmo quando `package_benefits`
   tiver os itens extras de texto livre, ou seja, o ✅ verde deve ser
   consistente entre "serviço marcado" e "item extra digitado", não só no
   caso vazio).

### Requisitos técnicos

- `src/app/app/(dashboard)/pacotes/actions.ts` — confirmar que o submit
  continua salvando `package_services` (join) e, se mantido, o campo de
  texto livre extra em `package_benefits` com ícone/cor fixos — sem quebrar
  o schema existente.
- Reaproveitar a UI de checkbox de "Serviços incluídos" já existente —
  não recriar do zero.
- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx`, `npm run build`
  limpos.
- Testar de ponta a ponta: cadastrar/editar um pacote marcando serviços,
  salvar, conferir no catálogo público que a lista "O que está incluso"
  aparece com ✅ verde e os nomes corretos dos serviços marcados — sem
  precisar preencher nada a mais.
- Testar em mobile 390px.

## Critério de aceite

- **Problema 1**: trocar "Apresentação padrão" em qualquer um dos dois
  formulários (serviço e pacote) muda instantaneamente quais campos de
  mídia aparecem, sem reload.
- **Problema 2**: existe um único bloco no formulário de pacote para
  configurar o que aparece como "incluído" no card — marcar um serviço já
  basta, sem escolher ícone ou cor à parte. O card do pacote no catálogo
  público mostra a lista com ✅ verde padronizado.
