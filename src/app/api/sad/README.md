# API SAD — Synchronous Access to Data

API REST para consulta do status de matrícula de um aluno em um período letivo do Luna Educação.

---

## Endpoint

```
POST /api/sad
```

| Header | Obrigatório | Descrição |
|---|---|---|
| `Authorization` | ✅ | Chave canônica. Aceita `Bearer <chave>` ou `<chave>` diretamente. |
| `Content-Type` | ✅ | `application/json` |

---

## Autenticação

A chave canônica **não** vai no body. Ela deve ser enviada no header `Authorization`.

- Formato: **base64 de 32 bytes** (`crypto.randomBytes(32).toString("base64")`)
- Configuração no servidor: variável de ambiente `SAD_CANONICAL_CODE`
- Exemplo de valor: `k7xR2mP9vQ4sT6uW8yZ0aB1cD3eF5gH7jK9lM1nO3pQ=`

Para gerar uma chave:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Body (JSON)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `cpf` | `string` | ✅ | CPF do aluno. Apenas 11 dígitos numéricos, sem pontuação. |
| `email` | `string` | ✅ | Email cadastrado do aluno no sistema. |
| `periodCode` | `string` | ✅ | Slug do período letivo. Ex: `2025-1`, `primeiro-semestre-2025`. |

### Exemplo de requisição

```bash
curl -X POST https://seu-dominio.com/api/sad \
  -H "Authorization: Bearer k7xR2mP9vQ4sT6uW8yZ0aB1cD3eF5gH7jK9lM1nO3pQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "email": "ana.clara@email.com",
    "periodCode": "2025-1"
  }'
```

---

## Fluxo de validação

A API executa as validações em cascata. Se uma etapa falhar, a resposta é retornada imediatamente.

```
 1. JSON válido?                          → 400 INVALID_BODY
 2. Campos obrigatórios no body?          → 400 MISSING_FIELDS
 3. Header Authorization presente?        → 401 MISSING_AUTH
 4. CPF com 11 dígitos?                   → 422 INVALID_CPF
 5. Email com formato válido?             → 422 INVALID_EMAIL
 6. Chave em formato base64 de 32 bytes?  → 422 INVALID_CANONICAL_CODE
 7. periodCode preenchido?                → 422 INVALID_PERIOD_CODE
 8. SAD_CANONICAL_CODE configurada?       → 500 INTERNAL_ERROR
 9. Chave confere com a env?              → 403 CANONICAL_MISMATCH
10. Período existe no banco?              → 404 PERIOD_NOT_FOUND
11. Aluno existe (CPF + email)?           → 404 STUDENT_NOT_FOUND
12. Aluno vinculado ao período?           → 404 NOT_IN_PERIOD
13. Aluno em alguma turma?                → 200 WAITING / 200 ENROLLED
```

> Ao validar com sucesso, a API atualiza `accessedAt` em `StudentPeriod` com o horário da consulta.

---

## Respostas

### Aluno matriculado — `200 OK`

Retornado quando o aluno possui ao menos uma matrícula em turma do período (`status: "ENROLLED"`).

