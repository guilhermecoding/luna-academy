# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.7.7] - 2026-07-21

### Corrigido

- Geração de aulas a partir da grade horária deixava de incluir o último dia do período (ex.: sábado final omitido); as datas de início/fim do período passam a ser interpretadas em calendário UTC

## [1.7.6] - 2026-07-21

### Alterado

- Nome da aplicação no metadata (`APP_NAME`): "LUNA ACADEMY" → "Luna Academy"

### Corrigido

- Páginas admin e perfil do professor envolvidas em `Suspense` com `PageSkeleton`, evitando bloqueio de rota durante o carregamento assíncrono (programas, instituições, salas, períodos, matrizes, disciplinas, horários e novo aluno)

## [1.7.5] - 2026-07-21

### Adicionado

- Aba **Associação em Massa** na criação/importação de alunos a partir de um período, para vincular alunos já cadastrados via CPF ou matrícula
- Validação da lista colada com boxes scrolláveis de alunos encontrados e de identificadores não encontrados
- Opção **Vincular todos os alunos do sistema**, que oculta o colar de CPF/matrícula e associa todos os alunos existentes ao período (já vinculados são ignorados)

## [1.7.4] - 2026-07-20

### Adicionado

- Aviso fixo na tela de chamada para usuários com acesso **somente leitura**, informando que não é possível realizar chamadas.

## [1.7.3] - 2026-07-20

### Adicionado

- Geração automática de aulas ao salvar a grade horária da disciplina, cobrindo o intervalo do período letivo
- Botão para registrar/sincronizar todas as aulas da grade na página de aulas
- Badge **Removida** em aulas cujo horário foi retirado da grade (a aula permanece no histórico)
- Criação de registros de presença sob demanda ao abrir a chamada, quando a aula ainda não tiver lista

### Alterado

- Grade horária da disciplina passa a ser atualizada de forma incremental (slots mantidos não são recriados do zero)
- Edição de data e horário de aulas com validação de conflito na mesma disciplina (data + horário já existentes)
- Projeção de aulas previstas alinhada ao fuso horário da aplicação

### Corrigido

- Aulas previstas que não apareciam por inconsistência entre data local e UTC na geração do calendário

## [1.7.2] - 2026-07-19

### Alterado

- Disciplinas da matriz curricular passam a ser cadastradas sem vínculo com série ou período
- Na criação de turma, as disciplinas ofertadas são escolhidas manualmente a partir da matriz selecionada
- Telas de turmas e disciplinas deixam de exibir a série vinculada à turma

### Removido

- Configuração de nível/série nas disciplinas da matriz curricular
- Campo de série na turma e geração automática de disciplinas ao criar uma turma

## [1.7.1] - 2026-07-11

### Adicionado

- Plano de fundo SVG (`bg-login.svg`) na página de login, com opacidade reduzida para não competir com o formulário

### Alterado

- Ícones do PWA (`manifest`) e favicon atualizados
- Subtítulo da página SAD: "ciclo" → "período"
- `AdminProgramPage`: redirecionamento envolvido em `Suspense` para evitar bloqueio de rota

### Corrigido

- Lista SAD desatualizada após enturmar ou desenturmar alunos (invalidação da tag de cache `sad-access`)
- Data e horário das exportações PDF/CSV gerados em UTC no servidor; agora usam `APP_TIMEZONE` (`NEXT_PUBLIC_APP_TIMEZONE` com fallback) no rodapé "Gerado em" e no sufixo do nome do arquivo

## [1.7.0] - 2026-07-06

### Adicionado

- Exportação de listas em **CSV** e **PDF** para alunos (período, turma e disciplina) e professores, no painel admin e no portal do professor
- Página SAD: botão para marcar ou retirar manualmente a visualização do resultado por aluno, com confirmação do Gibby
- Indicador visual (ícone **M**) no horário de acesso quando a visualização foi registrada manualmente pelo administrador
- Botão **Entrar** desabilitado na página de login enquanto e-mail ou senha estiverem vazios

### Alterado

- Primeira abertura do site: a splash screen não é mais sobreposta pelo carregamento global da aplicação

