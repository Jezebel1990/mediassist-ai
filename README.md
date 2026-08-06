# MediAssist AI

MediAssist AI é uma plataforma web desenvolvida para auxiliar colaboradores de clínicas e consultórios médicos no acesso rápido e preciso a documentos internos utilizando Inteligência Artificial Generativa.

A solução utiliza a arquitetura **RAG (Retrieval-Augmented Generation)** para responder a perguntas em linguagem natural com base em documentos corporativos previamente processados, reduzindo o tempo gasto na busca manual por informações e centralizando o conhecimento organizacional em um ambiente seguro e intuitivo.

O projeto foi desenvolvido como parte do **Challenge Alura Agentes**, demonstrando a construção completa de um agente inteligente corporativo utilizando **Next.js 15**, **FastAPI**, **LangChain**, **FAISS** e **OpenRouter**.

---

# Demonstração

Aplicação executando em ambiente de produção:

![MediAssist AI Demo](apps/web/public/demo-mediassist.gif)


---

# Arquitetura e Fluxo RAG

```text
                                 ┌───────────────────────────┐
                                 │    Usuário / Cliente      │
                                 └─────────────┬─────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │   Next.js 15 (Frontend)   │
                                 └─────────────┬─────────────┘
                                               │ (HTTP / REST)
                                               ▼
                                 ┌───────────────────────────┐
                                 │     FastAPI (Backend)     │
                                 └─────────────┬─────────────┘
                                               │
        ┌──────────────────────┬───────────────┴───────────────┬──────────────────────┐
        ▼                      ▼                               ▼                      ▼
┌──────────────┐     ┌───────────────────┐           ┌───────────────────┐    ┌──────────────┐
│ Autenticação │     │ Base de Conhecimento │     │ LangChain + FAISS │    │  OpenRouter  │
│ (SQLAlchemy) │     │ (Upload/Gestão)   │           │ (Busca Semântica) │    │  (LLM Models)│
└──────────────┘     └───────────────────┘           └───────────────────┘    └──────────────┘
                                                                                      │
                                                                                      ▼
                                                                           ┌───────────────────┐
                                                                           │Resposta Inteligente│
                                                                           └───────────────────┘
```

---


# Arquitetura de Deploy

A aplicação foi publicada em ambiente cloud utilizando uma arquitetura separada entre frontend, backend e serviços auxiliares.

```text

                    Usuário
                       │
                       ▼
        ┌─────────────────────────┐
        │ Cloudflare Tunnel       │
        │ HTTPS Público           │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │ Oracle Cloud VM         │
        │ Ubuntu Linux            │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────┐        ┌────────────────┐
│ Next.js 15    │        │ FastAPI        │
│ PM2           │        │ PM2            │
│ Frontend      │        │ Backend        │
└───────────────┘        └───────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ OpenRouter API  │
                        │ LLM Generation  │
                        └─────────────────┘



```

### Infraestrutura utilizada
- **Cloud Provider:** Oracle Cloud Infrastructure (OCI)
- **Sistema Operacional:** Ubuntu Server
- **Process Manager:** PM2
- **Proxy/Túnel HTTPS:** Cloudflare Tunnel
- **Backend Runtime:** FastAPI + Uvicorn
- **Frontend Runtime:** Next.js Production Build
- **Versionamento:** Git + GitHub


## Ambiente Cloud

A aplicação foi hospedada em uma máquina virtual da Oracle Cloud Infrastructure.

Configuração utilizada:

- Instância Ubuntu Linux
- Execução dos serviços via PM2
- Gerenciamento de processos do frontend e backend
- Comunicação segura através do Cloudflare Tunnel

![Oracle Cloud VM](apps/web/public/oracle-vm.png)


---



# Estrutura do Monorepo

