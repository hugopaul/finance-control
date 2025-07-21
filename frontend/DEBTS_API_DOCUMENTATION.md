# 📋 Documentação Completa - API de Dívidas

## 📖 Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints de Pessoas](#endpoints-de-pessoas)
4. [Endpoints de Dívidas](#endpoints-de-dívidas)
5. [Regras de Negócio](#regras-de-negócio)
6. [Casos de Uso](#casos-de-uso)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Códigos de Erro](#códigos-de-erro)
9. [Estrutura do Banco](#estrutura-do-banco)

---

## 🎯 Visão Geral

O módulo de Dívidas permite gerenciar dívidas pessoais associadas a pessoas específicas, com suporte completo a parcelamento e controle de pagamentos. O sistema segue o mesmo padrão dos endpoints de Finanças, garantindo consistência na API.

### Características Principais:
- ✅ **Gestão de Pessoas**: CRUD completo para pessoas relacionadas
- ✅ **Dívidas Parceladas**: Suporte automático a parcelamento mensal
- ✅ **Controle de Pagamentos**: Atualização de valores pagos e status
- ✅ **Relatórios Mensais**: Resumo detalhado por pessoa e parcelas
- ✅ **Filtros Avançados**: Busca por mês, pessoa e status
- ✅ **Validações Robustas**: Múltiplas camadas de validação

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT via header:

```
Authorization: Bearer <token>
```

**Exemplo:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     https://solidtechsolutions.com.br/api/debts/
```

---

## 👥 Endpoints de Pessoas

### GET /debts/people
**Descrição:** Lista todas as pessoas do usuário autenticado

**Regras de Negócio:**
- ✅ Apenas pessoas do usuário autenticado são retornadas
- ✅ Ordenação por nome (implícita)
- ✅ Inclui dados completos da pessoa (nome, email, telefone, relacionamento, cor, notas)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "people": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "João Silva",
        "email": "joao@email.com",
        "phone": "11999999999",
        "relationship": "amigo",
        "color": "bg-blue-500",
        "notes": "Amigo do trabalho",
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /debts/people
**Descrição:** Cria uma nova pessoa

**Regras de Negócio:**
- ✅ Nome é obrigatório e único por usuário
- ✅ Email deve ser válido (se fornecido)
- ✅ Telefone deve ter formato válido (se fornecido)
- ✅ Relacionamento deve existir na tabela `relationships`
- ✅ Cor padrão: `bg-blue-500`
- ✅ Notas são opcionais

**Payload:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "relationship": "amigo",
  "color": "bg-green-500",
  "notes": "Amigo do trabalho"
}
```

**Validações:**
- ❌ Nome vazio ou nulo
- ❌ Email inválido
- ❌ Telefone inválido
- ❌ Relacionamento inexistente

**Resposta:**
```json
{
  "success": true,
  "message": "Pessoa criada com sucesso",
  "data": {
    "person": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "relationship": "amigo",
      "color": "bg-green-500",
      "notes": "Amigo do trabalho",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### GET /debts/people/{person_id}
**Descrição:** Busca uma pessoa específica por ID

**Regras de Negócio:**
- ✅ Apenas pessoas do usuário autenticado
- ✅ Retorna erro 404 se pessoa não encontrada
- ✅ Validação de UUID válido

**Parâmetros:**
- `person_id`: UUID da pessoa

**Exemplo:**
```bash
GET /debts/people/550e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "person": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "relationship": "amigo",
      "color": "bg-blue-500",
      "notes": "Amigo do trabalho",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### PUT /debts/people/{person_id}
**Descrição:** Atualiza uma pessoa existente

**Regras de Negócio:**
- ✅ Apenas pessoas do usuário autenticado
- ✅ Apenas campos fornecidos são atualizados
- ✅ Mesmas validações do POST
- ✅ Retorna erro 404 se pessoa não encontrada

**Payload (campos opcionais):**
```json
{
  "name": "João Silva Santos",
  "email": "joao.santos@email.com",
  "phone": "11988888888",
  "relationship": "familiar",
  "color": "bg-red-500",
  "notes": "Primo"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pessoa atualizada com sucesso",
  "data": {
    "person": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva Santos",
      "email": "joao.santos@email.com",
      "phone": "11988888888",
      "relationship": "familiar",
      "color": "bg-red-500",
      "notes": "Primo",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### DELETE /debts/people/{person_id}
**Descrição:** Remove uma pessoa

**Regras de Negócio:**
- ✅ Apenas pessoas do usuário autenticado
- ✅ Retorna erro 404 se pessoa não encontrada
- ✅ Cascade: remove todas as dívidas associadas
- ✅ Validação de UUID válido

**Exemplo:**
```bash
DELETE /debts/people/550e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pessoa deletada com sucesso"
}
```

---

## 💰 Endpoints de Dívidas

### GET /debts/
**Descrição:** Lista dívidas com filtros opcionais

**Regras de Negócio:**
- ✅ Apenas dívidas do usuário autenticado
- ✅ Filtros opcionais: mês, pessoa, status
- ✅ Ordenação por data (mais recente primeiro)
- ✅ Inclui dados completos da pessoa associada

**Parâmetros de Query:**
- `month`: Formato YYYY-MM (ex: "2025-01")
- `person_id`: UUID da pessoa
- `status`: "pending", "partial", "paid"

**Exemplos:**
```bash
# Todas as dívidas
GET /debts/

# Dívidas de janeiro de 2025
GET /debts/?month=2025-01

# Dívidas de uma pessoa específica
GET /debts/?person_id=550e8400-e29b-41d4-a716-446655440000

# Dívidas pendentes
GET /debts/?status=pending

# Combinação de filtros
GET /debts/?month=2025-01&person_id=550e8400-e29b-41d4-a716-446655440000&status=partial
```

**Validações:**
- ❌ Formato de mês inválido
- ❌ UUID de pessoa inválido
- ❌ Status inválido

**Resposta:**
```json
{
  "success": true,
  "data": {
    "debts": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "description": "Empréstimo do João",
        "amount": 100.00,
        "paid_amount": 50.00,
        "status": "partial",
        "date": "2025-01-15",
        "due_date": "2025-01-20",
        "installments": 1,
        "total_installments": 10,
        "person_id": "550e8400-e29b-41d4-a716-446655440000",
        "person": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "João Silva",
          "email": "joao@email.com",
          "phone": "11999999999",
          "relationship": "amigo",
          "color": "bg-blue-500",
          "notes": "Amigo do trabalho",
          "created_at": "2025-01-15T10:00:00Z",
          "updated_at": "2025-01-15T10:00:00Z"
        },
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /debts/
**Descrição:** Cria uma nova dívida (com suporte a parcelamento)

**Regras de Negócio:**

#### **Para Dívidas Parceladas:**
- ✅ Valor total dividido pelo número de parcelas
- ✅ Cada parcela criada mensalmente
- ✅ Data de vencimento incrementada mensalmente
- ✅ Campos `installments` e `total_installments` preenchidos

#### **Para Dívidas Únicas:**
- ✅ Valor total lançado em uma única dívida
- ✅ Campos de parcelamento como `null`

**Validações:**
- ❌ Valor ≤ 0
- ❌ Total de parcelas < 1
- ❌ Parcela atual > total de parcelas
- ❌ Data de vencimento < data da dívida
- ❌ Data da dívida no futuro
- ❌ Pessoa inexistente

**Payload - Dívida Única:**
```json
{
  "description": "Empréstimo do João",
  "amount": 500.00,
  "date": "2025-01-15",
  "due_date": "2025-01-20",
  "person_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Payload - Dívida Parcelada:**
```json
{
  "description": "Empréstimo do João",
  "amount": 1000.00,
  "date": "2025-01-15",
  "due_date": "2025-01-20",
  "total_installments": 10,
  "person_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Exemplo de Parcelamento:**
- Valor: R$ 1000, Parcelas: 10
- Resultado: 10 dívidas de R$ 100 cada, uma para cada mês

**Resposta:**
```json
{
  "success": true,
  "message": "Dívida criada com sucesso",
  "data": {
    "debt": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "description": "Empréstimo do João",
      "amount": 100.00,
      "paid_amount": 0.00,
      "status": "pending",
      "date": "2025-01-15",
      "due_date": "2025-01-20",
      "installments": 1,
      "total_installments": 10,
      "person_id": "550e8400-e29b-41d4-a716-446655440000",
      "person": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "João Silva",
        "email": "joao@email.com",
        "phone": "11999999999",
        "relationship": "amigo",
        "color": "bg-blue-500",
        "notes": "Amigo do trabalho",
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      },
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### GET /debts/{debt_id}
**Descrição:** Busca uma dívida específica por ID

**Regras de Negócio:**
- ✅ Apenas dívidas do usuário autenticado
- ✅ Retorna erro 404 se dívida não encontrada
- ✅ Validação de UUID válido
- ✅ Inclui dados completos da pessoa

**Parâmetros:**
- `debt_id`: UUID da dívida

**Exemplo:**
```bash
GET /debts/660e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "debt": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "description": "Empréstimo do João",
      "amount": 100.00,
      "paid_amount": 50.00,
      "status": "partial",
      "date": "2025-01-15",
      "due_date": "2025-01-20",
      "installments": 1,
      "total_installments": 10,
      "person_id": "550e8400-e29b-41d4-a716-446655440000",
      "person": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "João Silva",
        "email": "joao@email.com",
        "phone": "11999999999",
        "relationship": "amigo",
        "color": "bg-blue-500",
        "notes": "Amigo do trabalho",
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      },
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### PUT /debts/{debt_id}
**Descrição:** Atualiza uma dívida existente

**Regras de Negócio:**
- ✅ Apenas dívidas do usuário autenticado
- ✅ Apenas campos fornecidos são atualizados
- ✅ Mesmas validações do POST
- ✅ Retorna erro 404 se dívida não encontrada

**Payload (campos opcionais):**
```json
{
  "description": "Empréstimo atualizado",
  "amount": 1200.00,
  "date": "2025-01-20",
  "due_date": "2025-01-25",
  "total_installments": 12,
  "person_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validações:**
- ❌ Valor ≤ 0
- ❌ Total de parcelas < 1
- ❌ Parcela atual > total de parcelas
- ❌ Data de vencimento < data da dívida
- ❌ Data da dívida no futuro
- ❌ Pessoa inexistente

**Resposta:**
```json
{
  "success": true,
  "message": "Dívida atualizada com sucesso",
  "data": {
    "debt": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "description": "Empréstimo atualizado",
      "amount": 1200.00,
      "paid_amount": 50.00,
      "status": "partial",
      "date": "2025-01-20",
      "due_date": "2025-01-25",
      "installments": 1,
      "total_installments": 12,
      "person_id": "550e8400-e29b-41d4-a716-446655440000",
      "person": { ... },
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### PATCH /debts/{debt_id}/payment
**Descrição:** Atualiza o pagamento de uma dívida

**Regras de Negócio:**
- ✅ Apenas dívidas do usuário autenticado
- ✅ Atualiza apenas o valor pago
- ✅ Status atualizado automaticamente:
  - `paid`: se valor pago ≥ valor da dívida
  - `partial`: se valor pago > 0 mas < valor da dívida
  - `pending`: se valor pago = 0
- ✅ Retorna erro 404 se dívida não encontrada

**Payload:**
```json
{
  "paid_amount": 50.00
}
```

**Validações:**
- ❌ Valor pago < 0
- ✅ Valor pago > valor da dívida (permitido, mas marca como quitada)

**Exemplo:**
```bash
PATCH /debts/660e8400-e29b-41d4-a716-446655440000/payment
Content-Type: application/json

{
  "paid_amount": 50.00
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pagamento atualizado com sucesso",
  "data": {
    "debt": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "description": "Empréstimo do João",
      "amount": 100.00,
      "paid_amount": 50.00,
      "status": "partial",
      "date": "2025-01-15",
      "due_date": "2025-01-20",
      "installments": 1,
      "total_installments": 10,
      "person_id": "550e8400-e29b-41d4-a716-446655440000",
      "person": { ... },
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### DELETE /debts/{debt_id}
**Descrição:** Remove uma dívida

**Regras de Negócio:**
- ✅ Apenas dívidas do usuário autenticado
- ✅ Retorna erro 404 se dívida não encontrada
- ✅ Validação de UUID válido
- ✅ Remove permanentemente (sem soft delete)

**Exemplo:**
```bash
DELETE /debts/660e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
{
  "success": true,
  "message": "Dívida deletada com sucesso"
}
```

---

### GET /debts/summary
**Descrição:** Retorna resumo mensal das dívidas

**Regras de Negócio:**
- ✅ Apenas dívidas do usuário autenticado
- ✅ Mês obrigatório no formato YYYY-MM
- ✅ Agrupamento por pessoa
- ✅ Cálculo de totais e pendências
- ✅ Lista de dívidas parceladas

**Parâmetros:**
- `month`: Formato YYYY-MM (obrigatório)

**Validações:**
- ❌ Formato de mês inválido

**Exemplo:**
```bash
GET /debts/summary?month=2025-01
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDebts": 1500.00,
      "totalPaid": 500.00,
      "totalPending": 1000.00,
      "installmentsCount": 5
    },
    "debtsByPerson": {
      "João Silva": {
        "total": 1000.00,
        "paid": 300.00,
        "pending": 700.00,
        "debts": [
          {
            "id": "660e8400-e29b-41d4-a716-446655440000",
            "description": "Empréstimo do João",
            "amount": 100.00,
            "paid_amount": 30.00,
            "status": "partial",
            "date": "2025-01-15",
            "due_date": "2025-01-20",
            "installments": 1,
            "total_installments": 10,
            "person_id": "550e8400-e29b-41d4-a716-446655440000",
            "person": { ... },
            "created_at": "2025-01-15T10:00:00Z",
            "updated_at": "2025-01-15T10:00:00Z"
          }
        ]
      },
      "Maria Santos": {
        "total": 500.00,
        "paid": 200.00,
        "pending": 300.00,
        "debts": [ ... ]
      }
    },
    "installments": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "description": "Empréstimo do João",
        "amount": 100.00,
        "totalAmount": 1000.00,
        "currentInstallment": 1,
        "totalInstallments": 10,
        "dueDate": "2025-01-20",
        "person": "João Silva",
        "status": "partial"
      }
    ]
  }
}
```

---

## 🎯 Regras de Negócio

### **Validações de Dados:**
- ✅ UUIDs válidos
- ✅ Valores monetários positivos
- ✅ Datas válidas e consistentes
- ✅ Emails válidos (se fornecidos)
- ✅ Telefones válidos (se fornecidos)

### **Segurança:**
- ✅ Isolamento por usuário (user_id)
- ✅ Autenticação JWT obrigatória
- ✅ Validação de propriedade dos recursos

### **Performance:**
- ✅ Índices nas colunas principais
- ✅ Queries otimizadas com JOINs
- ✅ Paginação implícita

### **Consistência:**
- ✅ Constraints no banco de dados
- ✅ Validações em múltiplas camadas
- ✅ Transações atômicas

### **Formato de Resposta:**
- ✅ Padrão consistente em todos os endpoints
- ✅ Serialização correta de UUIDs e Decimais
- ✅ Tratamento de erros padronizado

---

## 📋 Casos de Uso

### **1. Gestão de Pessoas**
```bash
# Criar pessoa
POST /debts/people
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "relationship": "amigo",
  "color": "bg-blue-500",
  "notes": "Amigo do trabalho"
}