### Corrigido

- Logo da Luna nos documentos PDF exportados

## [1.6.0] - 2026-06-25

### Adicionado

- Login social com Google (Better Auth), habilitado quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão configurados
- Botão "Entre com o Google" na página de login, com callback OAuth e tratamento de erros (conta não vinculada, e-mail divergente, etc.)
- Componente `GoogleAccountLink` para vincular e desvincular conta Google no perfil do professor e na edição de membros da equipe
- Utilitários `google-auth.ts` e `login-session.ts` (abas de login, cookie/sessionStorage, redirecionamento pós-login por perfil)
- Gestão de abas **Administrador** / **Professor(a)** no login, com redirecionamento respeitando a aba selecionada
- Mensagem de boas-vindas personalizada com o primeiro nome do usuário após login
- Novas miniaturas na página de login (`Imagem_09`, `Imagem_11`, `Imagem_12`) e atualização das imagens existentes
- API SAD: campo `teachers` (titular + assistentes) em `courses[]` e `schedules[]`, substituindo `teacherName` por slot
- Serviço `accounts.service.ts` para consulta de vínculo com provedor Google
- Estados de carregamento com `Suspense` e `SkeletonForm` nas páginas de criação de administrador e professor
- Variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` documentadas em `.env.example`
- Link da versão na página "Sobre" apontando para as releases no GitHub

### Alterado

- Tema padrão da aplicação: **claro** quando não há preferência salva (antes seguia o sistema)
- Script de inicialização de tema (`theme-script.ts`) alinhado ao novo padrão; opção "Sistema" continua disponível no menu do usuário
- Página de login refatorada com carregamento assíncrono (`Suspense`), layout responsivo e separador condicional entre formulário e Google
- Formulário de login com melhorias de UX (tooltip informativo, fluxo OAuth)
- `GibbyAnimate` com prop `size` personalizável e tamanho padrão reduzido; sombra removida
- `LessonCardList`: data e horário das aulas passam a quebrar linha em telas estreitas (sem corte por `truncate`)
- API SAD: invalidação de cache com `revalidateTag` e perfis de vida (`days` / `minutes`) em vez de `updateTag`
- Formulários de edição de perfil e de membro: botão **Cancelar** com link de retorno configurável
- Documentação da API SAD (`README.md`) atualizada para a nova estrutura de professores por slot

### Corrigido

- `AttendanceTable`: estado de alterações pendentes derivado de `localChanges` (evita botão **Salvar Presenças** sem ação)
- **Todos Presentes** / **Todos Ausentes** passam a registrar todos os alunos para permitir fechar a chamada mesmo quando todos já estão presentes por padrão
- Formatação de texto na tabela de acesso SAD do painel admin
- Tratamento de erros na vinculação de conta Google (mensagens amigáveis e logs condicionais)
- Erro de formatação no `README.md`

### Removido

- Campo `schedules[].teacherName` na resposta da API SAD (substituído por `schedules[].teachers`)

## [1.5.0] - 2026-06-23

### Adicionado

- Página de indicadores gerais do período letivo (`/admin/[program]/periodos/[period]/indicadores`) com:
  - Flip cards: total de alunos, média etária, escola de origem, matriculados, aguardando, taxa de matrícula, acesso SAD, total de turmas e média de alunos por turma
  - Gráficos: gênero, faixa etária, status de matrícula, acesso SAD, transferências, distribuição por turno, alunos por turma, frequência, comparação entre turmas e faixa etária por turno
  - Indicadores de tendência comparando com o período anterior
- Serviço `period-indicators.service.ts` com queries agregadas e cache
- Página de indicadores gerais dos alunos (`/admin/alunos/indicadores`) refatorada com flip cards (contagem total, média etária, alunos de outras escolas) e gráficos de gênero e faixa etária com carregamento assíncrono
- Componentes de UI para gráficos: `chart.tsx` (base shadcn/recharts), `NumberTicker` (animação de números), `WrapperFlipCardIndicator` e skeletons `ChartAreaSkeleton` e `FlipCardValueSkeleton`
- Utilitários `age-range.ts`, `period-chart-colors.ts` e hook `use-chart-animation-key.ts`
- Dependência `recharts` 3.8.0
- Botão "Indicadores" na página do período letivo
- `ScheduleTeachersSheet` para atribuição de professores titulares e assistentes por slot de horário
- `schedule-teacher-utils.ts` com funções de agregação, formatação e filtragem por professor
- Exibição de professores (titular e assistentes) na listagem de disciplinas por turma, com modal de detalhamento
- Script `analyze` no `package.json` (`next experimental-analyze`)
- README reescrito com descrição do projeto, recursos, motivação e instruções de uso
- Variáveis CSS de cores para gráficos em `globals.css`

### Alterado

- Professores assistentes passam a ser vinculados ao slot de horário (`Schedule`) em vez da disciplina (`Course`)
- Modelo `CourseAssistant` migrado para `ScheduleAssistant` (`schedule_assistants`)
- Índice único de `Schedule`: removido `(teacherId, dayOfWeek, timeSlotId)`; mantidos `(courseId, dayOfWeek, timeSlotId)` e `(roomId, dayOfWeek, timeSlotId)`
- Campo `school` do modelo `Student` renomeado para `originSchool` (opcional), com migração correspondente
- Formulários de criação/edição de aluno e importação em lote adaptados ao novo campo
- Formulários de criação/edição de disciplina por turma passam a usar `ScheduleTeachersSheet` por slot
- Guards do portal do professor (`teacher-period-guards`) atualizados para considerar assistentes por slot
- Portal do professor: acesso a disciplinas e aulas filtrado por vínculo em slot (titular ou assistente)
- Filtro de aulas: labels ajustados ("Registradas (futuras)", "Não registradas", "Fechadas")
- Estilo do campo de busca em `add-students-to-class-sheet`
- Fallback do `Suspense` na home admin simplificado para `null`
- `pnpm-workspace.yaml` atualizado com configurações adicionais

### Removido

- Página placeholder de indicadores em `/admin/[program]/periodos/[period]/alunos/indicadores` (substituída pela nova rota de indicadores do período)
- Botão "Indicadores" da página de alunos do período
- Modelo/tabela `course_assistants`

### Refatoração

- Página de indicadores de alunos dividida em flip cards e gráficos com componentes client/server separados
- Serviços `courses`, `class-groups`, `programs`, `users` e `students` estendidos para suportar indicadores e a nova estrutura de professores

## [1.4.0] - 2026-06-21

### Adicionado

- Página "Sobre" (`AboutPage`) com versão e contato, acessível pelo admin e pelo portal do professor
- Toggle de visibilidade de senha no formulário de login (com supressão do botão nativo em Edge/Chrome)
- `NextTopLoader` (`nextjs-toploader`) como indicador visual de navegação entre páginas
- Lista filtrada de aulas no portal do professor, com filtros (registradas, não registradas, fechadas) e paginação
- Utilitário `lesson-schedule-utils.ts` para mesclar e ordenar aulas
- Link "Ver todas as disciplinas" na página da turma, com layout responsivo da seção de disciplinas
- Variáveis de ambiente para o administrador inicial do seed (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_CPF`, `ADMIN_PHONE`, `ADMIN_BIRTH_DATE`, `ADMIN_BIO`, `ADMIN_LUNA_ID`) em `.env.example`, com instruções de formatação
- Variável de ambiente `SAD_CANONICAL_CODE` para autenticação da API SAD (chave canônica base64 de 32 bytes)
- Componentes de esqueleto para carregamento: `ButtonSkeleton`, `TimeSlotSkeleton`
- Estados de carregamento com `Suspense` nas páginas de horários e matrizes curriculares do painel admin