```text
mediassist-ai/
├── apps/
│   ├── web/                         # Frontend Next.js 15 (App Router)
│   │   ├── app/                     # Rotas: /, /login, /register, /dashboard, /dashboard/chat, /dashboard/knowledge
│   │   ├── components/              # Componentes React (auth, brand, chat, dashboard, documents, ui)
│   │   ├── hooks/                   # Custom Hooks
│   │   ├── lib/                     # Utilitários e armazenamento de autenticação
│   │   ├── services/                # Camada de integração com as APIs REST
│   │   ├── styles/                  # Estilos globais e Tailwind CSS
│   │   ├── types/                   # Definições de tipos TypeScript
│   │   ├── middleware.ts            # Middleware de proteção de rotas privadas
│   │   └── public/                  # Assets estáticos, capturas de tela e demo-documents/
│   │       └── demo-documents/      # Documentos de demonstração (PDF, JSON, CSV, HTML)
│   │
│   └── api/                         # Backend FastAPI (Python 3.12+)
│       ├── app/
│       │   ├── api/                 # Endpoints HTTP (auth, health, documents, chat, rag)
│       │   ├── core/                # Configurações, segurança e variáveis de ambiente
│       │   ├── database/            # Conexão e sessão SQLAlchemy (SQLite)
│       │   ├── models/              # Modelos de dados (User, Document)
│       │   ├── modules/             # Módulos de domínio (auth, documents, rag, chat)
│       │   ├── repositories/        # Camada de acesso ao banco de dados
│       │   ├── schemas/             # Schemas Pydantic para validação de requisições
│       │   └── services/            # Serviços de integração (LLM, Embeddings, FAISS)
│       ├── storage/                 # Armazenamento de arquivos e índice FAISS persistido
│       ├── requirements.txt         # Dependências Python
│       └── .env.example             # Modelo de variáveis de ambiente do backend
│
├── packages/                        # Pacotes compartilhados reservados para expansão
├── package.json                     # Scripts do monorepo (pnpm workspaces)
├── pnpm-workspace.yaml              # Configuração do pnpm workspace
├── pyrightconfig.json               # Configuração do Pyright para o backend Python
└── README.md                        # Documentação principal do projeto
```

---

# Tecnologias Utilizadas

| Camada                          | Tecnologias                                                                          |
| :--------------------------------| :-------------------------------------------------------------------------------------|
| **Monorepo**                    | pnpm Workspaces                                                                      |
| **Frontend**                    | Next.js 15 (App Router), React 19, TypeScript                                        |
| **Interface & UI**              | Tailwind CSS v4, shadcn/ui, Lucide React                                             |
| **Notificações**                | Sonner (Toasts interativos)                                                          |
| **Backend**                     | FastAPI, Python 3.12+, SQLAlchemy, Pydantic v2                                       |
| **Orquestração RAG**            | LangChain, LangChain Community, LangChain Text Splitters                             |
| **Modelos de Linguagem**        | OpenRouter (Modelos gratuitos e corporativos)                                        |
| **Busca Vetorial**              | FAISS (`faiss-cpu`)                                                                  |
| **Processadores de Documentos** | `pypdf`, `pandas`, `openpyxl`, `docx2txt`, `python-pptx`, `unstructured`, `markdown` |
| **Cloud / Deploy**              | Oracle Cloud Infrastructure (OCI), Ubuntu Server, PM2, Cloudflare Tunnel             |
| **Controle de Versão**          | Git, GitHub                                                                          |

---

# Rotas da aplicação

### Rotas públicas

- `/` — Redireciona automaticamente para a página de login.
- `/login` — Página de autenticação de colaboradores.
- `/register` — Página de cadastro de novos usuários.

### Rotas protegidas

- `/dashboard` — Painel principal com métricas gerais e visão do sistema.
- `/dashboard/chat` — Interface do Assistente Inteligente para consulta em linguagem natural.
- `/dashboard/knowledge` — Gerenciamento da Base de Conhecimento (upload, processamento e exclusão de documentos).

---

# Autenticação

A aplicação possui controle de acesso com proteção de rotas (Route Guard):

- **Páginas públicas**: Podem ser acessadas livremente sem necessidade de login (`/`, `/login`, `/register`).
- **Páginas privadas**: Exigem autenticação ativa para visualização (`/dashboard`, `/dashboard/chat`, `/dashboard/knowledge`).
- **Redirecionamento automático**: Usuários não autenticados que tentarem acessar páginas privadas são redirecionados automaticamente para `/login`.
- **Proteção pós-logout**: Após encerrar a sessão (logout), o usuário não consegue acessar novamente páginas protegidas utilizando o botão "Voltar" do navegador ou digitando a URL diretamente.

---

# Endpoints principais da API

### Health

- `GET /health` — Verifica a disponibilidade e o status de funcionamento da API.

### Auth

- `POST /api/auth/register` — Cadastra um novo usuário no sistema.
- `POST /api/auth/login` — Autentica o usuário e retorna os dados do perfil.

### Documents

- `POST /api/documents/upload` — Realiza o envio (upload) de um ou mais documentos.
- `POST /api/documents/process` — Processa documentos pendentes (extração de texto, fragmentação e vetorização).
- `POST /api/documents/reindex` — Recria o índice vetorial com todos os documentos processados.
- `GET /api/documents` — Lista todos os documentos cadastrados na Base de Conhecimento.
- `GET /api/documents/status` — Retorna estatísticas de documentos, total de fragmentos de texto, condição operacional e data da última sincronização.
- `PUT /api/documents/{document_id}` — Atualiza o nome de um documento cadastrado.
- `DELETE /api/documents/{document_id}` — Remove um documento, seu arquivo e atualiza o índice vetorial.

