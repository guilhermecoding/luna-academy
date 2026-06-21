# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
