# Controle Financeiro

Sistema de controle financeiro pessoal com backend em FastAPI e frontend em React.

## 🚀 Executando com Docker

### Usando o Script (Recomendado)

Para facilitar a execução, use o script `start.sh`:

```bash
# Desenvolvimento (padrão)
./start.sh

# Ou explicitamente
./start.sh dev

# Produção
./start.sh prod

# Parar containers
./start.sh stop

# Ver logs
./start.sh logs

# Ajuda
./start.sh help
```

### Usando Docker Compose Diretamente

#### Desenvolvimento

Para executar em modo desenvolvimento (com hot reload):

```bash
docker-compose up --build
```

#### Produção

Para executar em modo produção:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 📋 Serviços

- **Frontend**: http://localhost:3000
- **Backend API**: https://solidtechsolutions.com.br/api
- **PostgreSQL**: localhost:5433

## 🔧 Configuração

### Variáveis de Ambiente

Copie o arquivo `env.example` para `.env` e ajuste as configurações conforme necessário:

```bash
cp env.example .env
```

### Variáveis de Ambiente

#### Backend
- `POSTGRES_USER`: Usuário do banco de dados (padrão: finance_admin)
- `POSTGRES_PASSWORD`: Senha do banco de dados (padrão: senha_forte_123!)
- `POSTGRES_DB`: Nome do banco de dados (padrão: finance_control)
- `POSTGRES_HOST`: Host do banco de dados (padrão: db)
- `POSTGRES_PORT`: Porta do banco de dados (padrão: 5432)
- `JWT_SECRET_KEY`: Chave secreta para JWT
- `JWT_ALGORITHM`: Algoritmo JWT (padrão: HS256)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: Tempo de expiração do token (padrão: 30)
- `JWT_REFRESH_TOKEN_EXPIRE_DAYS`: Tempo de expiração do refresh token (padrão: 7)

#### Frontend
- `REACT_APP_API_URL`: URL da API backend (padrão: https://solidtechsolutions.com.br/api)

## 🛠️ Comandos Úteis

### Parar todos os serviços
```bash
docker-compose down
```

### Parar e remover volumes
```bash
docker-compose down -v
```

### Ver logs de um serviço específico
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Executar comandos dentro de um container
```bash
# Backend
docker-compose exec backend python -m pytest

# Frontend
docker-compose exec frontend npm test

# Database
docker-compose exec db psql -U finance_admin -d finance_control
# Ou conectar diretamente via porta 5433:
# psql -h localhost -p 5433 -U finance_admin -d finance_control
```

## 📁 Estrutura do Projeto

```
controle-financeiro/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── domain/         # Lógica de negócio
│   │   ├── infrastructure/ # Configurações e modelos
│   │   ├── interface/      # Controllers e rotas
│   │   └── usecases/       # Casos de uso
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Serviços de API
│   │   └── types/          # Tipos TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Desenvolvimento
├── docker-compose.prod.yml # Produção
└── README.md
```

## 🔍 Health Checks e Resiliência

O sistema inclui health checks e configurações de resiliência para todos os serviços:

### Health Checks
- **Database**: Verifica se o PostgreSQL está respondendo
- **Backend**: Verifica se a API está respondendo em `/health`
- **Frontend**: Verifica se o servidor web está respondendo

### Configurações de Resiliência (Produção)
- **Restart Policies**: `unless-stopped` para todos os serviços
- **Resource Limits**: Limites de CPU e memória configurados
- **Log Rotation**: Logs limitados a 10MB com máximo de 3 arquivos
- **Multiple Workers**: Backend com 4 workers para melhor performance
- **Graceful Shutdown**: Configurações para shutdown suave

## 🚨 Troubleshooting

### Problemas comuns

1. **Porta já em uso**: Verifique se as portas 3000, 8000 e 5433 estão livres
2. **Erro de conexão com banco**: Aguarde o banco inicializar completamente
3. **Frontend não carrega**: Verifique se o backend está rodando na porta 8000

### Logs de erro

Para ver logs detalhados:
```bash
docker-compose logs --tail=100 -f
``` 