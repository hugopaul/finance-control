# 🛠️ Guia de Desenvolvimento

## 🔧 Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
# API Configuration
REACT_APP_API_URL=https://solidtechsolutions.com.br/api

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_REGISTRATION=true
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_DEBT_SYSTEM=true

# Debug Mode
REACT_APP_DEBUG=true
```

### 2. Backend Necessário

O frontend espera um backend com as seguintes características:

#### Estrutura de Resposta Padrão
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "errors": object
}
```

#### Headers Necessários
```http
Content-Type: application/json
Authorization: Bearer {token}  // Para rotas protegidas
```

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Login/Registro**
   - Frontend envia credenciais
   - Backend retorna token JWT
   - Frontend armazena token no localStorage

2. **Requests Autenticados**
   - Frontend inclui header `Authorization: Bearer {token}`
   - Backend valida token
   - Se inválido, retorna 401

3. **Logout**
   - Frontend remove token do localStorage
   - Backend invalida token (opcional)

### Implementação no Frontend

```typescript
// AuthContext.tsx
const login = async (credentials: LoginCredentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('authToken', data.data.token);
    // Atualizar estado
  }
};
```

## 💰 Integração Financeira

### 1. Listar Transações

**Frontend Request:**
```typescript
const fetchTransactions = async (month: string) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`/api/finance/transactions?month=${month}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

**Backend Response Esperado:**
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
        "dueDate": null
      }
    ]
  }
}
```

### 2. Criar Transação

**Frontend Request:**
```typescript
const createTransaction = async (transaction: Transaction) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/finance/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(transaction)
  });
  
  return response.json();
};
```

### 3. Resumo Mensal

**Frontend Request:**
```typescript
const fetchSummary = async (month: string) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`/api/finance/summary?month=${month}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## 👥 Integração de Dívidas

### 1. Listar Pessoas

**Frontend Request:**
```typescript
const fetchPeople = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/debts/people', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### 2. Criar Dívida

**Frontend Request:**
```typescript
const createDebt = async (debt: Debt) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/debts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(debt)
  });
  
  return response.json();
};
```

## 🔄 Navegação por Meses

### Funcionalidade Implementada

O sistema agora suporta **recarregamento automático de dados** quando o usuário troca de mês nos painéis de finanças e dívidas.

### Implementação nos Contextos

#### FinancialContext
```typescript
// Monitora mudanças no currentMonth
useEffect(() => {
  if (isInitialized.current) {
    loadTransactions(state.currentMonth);
  }
}, [state.currentMonth, loadTransactions]);
```

#### DebtContext
```typescript
// Monitora mudanças no currentMonth
useEffect(() => {
  if (isInitialized.current) {
    loadDebts(state.currentMonth);
  }
}, [state.currentMonth, loadDebts]);
```

### Fluxo de Funcionamento

1. **Usuário clica em um mês diferente**
2. **MonthlyTabs/DebtMonthlyTabs** dispara `SET_CURRENT_MONTH`
3. **Contexto atualiza** `state.currentMonth`
4. **useEffect detecta** a mudança no `currentMonth`
5. **Request automático** é feito para a API com o novo mês
6. **Dados são atualizados** e a interface é re-renderizada

### Endpoints Utilizados

- **Finanças**: `GET /finance/transactions?month=YYYY-MM`
- **Dívidas**: `GET /debts?month=YYYY-MM`

### Benefícios

- ✅ **UX Melhorada**: Dados sempre atualizados
- ✅ **Performance**: Requests apenas quando necessário
- ✅ **Consistência**: Mesmo comportamento em ambos os painéis
- ✅ **Manutenibilidade**: Lógica centralizada nos contextos

## 🔄 Estados de Loading

### Implementação

```typescript
// Context
const [isLoading, setIsLoading] = useState(false);

// Component
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await apiCall();
  } finally {
    setIsLoading(false);
  }
};
```

### UI Feedback

```tsx
<button 
  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
  disabled={isLoading}
>
  {isLoading ? 'Salvando...' : 'Salvar'}
</button>
```

## 🚨 Tratamento de Erros

### 1. Erros de Rede

```typescript
const handleApiCall = async () => {
  try {
    const response = await fetch('/api/endpoint');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Mostrar alerta para o usuário
  }
};
```

### 2. Erros de Validação

```typescript
// Backend retorna
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "email": ["Email já está em uso"],
    "password": ["Senha deve ter pelo menos 6 caracteres"]
  }
}

// Frontend processa
const handleError = (error: any) => {
  if (error.errors) {
    // Mostrar erros específicos por campo
    setFieldErrors(error.errors);
  } else {
    // Mostrar erro geral
    setGeneralError(error.message);
  }
};
```

### 3. Token Expirado

```typescript
// Interceptor para requests
const apiRequest = async (url: string, options: RequestInit) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expirado
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    return;
  }
  
  return response;
};
```

## 📊 Configurações

### 1. Categorias

**Frontend Request:**
```typescript
const fetchCategories = async () => {
  const response = await fetch('/api/config/categories');
  return response.json();
};
```

**Backend Response:**
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
      }
    ]
  }
}
```

### 2. Relacionamentos

**Frontend Request:**
```typescript
const fetchRelationships = async () => {
  const response = await fetch('/api/config/relationships');
  return response.json();
};
```

## 🔧 Debug e Desenvolvimento

### 1. Logs de Debug

```typescript
// Habilitar logs detalhados
if (process.env.REACT_APP_DEBUG === 'true') {
  console.log('API Request:', { url, data });
  console.log('API Response:', response);
}
```

### 2. Mock Data para Desenvolvimento

```typescript
// Em desenvolvimento, usar dados mock se API não estiver disponível
const useMockData = process.env.REACT_APP_ENV === 'development' && !process.env.REACT_APP_API_URL;

if (useMockData) {
  // Retornar dados mock
  return mockData;
}
```

### 3. CORS em Desenvolvimento

**Backend deve configurar CORS:**
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 🧪 Testes

### 1. Testes de API

```typescript
// __tests__/api.test.ts
describe('API Integration', () => {
  test('should login successfully', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### 2. Testes de Componentes

```typescript
// __tests__/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../components/auth/LoginForm';

test('should show validation errors', () => {
  render(<LoginForm />);
  
  const submitButton = screen.getByText('Entrar');
  fireEvent.click(submitButton);
  
  expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
});
```

## 🚀 Deploy

### 1. Build de Produção

```bash
npm run build
```

### 2. Variáveis de Produção

```env
REACT_APP_API_URL=https://api.seudominio.com/api
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

### 3. Configuração do Servidor

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

## 📈 Monitoramento

### 1. Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV
});
```

### 2. Analytics

```typescript
// Google Analytics
import ReactGA from 'react-ga';

ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
```

## 🔄 Atualizações

### 1. Migração de Dados

Quando a API mudar, atualize os tipos:

```typescript
// types/index.ts
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  // Novos campos adicionados aqui
}
```

### 2. Versionamento da API

```typescript
// Usar versionamento na URL
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/v1`;
```

---

**Este guia deve ser atualizado conforme o projeto evolui!** 