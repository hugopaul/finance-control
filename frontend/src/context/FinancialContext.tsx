import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Transaction, Category, FinancialGoal, MonthlyData } from '../types';
import { PaymentMethod } from '../interfaces/api';
import { FinancialService } from '../services/api';

interface FinancialState {
  currentMonth: string;
  monthlyData: MonthlyData[];
  categories: Category[];
  goals: FinancialGoal[];
  isLoading: boolean;
  error: string | null;
  paymentMethods: PaymentMethod[];
  isActive: boolean; // Novo: indica se a aba está ativa
}

type FinancialAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'LOAD_CATEGORIES'; payload: Category[] }
  | { type: 'LOAD_GOALS'; payload: FinancialGoal[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CURRENT_MONTH'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'ADD_GOAL'; payload: FinancialGoal }
  | { type: 'UPDATE_GOAL'; payload: FinancialGoal }
  | { type: 'LOAD_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'SET_ACTIVE'; payload: boolean }; // Novo: controla se a aba está ativa

const initialState: FinancialState = {
  currentMonth: (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  })(), // YYYY-MM format
  monthlyData: [],
  categories: [],
  goals: [],
  isLoading: false,
  error: null,
  paymentMethods: [],
  isActive: false, // Inicialmente inativo
};

function financialReducer(state: FinancialState, action: FinancialAction): FinancialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'LOAD_TRANSACTIONS': {
      const transactions = action.payload;
      const monthlyDataMap = new Map<string, MonthlyData>();

      // Group transactions by month
      transactions.forEach(transaction => {
        const monthKey = transaction.date.slice(0, 7);
        const [year, month] = monthKey.split('-');
        
        if (!monthlyDataMap.has(monthKey)) {
          monthlyDataMap.set(monthKey, {
            month,
            year: parseInt(year),
            transactions: [],
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0,
            projectedBalance: 0,
          });
        }

        const monthData = monthlyDataMap.get(monthKey)!;
        monthData.transactions.push(transaction);

        if (transaction.type === 'income') {
          monthData.totalIncome += transaction.amount;
        } else {
          monthData.totalExpenses += transaction.amount;
        }
      });

      // Calculate balance for each month
      monthlyDataMap.forEach(monthData => {
        monthData.balance = monthData.totalIncome - monthData.totalExpenses;
      });

      return {
        ...state,
        monthlyData: Array.from(monthlyDataMap.values()),
      };
    }

    case 'LOAD_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'LOAD_GOALS':
      return { ...state, goals: action.payload };

    case 'ADD_TRANSACTION': {
      const newTransaction = action.payload;
      const monthKey = newTransaction.date.slice(0, 7);
      const [year, month] = monthKey.split('-');
      
      const updatedMonthlyData = [...state.monthlyData];
      let monthData = updatedMonthlyData.find(m => m.month === month && m.year === parseInt(year));
      
      if (!monthData) {
        monthData = {
          month,
          year: parseInt(year),
          transactions: [],
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          projectedBalance: 0,
        };
        updatedMonthlyData.push(monthData);
      }

      if (monthData) {
        monthData.transactions.push(newTransaction);
        
        if (newTransaction.type === 'income') {
          monthData.totalIncome += newTransaction.amount;
        } else {
          monthData.totalExpenses += newTransaction.amount;
        }
        
        monthData.balance = monthData.totalIncome - monthData.totalExpenses;
      }

      return { ...state, monthlyData: updatedMonthlyData };
    }

    case 'UPDATE_TRANSACTION': {
      const updatedTransaction = action.payload;
      const updatedMonthlyData = state.monthlyData.map(monthData => {
        const transactionIndex = monthData.transactions.findIndex(t => t.id === updatedTransaction.id);
        if (transactionIndex !== -1) {
          const oldTransaction = monthData.transactions[transactionIndex];
          const newTransactions = [...monthData.transactions];
          newTransactions[transactionIndex] = updatedTransaction;
          
          // Recalculate totals
          let totalIncome = 0;
          let totalExpenses = 0;
          
          newTransactions.forEach(t => {
            if (t.type === 'income') {
              totalIncome += t.amount;
            } else {
              totalExpenses += t.amount;
            }
          });
          
          return {
            ...monthData,
            transactions: newTransactions,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
          };
        }
        return monthData;
      });

      return { ...state, monthlyData: updatedMonthlyData };
    }

    case 'DELETE_TRANSACTION': {
      const deletedTransactionId = action.payload;
      const updatedMonthlyData = state.monthlyData.map(monthData => {
        const transactionIndex = monthData.transactions.findIndex(t => t.id === deletedTransactionId);
        if (transactionIndex !== -1) {
          const deletedTransaction = monthData.transactions[transactionIndex];
          const newTransactions = monthData.transactions.filter(t => t.id !== deletedTransactionId);
          
          // Recalculate totals
          let totalIncome = 0;
          let totalExpenses = 0;
          
          newTransactions.forEach(t => {
            if (t.type === 'income') {
              totalIncome += t.amount;
            } else {
              totalExpenses += t.amount;
            }
          });
          
          return {
            ...monthData,
            transactions: newTransactions,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
          };
        }
        return monthData;
      });

      return { ...state, monthlyData: updatedMonthlyData };
    }

    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        ),
      };

    case 'LOAD_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };

    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };

    default:
      return state;
  }
}

