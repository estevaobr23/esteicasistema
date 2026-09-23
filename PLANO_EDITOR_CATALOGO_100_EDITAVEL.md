# Plano aprofundado — Catálogo 100% editável

## 1. Objetivo

Evoluir o editor atual para um construtor de catálogo baseado em blocos, no qual o cliente consiga:

- adicionar seções a partir de uma biblioteca;
- remover, ocultar, duplicar e reordenar seções;
- escolher diferentes formatos para o mesmo conteúdo;
- editar textos, imagens, vídeos, botões e cores;
- controlar largura, espaçamento, alinhamento e colunas;
- configurar comportamento responsivo com opções seguras;
- visualizar exatamente o resultado final;
- começar por templates com seções reais já selecionadas;
- manter os dados de serviços, pacotes, portfólio, horários e avaliações nas tabelas atuais.

## 2. O que deve permanecer do editor atual

O produto já possui uma boa experiência de edição direta. Esta evolução deve preservar:

- rota `/app/catalogo`;
- preview ao vivo usando o próprio catálogo;
- edição tocando diretamente na prévia;
- `BottomSheet` como painel de edição;
- Context + reducer;
- botão de salvar e indicação de alterações pendentes;
- seleção inicial de template;
- serviços, pacotes, portfólio, horários e avaliações como fontes de dados oficiais;
- catálogo público renderizado pelo mesmo motor usado na prévia.

O sistema não deve virar um editor livre como Canva ou Figma. Ele será um builder estruturado, flexível e seguro.

## 3. Diagnóstico da arquitetura atual

Hoje, `sections_config` contém apenas:

```ts
type SectionConfig = {
  id: SectionId;
  visible: boolean;
};
```

Limitações:

- só existem nove tipos fixos;
- cada tipo pode aparecer apenas uma vez;
- não existe identificador por instância;
- não existe conteúdo personalizado por seção;
- não existe variante visual;
- não existe largura, espaçamento ou alinhamento;
- templates mudam cores e ordem, mas não representam páginas realmente diferentes;
- a miniatura do template é um desenho abstrato, não uma prévia real;
- hero, CTA final e footer estão fora da lista de seções;
- blocos sem dados desaparecem, dificultando configurar antes de cadastrar conteúdo.

## 4. Decisão de arquitetura

Criar um documento versionado chamado `CatalogLayout`.

```ts
type CatalogLayout = {
  schemaVersion: 1;
  templateId: TemplateId;
  global: CatalogGlobalStyle;
  blocks: CatalogBlock[];
};
```

Cada bloco deve possuir uma instância independente:

```ts
type CatalogBlock = {
  instanceId: string;
  type: CatalogBlockType;
  visible: boolean;
  variant: string;
  content: Record<string, unknown>;
  dataSource?: BlockDataSource;
  style: BlockStyle;
  responsive: ResponsiveSettings;
};
```

### Por que `instanceId`

Permite adicionar mais de um bloco do mesmo tipo:

- dois banners em locais diferentes;
- um vídeo institucional e outro de demonstração;
- uma lista de serviços em destaque e outra por categoria;
- dois CTAs com textos diferentes;
- galeria de resultados em mais de uma parte do catálogo.

### Onde salvar

Adicionar em `businesses`:

- `catalog_layout jsonb`;
- `catalog_layout_version integer`;
- `catalog_updated_at timestamptz`;

Em uma fase posterior:

- `catalog_published_layout jsonb` para separar rascunho e versão pública;
- `catalog_revision integer` para controle de concorrência;
- tabela `catalog_layout_history` para restauração de versões.

## 5. Separação entre conteúdo e apresentação

### Conteúdo oficial continua nas tabelas atuais

- serviços → `services`;
- pacotes → `packages`;
- resultados → `portfolio_items`;
- avaliações → `reviews`;
- horários → `availability_slots`;
- dados do negócio → `businesses`.

### O layout guarda referências e preferências

Exemplo para serviços:

