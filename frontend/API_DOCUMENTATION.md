# 📚 Documentação da API - Controle Financeiro

> **Versão:** 1.1.0  
> **Data:** 2024-01-15  
> **Status:** Ativo  
> **Última Atualização:** 2024-01-15

## 🔗 Base URL
```
https://solidtechsolutions.com.br/api
```

## 📋 Histórico de Versões

| Versão | Data | Mudanças | Status |
|--------|------|----------|--------|
| 1.1.0 | 2024-01-15 | Adicionado recarregamento automático de dados ao trocar de mês | ✅ Ativo |
| 1.0.0 | 2024-01-15 | Versão inicial da documentação | ✅ Ativo |

## ⚠️ Notas de Versionamento

- **Breaking Changes**: Qualquer mudança que quebre compatibilidade deve incrementar a versão major (ex: 1.0.0 → 2.0.0)
- **Novas Funcionalidades**: Incrementar versão minor (ex: 1.0.0 → 1.1.0)
- **Correções**: Incrementar versão patch (ex: 1.0.0 → 1.0.1)
- **Deprecação**: Endpoints deprecados devem ser marcados e removidos na próxima versão major

## 🔄 Comportamento de Navegação por Meses

### Funcionalidade
O sistema agora suporta **recarregamento automático de dados** quando o usuário troca de mês nos painéis de finanças e dívidas.

### Como Funciona
1. **Seleção de Mês**: Ao clicar em um mês diferente na navegação
2. **Atualização de Estado**: O `currentMonth` é atualizado no contexto
3. **Request Automático**: Um `useEffect` detecta a mudança e faz request para a API
4. **Atualização de Dados**: Os dados são recarregados e a interface é atualizada

### Endpoints Afetados
- **Finanças**: `GET /finance/transactions?month=YYYY-MM`
- **Dívidas**: `GET /debts?month=YYYY-MM`

### Parâmetros de Query
- `month`: Formato `YYYY-MM` (ex: `2024-01`)
- Quando não fornecido, retorna dados do mês atual

## 🔐 Autenticação

### Headers Padrão
```http
Content-Type: application/json
Authorization: Bearer {token}  // Para rotas protegidas
```

### Resposta de Erro Padrão
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": {
    "field": ["Mensagem de erro específica"]
  }
}
```

---

## 👤 Autenticação

### 1. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "1",
      "name": "João Silva",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Email ou senha incorretos"
}
```

### 2. Registro
**POST** `/auth/register`

**Request:**
```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "user": {
      "id": "1",
      "name": "João Silva",
      "email": "user@example.com",
      "avatar": null,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "email": ["Email já está em uso"],
    "password": ["Senha deve ter pelo menos 6 caracteres"]
  }
}
```

### 3. Obter Usuário Atual
**GET** `/auth/me`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "João Silva",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 4. Logout
**POST** `/auth/logout`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 💰 Finanças

### 1. Listar Transações
**GET** `/finance/transactions`

**Headers:**
```http
Authorization: Bearer {token}
```

