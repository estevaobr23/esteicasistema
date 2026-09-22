# Plano de evolução do painel Vitrine Detail

## 1. Objetivo

Transformar o painel atual em uma central de gestão útil, visual e orientada a resultados, sem perder a simplicidade do produto.

O usuário deve conseguir responder rapidamente:

1. Meu catálogo está publicado e completo?
2. Quantas pessoas estão demonstrando interesse?
3. O que precisa ser corrigido agora?
4. Qual conteúdo está trazendo mais resultado?
5. Qual é a próxima ação recomendada?

## 2. Regra de proteção do editor de catálogo

O fluxo atual de construção em `/app/catalogo` será mantido.

Não alterar:

- seleção atual de template;
- Context e reducer do editor;
- organização principal por painéis;
- preview ao vivo;
- `SaveBar` e ação de salvamento completo;
- estrutura pública produzida pelo editor;
- comportamento dos planos dentro do editor.

Melhorias permitidas sem reconstruir o editor:

- cabeçalho mais informativo;
- estado publicado/rascunho;
- botão para abrir o catálogo;
- indicador de última gravação;
- alternância visual entre celular, tablet e desktop;
- checklist de qualidade;
- avisos de conteúdo incompleto;
- ajuda contextual;
- confirmação antes de sair com alterações não salvas.

Todas essas melhorias devem envolver o fluxo existente, e não substituí-lo.

## 3. Princípios de produto e interface

### Estrutura padrão das páginas

Cada seção seguirá a mesma hierarquia:

1. Cabeçalho da página.
2. Ação principal.
3. Até quatro indicadores prioritários.
4. Alertas ou recomendações.
5. Conteúdo principal.
6. Ações secundárias e atalhos relacionados.

### Regras para widgets

- Um widget precisa levar a uma decisão ou ação.
- Máximo de quatro métricas no topo.
- Métricas vazias devem ensinar o que fazer.
- Não repetir na página inteira uma função que já possui tela dedicada.
- Usar cores para significado: verde para saudável, âmbar para atenção, vermelho para problema e neutro para informação.
- Garantir a mesma leitura em celular e desktop.

### Componentes compartilhados

Criar uma pequena biblioteca interna:

- `DashboardPageHeader`
- `MetricCard`
- `StatusBadge`
- `InsightCard`
- `QuickActionCard`
- `SectionHealthCard`
- `EmptyState`
- `LockedFeatureCard`
- `PeriodSelector`
- `DataTableToolbar`
- `ConfirmActionDialog`
- `SkeletonCard`

Esses componentes evitam que cada seção tenha uma estética diferente.

## 4. Arquitetura de navegação

### Desktop

Agrupar os links na barra lateral:

- Visão geral
  - Início
  - Analytics
- Conteúdo
  - Serviços
  - Pacotes
  - Portfólio
- Operação
  - Horários
  - Avaliações
- Aparência
  - Catálogo
- Sistema
  - Configurações

### Mobile

Manter cinco destinos fixos:

- Início
- Serviços
- Catálogo
- Analytics
- Mais

O menu “Mais” reunirá Pacotes, Portfólio, Horários, Avaliações e Configurações.

### Cabeçalho global

Adicionar:

- marca Vitrine Detail;
- nome da estética;
- plano atual;
- status publicado/rascunho;
- atalho para abrir o catálogo;
- menu de conta e saída.

No celular, manter apenas marca, status e menu para não ocupar altura excessiva.

## 5. Fase 0 — fundação visual e técnica

### Objetivo

Preparar componentes e padrões antes de modificar cada tela.

### Tarefas

- Criar componentes compartilhados do painel.
- Definir tokens de espaçamento, borda, cores e tipografia.
- Criar padrão de cabeçalho e ação principal.
- Criar padrão responsivo para os indicadores.
- Criar padrões de carregamento, vazio, erro e bloqueio de plano.
- Criar utilitários de período e comparação percentual.
- Centralizar formatação de números, datas, moeda e porcentagem.
- Definir eventos de analytics internos sem quebrar os eventos existentes.

