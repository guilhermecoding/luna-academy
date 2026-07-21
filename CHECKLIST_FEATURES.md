# Checklist de Features - Luna Edu

Atualizado em: 21/07/2026

## 1. Base do Projeto e Estrutura Inicial

- [x] Projeto configurado com Next.js 16 + React 19 + TypeScript
- [x] Prisma configurado com Postgres e cliente gerado em src/generated/prisma
- [x] Histórico inicial de migrations criado e versionado
- [x] ESLint e Husky configurados

## 2. Autenticacao e Acesso

- [x] Better Auth configurado com adapter Prisma
- [x] Endpoint de autenticacao pronto em /api/auth/[...all]
- [x] Auth client com signIn, signUp, signOut e useSession
- [x] Tela de login funcional no App Router (`/entrar`)
- [x] Protecao de rotas por perfil (admin/professor)
- [ ] Tela de registro publico (sign-up desabilitado intencionalmente)

## 3. Modulo Admin - Painel Base

- [x] Layout administrativo implementado
- [x] Sidebar e navegacao base do admin implementadas
- [x] Redirecionamento inicial do admin para programa/periodos
- [x] Persistencia de programa ativo por cookie
- [x] Indicadores/metricas por periodo e por alunos
- [ ] Criar dashboard inicial unificado do admin com metricas basicas

==================================================

# FLUXO ACADÊMICO CORE

==================================================

## 4. Fase A: Configuração Curricular (Base Teórica)

- **Programas**
  - [x] Listagem, Criacao, Edicao e Exclusao de programas
  - [x] Validacoes Zod e invalidacoes de cache
- **Matrizes / Cursos de Formação (Degrees)**
  - [x] CRUD de Cursos Formativos por Programa
- **Disciplinas Base (Subjects)**
  - [x] CRUD de Disciplinas amarradas nas Matrizes (nome, carga horaria)



## 5. Fase B: Execução Temporal (Calendário)

- **Períodos Letivos (Admin)**
  - [x] CRUD de Períodos gerados por Programa
  - [x] Separacao visual de periodo atual vs arquivo
  - [x] Regra antiburla de sobreposicao de periodos abertos
  - [x] Container principal do período atual na UI
  - [ ] Adicionar card de pendências do período na tela



## 6. Fase C: Oferta Letiva (Encontro da Fase A + B)

- **Infraestrutura**
  - [x] Gestão de Campus (Instituições)
  - [x] Gestão de Salas de Aula (Rooms) e capacidades
  - [ ] Gestão de Blocos como entidade propria (hoje e campo opcional da sala)
- **Oferta de Turmas (ClassGroups / Courses)**
  - [x] Cadastro de Turmas ofertadas (Periodo + Matriz + Turno + Disciplinas; sala na oferta da disciplina)
  - [x] Listagem consolidada de turmas no periodo



## 7. Módulo Secretaria: Alunos e Vínculos

- [x] CRUD de Alunos
- [x] Importacao em massa de alunos via CSV
- [x] Associacao em massa de alunos ao periodo (CPF/matricula ou todos do sistema)
- [x] Vinculo de alunos ao periodo (`StudentPeriod`)
- [x] Modulo de Matriculas (Enrollments) do Aluno na Turma
- [ ] API de consulta de vagas/turmas para comunicação externa
- [x] API SAD de consulta de status de matricula do aluno



## 8. Módulo Professor e Diário de Classe

- [x] Estrutura de rotas e layout do modulo professor
- [x] Dashboard do professor com turmas alocadas
- [x] Registro de Aulas (Lessons)
- [x] Chamada e Frequência (Attendances)
- [ ] Criação de Atividades avaliativas com tipos e pesos (Activities)
- [ ] Lançamento de notas das atividades (ActivityGrades)
- [x] Gestao de etapas (SubPeriods) com peso e status de fechamento
- [ ] Fechamento operacional de etapa na UI + medias de rotina e notas Finais



## 9. Módulos Adicionais e Engajamento

- [x] Gestão de Assistentes de horário/aula (ScheduleAssistant)
- [ ] Sistema de Notificações Internas (Admin/Professores/Alunos)
- [ ] Visualização de Estatísticas Acadêmicas Pessoais do Aluno (Stats)

==================================================

# OPERAÇÃO DE ENGENHARIA

==================================================

## 10. Qualidade e Infra

- [x] README e documentação atualizados
- [ ] Testes automatizados (unitários/integração) nos fluxos críticos
- [x] Seed basico via Prisma (admin inicial)
- [ ] Seed de dados completo para desenvolvimento (professores, turmas, aulas, etc.)
- [ ] Observabilidade, logs e tratamento de erros de produção



## 11. Sprint Atual / Backlog Imediato (Sugestão de Foco)

- [x] 1. Desenvolver a Tela de Login e Guardas de Rota
- [x] 2. Ajustes finais no CRUD de Semestres (Cards e UI do Período Atual)
- [x] 3. Iniciar CRUD de Cursos de Formação (Degrees)
- [x] 4. Iniciar CRUD de Disciplinas Teóricas (Subjects)
- [ ] 5. Card de pendências do período
- [ ] 6. Atividades avaliativas e lançamento de notas
- [ ] 7. Fechamento de etapa/semestre com médias e notas finais
- [ ] 8. API externa de vagas/turmas
- [ ] 9. Notificações internas
- [ ] 10. Testes automatizados e observabilidade