**Query Parameters:**
```
?month=2024-01&type=expense&category=alimentacao&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "1",
        "description": "Supermercado",
        "amount": 150.50,
        "type": "expense",
        "category": "alimentacao",
        "date": "2024-01-15T10:30:00Z",
        "isRecurring": false,
        "installments": null,
        "totalInstallments": null,
        "currentInstallment": null,
        "dueDate": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 2. Criar Transação
**POST** `/finance/transactions`

**Headers:**
```http
Authorization: Bearer {token}
```

**Request:**
```json
{
  "description": "Supermercado",
  "amount": 150.50,
  "type": "expense",
  "category": "alimentacao",
  "date": "2024-01-15T10:30:00Z",
  "isRecurring": false,
  "installments": null,
  "totalInstallments": null,
  "dueDate": null
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transação criada com sucesso",
  "data": {
    "transaction": {
      "id": "1",
      "description": "Supermercado",
      "amount": 150.50,
      "type": "expense",
      "category": "alimentacao",
      "date": "2024-01-15T10:30:00Z",
      "isRecurring": false,
      "installments": null,
      "totalInstallments": null,
      "currentInstallment": null,
      "dueDate": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 3. Atualizar Transação
**PUT** `/finance/transactions/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Request:**
```json
{
  "description": "Supermercado Atualizado",
  "amount": 160.00,
  "type": "expense",
  "category": "alimentacao",
  "date": "2024-01-15T10:30:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transação atualizada com sucesso",
  "data": {
    "transaction": {
      "id": "1",
      "description": "Supermercado Atualizado",
      "amount": 160.00,
      "type": "expense",
      "category": "alimentacao",
      "date": "2024-01-15T10:30:00Z",
      "isRecurring": false,
      "installments": null,
      "totalInstallments": null,
      "currentInstallment": null,
      "dueDate": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 4. Deletar Transação
**DELETE** `/finance/transactions/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transação deletada com sucesso"
}
```

### 5. Resumo Mensal
**GET** `/finance/summary`

**Headers:**
```http
Authorization: Bearer {token}
```

**Query Parameters:**
```
?month=2024-01
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 5000.00,
      "totalExpenses": 3200.50,
      "balance": 1799.50,
      "projectedBalance": 1500.00,
      "pendingInstallments": 800.00,
      "recurringExpenses": 1200.00
    },
    "expensesByCategory": {
      "alimentacao": 800.00,
      "transporte": 400.00,
      "lazer": 300.00,
      "moradia": 1200.00,
      "outros": 500.50
    },
    "installments": [
      {
        "id": "1",
        "description": "Notebook",
        "amount": 250.00,
        "totalAmount": 3000.00,
        "currentInstallment": 3,
        "totalInstallments": 12,
        "dueDate": "2024-01-20T00:00:00Z",
        "status": "pending"
      }
    ]
  }
}
```

### 6. Metas Financeiras
**GET** `/finance/goals`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "1",
        "title": "Viagem para Europa",
        "targetAmount": 10000.00,
        "currentAmount": 3500.00,
        "deadline": "2024-12-31T00:00:00Z",
        "description": "Economizar para viagem de 15 dias",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**POST** `/finance/goals`

**Request:**
```json
{
  "title": "Viagem para Europa",
  "targetAmount": 10000.00,
  "deadline": "2024-12-31T00:00:00Z",
  "description": "Economizar para viagem de 15 dias"
}
```

---

## 👥 Dívidas

### 1. Listar Pessoas
**GET** `/debts/people`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "people": [
      {
        "id": "1",
        "name": "Maria Silva",
        "email": "maria@example.com",
        "phone": "+55 11 99999-9999",
        "relationship": "amigo",
        "color": "bg-blue-500",
        "notes": "Amiga da faculdade",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 2. Criar Pessoa
**POST** `/debts/people`

**Request:**
```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "+55 11 99999-9999",
  "relationship": "amigo",
  "notes": "Amiga da faculdade"
}
```

### 3. Listar Dívidas
**GET** `/debts`

**Headers:**
```http
Authorization: Bearer {token}
```

**Query Parameters:**
```
?month=2024-01&personId=1&status=pending
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "debts": [
      {
        "id": "1",
        "description": "Empréstimo para conserto do carro",
        "amount": 500.00,
        "paidAmount": 200.00,
        "status": "partial",
        "date": "2024-01-15T10:30:00Z",
        "dueDate": "2024-02-15T00:00:00Z",
        "personId": "1",
        "person": {
          "id": "1",
          "name": "Maria Silva",
          "email": "maria@example.com",
          "phone": "+55 11 99999-9999",
          "relationship": "amigo",
          "color": "bg-blue-500"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 4. Criar Dívida
**POST** `/debts`

**Request:**
```json
{
  "description": "Empréstimo para conserto do carro",
  "amount": 500.00,
  "date": "2024-01-15T10:30:00Z",
  "dueDate": "2024-02-15T00:00:00Z",
  "personId": "1"
}
```

### 5. Atualizar Pagamento
**PATCH** `/debts/{id}/payment`

**Request:**
```json
{
  "paidAmount": 300.00
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pagamento atualizado com sucesso",
  "data": {
    "debt": {
      "id": "1",
      "description": "Empréstimo para conserto do carro",
      "amount": 500.00,
      "paidAmount": 300.00,
      "status": "partial",
      "date": "2024-01-15T10:30:00Z",
      "dueDate": "2024-02-15T00:00:00Z",
      "personId": "1",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 📊 Relatórios

### 1. Relatório Mensal
**GET** `/reports/monthly`

**Headers:**
```http
Authorization: Bearer {token}
```

**Query Parameters:**
```
?month=2024-01&format=pdf
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "report": {
      "month": "2024-01",
      "summary": {
        "totalIncome": 5000.00,
        "totalExpenses": 3200.50,
        "balance": 1799.50
      },
      "expensesByCategory": {
        "alimentacao": 800.00,
        "transporte": 400.00,
        "lazer": 300.00
      },
      "topExpenses": [
        {
          "description": "Supermercado",
          "amount": 150.50,
          "category": "alimentacao"
        }
      ],
      "installments": [
        {
          "description": "Notebook",
          "amount": 250.00,
          "currentInstallment": 3,
          "totalInstallments": 12
        }
      ]
    },
    "downloadUrl": "https://api.example.com/reports/monthly-2024-01.pdf"
  }
}
```

---

## 🔧 Configurações

### 1. Categorias Disponíveis
**GET** `/config/categories`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "alimentacao",
        "name": "Alimentação",
        "icon": "🍽️",
        "color": "#FF6B6B"
      },
      {
        "id": "transporte",
        "name": "Transporte",
        "icon": "🚗",
        "color": "#4ECDC4"
      },
      {
        "id": "lazer",
        "name": "Lazer",
        "icon": "🎮",
        "color": "#45B7D1"
      },
      {
        "id": "moradia",
        "name": "Moradia",
        "icon": "🏠",
        "color": "#96CEB4"
      },
      {
        "id": "outros",
        "name": "Outros",
        "icon": "📦",
        "color": "#FFEAA7"
      }
    ]
  }
}
```

### 2. Relacionamentos Disponíveis
**GET** `/config/relationships`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "relationships": [
      {
        "id": "amigo",
        "name": "Amigo",
        "icon": "👥"
      },
      {
        "id": "familiar",
        "name": "Familiar",
        "icon": "👨‍👩‍👧‍👦"
      },
      {
        "id": "colega",
        "name": "Colega",
        "icon": "💼"
      },
      {
        "id": "vizinho",
        "name": "Vizinho",
        "icon": "🏠"
      },
      {
        "id": "outro",
        "name": "Outro",
        "icon": "👤"
      }
    ]
  }
}
```

---

## 📝 Códigos de Status HTTP

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Requisição inválida
- **401** - Não autorizado
- **403** - Proibido
- **404** - Não encontrado
- **422** - Dados inválidos
- **500** - Erro interno do servidor

---

## 🔒 Segurança

### Headers de Segurança
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Rate Limiting
- **Login/Register**: 5 tentativas por minuto
- **API Geral**: 1000 requests por hora
- **Relatórios**: 10 requests por hora

---

## 📋 Validações

### Usuário
- **Nome**: Mínimo 2 caracteres, máximo 100
- **Email**: Formato válido, único no sistema
- **Senha**: Mínimo 6 caracteres, máximo 100

### Transação
- **Descrição**: Mínimo 3 caracteres, máximo 200
- **Valor**: Positivo, máximo 999999.99
- **Data**: Não pode ser futura (exceto para receitas)
- **Categoria**: Deve existir na lista de categorias

### Dívida
- **Descrição**: Mínimo 3 caracteres, máximo 200
- **Valor**: Positivo, máximo 999999.99
- **Pessoa**: Deve existir no sistema
- **Data de Vencimento**: Opcional, se fornecida deve ser futura

### Pessoa
- **Nome**: Mínimo 2 caracteres, máximo 100
- **Email**: Formato válido, opcional
- **Telefone**: Formato brasileiro, opcional
- **Relacionamento**: Deve existir na lista de relacionamentos 