```ts
{
  instanceId: "uuid",
  type: "services",
  variant: "cards-grid",
  dataSource: {
    mode: "automatic",
    filter: { category: null, featuredOnly: false },
    limit: 6,
    order: "catalog"
  },
  content: {
    title: "Nossos serviços",
    subtitle: "Escolha seu veículo para ver o valor"
  },
  style: {},
  responsive: {}
}
```

Não copiar os dados completos dos serviços para dentro do JSON. Isso evita divergência entre o painel de Serviços e o catálogo.

### Conteúdo próprio do bloco

Textos, banners, benefícios, FAQ e CTAs personalizados podem ficar no `content` do bloco, pois pertencem àquela instância.

## 6. Biblioteca de seções

## 6.1 Estrutura principal

### Hero

Finalidade: primeira impressão e ação principal.

Variantes:

- centralizado com imagem de fundo;
- dividido: texto de um lado e imagem do outro;
- compacto;
- hero com vídeo;
- hero com galeria curta;
- hero focado em oferta.

Campos:

- logo;
- título;
- descrição;
- destaques;
- imagem ou vídeo;
- botão principal;
- botão secundário;
- alinhamento;
- altura.

O hero passa a ser um bloco obrigatório, mas configurável. Não poderá ser duplicado.

### Barra de anúncio

- texto curto;
- link opcional;
- ícone;
- cor;
- botão fechar opcional;
- posição no topo ou após o hero.

### Banner promocional

Variantes:

- imagem inteira;
- imagem + texto;
- texto + botão;
- oferta com preço;
- banner estreito;
- banner de largura total.

Campos:

- imagem;
- título;
- descrição;
- CTA;
- destino;
- sobreposição;
- posição do conteúdo;
- proporção da imagem.

## 6.2 Serviços e ofertas

### Lista de serviços

Variantes:

- cards em grade;
- lista horizontal;
- carrossel;
- cards compactos;
- tabela de preços;
- categorias com abas;
- serviço em destaque + lista secundária.

Configurações:

- todos, selecionados, categoria ou destaques;
- quantidade;
- ordem;
- mostrar foto;
- mostrar descrição;
- mostrar itens incluídos;
- mostrar preço;
- mostrar botão;
- número de colunas por dispositivo.

### Serviço em destaque

- seleciona um serviço específico;
- imagem grande;
- descrição completa;
- benefícios;
- preço;
- CTA para WhatsApp;
- variantes esquerda/direita/central.

### Pacotes

Variantes:

- cards;
- comparação lado a lado;
- pacote em destaque;
- carrossel;
- tabela de oferta;
- versão compacta.

### Oferta rápida

Bloco manual para campanha:

- título;
- texto;
- preço anterior;
- preço atual;
- validade opcional;
- botão;
- imagem.

Não substitui `packages`; serve para campanhas específicas.

## 6.3 Prova e mídia

### Antes e depois

Variantes:

- sliders em grade;
- um resultado em destaque;
- carrossel;
- comparação lado a lado;
- mosaico por categoria.

### Galeria de imagens

Variantes:

- grade;
- mosaico;
- carrossel;
- faixa horizontal;
- imagem grande com miniaturas.

Fonte:

- itens do portfólio;
- imagens próprias do bloco;
- imagens de um serviço selecionado.

### Vídeo

Variantes:

- vídeo centralizado;
- vídeo + texto lateral;
- vídeo de largura total;
- capa com botão play;
- dois vídeos lado a lado;
- playlist curta.

Fontes:

- YouTube;
- vídeo de apresentação já existente;
- futuramente vídeo hospedado.

Campos:

- título;
- descrição;
- URL;
- poster;
- proporção 16:9, 9:16 ou 1:1;
- autoplay somente sem som e quando tecnicamente seguro;
- CTA opcional.

### Avaliações

Variantes:

- cards;
- carrossel;
- uma avaliação em destaque;
- grade compacta;
- faixa de estrelas + depoimentos.

### Números e resultados