# Listar pessoas
GET /debts/people

# Atualizar pessoa
PUT /debts/people/{person_id}
{
  "name": "João Silva Santos",
  "email": "joao.santos@email.com"
}

# Deletar pessoa
DELETE /debts/people/{person_id}
```

### **2. Dívidas Únicas**
```bash
# Criar dívida única
POST /debts/
{
  "description": "Empréstimo do João",
  "amount": 500.00,
  "date": "2025-01-15",
  "due_date": "2025-01-20",
  "person_id": "550e8400-e29b-41d4-a716-446655440000"
}

# Atualizar pagamento
PATCH /debts/{debt_id}/payment
{
  "paid_amount": 200.00
}
```

### **3. Dívidas Parceladas**
```bash
# Criar dívida parcelada (10x R$ 100)
POST /debts/
{
  "description": "Empréstimo do João",
  "amount": 1000.00,
  "date": "2025-01-15",
  "due_date": "2025-01-20",
  "total_installments": 10,
  "person_id": "550e8400-e29b-41d4-a716-446655440000"
}

# Resultado: 10 dívidas de R$ 100 cada, uma para cada mês
```

### **4. Controle de Pagamentos**
```bash
# Pagamento parcial
PATCH /debts/{debt_id}/payment
{
  "paid_amount": 50.00
}
# Status: "partial"