interface FinancialContextType {
  state: FinancialState;
  dispatch: React.Dispatch<FinancialAction>;
  loadTransactions: (month?: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadGoals: () => Promise<void>;
  createTransaction: (transaction: any) => Promise<void>;
  updateTransaction: (id: string, transaction: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createGoal: (goal: any) => Promise<void>;
  updateGoal: (id: string, goal: any) => Promise<void>;
  setActive: (isActive: boolean) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);
  const isInitialized = useRef(false);
  const isLoadingData = useRef(false);

  const loadTransactions = useCallback(async (month?: string) => {
    if (isLoadingData.current) return; // Evita chamadas simultâneas
    
    try {
      isLoadingData.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.getTransactions(month);
      if (response.success) {
        dispatch({
          type: 'LOAD_TRANSACTIONS',
          payload: Array.isArray(response.data)
            ? response.data
            : response.data?.transactions || []
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar transações' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      isLoadingData.current = false;
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.getCategories();
      if (response.success) {
        dispatch({ type: 'LOAD_CATEGORIES', payload: response.data?.categories || [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar categorias' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.getGoals();
      if (response.success) {
        dispatch({ type: 'LOAD_GOALS', payload: response.data?.goals || [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar metas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createTransaction = useCallback(async (transaction: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.createTransaction(transaction);
      if (response.success) {
        // Reload transactions to get updated data
        await loadTransactions(state.currentMonth);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao criar transação' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadTransactions, state.currentMonth]);

  const updateTransaction = useCallback(async (id: string, transaction: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.updateTransaction(id, transaction);
      if (response.success) {
        // Reload transactions to get updated data
        await loadTransactions(state.currentMonth);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar transação' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadTransactions, state.currentMonth]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await FinancialService.deleteTransaction(id);
      // Reload transactions to get updated data
      await loadTransactions(state.currentMonth);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao deletar transação' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadTransactions, state.currentMonth]);

  const createGoal = useCallback(async (goal: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.createGoal(goal);
      if (response.success) {
        // Reload goals to get updated data
        await loadGoals();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao criar meta' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadGoals]);

  const updateGoal = useCallback(async (id: string, goal: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await FinancialService.updateGoal(id, goal);
      if (response.success) {
        // Reload goals to get updated data
        await loadGoals();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar meta' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadGoals]);

  const setActive = useCallback((isActive: boolean) => {
    dispatch({ type: 'SET_ACTIVE', payload: isActive });
  }, []);

  // Carregamento inicial consolidado
  useEffect(() => {
    const initializeData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token || !state.isActive) return;
      
      if (!isInitialized.current) {
        isInitialized.current = true;
        
        try {
          // Carregar dados em paralelo para melhor performance
          await Promise.all([
            loadCategories(),
            loadGoals()
          ]);
          
          // Carregar transações do mês atual
          await loadTransactions(state.currentMonth);
        } catch (error) {
          console.error('Erro ao inicializar dados:', error);
        }
      } else {
        // Se já foi inicializado mas a aba ficou inativa e agora está ativa novamente
        try {
          await Promise.all([
            loadCategories(),
            loadGoals()
          ]);
          
          await loadTransactions(state.currentMonth);
        } catch (error) {
          console.error('Erro ao recarregar dados:', error);
        }
      }
    };

    initializeData();
  }, [state.isActive, loadCategories, loadGoals, loadTransactions, state.currentMonth]);

  // Detectar login e carregar dados automaticamente
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const token = localStorage.getItem('authToken');
      if (token && !isInitialized.current && state.isActive) {
        console.log('🔐 Usuário autenticado detectado, carregando dados...');
        isInitialized.current = true;
        
        try {
          // Carregar dados em paralelo para melhor performance
          await Promise.all([
            loadCategories(),
            loadGoals(),
            loadPaymentMethods()
          ]);
          
          // Carregar transações do mês atual
          await loadTransactions(state.currentMonth);
          console.log('✅ Dados carregados com sucesso após login');
        } catch (error) {
          console.error('❌ Erro ao carregar dados após login:', error);
        }
      }
    };

    // Verificar imediatamente
    checkAuthAndLoadData();

    // Listener para mudanças no localStorage (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue && !isInitialized.current) {
        // Usuário fez login, carregar dados
        console.log('🔄 Login detectado via storage event, carregando dados...');
        checkAuthAndLoadData();
      } else if (e.key === 'authToken' && !e.newValue) {
        // Usuário fez logout, resetar estado
        console.log('🚪 Logout detectado, limpando dados...');
        isInitialized.current = false;
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: [] });
        dispatch({ type: 'LOAD_CATEGORIES', payload: [] });
        dispatch({ type: 'LOAD_GOALS', payload: [] });
      }
    };

    // Listener para eventos customizados (mesma aba)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'authToken' && e.detail?.newValue && !isInitialized.current) {
        console.log('🔄 Login detectado via custom event, carregando dados...');
        checkAuthAndLoadData();
      } else if (e.detail?.key === 'authToken' && !e.detail?.newValue) {
        console.log('🚪 Logout detectado via custom event, limpando dados...');
        isInitialized.current = false;
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: [] });
        dispatch({ type: 'LOAD_CATEGORIES', payload: [] });
        dispatch({ type: 'LOAD_GOALS', payload: [] });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener);
    };
  }, [loadCategories, loadGoals, loadTransactions, state.currentMonth]);

  // Recarregar transações quando o mês mudar
  useEffect(() => {
    if (isInitialized.current && !isLoadingData.current && state.isActive) {
      loadTransactions(state.currentMonth);
    }
  }, [state.currentMonth, loadTransactions, state.isActive]);

  // Carregar formas de pagamento quando autenticado
  const loadPaymentMethods = useCallback(async () => {
    try {
      const result = await FinancialService.getPaymentMethods();
      const methods = Array.isArray(result) ? result : (result?.data || []);
      dispatch({ type: 'LOAD_PAYMENT_METHODS', payload: methods });
    } catch (error) {
      console.warn('Erro ao carregar formas de pagamento:', error);
    }
  }, []);

  // Carregar formas de pagamento quando autenticado
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && isInitialized.current && state.isActive) {
      loadPaymentMethods();
    }
  }, [loadPaymentMethods, isInitialized.current, state.isActive]);

  return (
    <FinancialContext.Provider value={{ 
      state, 
      dispatch, 
      loadTransactions, 
      loadCategories, 
      loadGoals, 
      createTransaction, 
      updateTransaction, 
      deleteTransaction, 
      createGoal, 
      updateGoal,
      setActive
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
} 