### Critério de aceite

- Todos os novos widgets usam componentes compartilhados.
- Layout consistente em 360 px, tablet e desktop.
- Nenhuma mudança no editor de catálogo nesta fase.

## 6. Fase 1 — nova página Início

### Objetivo

Fazer a primeira tela funcionar como uma central de controle.

### Cabeçalho

- Saudação contextual.
- Nome da estética.
- selo do plano;
- status do catálogo;
- botão “Abrir catálogo”.

### Indicadores iniciais

Usando os dados já existentes:

- visualizações hoje;
- visualizações nos últimos sete dias;
- cliques no WhatsApp nos últimos sete dias;
- serviço mais acessado.

Quando houver base suficiente, exibir comparação com o período anterior.

### Widget do catálogo

- URL atual;
- copiar link;
- compartilhar no WhatsApp;
- abrir catálogo;
- estado publicado/rascunho;
- botão “Gerenciar endereço”, levando às Configurações.

O campo de endereço não deve ser duplicado com duas regras diferentes. A edição oficial continua nas Configurações; a Início funciona como resumo e atalho.

### Widget do template

- miniatura do template atual;
- nome do template;
- cores principais;
- botão “Personalizar catálogo”.

### Ações rápidas

- novo serviço;
- novo pacote, quando permitido;
- adicionar resultado antes/depois, quando permitido;
- adicionar horários;
- compartilhar catálogo.

### Checklist inteligente

Itens sugeridos:

- catálogo publicado;
- logo configurada;
- capa configurada;
- WhatsApp configurado;
- pelo menos um serviço ativo;
- preços preenchidos;
- horários cadastrados;
- portfólio e avaliações quando disponíveis no plano.

Cada item incompleto deve abrir a tela correta.

### Atividade recente

- acessos recebidos;
- cliques em serviço;
- cliques no WhatsApp;
- horários consultados;
- última alteração do catálogo.

### Critério de aceite

- O usuário entende o estado do catálogo sem navegar.
- As métricas usam apenas dados verdadeiros.
- Todo alerta possui ação de correção.
- Carregamento das métricas não bloqueia o restante da página.

## 7. Fase 2 — Serviços

### Indicadores

- ativos;
- ocultos;
- destacados;
- incompletos;
- limite do plano.

### Lista aprimorada

Cada item deverá exibir:

- miniatura;
- nome e categoria;
- tipo e valor do preço;
- ativo/oculto;
- destaque;
- número de visualizações;
- cliques relacionados ao serviço.

### Funções

- busca por nome;
- filtro por status;
- filtro por preço;
- filtro “precisa de atenção”;
- ordenação manual;
- pré-visualização no catálogo;
- duplicação;
- ativação e ocultação;
- exclusão com confirmação;
- ações em lote;
- criação a partir dos modelos existentes;
- edição rápida de preço e status;
- aviso de foto, descrição ou preço ausente.

### Insights

- serviço mais acessado;
- serviço com maior taxa de clique;
- serviço com visitas, mas sem contato;
- serviço ativo sem imagem;
- serviço sem preço definido.

### Critério de aceite

- As ações existentes continuam funcionando.
- É possível localizar um serviço rapidamente.
- O usuário identifica itens incompletos sem abrir um por um.

## 8. Fase 3 — Pacotes

### Indicadores

- pacotes ativos;
- ocultos;
- em promoção;
- pacote mais acessado.

### Cards aprimorados

- imagem;
- nome;
- quantidade de serviços;
- preço normal;
- preço promocional;
- economia em reais e porcentagem;
- destaque;
- status;
- visualizações e cliques.

### Funções

- busca e filtros;
- ordenar manualmente;
- destacar pacote;
- duplicar;
- pré-visualizar;
- calcular economia automaticamente;
- validar se o promocional é menor que o preço normal;
- etiqueta comercial opcional;
- definir início e fim da promoção;
- visualizar comparação com os serviços separados.