# Pagamento total
PATCH /debts/{debt_id}/payment
{
  "paid_amount": 100.00
}
# Status: "paid"
```

### **5. Relatórios Mensais**
```bash
# Resumo de janeiro de 2025
GET /debts/summary?month=2025-01

# Filtros por pessoa
GET /debts/?person_id=550e8400-e29b-41d4-a716-446655440000

# Filtros por status
GET /debts/?status=pending
```

---

## 📊 Exemplos Práticos

### **Exemplo 1: Empréstimo Parcelado**
```json
// Criar empréstimo de R$ 1000 em 10x
POST /debts/
{
  "description": "Empréstimo do João",
  "amount": 1000.00,
  "date": "2025-01-15",
  "due_date": "2025-01-20",
  "total_installments": 10,
  "person_id": "550e8400-e29b-41d4-a716-446655440000"
}

// Resultado: 10 dívidas criadas
// - Jan/2025: R$ 100 (parcela 1/10)
// - Fev/2025: R$ 100 (parcela 2/10)
// - Mar/2025: R$ 100 (parcela 3/10)
// - ... até Dez/2025: R$ 100 (parcela 10/10)
```

### **Exemplo 2: Controle de Pagamentos**
```json
// Dívida inicial
{
  "amount": 100.00,
  "paid_amount": 0.00,
  "status": "pending"
}

