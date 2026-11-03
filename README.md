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

## Prospecção com Google Places API (New)

Na página **Encontrar empresas**, pesquise por texto, categoria e localização (por exemplo, “clínicas odontológicas em Campinas”). A API solicita apenas `id`, nome de exibição, endereço formatado, telefone internacional, site e categoria principal, com até 10 resultados por busca. Cada busca é uma solicitação faturável; consulte preços e cotas no Google Cloud. Não há busca por proximidade porque o app não mantém coordenadas de pesquisa.

Para ativar, habilite **Places API (New)** e o faturamento no projeto Google Cloud e defina `GOOGLE_MAPS_API_KEY` no ambiente do processo da API (ou `GooglePlaces__ApiKey` na configuração .NET). Restrinja a chave à Places API (New) e não a configure no Angular. Sem a credencial a API informa como configurar; erros de cota e chave inválida são apresentados ao usuário sem registrar a chave nem o conteúdo retornado.

Os dados da Places API são exibidos temporariamente para revisão e não são persistidos como lead. A política do Google permite guardar o `place_id` sem limite de retenção; os demais campos não podem ser armazenados de forma permanente neste fluxo. Ao escolher **Revisar e adicionar**, o cadastro fica vazio: informe nome, contato e demais dados obtidos de fonte independente. O `place_id` selecionado é associado ao lead e duplicidades são recusadas. Resultados exibidos levam a atribuição **Google Maps** e não são mantidos após sair da busca/recarregar a página.

Consulte as [políticas e atribuições da Places API](https://developers.google.com/maps/documentation/places/web-service/policies), [Text Search (New)](https://developers.google.com/maps/documentation/places/web-service/text-search) e [preços e campos](https://developers.google.com/maps/documentation/places/web-service/data-fields). O aplicativo precisa também disponibilizar Termos de Uso e Política de Privacidade públicos que incorporem os termos e a política do Google antes de distribuição pública.

# rostdev-portal
