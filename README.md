# MediAssist AI

Plataforma web para colaboradores de clínicas consultarem documentos internos com Inteligência Artificial (RAG).

Este repositório contém apenas a estrutura inicial do monorepo. Funcionalidades de negócio ainda não foram implementadas.

## Estrutura do monorepo

```text
/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend FastAPI
├── packages/         # Pacotes compartilhados (futuro)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### Frontend (`apps/web`)

```text
apps/web
├── app/              # App Router (rotas e layouts)
├── components/       # Componentes React (inclui ui/ para shadcn)
├── hooks/            # React hooks
├── lib/              # Utilitários e helpers
├── services/         # Integrações com APIs externas/internas
├── types/            # Tipos TypeScript compartilhados
├── public/           # Assets estáticos
└── styles/           # Estilos globais
```

### Backend (`apps/api`)

```text
apps/api
├── app/
│   ├── api/          # Rotas HTTP
│   ├── core/         # Configuração e infraestrutura
│   ├── services/     # Casos de uso
│   ├── models/       # Modelos de domínio
│   ├── schemas/      # Schemas Pydantic
│   ├── utils/        # Utilitários
│   └── main.py
├── knowledge_base/   # Base para futuros documentos do RAG
├── requirements.txt
└── .env.example
```

## Tecnologias

| Camada | Stack |
| --- | --- |
| Monorepo | pnpm workspaces |
| Web | Next.js 15, React 19, TypeScript, Tailwind CSS, ESLint, Prettier, shadcn/ui (preparado) |
| API | Python 3.12+, FastAPI, Uvicorn, Pydantic Settings |

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Python 3.12+

## Instalação

Na raiz do repositório:

```bash
pnpm install:all
```

Esse comando:

1. Instala as dependências Node.js do monorepo
2. Cria o ambiente virtual em `apps/api/.venv`
3. Instala as dependências Python do `requirements.txt`

Configure o ambiente da API:

```bash
cp apps/api/.env.example apps/api/.env
```

## Execução

### Frontend

```bash
pnpm dev:web
```

Disponível em [http://localhost:3000](http://localhost:3000).

### Backend

```bash
pnpm dev:api
```

Disponível em [http://localhost:8000](http://localhost:8000).

Health check: [http://localhost:8000/health](http://localhost:8000/health)

### Lint (frontend)

```bash
pnpm lint
```

## Observações

- shadcn/ui está configurado (`components.json` + `lib/utils.ts`), sem componentes instalados ainda
- LangChain e RAG não foram implementados nesta etapa
- `packages/` está reservado para bibliotecas compartilhadas futuras