### Dependência de dados

O evento `package_view` atual não salva qual pacote foi acessado. Adicionar `package_id` antes de mostrar ranking real de pacotes.

### Critério de aceite

- Nenhuma métrica de pacote usa estimativa.
- Valores inválidos são impedidos ou explicados.
- Recursos bloqueados pelo plano exibem contexto de upgrade.

## 9. Fase 4 — Portfólio

### Indicadores

- resultados publicados;
- ocultos;
- incompletos;
- visualizações;
- resultado mais acessado.

### Galeria de gestão

- cards maiores com comparação antes/depois;
- busca;
- filtro por categoria, veículo e serviço;
- ordenação manual;
- destaque;
- edição completa;
- ativação/ocultação;
- exclusão com confirmação;
- visualização no catálogo.

### Melhorias de conteúdo

- vincular resultado a um serviço;
- título, veículo, categoria e descrição;
- verificação de resolução;
- aviso de proporções incompatíveis;
- orientação de enquadramento;
- upload sequencial mais claro;
- múltiplos resultados em uma sessão.

### Critério de aceite

- O usuário visualiza o antes/depois antes de publicar.
- Itens incompletos aparecem claramente.
- A ordenação pública respeita a ordem do painel.

## 10. Fase 5 — Horários

### Escopo preservado

Continuar sendo disponibilidade recorrente com confirmação por WhatsApp. Não transformar em agenda completa nesta fase.

### Indicadores

- horários ativos;
- dias com disponibilidade;
- próximo horário sugerido;
- cliques em horários;
- dia mais procurado.

### Funções

- grade semanal visual;
- adicionar vários horários;
- copiar horários de um dia;
- ativar/desativar dia inteiro;
- remover em lote;
- intervalo padrão de 30, 45 ou 60 minutos;
- pré-visualizar no catálogo;
- mensagem padrão para WhatsApp;
- exceções por data;
- feriados e folgas.

### Nova estrutura de dados

Criar `availability_exceptions` para datas específicas, sem alterar o funcionamento da recorrência semanal atual.

### Critério de aceite

- Fica explícito que o horário é uma sugestão.
- Exceções não apagam a configuração semanal.
- O usuário consegue configurar uma semana sem cadastrar horário por horário.

## 11. Fase 6 — Avaliações

### Indicadores

- média das notas;
- total;
- publicadas;
- ocultas;
- aguardando aprovação, após a coleta pública existir.

### Funções administrativas

- editar;
- buscar por cliente;
- filtrar por nota e status;
- ordenar;
- destacar;
- pré-visualizar;
- ativar/ocultar;
- excluir com confirmação;
- copiar pedido de avaliação para WhatsApp.

### Coleta pública

Criar link público opcional com:

- nome;
- nota;
- comentário;
- autorização de publicação;
- proteção contra spam;
- status pendente até aprovação.

### Nova estrutura de dados

Evoluir `reviews` com:

- `status`;
- `featured`;
- `source`;
- `customer_consent_at`;
- `sort_order`.

### Critério de aceite

- Nenhuma avaliação enviada pelo público é publicada automaticamente.
- O dono controla aprovação, visibilidade e ordem.
- O plano Essencial continua respeitando o bloqueio atual.

## 12. Fase 7 — Analytics completo

### Painel principal

- seletor de período;
- visualizações;
- visitantes únicos;
- cliques em serviços;
- cliques no WhatsApp;
- taxa de conversão;
- comparação com o período anterior.

### Relatórios

- evolução diária;
- funil visita → serviço → WhatsApp;
- serviços mais acessados;
- pacotes mais acessados;
- horários mais procurados;
- dias e horas de maior movimento;
- origem do tráfego;
- campanhas UTM;
- dispositivos;
- visitantes online.

### Evolução do evento

Adicionar de forma compatível:

