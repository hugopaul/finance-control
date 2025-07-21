// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.solidtechsolutions.com.br',

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Financial API Service
export class FinancialService {
  static async getTransactions(month?: string): Promise<any> {
    const params = month ? `?month=${month}` : '';
    return makeAuthenticatedRequest(`/finance/transactions${params}`);
  }

  static async createTransaction(transaction: any): Promise<any> {
    return makeAuthenticatedRequest('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  static async updateTransaction(id: string, transaction: any): Promise<any> {
    return makeAuthenticatedRequest(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  static async deleteTransaction(id: string): Promise<void> {
    return makeAuthenticatedRequest(`/finance/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  static async getCategories(): Promise<any> {
    return makeAuthenticatedRequest('/config/categories');
  }

  static async createCategory(category: any): Promise<any> {
    return makeAuthenticatedRequest('/config/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  static async updateCategory(id: string, category: any): Promise<any> {
    return makeAuthenticatedRequest(`/config/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  static async deleteCategory(id: string): Promise<any> {
    return makeAuthenticatedRequest(`/config/categories/${id}`, {
      method: 'DELETE',
    });
  }

  static async getGoals(): Promise<any> {
    return makeAuthenticatedRequest('/finance/goals');
  }

  static async createGoal(goal: any): Promise<any> {
    return makeAuthenticatedRequest('/finance/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  static async updateGoal(id: string, goal: any): Promise<any> {
    return makeAuthenticatedRequest(`/finance/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  static async getPaymentMethods(): Promise<any> {
    return makeAuthenticatedRequest('/finance/payment-methods/');
  }

  static async createPaymentMethod(paymentMethod: any): Promise<any> {
    return makeAuthenticatedRequest('/finance/payment-methods/', {
      method: 'POST',
      body: JSON.stringify(paymentMethod),
    });
  }

  static async updatePaymentMethod(id: string, paymentMethod: any): Promise<any> {
    return makeAuthenticatedRequest(`/finance/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentMethod),
    });
  }

  static async deletePaymentMethod(id: string): Promise<void> {
    return makeAuthenticatedRequest(`/finance/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }
}

// Debt API Service
export class DebtService {
  static async getPeople(): Promise<any> {
    return makeAuthenticatedRequest('/debts/people');
  }

  static async createPerson(person: any): Promise<any> {
    return makeAuthenticatedRequest('/debts/people', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  }

  static async updatePerson(id: string, person: any): Promise<any> {
    return makeAuthenticatedRequest(`/debts/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(person),
    });
  }

  static async deletePerson(id: string): Promise<void> {
    return makeAuthenticatedRequest(`/debts/people/${id}`, {
      method: 'DELETE',
    });
  }

  static async getDebts(month?: string): Promise<any> {
    const params = month ? `?month=${month}` : '';
    return makeAuthenticatedRequest(`/debts${params}`);
  }

  static async createDebt(debt: any): Promise<any> {
    return makeAuthenticatedRequest('/debts', {
      method: 'POST',
      body: JSON.stringify(debt),
    });
  }

  static async updateDebt(id: string, debt: any): Promise<any> {
    return makeAuthenticatedRequest(`/debts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(debt),
    });
  }

  static async updateDebtPayment(id: string, paymentData: any): Promise<any> {
    return makeAuthenticatedRequest(`/debts/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  }

  static async deleteDebt(id: string): Promise<void> {
    return makeAuthenticatedRequest(`/debts/${id}`, {
      method: 'DELETE',
    });
  }

  static async getDebtSummary(month: string): Promise<any> {
    return makeAuthenticatedRequest(`/debts/summary?month=${month}`);
  }
} 