- anos de experiência;
- carros atendidos;
- avaliações;
- nota média;
- garantia ou outros indicadores informados pelo cliente.

Os números manuais precisam de aviso para não inventar promessas.

## 6.4 Conteúdo e confiança

### Sobre o negócio

Variantes:

- texto simples;
- foto + texto;
- história em destaque;
- valores em cards.

### Benefícios

- lista com ícones;
- cards;
- grade;
- faixa horizontal.

Campos repetíveis:

- ícone;
- título;
- texto.

### Como funciona

- três passos;
- linha do tempo;
- cards numerados;
- processo horizontal.

### FAQ

- acordeão;
- duas colunas;
- lista simples.

### Comparação

- plano ou serviço A versus B;
- “processo comum” versus “com a nossa estética”;
- tabela de recursos.

### Marcas e produtos usados

- logos em faixa;
- grade;
- texto + logos.

Não permitir uso de logos sem autorização do cliente.

## 6.5 Conversão e operação

### CTA para WhatsApp

Variantes:

- faixa;
- card central;
- imagem + CTA;
- CTA compacto;
- CTA de largura total.

Campos:

- título;
- descrição;
- texto do botão;
- mensagem pré-preenchida;
- cor;
- imagem opcional.

### Horários disponíveis

- chips;
- grade semanal;
- lista compacta;
- próximo horário em destaque.

### Localização e contato

- endereço simples;
- mapa + informações;
- cartões de contato;
- localização + horário de funcionamento.

### Formulário de interesse

Fase posterior:

- nome;
- WhatsApp;
- veículo;
- serviço;
- observação;
- consentimento.

O envio pode abrir WhatsApp ou registrar lead, conforme configuração.

## 6.6 Estrutura

### Texto livre

- título;
- subtítulo;
- texto rico limitado;
- botão;
- alinhamento.

### Imagem

- imagem simples;
- imagem com legenda;
- imagem com link;
- proporção configurável.

### Divisor

- linha;
- espaço;
- mudança de cor;
- transição visual.

### Colunas de conteúdo

- duas colunas;
- três colunas;
- imagem + texto;
- cards manuais.

Não permitir blocos arbitrários dentro de blocos na primeira versão. Isso evitará complexidade excessiva.

## 7. Controles de layout e responsividade

## 7.1 Largura externa da seção

Oferecer presets seguros:

- tela inteira;
- ampla — máximo aproximado de 1280 px;
- padrão — máximo aproximado de 1024 px;
- compacta — máximo aproximado de 760 px;
 
Não usar campo de pixels livre na primeira versão. Presets evitam layouts quebrados.

## 7.2 Ocupação na grade da página

Quando duas seções puderem ficar lado a lado:

- 100%;
- 75%;
- 66%;
- 50%;
- 33%;
- 25% somente para blocos compactos.

Regras:

- hero, banner full bleed, serviços grandes e footer sempre ocupam 100%;
- no mobile, todos os blocos ficam 100% por padrão;
- o sistema impede combinações que ultrapassem 100% na mesma linha;
- blocos incompatíveis iniciam automaticamente uma nova linha.

## 7.3 Colunas internas

Configurar separadamente:

- celular: 1 ou 2;
- tablet: 1, 2 ou 3;
- desktop: 1, 2, 3 ou 4;
- automático como padrão recomendado.

## 7.4 Espaçamento

Presets:

- sem espaço;
- compacto;
- confortável;
- amplo.

Controles separados:

- espaço superior;
- espaço inferior;
- espaço entre itens.

## 7.5 Alinhamento

- esquerda;
- centro;
- direita;
- vertical no topo, centro ou base quando houver colunas.

## 7.6 Visibilidade responsiva

- todos os dispositivos;
- somente celular;
- somente desktop;
- ocultar no celular;
- ocultar no desktop.

Exibir aviso quando uma configuração fizer o conteúdo desaparecer em algum dispositivo.

## 7.7 Imagens responsivas