### Alterado

- Sidebar do admin refatorada: itens não utilizados removidos, detecção de rota ativa, suporte a itens recolhíveis e estilos consistentes para estados ativo/foco
- Sidebar do professor atualizada com link para "Sobre"
- `NavUser`: label "Perfil" → "Meu Perfil"
- Página de teste substituída pela página offline (`~offline`) em tela cheia
- `ItemPeriod`: ícone de monitoramento trocado por ícone de pesquisa; label "Monitoramento SAD" → "SAD"
- Exibição de ocupação/sobrecarga na listagem de disciplinas por turma (centralização e formato mais claro)
- Tabela de acesso: bordas arredondadas; botão "Visualizados" → "Vistos"
- Fallback do `Suspense` na home do professor simplificado para `null` (sem animação de loading)
- Script de seed (`prisma/seed.ts`) passa a exigir exclusivamente variáveis de ambiente para criar o administrador inicial, com validação de data de nascimento e variáveis obrigatórias
- API SAD: validação passa a usar `SAD_CANONICAL_CODE` em vez do campo `canonicalCode` do modelo `Period`; documentação (`README.md`) atualizada
- `Dockerfile` atualizado com a nova variável `SAD_CANONICAL_CODE`
- Dependência `better-auth` atualizada de `1.6.2` para `1.6.11` (e pacotes relacionados `@better-auth/*`)
- Formatação dos agradecimentos na página "Sobre" (destaque em negrito)