```json
{
  "success": true,
  "status": "ENROLLED",
  "student": {
    "name": "Ana Clara Silva",
    "phone": "11999001001",
    "originSchool": "Escola Estadual Prof. Maria Luiza"
  },
  "period": {
    "name": "Primeiro Semestre 2025",
    "startDate": "2025-02-01",
    "endDate": "2025-07-15",
    "program": {
      "name": "Luna Educação"
    }
  },
  "classGroups": [
    {
      "name": "1º Ano A",
      "shift": "MORNING",
      "groupLink": "https://chat.whatsapp.com/EXEMPLO",
      "courses": [
        {
          "code": "MAT-1A-2025",
          "name": "Matemática - 1º Ano A",
          "subjectName": "Matemática",
          "shift": "MORNING",
          "room": {
            "name": "Sala 101",
            "block": "A",
            "campus": {
              "name": "Campus Central",
              "address": "Rua das Flores, 123"
            }
          },
          "schedules": [
            {
              "dayOfWeek": "MONDAY",
              "startTime": "08:00",
              "endTime": "09:40",
              "teacherName": "Prof. João Silva",
              "room": {
                "name": "Sala 101",
                "block": "A"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

#### Campos — `ENROLLED`

| Campo | Tipo | Descrição |
|---|---|---|
| `success` | `boolean` | Sempre `true`. |
| `status` | `"ENROLLED"` | Aluno matriculado em ao menos uma turma. |
| `student.name` | `string` | Nome completo do aluno. |
| `student.phone` | `string` | Telefone de contato do aluno. |
| `student.originSchool` | `string \| null` | Escola de origem do aluno. |
| `period.name` | `string` | Nome do período letivo. |
| `period.startDate` | `string` | Data de início (`YYYY-MM-DD`). |
| `period.endDate` | `string` | Data de término (`YYYY-MM-DD`). |
| `period.program.name` | `string` | Nome do programa. |
| `classGroups` | `array` | Turmas em que o aluno está matriculado. |
| `classGroups[].name` | `string` | Nome da turma. |
| `classGroups[].shift` | `string` | Turno: `MORNING`, `AFTERNOON` ou `EVENING`. |
| `classGroups[].groupLink` | `string \| null` | Link do grupo (WhatsApp/Telegram). |
| `classGroups[].courses` | `array` | Disciplinas da turma em que o aluno está matriculado. |
| `courses[].code` | `string` | Código da disciplina. |
| `courses[].name` | `string` | Nome da disciplina ofertada. |
| `courses[].subjectName` | `string` | Nome na matriz curricular. |
| `courses[].shift` | `string` | Turno da disciplina. |
| `courses[].room` | `object \| null` | Sala padrão da disciplina. |
| `courses[].room.campus.name` | `string` | Nome do campus. |
| `courses[].room.campus.address` | `string` | Endereço do campus. |
| `courses[].schedules` | `array` | Grade horária da disciplina. |
| `schedules[].dayOfWeek` | `string` | `MONDAY` a `SUNDAY`. |
| `schedules[].startTime` | `string` | Horário de início. |
| `schedules[].endTime` | `string` | Horário de término. |
| `schedules[].teacherName` | `string \| null` | Nome do professor. |
| `schedules[].room` | `object \| null` | Sala do horário (pode diferir da sala padrão). |

---

### Aluno em espera — `200 OK`

Retornado quando o aluno está vinculado ao período, mas ainda não foi enturmado (`status: "WAITING"`).

```json
{
  "success": true,
  "status": "WAITING",
  "student": {
    "name": "Ana Clara Silva",
    "phone": "11999001001",
    "originSchool": "Escola Estadual Prof. Maria Luiza"
  },
  "period": {
    "name": "Primeiro Semestre 2025",
    "startDate": "2025-02-01",
    "endDate": "2025-07-15",
    "program": {
      "name": "Luna Educação"
    }
  }
}
```

> A resposta `WAITING` possui `student` e `period`, mas **sem** o campo `classGroups`.

---

### Erros

Todas as respostas de erro seguem o formato:

```json
{
  "success": false,
  "error": "Mensagem descritiva do erro em português.",
  "code": "CODIGO_DO_ERRO"
}
```

| HTTP | Código | Descrição |
|---|---|---|
| `400` | `INVALID_BODY` | Corpo da requisição não é JSON válido. |
| `400` | `MISSING_FIELDS` | Um ou mais campos obrigatórios do body (`cpf`, `email`, `periodCode`) não foram enviados. |
| `401` | `MISSING_AUTH` | Header `Authorization` ausente. |
| `422` | `INVALID_CPF` | CPF sem 11 dígitos numéricos. |
| `422` | `INVALID_EMAIL` | Email em formato inválido. |
| `422` | `INVALID_CANONICAL_CODE` | Chave canônica não é base64 válido de 32 bytes. |
| `422` | `INVALID_PERIOD_CODE` | `periodCode` vazio. |
| `403` | `CANONICAL_MISMATCH` | Chave canônica não confere com `SAD_CANONICAL_CODE`. |
| `404` | `PERIOD_NOT_FOUND` | Nenhum período encontrado com o slug informado. |
| `404` | `STUDENT_NOT_FOUND` | Nenhum aluno com a combinação CPF + email informada. |
| `404` | `NOT_IN_PERIOD` | Aluno existe, mas não está vinculado ao período. |
| `500` | `INTERNAL_ERROR` | Erro interno (ex.: `SAD_CANONICAL_CODE` não configurada). |

---

## Exemplos de uso

### JavaScript / TypeScript

```typescript
async function consultarMatricula(
  cpf: string,
  email: string,
  canonicalCode: string,
  periodCode: string,
) {
  const response = await fetch("https://seu-dominio.com/api/sad", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${canonicalCode}`,
    },
    body: JSON.stringify({ cpf, email, periodCode }),
  });

  const data = await response.json();

  if (!data.success) {
    console.error(`Erro [${data.code}]: ${data.error}`);
    return null;
  }

  if (data.status === "WAITING") {
    console.log(`${data.student.name} está em espera.`);
    return data;
  }

  console.log(`${data.student.name} matriculado em ${data.classGroups.length} turma(s).`);
  return data;
}
```

### Python

```python
import requests

response = requests.post(
    "https://seu-dominio.com/api/sad",
    headers={"Authorization": "Bearer k7xR2mP9vQ4sT6uW8yZ0aB1cD3eF5gH7jK9lM1nO3pQ="},
    json={
        "cpf": "12345678901",
        "email": "ana.clara@email.com",
        "periodCode": "2025-1",
    },
)

data = response.json()

if not data["success"]:
    print(f"Erro [{data['code']}]: {data['error']}")
elif data["status"] == "WAITING":
    print(f"{data['student']['name']} está em espera.")
else:
    print(f"{data['student']['name']} está matriculado!")
    for turma in data["classGroups"]:
        print(f"  Turma: {turma['name']}")
```

---

## Segurança

- **Chave canônica**: funciona como API key global da rota. Configurada via `SAD_CANONICAL_CODE` no ambiente do servidor. Deve ser compartilhada apenas com serviços autorizados.
- **Sem IDs internos**: a API não retorna UUIDs do banco — apenas dados de exibição.
- **Validação em cascata**: falhas de autenticação e formato são rejeitadas antes de consultas ao banco.

---

## Notas técnicas

- `periodCode` corresponde ao campo `slug` da tabela `Period`.
- O email é comparado em lowercase após trim.
- Datas retornadas no formato `YYYY-MM-DD`.
- Horários (`startTime`, `endTime`) seguem o formato dos `TimeSlots` do programa.
- A busca de turmas, disciplinas, horários e salas usa uma query otimizada com `select` aninhado do Prisma.