- foco da imagem por dispositivo;
- `object-fit`: cobrir ou conter;
- proporção;
- posição do corte;
- altura compacta, média ou alta;
- poster específico para vídeo quando necessário.

## 8. Estilos globais do catálogo

Além dos estilos por seção, criar configurações globais:

- paleta principal e secundária;
- fundo principal e alternativo;
- cor de texto;
- fonte de títulos;
- fonte de textos;
- escala tipográfica;
- arredondamento dos cards;
- intensidade da sombra;
- estilo de botões;
- largura padrão do conteúdo;
- espaçamento padrão;
- animações reduzidas, suaves ou desligadas.

Cada template define os valores iniciais. O cliente pode personalizar depois.

## 9. Experiência de “Adicionar seção”

### Pontos de entrada

- botão fixo “Adicionar seção” no editor;
- botão `+` entre as seções;
- opção “Duplicar” no menu de cada bloco.

### Biblioteca

Abrir um painel com:

- busca;
- categorias;
- miniatura real da seção;
- nome;
- descrição curta;
- selo do plano quando necessário;
- variantes disponíveis;
- botão adicionar.

### Fluxo

1. Usuário toca em “Adicionar seção”.
2. Escolhe o tipo.
3. Escolhe uma variante visual.
4. A seção entra no ponto selecionado.
5. O painel de conteúdo abre automaticamente.
6. O usuário edita e vê a mudança ao vivo.
7. Salva o catálogo.

### Estado vazio real no editor

Quando uma seção baseada em dados não possui conteúdo, o editor deve mostrar um estado configurável:

- “Nenhum pacote cadastrado”; 
- botão “Cadastrar pacote”;
- botão “Escolher outro tipo de seção”.

Esse estado aparece somente no editor. O catálogo público continua omitindo seções sem conteúdo, salvo configuração explícita.

## 10. Menu de ações de cada bloco

Ao selecionar uma seção:

- editar conteúdo;
- editar design;
- editar layout;
- mover para cima;
- mover para baixo;
- arrastar para reordenar;
- duplicar;
- ocultar;
- excluir;
- redefinir estilo da seção;
- salvar como seção reutilizável em fase posterior.

Seções obrigatórias, como hero e footer, não podem ser excluídas; apenas configuradas.

## 11. Painel inferior de edição

Manter o `BottomSheet`, expandindo para quatro abas:

### Conteúdo

- textos;
- mídia;
- botões;
- itens repetíveis;
- fonte de dados;
- filtros e seleção de serviços/pacotes.

### Design

- variante;
- fundo;
- cores;
- bordas;
- sombra;
- estilo de botão;
- tratamento da imagem.

### Layout

- largura externa;
- ocupação na linha;
- colunas internas;
- alinhamento;
- espaçamento;
- comportamento por dispositivo.

### Avançado

- âncora da seção;
- visibilidade por dispositivo;
- atributos de acessibilidade;
- redefinir;
- excluir.

## 12. Templates com pré-seleção real

Cada template passará a definir:

- estilos globais;
- lista real de blocos;
- ordem;
- variantes;
- largura e colunas;
- textos iniciais seguros;
- quais blocos são visíveis;
- regras responsivas.

### Template Clássico Dark

Pré-seleção:

1. Hero central com capa.
2. Benefícios compactos.
3. Serviços em grade.
4. Serviços em destaque.
5. Antes e depois.
6. Pacotes.
7. Avaliações.
8. Horários.
9. Localização.
10. CTA para WhatsApp.

### Template Claro Premium

Pré-seleção:

1. Barra de anúncio.
2. Hero dividido.
3. Serviços em lista visual.
4. Sobre com imagem.
5. Galeria em mosaico.
6. Pacotes em comparação.
7. Avaliações em carrossel.
8. FAQ.
9. Contato e localização.
10. CTA compacto.

### Template Performance GT

Pré-seleção:

1. Hero esportivo de altura alta.
2. Números e resultados.
3. Serviço principal em destaque.
4. Serviços em carrossel.
5. Banner promocional.
6. Antes e depois em destaque.
7. Processo em três passos.
8. Vídeo.
9. Avaliações.
10. CTA de largura total.

### Aplicação de template

Oferecer duas ações distintas:

- Aplicar apenas estilo: preserva blocos, conteúdo e ordem.
- Aplicar template completo: substitui estrutura e estilos, preservando os dados oficiais do negócio.

Antes de substituir a estrutura, mostrar exatamente quais blocos entrarão e quais sairão.

## 13. Pré-visualização verdadeira dos templates

Eliminar `TemplateThumbnail` baseado em retângulos abstratos.

Usar o mesmo motor `CatalogRenderer` da página pública em modo de demonstração.

### Miniatura

- renderizar o catálogo real em escala reduzida;
- usar `pointer-events: none`;
- cortar uma região significativa do hero e das primeiras seções;
- mostrar selo “Exemplo” quando usar dados demonstrativos.

### Prévia expandida

- abrir modal ou tela completa;
- alternar celular e desktop;
- rolar por todas as seções do template;
- permitir escolher somente após visualizar;
- mostrar a lista de seções incluídas.

### Dados usados

- preferir dados reais do negócio quando existirem;
- completar somente lacunas com um conjunto demonstrativo curado;
- nunca exibir caixas vazias ou placeholders genéricos na seleção;
- não salvar dados demonstrativos no negócio.

## 14. Evolução do renderer

Extrair a renderização atual em camadas:

```text
CatalogPresentation
└── CatalogRenderer
    ├── CatalogBlockRenderer
    ├── blocks/HeroBlock
    ├── blocks/ServicesBlock
    ├── blocks/PackagesBlock
    ├── blocks/VideoBlock
    ├── blocks/BannerBlock
    └── demais blocos
```

### Registro de blocos

Criar `block-registry.ts` contendo para cada tipo:

- nome;
- categoria;
- ícone;
- variantes;
- configuração padrão;
- planos permitidos;
- capacidades de layout;
- função de validação;
- renderer;
- editor do conteúdo.

Isso evita grandes `switch` espalhados pelo projeto.

## 15. Estado do editor

Evoluir `EditorState`:

```ts
type EditorState = {
  businessId: string;
  business: BusinessDraft;
  services: ServiceDraft[];
  layout: CatalogLayout;
  selection: { instanceId: string | null };
  history: {
    past: CatalogLayout[];
    future: CatalogLayout[];
  };
  dirty: boolean;
  saving: boolean;
  lastSavedAt: number | null;
  saveError: string | null;
};
```

### Novas actions

- `ADD_BLOCK`;
- `REMOVE_BLOCK`;
- `DUPLICATE_BLOCK`;
- `MOVE_BLOCK`;
- `REORDER_BLOCKS`;
- `UPDATE_BLOCK_CONTENT`;
- `UPDATE_BLOCK_STYLE`;
- `UPDATE_BLOCK_RESPONSIVE`;
- `SET_BLOCK_VARIANT`;
- `TOGGLE_BLOCK`;
- `UPDATE_GLOBAL_STYLE`;
- `APPLY_TEMPLATE_STYLE`;
- `APPLY_TEMPLATE_LAYOUT`;
- `UNDO`;
- `REDO`.

## 16. Salvamento, rascunho e publicação

### Primeira etapa

Manter o botão Salvar atual e gravar `catalog_layout` de forma atômica.

No servidor:

- validar `schemaVersion`;
- validar tipos de bloco;
- remover propriedades desconhecidas;
- validar limites do plano;
- validar propriedade de IDs referenciados;
- limitar número de blocos e itens;
- normalizar layout responsivo;
- revalidar catálogo público.

### Segunda etapa

Separar:

- salvar rascunho;
- publicar alterações;
- descartar rascunho;
- restaurar versão anterior.

Isso evita alterar um catálogo público enquanto o cliente ainda está montando uma nova versão.

## 17. Compatibilidade e migração