### Chat

- `POST /api/chat` — Endpoint principal do Assistente Inteligente (RAG + OpenRouter) com resposta e fontes deduplicadas.

### RAG

- `POST /api/rag/query` — Endpoint de consulta semântica direta (utilizado para testes e integrações de busca RAG).

---

# Funcionalidades Implementadas

## 1. Autenticação e Gestão de Acesso
- Cadastro de novos colaboradores.
- Autenticação de usuários com suporte a credenciais seguras.
- Encerramento de sessão (Logout) com bloqueio imediato de rotas protegidas.
- Topbar e Sidebar personalizadas com nome, e-mail e avatar do usuário logado.

## 2. Dashboard Informativo
- **Documentos Indexados**: Total de arquivos disponíveis para consulta.
- **Fragmentos de texto**: Total de trechos extraídos e vetorizados na Base de Conhecimento.
- **Condição operacional**: Status da sincronização e integridade do índice vetorial (`Operacional`, `Pendente`, `Vazio`, `Atenção`).
- **Última Atualização**: Data e hora da última sincronização no fuso horário `America/Sao_Paulo`.
- **Filtro por formato**: Filtro dinâmico para visualização rápida por tipo de arquivo.

## 3. Base de Conhecimento (Gestão de Documentos)
- **Upload de Documentos**: Suporte ao envio de múltiplos arquivos simultaneamente.
- **Processamento e Indexação**: Botão **Processar** para extração de texto, geração de fragmentos de texto e vetorização.
- **Atualização da Base**: Botão **Atualizar** para sincronizar e recriar o índice vetorial quando necessário.
- **Renomeação**: Edição do nome do documento diretamente na interface.
- **Exclusão de Documentos**: Remoção com atualização automática da Base de Conhecimento.
- **Badges e Feedback**: Indicadores visuais de formato, status (`Indexado`, `Processado`, `Pendente`, `Erro`) e notificações toast.
- **Formatos suportados**: Suporte completo a arquivos nos formatos `.pdf`, `.csv`, `.docx`, `.xlsx`, `.pptx`, `.json`, `.html` (`.htm`), `.md` (`.markdown`).

## 4. Assistente Inteligente (Chat RAG Conversacional)
- Interface conversacional fluida em linguagem natural.
- Recuperação de contexto semântico utilizando LangChain e busca vetorial.
- Exibição dinâmica de fontes efetivamente utilizadas com indicação de documentos e páginas consultadas.
- **Tratamento gracioso**: Respostas amigáveis quando o assunto não estiver presente na Base de Conhecimento.
- **Indicadores interativos**: Animações de estado do assistente e resposta em tempo real.

---

# Documentos de Demonstração

O projeto inclui documentos de exemplo pré-configurados para facilitar o teste imediato da Base de Conhecimento.

**Localização no projeto:**
```text
apps/web/public/demo-documents/
```

| Arquivo | Formato | Descrição do Conteúdo |
| :--- | :--- | :--- |
| **`Manual_Colaborador.pdf`** | PDF | Regras internas, horários, procedimentos de férias, código de conduta e benefícios da clínica. |
| **`FAQ_Clinica.json`** | JSON | Perguntas frequentes sobre agendamentos, convênios aceitos, cancelamentos e atendimento. |
| **`Contatos_Internos.csv`** | CSV | Tabela com ramais, telefones, e-mails e responsáveis pelos setores da clínica. |
| **`Politica_Privacidade.html`** | HTML | Termos de privacidade, diretrizes da LGPD, segurança de dados de pacientes e contatos DPO. |

---

# Exemplos de Perguntas para Testes

### Testando com `Manual_Colaborador.pdf`
- *Como funciona o procedimento para solicitação de férias?*
- *Qual é a política sobre banco de horas e horas extras?*
- *Como devo proceder em caso de registro de incidentes internos?*
- *Qual é o horário de atendimento e expediente corporativo?*

### Testando com `FAQ_Clinica.json`
- *Quais são os convênios médicos aceitos pela clínica?*
- *Como o paciente pode realizar o cancelamento ou reagendamento de uma consulta?*
- *A clínica realiza atendimento por telemedicina/teleconsulta?*
- *Quais documentos o paciente deve trazer na primeira consulta?*

### Testando com `Contatos_Internos.csv`
- *Qual é o telefone e o responsável pelo setor de TI?*
- *Quem é a responsável pelo setor de Enfermagem e qual o seu ramal?*
- *Qual o e-mail de contato da Recepção e do Financeiro?*
- *Qual o horário de atendimento do Laboratório?*