// Pagamento parcial
PATCH /debts/{debt_id}/payment
{
  "paid_amount": 30.00
}

// Resultado
{
  "amount": 100.00,
  "paid_amount": 30.00,
  "status": "partial"
}

// Pagamento total
PATCH /debts/{debt_id}/payment
{
  "paid_amount": 100.00
}

// Resultado
{
  "amount": 100.00,
  "paid_amount": 100.00,
  "status": "paid"
}
```

### **Exemplo 3: Relatório Mensal**
```json
GET /debts/summary?month=2025-01

// Resposta
{
  "summary": {
    "totalDebts": 2500.00,
    "totalPaid": 800.00,
    "totalPending": 1700.00,
    "installmentsCount": 8
  },
  "debtsByPerson": {
    "João Silva": {
      "total": 1000.00,
      "paid": 300.00,
      "pending": 700.00
    },
    "Maria Santos": {
      "total": 1500.00,
      "paid": 500.00,
      "pending": 1000.00
    }
  },
  "installments": [
    {
      "description": "Empréstimo do João",
      "amount": 100.00,
      "totalAmount": 1000.00,
      "currentInstallment": 1,
      "totalInstallments": 10,
      "person": "João Silva",
      "status": "partial"
    }
  ]
}
```

---

## ❌ Códigos de Erro

### **400 Bad Request**
```json
{
  "success": false,
  "message": "O valor da dívida deve ser positivo.",
  "status_code": 400
}
```

**Causas:**
- Valor ≤ 0
- Total de parcelas < 1
- Parcela atual > total de parcelas
- Data de vencimento < data da dívida
- Data da dívida no futuro
- Formato de mês inválido
- UUID inválido
- Email inválido
- Telefone inválido

### **404 Not Found**
```json
{
  "success": false,
  "message": "Dívida não encontrada",
  "status_code": 404
}
```

**Causas:**
- Dívida não existe
- Dívida pertence a outro usuário
- Pessoa não existe
- Pessoa pertence a outro usuário

### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "status_code": 500
}
```