Não apagar `sections_config` imediatamente.

### Adaptador legado

Criar função:

```ts
legacySectionsToCatalogLayout(sectionsConfig, business, template)
```

Fluxo:

1. Se `catalog_layout` for válido, usar o layout novo.
2. Caso contrário, converter `sections_config` em blocos equivalentes.
3. Adicionar hero, CTA e footer como blocos protegidos.
4. Salvar no novo formato na primeira edição confirmada.
5. Manter leitura legada por pelo menos uma versão de implantação.

### Mapeamento

- `servicos` → `services`;
- `destaques` → `featured-services`;
- `antes_depois` → `before-after`;
- `branding_video` → `video`;
- `pacotes` → `packages`;
- `horarios` → `availability`;
- `avaliacoes` → `reviews`;
- `sobre` → `about`;
- `localizacao` → `location`.

## 18. Limites e proteção do layout

- máximo inicial de 30 blocos;
- máximo de 10 itens manuais por bloco repetível;
- máximo de um hero;
- máximo de um footer;
- links somente `https`, `mailto`, `tel`, WhatsApp ou âncoras internas;
- bloquear HTML arbitrário;
- vídeos apenas de fontes permitidas;
- validar tamanho e tipo de upload;
- sanitizar textos;
- impedir exclusão acidental com confirmação;
- avisar quando não houver CTA ou contato configurado;
- bloquear combinações responsivas inválidas.

## 19. Plano Essencial e Profissional

Para o catálogo continuar útil no Essencial:

### Essencial

- adicionar blocos básicos;
- editar textos, imagens, largura e espaçamento;
- serviços;
- sobre;
- localização;
- benefícios;
- CTA;
- banner simples;
- limites menores de quantidade e variantes.

### Profissional

- vídeos;
- galerias;
- antes e depois;
- pacotes;
- avaliações;
- carrosséis;
- comparação;
- blocos avançados;
- mais instâncias;
- visibilidade por dispositivo;
- histórico e publicação de rascunho.

O bloqueio deve aparecer dentro da biblioteca com prévia e explicação, não esconder o recurso.

## 20. Responsividade do próprio editor

### Desktop

- preview central;
- painel lateral opcional para edição rápida;
- biblioteca de blocos lateral;
- drag and drop;
- seletor celular/tablet/desktop.

### Mobile

- preview em largura total;
- edição pelo `BottomSheet`;
- botões de mover como alternativa ao arrastar;
- botão fixo “Adicionar seção”;
- seletor de dispositivo não precisa simular desktop em tamanho ilegível; pode abrir uma prévia separada.

## 21. Acessibilidade e SEO

Cada bloco deve definir:

- hierarquia correta de títulos;
- texto alternativo;
- labels de botões;
- contraste;
- foco visível;
- navegação por teclado;
- redução de movimento;
- links seguros;
- imagens dimensionadas;
- carregamento tardio abaixo da dobra.

Adicionar painel de qualidade com avisos:

- mais de um H1;
- imagem sem descrição;
- botão sem destino;
- seção vazia;
- contraste baixo;
- vídeo sem título;
- catálogo sem CTA;
- excesso de blocos pesados.

## 22. Desempenho

- carregar somente renderers dos blocos usados;
- lazy load de vídeos e carrosséis;
- gerar tamanhos responsivos de imagem;
- não montar editores dentro da página pública;
- manter props do catálogo serializáveis;
- evitar dependência pesada para drag and drop na primeira entrega;
- limitar animações;
- medir impacto de cada bloco no bundle.

## 23. Estrutura de arquivos proposta

