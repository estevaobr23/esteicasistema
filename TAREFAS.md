# Tarefas para outro agente (Codex)

> Contexto: estou (Claude) construindo o editor visual ao vivo do catálogo
> em `/app/catalogo`. A arquitetura já está pronta e funcionando: Context +
> reducer (`src/components/dashboard/catalog-editor/CatalogEditorContext.tsx`),
> preview ao vivo (`src/components/catalog/CatalogPresentation.tsx`), Server
> Action de salvamento (`src/app/app/(dashboard)/catalogo/actions.ts`), e um
> primeiro painel funcionando (`panels/TemplatePanel.tsx` — tema/cores/logo).
> Continuo trabalhando nos próximos painéis (Textos, Seções, Serviços). A
> tarefa abaixo é independente disso — não mexe nos mesmos arquivos — para
> evitar qualquer conflito.

## Tarefa 1: Painel "Avaliações" do editor de catálogo

**Objetivo:** criar `src/components/dashboard/catalog-editor/panels/AvaliacoesPanel.tsx`,
um painel simples que entra no editor visual do catálogo (`/app/catalogo`) e
controla só a **visibilidade** da seção de avaliações no catálogo público —
não duplica o CRUD de avaliações (isso continua em `/app/avaliacoes`, sem
mudanças lá).

### O que fazer

1. Ler `src/components/dashboard/catalog-editor/CatalogEditorContext.tsx`
   para entender o shape do estado: `state.sectionsConfig` é um array de
   `{ id: SectionId, visible: boolean }`, e a action para mudar visibilidade
   já existe: `dispatch({ type: "TOGGLE_SECTION", id: "avaliacoes", visible: boolean })`.
2. Ler `src/components/dashboard/catalog-editor/panels/TemplatePanel.tsx`
   como referência de estilo/padrão (mesmo import de
   `useCatalogEditorState`/`useCatalogEditorDispatch`, mesmas classes
   Tailwind dark-mode do projeto — fundo `neutral-950`/`neutral-900`, texto
   `neutral-300`/`neutral-500`, bordas `neutral-800`).
3. Criar `AvaliacoesPanel.tsx` com:
   - Um toggle (switch ou checkbox estilizado) para mostrar/ocultar a seção
     "Avaliações" no catálogo público — lê `state.sectionsConfig.find(s => s.id === "avaliacoes")?.visible`,
     despacha `TOGGLE_SECTION` ao mudar.
   - Um link/botão "Gerenciar avaliações" que leva para `/app/avaliacoes`
     (usar `next/link`) — é lá que o dono cadastra/edita as avaliações em si,
     este painel só controla se a seção aparece e (se der tempo) a ordem.
   - Se `!limitesDoPlano(business.plano).permiteAvaliacoes` (plano
     Essencial), o toggle deve aparecer desabilitado com um cadeado e texto
     "Disponível no plano Profissional" — não escondido. Ver o padrão exato
     em `src/app/app/(dashboard)/avaliacoes/page.tsx` (já implementado lá
     para a página inteira, adapte para um controle inline aqui). Você vai
     precisar receber o `plano` do negócio como prop — adicione uma prop
     `plano: "essencial" | "profissional"` ao componente.
4. **Não integre o componente em nenhum lugar ainda** (não edite
   `CatalogEditorShell.tsx` nem `page.tsx` de `/app/catalogo` — eu vou
   conectar todos os painéis de uma vez depois, para evitar conflito de
   edição simultânea no mesmo arquivo). Só crie o arquivo do painel,
   standalone, exportado como default.
5. Rode `npx tsc --noEmit` e `npx eslint src --ext .ts,.tsx` na raiz do
   projeto (`C:\Users\Usuário\Desktop\CATALAGO SITE`) para confirmar que
   compila limpo antes de terminar.

### Arquivos de referência (só leitura, não precisa mexer)

- `src/components/dashboard/catalog-editor/CatalogEditorContext.tsx`
- `src/components/dashboard/catalog-editor/panels/TemplatePanel.tsx`
- `src/lib/domain/catalog-sections.ts` (lista de `SectionId`, incluindo `"avaliacoes"`)
- `src/lib/domain/plans.ts` (`limitesDoPlano`, flag `permiteAvaliacoes`)
- `src/app/app/(dashboard)/avaliacoes/page.tsx` (padrão de bloqueio por plano já usado no projeto)

### Critério de pronto

- Arquivo `AvaliacoesPanel.tsx` criado, compilando sem erro de `tsc`/`eslint`.
- Não precisa rodar/testar visualmente (o componente ainda não está
  conectado a nenhuma rota) — só garantir que os tipos batem com o Context
  existente.