**Causas:**
- Erro de banco de dados
- Erro de validação interna
- Erro de serialização

---

## 🗄️ Estrutura do Banco

### **Tabela `debts`**
```sql
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    paid_amount DECIMAL(10,2) DEFAULT 0 CHECK (paid_amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
    date DATE NOT NULL,
    due_date DATE,
    installments INTEGER CHECK (installments > 0),
    total_installments INTEGER CHECK (total_installments > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_installments CHECK (
        (installments IS NULL AND total_installments IS NULL) OR
        (installments IS NOT NULL AND total_installments IS NOT NULL AND installments <= total_installments)
    )
);
```

### **Tabela `people`**
```sql
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    relationship VARCHAR(50) NOT NULL REFERENCES relationships(id),
    color VARCHAR(20) DEFAULT 'bg-blue-500',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **Índices**
```sql
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_person_id ON debts(person_id);
CREATE INDEX IF NOT EXISTS idx_debts_date ON debts(date);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_installments ON debts(installments);
CREATE INDEX IF NOT EXISTS idx_debts_total_installments ON debts(total_installments);

CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_people_relationship ON people(relationship);
```

---

## 🔄 Status das Dívidas

### **pending**
- Valor pago = 0
- Dívida ainda não foi paga

### **partial**
- Valor pago > 0 e < valor da dívida
- Dívida foi parcialmente paga

### **paid**
- Valor pago ≥ valor da dívida
- Dívida foi totalmente quitada

---

## 📝 Relacionamentos Disponíveis

### **Tabela `relationships`**
```sql
INSERT INTO relationships (id, name, icon) VALUES
('amigo', 'Amigo', '👥'),
('familiar', 'Familiar', '👨‍👩‍👧‍👦'),
('colega', 'Colega', '💼'),
('vizinho', 'Vizinho', '🏠'),
('outro', 'Outro', '👤');
```

---

## 🎨 Cores Disponíveis

### **Cores Padrão**
- `bg-blue-500` (padrão)
- `bg-green-500`
- `bg-red-500`
- `bg-yellow-500`
- `bg-purple-500`
- `bg-pink-500`
- `bg-indigo-500`
- `bg-gray-500`

---

## 📚 Conclusão

O módulo de Dívidas oferece uma solução completa para gestão de dívidas pessoais, com suporte a parcelamento automático, controle de pagamentos e relatórios detalhados. Todas as funcionalidades seguem as melhores práticas de API REST e mantêm consistência com o padrão estabelecido no sistema.

**Principais Benefícios:**
- ✅ Gestão completa de pessoas e dívidas
- ✅ Parcelamento automático mensal
- ✅ Controle granular de pagamentos
- ✅ Relatórios detalhados por pessoa
- ✅ Validações robustas em múltiplas camadas
- ✅ Performance otimizada com índices
- ✅ Segurança com isolamento por usuário
- ✅ API RESTful consistente

---

*Documentação gerada em: 2025-01-15*
*Versão: 1.0.0* 