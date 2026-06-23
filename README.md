# LUNA ACADEMY

Plataforma de gestão acadêmica para instituições de ensino. Gerencie, acompanhe e otimize o desempenho dos seus alunos em um único lugar.

## O que é

A **LUNA ACADEMY** é um sistema de gestão acadêmica que centraliza a operação escolar — desde a configuração curricular até o registro de aulas e frequência. A aplicação oferece dois portais principais:

- **Painel administrativo** (`/admin`) — configuração de programas, matrizes curriculares, períodos letivos, turmas, alunos, equipe e instituições.
- **Portal do professor** (`/prof`) — acompanhamento de turmas, disciplinas e registro de aulas com chamada e frequência.

O objetivo é unificar matrículas, oferta de turmas, diário de classe e indicadores operacionais em uma experiência coesa, em português.

## Recursos

### Gestão acadêmica

- Programas, matrizes curriculares e disciplinas
- Períodos letivos (com regras de sobreposição e arquivo)
- Turmas, disciplinas ofertadas e grade de horários
- Etapas avaliativas por período

### Pessoas e estrutura

- Cadastro de alunos (incluindo importação em lote)
- Gestão de equipe (administradores e professores)
- Instituições: campus e salas de aula

### Professor

- Visualização de períodos, turmas e disciplinas vinculadas
- Lista de aulas com filtros (registradas, não registradas, fechadas)
- Registro de aulas e chamada/frequência

### Indicadores e integrações

- Dashboard de indicadores do período (gênero, faixa etária, matrículas, turno, frequência, acesso SAD, transferências, comparação entre turmas)
- API SAD (`POST /api/sad`) para consulta externa de status de matrícula — detalhes em [src/app/api/sad/README.md](src/app/api/sad/README.md)

### Acesso e experiência

- Autenticação com perfis (admin, professor, somente leitura)
- PWA com suporte offline (`~offline`)
- Página "Sobre" com versão e contato

## Motivação

A gestão acadêmica costuma estar espalhada em planilhas, sistemas legados e ferramentas que não conversam entre si. Currículo, calendário letivo, oferta de turmas, matrículas e diário de classe acabam em fluxos desconectados — o que dificulta a coordenação e aumenta o risco de inconsistências.

O LUNA ACADEMY nasce para reunir esses processos em uma plataforma única, com visibilidade operacional para quem coordena a instituição: indicadores por período, acompanhamento de acesso via SAD e registro de frequência em tempo real.

O foco é atender escolas e cursos técnicos ou profissionalizantes com uma solução pensada para a realidade brasileira — interface em português, fluxos alinhados ao ciclo letivo e ferramentas que apoiam decisões do dia a dia da secretaria e da coordenação pedagógica.

## Configuração

### Pré-requisitos

- Node.js 22+
- pnpm
- PostgreSQL

### Passos

1. Clone o repositório e instale as dependências:

   ```bash
   pnpm install
   ```

2. Copie `.env.example` para `.env` e preencha as variáveis obrigatórias:

   | Variável | Descrição |
   | --- | --- |
   | `DATABASE_URL` | Conexão com o PostgreSQL |
   | `BETTER_AUTH_SECRET` | Segredo da autenticação |
   | `BETTER_AUTH_URL` | URL base da aplicação para auth |
   | `BETTER_AUTH_TRUSTED_ORIGINS` | Origens confiáveis (separadas por vírgula) |
   | `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |
   | `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc. | Dados do administrador inicial (seed) |
   | `SAD_CANONICAL_CODE` | Chave da API SAD (opcional) |
   | `RESEND_API_KEY`, `EMAIL_FROM` | Envio de e-mail (opcional) |

   Consulte [`.env.example`](.env.example) para o formato de cada variável.

3. Aplique as migrations do banco:

   ```bash
   pnpm exec prisma migrate deploy
   ```

   Em desenvolvimento, você pode usar `pnpm exec prisma migrate dev`.

4. Popule os dados iniciais:

   ```bash
   pnpm seed
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000) — a aplicação redireciona para `/admin`.

### Comandos úteis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção (inclui `prisma migrate deploy`) |
| `pnpm start` | Servidor de produção |
| `pnpm lint` | Verificação de lint |

### Deploy com Docker

O repositório inclui um [`Dockerfile`](Dockerfile) para build e execução em container. Configure as variáveis de ambiente necessárias (incluindo `DATABASE_URL`, `BETTER_AUTH_*` e `SAD_CANONICAL_CODE`) antes do deploy.

### Documentação adicional

- [CHANGELOG.md](CHANGELOG.md) — histórico de versões
- [src/app/api/sad/README.md](src/app/api/sad/README.md) — integração com a API SAD

## Criador

**João Guilherme Araújo Viana**

- LinkedIn: [joão-guilherme-araújo-viana](https://www.linkedin.com/in/jo%C3%A3o-guilherme-ara%C3%BAjo-viana/)
- GitHub: [guilhermecoding](https://github.com/guilhermecoding)
- E-mail: joaoguilhermearaujo1617@gmail.com