### Testando com `Politica_Privacidade.html`
- *Como a clínica garante a proteção dos dados pessoais de acordo com a LGPD?*
- *Quais são os direitos dos titulares de dados segundo a política da empresa?*
- *Como posso entrar em contato com o Encarregado de Proteção de Dados (DPO)?*
- *Os dados de saúde são compartilhados com empresas parceiras?*

---

# Requisitos do Ambiente

- **Node.js**: v20.0.0 ou superior
- **pnpm**: v9.0.0 ou superior
- **Python**: v3.12 ou superior
- **Chave de API**: OpenRouter API Key ([Obter chave no OpenRouter](https://openrouter.ai/))

---

# Guia de Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/Jezebel1990/mediassist-ai.git
cd mediassist-ai
```

### 2. Instalar Dependências do Monorepo e Backend
Execute o script unificado na raiz do projeto:
```bash
pnpm install:all
```
*Este comando instala os pacotes Node.js no frontend, cria o ambiente virtual Python (`apps/api/.venv`) e instala as dependências declaradas em `requirements.txt`.*

### 3. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo para criar o `.env` do backend:
```bash
cp apps/api/.env.example apps/api/.env
```

Edite o arquivo `apps/api/.env` e insira sua chave da OpenRouter:
```env
OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
MODEL_NAME=meta-llama/llama-3.3-70b-instruct:free
```

---

# Instruções de Execução

Você pode executar o frontend e o backend simultaneamente ou em terminais separados.

### Opção A: Execução em Terminais Separados (Recomendado)

**Terminal 1 — Backend FastAPI:**
```bash
pnpm dev:api
```
- API disponível em: `http://localhost:8000`
- Swagger / Documentação OpenAPI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

**Terminal 2 — Frontend Next.js:**
```bash
pnpm dev:web
```
- Aplicação Web disponível em: `http://localhost:3000`

---

# Execução em Produção

O projeto também está preparado para execução em ambiente produtivo.

Serviços gerenciados:

```bash
pm2 list
```

---

# Estrutura da Base de Conhecimento e Pipeline RAG

O processamento de documentos ocorre através de um pipeline estruturado:

```text
┌────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│ Documento enviado │ ──► │ Extração & Loader     │ ──► │ Divisão em Fragmentos  │
│ (PDF, JSON, CSV)│     │ (LangChain Loaders)   │     │ (RecursiveTextSplitter)│
└────────────────┘     └───────────────────────┘     └───────────┬────────────┘
                                                                 │
                                                                 ▼
┌────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│ Resposta RAG   │ ◄── │ Recuperação Semântica │ ◄── │ Embeddings & FAISS     │
│ (OpenRouter)   │     │ (FAISS Vector Store)  │     │ (HuggingFace/OpenAI)   │
└────────────────┘     └───────────────────────┘     └────────────────────────┘
```

---

# Tratamento de Erros e Resiliência

A aplicação foi projetada para garantir estabilidade e alta usabilidade:

- **Perguntas Fora de Escopo / Sem Contexto**: Quando a Base de Conhecimento não contém a resposta, o sistema responde educadamente sem gerar alucinações nem falhar a requisição HTTP.
- **Erros de Conexão com LLM**: Exceções no OpenRouter são tratadas no backend, retornando orientações claras para o usuário.
- **Feedback em Tempo Real**: Toasts informativos (Sonner) alertam sobre status de upload, atualizações de índice e eventuais falhas.

---

# Capturas de Tela

### 1. Autenticação (Login e Cadastro)
![Página de Login](apps/web/public/login-page.png)
![Página de Cadastro](apps/web/public/register-page.png)

### 2. Base de Conhecimento (Gestão de Documentos)
![Base de Conhecimento](apps/web/public/knowledge_base.png)

### 3. Assistente Inteligente (Chat RAG e Fontes Consultadas)
![Assistente Inteligente](apps/web/public/assistant.png)
![Fontes Consultadas](apps/web/public/searches.png)

---

# Observações Finais

- O projeto segue a arquitetura monorepo gerenciada por **pnpm Workspaces**.
- O diretório `packages/` está configurado para abrigar futuras bibliotecas compartilhadas.
- Todo o processamento de datas e logs da aplicação segue o fuso horário corporativo `America/Sao_Paulo`.
- Os documentos da pasta `apps/web/public/demo-documents/` podem ser carregados diretamente pela interface para testes imediatos.

---

# Licença

Projeto desenvolvido para fins educacionais e de demonstração prática como parte do **Challenge Alura Agentes**.