- `visitor_id` anônimo;
- `session_id`;
- `package_id`;
- `path`;
- `referrer`;
- `utm_source`;
- `utm_medium`;
- `utm_campaign`;
- `device_type`;
- `occurred_at` ou uso padronizado de `created_at`.

Não coletar nome, telefone, e-mail ou conteúdo de mensagem do visitante.

### Agregação

Criar consultas agregadas ou funções SQL para:

- resumo por período;
- série diária;
- funil;
- ranking de serviços;
- ranking de pacotes;
- origem do tráfego.

Evitar carregar todos os eventos brutos no navegador.

### Critério de aceite

- Todos os números têm definição documentada.
- “Visitantes únicos” usa `visitor_id`, não visualizações.
- Comparações utilizam períodos de mesma duração.
- Analytics continua restrito ao plano Profissional.

## 13. Fase 8 — visitantes online

### Definição

Um visitante é considerado online quando enviou presença nos últimos cinco minutos.

### Arquitetura

- gerar identificador anônimo;
- iniciar uma sessão ao abrir o catálogo;
- atualizar `last_seen_at` em intervalo controlado;
- encerrar por expiração, sem depender de evento de saída;
- agregar por negócio;
- atualizar o widget por polling ou recurso em tempo real.

### Exibição

- “3 pessoas vendo seu catálogo agora”;
- último acesso;
- seção mais vista no momento;
- nunca identificar pessoas nominalmente.

### Critério de aceite

- O número representa presença recente, não total de page views.
- Sessões inativas expiram automaticamente.
- O mecanismo não gera volume excessivo de escrita.

## 14. Fase 9 — Configurações

### Organização

Separar em grupos:

- Negócio;
- Contato;
- Endereço do catálogo;
- Publicação;
- Plano e conta;
- Preferências;
- Segurança.

### Endereço do catálogo

- disponibilidade do slug;
- prévia da URL;
- validação de caracteres;
- copiar link;
- aviso antes de mudar;
- redirecionamento temporário do endereço antigo;
- registro da última alteração.

### Publicação

- estado atual;
- publicar/despublicar;
- pré-requisitos ausentes;
- data da última publicação;
- abrir catálogo.

### Conta e plano

- plano atual;
- limites;
- benefícios do Profissional;
- upgrade;
- dados da conta;
- encerramento de conta com confirmação forte.

### Critério de aceite

- Nenhum campo aparece em dois lugares como fonte oficial.
- Alterações sensíveis possuem confirmação.
- Mudança de slug preserva acesso pelo endereço anterior por um período definido.

## 15. Fase 10 — domínio próprio

Esta fase é independente do slug existente.

### Estrutura necessária

Criar entidade de domínio com:

- hostname;
- negócio associado;
- status;
- token de verificação;
- data de verificação;
- erro atual;
- domínio principal;
- datas de criação e atualização.

### Fluxo

1. Usuário informa o domínio.
2. Sistema mostra o registro DNS necessário.
3. Sistema verifica a configuração.
4. Domínio fica aguardando, verificado ou com erro.
5. O roteamento resolve o negócio pelo hostname.
6. Certificado e HTTPS são validados.

### Critério de aceite

- O domínio padrão continua funcionando.
- Um domínio não pode pertencer a dois negócios.
- Falha de domínio próprio não derruba o catálogo padrão.

## 16. Fase 11 — melhorias seguras no editor de catálogo

Estas tarefas respeitam integralmente o builder atual.

### Permitidas

- barra de status de publicação;
- botão abrir catálogo;
- data da última gravação;
- preview celular/tablet/desktop;
- checklist de qualidade lateral;
- indicação de seção incompleta;
- aviso de saída com alterações pendentes;
- melhor estado vazio dos painéis;
- atalhos para páginas administrativas existentes;
- acessibilidade dos controles;
- feedback de upload e erro;
- otimização de imagens no preview.

### Fora do escopo

- trocar o Context/reducer por outra arquitetura;
- substituir o preview existente;
- reorganizar completamente os painéis;
- criar um editor livre de arrastar blocos;
- mudar o formato público do catálogo;
- misturar CRUD completo de serviços, pacotes ou avaliações dentro do builder.

