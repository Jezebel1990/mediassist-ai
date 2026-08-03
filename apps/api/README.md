# MediAssist AI API

Backend FastAPI do monorepo MediAssist AI.

## Stack

- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic Settings
- SQLAlchemy
- LangChain + FAISS (infraestrutura de Base de Conhecimento)

## Estrutura

```text
apps/api
├── app/
│   ├── api/                 # Agregação de routers HTTP
│   ├── core/                # Configuração e infraestrutura
│   ├── database/            # Sessão e base SQLAlchemy
│   ├── models/              # Entidades de persistência
│   ├── modules/
│   │   └── documents/       # Upload, loaders, chunks e FAISS
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── storage/
│   ├── documents/           # Arquivos enviados
│   └── faiss/               # Índice FAISS persistido
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

## Endpoints principais

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| POST | `/api/documents/upload` | Upload múltiplo |
| POST | `/api/documents/process` | Processar e indexar (atualiza FAISS) |
| POST | `/api/documents/reindex` | Recriar índice FAISS explicitamente |
| GET | `/api/documents` | Listar documentos |
| GET | `/api/documents/status` | Contadores e estado do índice |

Chat / LLM ainda não estão implementados.
