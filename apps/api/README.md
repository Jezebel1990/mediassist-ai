# MediAssist AI API

Backend FastAPI do monorepo MediAssist AI.

## Stack

- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic Settings

## Estrutura

```text
apps/api
├── app/
│   ├── api/          # Rotas HTTP
│   ├── core/         # Configuração e infraestrutura
│   ├── services/     # Casos de uso / regras de negócio
│   ├── models/       # Modelos de domínio / persistência
│   ├── schemas/      # Contratos de entrada e saída
│   ├── utils/        # Utilitários compartilhados
│   └── main.py       # Entry point da aplicação
├── knowledge_base/   # Documentos para futuras implementações de RAG
├── scripts/          # Scripts de desenvolvimento do monorepo
├── requirements.txt
└── .env.example
```

## Setup local

Na raiz do monorepo:

```bash
pnpm install:all
```

Isso cria `apps/api/.venv` e instala as dependências do `requirements.txt`.

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

## Executar

Na raiz do monorepo:

```bash
pnpm dev:api
```

A API sobe em `http://localhost:8000`.

Health check:

```bash
GET /health
```