## 17. Banco de dados e migrações planejadas

Criar migrações separadas e reversíveis:

1. Analytics enriquecido.
2. Sessões/presença anônima.
3. Exceções de disponibilidade.
4. Coleta e moderação de avaliações.
5. Histórico de slugs.
6. Domínios próprios.

Não agrupar todas as mudanças em uma única migração.

## 18. Segurança e privacidade

- Revalidar plano no servidor em todas as novas ações.
- Manter isolamento por `business_id` e RLS.
- Não confiar em IDs enviados pelo cliente sem validar propriedade.
- Não registrar conteúdo de WhatsApp.
- Usar identificadores anônimos em analytics.
- Limitar endpoints públicos de eventos e avaliações.
- Sanitizar texto de avaliações.
- Confirmar ações destrutivas.
- Não expor métricas de um negócio a outro.

## 19. Desempenho

- Buscar agregados no servidor.
- Executar consultas independentes em paralelo.
- Carregar gráficos pesados apenas quando necessários.
- Paginar listas extensas.
- Usar imagens dimensionadas e responsivas.
- Evitar atualização em tempo real fora do widget de presença.
- Revalidar apenas rotas afetadas.
- Adicionar índices para filtros por negócio, data e tipo de evento.

## 20. Acessibilidade e responsividade

- Navegação completa por teclado.
- `aria-label` em botões de ícone.
- foco visível;
- contraste suficiente;
- gráficos com resumo textual;
- não depender apenas de cor;
- formulários com labels e erros associados;
- áreas de toque adequadas no celular;
- tabelas transformadas em cards no mobile.

## 21. Estratégia de testes

### Por entrega

- TypeScript;
- ESLint;
- build de produção;
- teste manual em mobile e desktop;
- plano Essencial e Profissional;
- negócio publicado e rascunho;
- estados com e sem dados;
- RLS e propriedade do negócio;
- regressão do catálogo público.

### Fluxos essenciais

- criar e editar serviço;
- publicar catálogo;
- trocar template e salvar;
- registrar evento;
- abrir Analytics;
- configurar horário;
- aprovar avaliação;
- mudar slug;
- acessar domínio padrão após mudanças.

## 22. Ordem final de execução

### Entrega 1 — fundação e Início

- componentes compartilhados;
- cabeçalho global;
- nova Início;
- métricas atuais;
- atalhos;
- checklist inteligente;
- template atual;
- atividade recente.

### Entrega 2 — conteúdo

- Serviços;
- Pacotes;
- Portfólio;
- busca, filtros, indicadores e estados incompletos;
- reordenação e pré-visualização.

### Entrega 3 — operação

- Horários;
- Avaliações;
- exceções de datas;
- coleta pública moderada.

### Entrega 4 — analytics

- eventos enriquecidos;
- gráficos;
- funil;
- rankings;
- origem e UTMs;
- visitantes únicos.

### Entrega 5 — recursos avançados

- visitantes online;
- domínio próprio;
- notificações e recomendações.

### Entrega 6 — acabamento do catálogo

- melhorias seguras ao redor do builder atual;
- dispositivos de preview;
- checklist de qualidade;
- prevenção de perda de alterações;
- refinamento de acessibilidade e desempenho.

## 23. Definição de pronto do projeto

O projeto será considerado concluído quando:

- todas as páginas tiverem hierarquia visual consistente;
- a Início funcionar como central de controle;
- métricas forem verdadeiras e explicáveis;
- listas tiverem busca, filtros e estados vazios úteis;
- planos forem aplicados no servidor e na interface;
- o catálogo atual continuar sendo criado pelo mesmo builder;
- o catálogo público não sofrer regressões;
- mobile e desktop estiverem validados;
- TypeScript, ESLint e build passarem;
- funcionalidades avançadas tiverem documentação de uso e privacidade.

