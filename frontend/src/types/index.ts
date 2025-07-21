export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  is_recurring?: boolean;
  installments?: number;
  total_installments?: number;
  due_date?: string;
  receipt?: string;
  payment_method_id?: string;
}

export interface MonthlyData {
  month: string;
  year: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  projectedBalance: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
}

// Tipos atualizados para o sistema de dívidas conforme API
export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: 'amigo' | 'familiar' | 'colega' | 'vizinho' | 'outro';
  color: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Debt {
  id: string;
  person_id: string;
  description: string;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid';
  date: string;
  due_date?: string;
  installments?: number;
  total_installments?: number;
  notes?: string;
  receipt?: string;
  created_at?: string;
  updated_at?: string;
  payment_method_id?: string;
  // Dados da pessoa (incluído na resposta da API)
  person?: Person;
}

export interface DebtMonthlyData {
  month: string;
  year: number;
  debts: Debt[];
  totalOwed: number;
  totalPaid: number;
  totalPending: number;
}

// Tipos para resumo mensal de dívidas
export interface DebtSummary {
  totalDebts: number;
  totalPaid: number;
  totalPending: number;
  installmentsCount: number;
}

export interface DebtByPerson {
  total: number;
  paid: number;
  pending: number;
  debts: Debt[];
}

export interface DebtInstallment {
  id: string;
  description: string;
  amount: number;
  totalAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string;
  person: string;
  status: 'pending' | 'partial' | 'paid';
}

export interface DebtSummaryResponse {
  summary: DebtSummary;
  debtsByPerson: Record<string, DebtByPerson>;
  installments: DebtInstallment[];
}

// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string | Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
} 