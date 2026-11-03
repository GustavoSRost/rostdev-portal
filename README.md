# Lead Intelligence

Aplicação local para organizar negócios potenciais, registrar pesquisa e acompanhar o pipeline de prospecção. A aplicação não envia mensagens. O envio de qualquer contato permanece sob ação explícita do usuário.

## Stack

- Angular 22 e TypeScript
- ASP.NET Core / .NET 10
- PostgreSQL 17 com Docker Compose
- Entity Framework Core 10

## Pré-requisitos

- .NET 10 SDK
- Node.js 24 ou superior e npm
- Docker Desktop com Docker Compose

## Executar localmente

Na raiz do projeto, inicie o banco:

```powershell
docker compose up -d postgres
```

Em um terminal, execute a API. Ela aplica as migrações pendentes ao iniciar:

```powershell
dotnet run --project backend/src/LeadIntelligence.Api
```

A API fica em `http://localhost:5000`; o documento OpenAPI de desenvolvimento fica em `/openapi/v1.json`.

Em outro terminal, instale as dependências e inicie o Angular:

```powershell
cd frontend
npm install
npm start
```

Abra `http://localhost:4200`. O PostgreSQL local usa `localhost:5433`, `lead_app` e `lead_intelligence`; a porta do container é 5432. Para mudar a senha, defina `POSTGRES_PASSWORD` antes de iniciar o Compose e passe a mesma senha à API em `ConnectionStrings__Database` ou `DATABASE_URL`.

## Testes e compilação

```powershell
dotnet test LeadIntelligence.slnx
dotnet build backend/src/LeadIntelligence.Api
cd frontend
npm test -- --watch=false
npm run build
```

## Fase 1 incluída

- Cadastro, edição, consulta, exclusão e pesquisa paginada de leads.
- Campos de negócio, origem, contato e localização com validação de entrada.
- Mudanças de status validadas pelo ciclo de vida do lead.
- Painel com contagens e funil do pipeline.
- Migração inicial PostgreSQL aplicada na inicialização da API.
- Interface de lista, cadastro e detalhes em português.

O projeto não contém integrações de fontes externas, envio de mensagens, enriquecimento automático ou dependências de IA.

# rostdev-portal
