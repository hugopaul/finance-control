// Base API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string | Date;
  };
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string | Date;
  };
  token: string;
  refreshToken: string;
}

// Finance API Interfaces
export interface TransactionRequest {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  isFixed?: boolean;
  isInstallment?: boolean;
  installmentInfo?: {
    currentInstallment: number;
    totalInstallments: number;
    dueDate: string;
  };
  paymentMethodId?: string;
  receipt?: string;
}

export interface TransactionResponse {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  isFixed?: boolean;
  isInstallment?: boolean;
  installmentInfo?: {
    currentInstallment: number;
    totalInstallments: number;
    dueDate: string;
  };
  paymentMethodId?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: TransactionResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GoalRequest {
  title: string;
  targetAmount: number;
  deadline: string;
  description?: string;
}

export interface GoalResponse {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsResponse {
  goals: GoalResponse[];
}

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CategoriesResponse {
  categories: CategoryResponse[];
}

// Debt API Interfaces
export interface PersonRequest {
  name: string;
  phone?: string;
  email?: string;
  relationship: string;
  color: string;
  notes?: string;
}

export interface PersonResponse {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  relationship: string;
  color: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeopleResponse {
  people: PersonResponse[];
}

export interface DebtRequest {
  personId: string;
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  paymentMethodId?: string;
  notes?: string;
  receipt?: string;
}

export interface DebtResponse {
  id: string;
  personId: string;
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  paymentMethodId?: string;
  notes?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtsResponse {
  debts: DebtResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface DebtPaymentRequest {
  paidAmount: number;
  notes?: string;
}

// Payment Method API Interfaces
export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

// Error Interfaces
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  errors: ValidationError[];
} 