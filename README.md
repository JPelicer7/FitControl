# FitControl — SaaS para Gestão de Academias

> Plataforma completa para donos de academias e personal trainers gerenciarem alunos, treinos, agenda e financeiro — construída com arquitetura profissional, segurança em múltiplas camadas e stack moderna.

---

## Sobre o Projeto

O FitControl nasceu de uma necessidade real: academias pequenas e médias e personal trainers independentes não têm um sistema próprio acessível e bem feito. A plataforma oferece duas experiências distintas:

- **Dono / Personal Trainer** — visão completa: alunos, treinos, agenda e financeiro
- **Aluno** — visão simplificada: seus treinos vinculados e suas medidas corporais

---

## Stack

### Backend
- **Node.js** + **TypeScript**
- **Fastify** com `@fastify/zod-type-provider` — validação de schemas em todas as rotas
- **Prisma ORM** + **PostgreSQL**
- **Better Auth** — autenticação com sessão server-side
- **Zod** — validação e tipagem de entrada e saída

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Orval** — geração automática de tipos e funções de fetch a partir do OpenAPI do backend
- **date-fns** — manipulação de datas com suporte a timezone

---

## Arquitetura

### Backend — Clean Architecture com UseCases

Cada operação de negócio é encapsulada em um UseCase isolado, com Input/Output DTO tipados. As rotas são responsáveis apenas por autenticação, validação de schema e chamada ao UseCase.

```
src/
  usecases/
    CreateAgendamento.ts
    GetTreinos.ts
    DeleteAlunoTreino.ts
    ...
  routes/
    agenda.ts
    treinos.ts
    alunos.ts
    ...
  lib/
    db.ts        ← instância única do Prisma
  errors/
    index.ts     ← NotFoundError, ForbiddenError, etc.
```

### Frontend — Server Components + Server Actions

O Next.js App Router é usado de forma intencional: fetches acontecem no servidor, o client recebe apenas dados prontos. Mutações passam por Server Actions com validação própria antes de chamar a API.

```
app/
  (dashboard)/
    treinos/
      page.tsx              ← Server Component, fetch no servidor
      actions.ts            ← Server Actions com validação
      _components/
        TreinosListaClient.tsx
        TreinosDetalheClient.tsx
        NovoTreinoDialog.tsx
        ...
    agenda/
    alunos/
    financeiro/
```

---

## Segurança

A segurança foi tratada como prioridade desde a primeira rota, não como adição posterior.

### Multi-tenancy rigoroso
Cada operação valida `academiaId` extraído da sessão do usuário autenticado. Nenhum dado de uma academia é acessível por outra, independente do `id` fornecido.

```ts
// academiaId NUNCA vem do cliente — sempre da sessão
const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
const result = await useCase.execute({ academiaId: session.user.academiaId });
```

### Validação em múltiplas camadas
- **Schema Zod na rota** — rejeita requests malformados antes de qualquer lógica
- **Validação no UseCase** — regras de negócio (ex: aluno pertence à academia?)
- **Validação na Server Action** — sanitização antes de chamar a API
- **Validação no componente** — feedback imediato ao usuário

### Controle de acesso por role
```ts
if (session.user.role !== "Dono") {
  return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
}
```

### Sem vazamento de dados entre rotas
Operações de delete e update sempre verificam ownership antes de executar:
```ts
const agendamento = await prisma.agenda.findUnique({ where: { id } });
if (!agendamento || agendamento.academiaId !== dto.academiaId) {
  throw new NotFoundError("Compromisso não encontrado.");
}
```

---

## Funcionalidades

### Gestão de Alunos
- Cadastro com plano e status
- Filtros e paginação server-side
- Edição inline com validação

### Treinos
- Criação de treinos com banco global de exercícios
- Adição de exercícios com séries, repetições e carga
- Vinculação e desvinculação de alunos
- Edição e remoção de exercícios do treino
- Exportação de PDF de treinos

### Agenda
- Calendário mensal com navegação
- Timeline do dia com categorias visuais (Personal, Avaliação, Reunião, Outro)
- Aviso de sobreposição de horários sem bloqueio
- Vínculo opcional com aluno cadastrado
- Tratamento correto de timezone (GMT-3 / America/Sao_Paulo)

### Financeiro
- Visão de receitas, despesas e lucro líquido
- Gráfico de despesas por categoria
- Listagem de transações com filtro por status

---

## Padrões Técnicos

**Server Actions tipadas com retorno padronizado**
```ts
export async function criarTreinoAction(body: CreateTreinoBody) {
  if (!body.nome?.trim() || body.nome.trim().length < 2)
    return { sucesso: false, mensagem: "Nome inválido." };
  // ...
  return { sucesso: true, id: response.data.id };
}
```

**Queries paralelas com Promise.all**
```ts
const [listResponse, exerciciosResponse, alunosResponse] = await Promise.all([
  getTreinos(),
  getExercicios(),
  getUsers({ Status: "Ativo", limit: 100 }),
]);
```

**Tratamento correto de timezone**
```ts
// frontend — envia com offset explícito
const dataComOffset = `${form.data}T${form.hora}:00-03:00`;

// backend — recebe e converte para UTC automaticamente via z.coerce.date()
data: z.coerce.date()
```

**Tipos gerados automaticamente via Orval**
Toda alteração no backend gera novos tipos TypeScript no frontend automaticamente, eliminando inconsistências entre camadas.

---

## Próximos Passos

- [ ] Visão do aluno (treinos e medidas vinculadas)
- [ ] Rate limiting nas rotas da API
- [ ] Notificações de compromissos
- [ ] Utilização de ChatBot para realizar tarefas

---

## Autor

**João Pelicer** — Desenvolvedor 
Graduado em Ciência da Computação — URI (Rio Grande do Sul)  