### Removido

- Campo `canonicalCode` do modelo `Period` no `schema.prisma`, com script de migração correspondente

### Refatoração

- Páginas de horários e matrizes divididas em conteúdo assíncrono com fallback de skeleton
- Componentes da página de aulas do professor refatorados para integrar a nova lista filtrada
- Layout da seção de disciplinas na página da turma reorganizado

## [1.3.0] - 2026-06-18

### Adicionado

- Guards de autenticação centralizados (`requireSession`, `requireAdmin`, `requireTeacher`) em `auth-guards.ts`
- Controle de permissão de escrita para perfil `READ_ONLY`:
  - `WriteAccessProvider`, `WritePageGuard` e `CanWrite`
  - Bloqueio de rotas `/novo` e `/editar` via proxy para usuários somente leitura
  - Ocultação de ações de escrita em menus, tabelas e formulários administrativos
- Proteção de Server Actions administrativas com verificação de permissão de admin e escrita
- Controle de acesso de professores a períodos letivos:
  - Bloqueio de períodos finalizados, inexistentes ou sem vínculo com o professor
  - `PeriodAccessGuard` e `teacher-period-guards` no portal `/prof`
- Páginas de erro 404 com componente compartilhado `NotFoundView` (raiz, admin e professor)
- Página de recurso em construção (`BuildFeaturePage`) para rotas de indicadores e etapas avaliativas
- Exibição de percentual de overbooking na listagem de disciplinas por turma
- Página offline (`~offline`) com ícone de desconexão e mensagem aprimorada
- Ações de período letivo atual com controle de permissão de escrita (`CurrentPeriodActions`)

### Alterado

- Imagens da tela de login substituídas e otimizadas (8 variações WebP)
- `IntroSplash` com novo estilo visual e ajustes de espaçamento
- Loading global com logo Gibby e animação `DualArc`
- Terminologia de interface: "Professor" → "Professor(a)"
- Espaçamento do componente `AppSidebar`
- Classes CSS dos cabeçalhos da tabela de salas
- Menus administrativos com flag `requiresWrite` em itens de criação
- Layouts admin e professor passam a fornecer contexto de permissão de escrita
- Componente `Page` com `w-full min-w-0 flex-1` para layout correto dentro do sidebar
- Wrapper de conteúdo no `SidebarAdminBase` com `min-w-0 flex-1`

### Corrigido

- Mensagem de boas-vindas no formulário de login
- Redirecionamento de contas desativadas no proxy com remoção do cookie de sessão
- Acesso indevido a períodos letivos finalizados no portal do professor
- Layout da página 404 encolhida dentro do shell administrativo

### Segurança

- Validação centralizada de administrador em layouts, páginas e Server Actions
- Restrição de operações de escrita para usuários com `systemRole` `READ_ONLY`
- Verificação de sessão ativa antes de operações sensíveis no painel admin

### Refatoração

- Contadores renomeados de "cursos" para "grupos de turmas" nos serviços e tipos de período

## [1.2.1] - 2026-06-15

Versão de manutenção anterior. Consulte o histórico do Git para detalhes (`git log 1.2.0..1.2.1`).
