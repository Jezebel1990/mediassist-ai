# MediAssist AI API

Backend FastAPI do monorepo MediAssist AI.

## Stack

- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic Settings
- SQLAlchemy
- LangChain + FAISS + OpenRouter (RAG / Assistente Inteligente)

## Estrutura

```text
apps/api
├── app/
│   ├── api/                 # Agregação de routers HTTP
│   ├── core/                # Configuração e infraestrutura
│   ├── database/            # Sessão e base SQLAlchemy
│   ├── models/              # Entidades de persistência
│   ├── modules/
│   │   ├── auth/            # Cadastro e login
│   │   ├── chat/            # POST /api/chat (facade conversacional)
│   │   ├── documents/       # Upload, loaders, fragmentos e FAISS
│   │   └── rag/             # Retriever e geração
│   ├── services/            # LLM / OpenRouter
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
| GET | `/api/documents/status` | Contadores, `last_indexed_at` e estado do índice |
| PATCH | `/api/documents/{id}` | Renomear documento |
| DELETE | `/api/documents/{id}` | Excluir documento e atualizar índice |
| POST | `/api/chat` | Assistente Inteligente (RAG + OpenRouter) |
| POST | `/api/rag/query` | Consulta RAG (uso interno / testes) |

## Chat (`POST /api/chat`)

Perguntas válidas retornam **HTTP 200** mesmo quando a Base de Conhecimento não possui contexto suficiente:

```json
{
  "success": true,
  "answer": "Desculpe, ainda não tenho essa informação disponível na Base de Conhecimento. Você pode adicionar novos documentos para ampliar meu conhecimento.",
  "sources": []
}
```

- Fontes são deduplicadas por documento; páginas consultadas são agrupadas em `pages`
- Índice ausente ou contexto insuficiente → resposta amigável (não é erro HTTP)
- Falhas reais (OpenRouter, exceções inesperadas) → HTTP 5xx com mensagem genérica; detalhes técnicos ficam apenas nos logs