```text
src/lib/catalog-builder/
  schema.ts
  defaults.ts
  block-registry.ts
  normalize-layout.ts
  legacy-adapter.ts
  template-layouts.ts
  validation.ts

src/components/catalog-builder/
  CatalogRenderer.tsx
  CatalogBlockRenderer.tsx
  EditorCanvas.tsx
  AddBlockButton.tsx
  BlockLibrary.tsx
  BlockToolbar.tsx
  DevicePreview.tsx
  QualityPanel.tsx
  blocks/
    HeroBlock.tsx
    ServicesBlock.tsx
    BannerBlock.tsx
    VideoBlock.tsx
    ...
  editors/
    BlockContentPanel.tsx
    BlockDesignPanel.tsx
    BlockLayoutPanel.tsx
    BlockAdvancedPanel.tsx
```

Os componentes existentes podem ser movidos gradualmente; não fazer uma reescrita única.

## 24. Ordem de implementação

### Entrega 1 — núcleo compatível

- tipos `CatalogLayout` e `CatalogBlock`;
- registro de blocos;
- coluna `catalog_layout`;
- adaptador legado;
- normalização e validação;
- renderer novo envolvendo as seções atuais;
- nenhuma mudança visual obrigatória para catálogos existentes.

### Entrega 2 — adicionar e gerenciar seções

- biblioteca;
- botão entre blocos;
- adicionar;
- remover;
- duplicar;
- mover;
- ocultar;
- estado vazio no editor;
- salvar novo layout.

Blocos iniciais:

- serviços;
- pacotes;
- antes/depois;
- vídeo;
- avaliações;
- sobre;
- localização;
- CTA;
- banner;
- texto livre.

### Entrega 3 — layout e responsividade

- largura externa;
- ocupação na linha;
- colunas internas;
- espaçamento;
- alinhamento;
- visibilidade por dispositivo;
- seletor celular/tablet/desktop;
- validação de combinações.

### Entrega 4 — variantes úteis

- variantes de hero;
- serviços em grid/lista/carrossel;
- pacotes em cards/comparação;
- portfólio em slider/mosaico;
- avaliações em cards/carrossel/destaque;
- vídeo central/dividido/full width;
- banners promocionais;
- benefícios;
- passos;
- FAQ.

### Entrega 5 — templates verdadeiros

- layouts completos por template;
- preview usando o renderer real;
- dados demonstrativos curados;
- preview expandido;
- aplicar apenas estilo;
- aplicar estrutura completa;
- comparação antes de substituir.

### Entrega 6 — segurança editorial

- desfazer/refazer;
- painel de qualidade;
- aviso de saída;
- histórico;
- rascunho separado da publicação;
- restauração de versão.

### Entrega 7 — acabamento

- drag and drop no desktop;
- atalhos de teclado;
- melhor upload e recorte;
- biblioteca de seções salvas;
- duplicar layout;
- testes visuais e de regressão.

## 25. Critérios de aceite principais

- O cliente adiciona uma seção sem sair do preview.
- Mais de uma instância de banner, vídeo, texto ou CTA pode existir.
- Todas as seções podem ser movidas, ocultadas e configuradas.
- Blocos permitidos podem ser duplicados e excluídos.
- Largura e colunas funcionam em celular, tablet e desktop.
- O preview usa exatamente o mesmo renderer do catálogo público.
- Templates mostram catálogo real, não placeholder abstrato.
- Aplicar template oferece preservar estrutura ou substituir estrutura.
- Dados de serviços e pacotes não são duplicados no layout.
- Catálogos antigos continuam funcionando.
- O servidor valida plano, IDs, URLs e limites.
- O editor continua simples no celular.
- TypeScript, ESLint, build e testes visuais passam.

## 26. Primeira entrega recomendada

Começar pela fundação, não pelas dezenas de variantes.

Escopo inicial ideal:

1. Novo modelo de blocos.
2. Adaptador das seções atuais.
3. Biblioteca “Adicionar seção”.
4. Adicionar, mover, duplicar, ocultar e excluir.
5. Blocos Banner, Vídeo, Texto e CTA.
6. Largura em quatro presets.
7. Colunas automáticas por dispositivo.
8. Templates com layouts reais.
9. Prévia real dos templates.

Essa entrega já transforma o produto em um builder flexível sem introduzir a complexidade completa de um editor livre.
