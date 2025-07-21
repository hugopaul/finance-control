# 📚 Controle Financeiro - Backend

## Índice
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Ambiente e Setup](#ambiente-e-setup)
- [Execução e Deploy](#execução-e-deploy)
- [Endpoints da API](#endpoints-da-api)
  - [Autenticação](#autenticação)
  - [Finanças](#finanças)
  - [Dívidas](#dívidas)
  - [Configurações](#configurações)
- [Padrão de Resposta](#padrão-de-resposta)
- [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
- [CORS e Segurança](#cors-e-segurança)
- [Testes](#testes)
- [Dicas para Desenvolvedores](#dicas-para-desenvolvedores)

---

## Visão Geral

Este backend é uma API RESTful para controle financeiro pessoal, permitindo:
- Gerenciar transações (receitas, despesas, parcelamentos, recorrências)
- Controlar dívidas de terceiros (quem te deve)
- Definir metas financeiras
- Consultar relatórios e resumos mensais
- Gerenciar categorias e relacionamentos

---

## Arquitetura

- **Framework:** FastAPI
- **Banco de Dados:** PostgreSQL (SQLAlchemy ORM)
- **Autenticação:** JWT (Bearer)
- **Estrutura:** Clean Architecture (domain, usecases, infrastructure, interface)
- **Serialização:** Pydantic (DTOs)
- **CORS:** Habilitado para `http://localhost:3000` (frontend React)
- **Documentação automática:** Swagger/OpenAPI em `/docs`

---

## Ambiente e Setup

1. **Pré-requisitos**
   - Python 3.11+
   - PostgreSQL
   - (Opcional) Node.js para frontend

2. **Instalação**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configuração do Banco**
   - Edite `app/infrastructure/config.py` com suas credenciais.
   - Execute o script `db/init.sql` para criar as tabelas e dados iniciais.

4. **Rodando o Projeto**
   ```bash
   uvicorn app.interface.api.main:app --reload --port 8000
   ```

---

## Execução e Deploy

- **Desenvolvimento:** `uvicorn app.interface.api.main:app --reload --port 8000`
- **Produção:** Use um servidor ASGI como Gunicorn + Uvicorn Worker.
- **CORS:** Já configurado para aceitar requisições do frontend local.

---

## Endpoints da API

### Autenticação

| Método | Rota           | Descrição                |
|--------|----------------|-------------------------|
| POST   | /auth/login    | Login do usuário        |
| POST   | /auth/register | Registro de usuário     |
| GET    | /auth/me       | Dados do usuário logado |
| POST   | /auth/logout   | Logout (placeholder)    |
| POST   | /auth/refresh  | Refresh do token JWT    |

**Exemplo de login:**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "senha123"
}
```

### Finanças

| Método | Rota                        | Descrição                        |
|--------|-----------------------------|----------------------------------|
| GET    | /finance/transactions       | Listar transações                |
| POST   | /finance/transactions       | Criar transação                  |
| PUT    | /finance/transactions/{id}  | Atualizar transação              |
| DELETE | /finance/transactions/{id}  | Deletar transação                |
| GET    | /finance/summary            | Resumo mensal financeiro         |
| GET    | /finance/goals              | Listar metas financeiras         |
| POST   | /finance/goals              | Criar meta financeira            |

### Dívidas

| Método | Rota                        | Descrição                        |
|--------|-----------------------------|----------------------------------|
| GET    | /debts/people               | Listar pessoas                   |
| POST   | /debts/people               | Criar pessoa                     |
| GET    | /debts                      | Listar dívidas                   |
| POST   | /debts                      | Criar dívida                     |
| PATCH  | /debts/{id}/payment         | Atualizar pagamento de dívida    |

### Configurações

| Método | Rota                  | Descrição                        |
|--------|-----------------------|----------------------------------|
| GET    | /config/categories    | Listar categorias                |
| GET    | /config/relationships | Listar tipos de relacionamento   |

---

## Padrão de Resposta

Todas as respostas seguem o padrão:
```json
{
  "success": true,
  "message": "Mensagem de sucesso",
  "data": { ... }
}
```
Em caso de erro:
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": { "campo": ["mensagem"] }
}
```
Os códigos de status HTTP seguem a documentação (`200`, `201`, `400`, `401`, `404`, `500`).

---

## Validações e Regras de Negócio

- **Usuário:** Nome (2-100), email único, senha (6+)
- **Transação:** Valor positivo, tipo válido, categoria existente, data não futura, parcelamento válido
- **Dívida:** Valor positivo, pessoa existente, relacionamento válido, data de vencimento futura (se fornecida)
- **Pessoa:** Nome (2-100), relacionamento válido, email/telefone opcionais

---

## CORS e Segurança

- **CORS:** Aceita requisições de `http://localhost:3000`
- **JWT:** Use o header `Authorization: Bearer <token>`
- **Headers de segurança:** Configurados conforme melhores práticas

---

## Testes

- Use ferramentas como **Swagger UI** (`/docs`), **Postman** ou **Insomnia** para testar os endpoints.
- O backend retorna erros claros e status HTTP apropriados para facilitar o debug.

---

## Dicas para Desenvolvedores

- **Adicione novas features** seguindo a separação de camadas (domain, usecases, infrastructure, interface).
- **Padronize nomes de campos**: camelCase nas respostas da API, snake_case no banco.
- **Atualize a documentação** sempre que alterar contratos de endpoints.
- **Use migrations** para evoluir o banco de dados em produção.
- **Implemente testes automatizados** para endpoints críticos.

---

## Referências

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [Uvicorn Docs](https://www.uvicorn.org/) 