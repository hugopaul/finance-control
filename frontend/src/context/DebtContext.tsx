import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Person, Debt, DebtMonthlyData, DebtSummaryResponse } from '../types';
import { DebtService } from '../services/api';
import { useFinancial } from './FinancialContext';

interface DebtState {
  currentMonth: string;
  people: Person[];
  monthlyDebtData: DebtMonthlyData[];
  debtSummary: DebtSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  paymentMethods: any[];
  isActive: boolean; // Novo: indica se a aba está ativa
}

type DebtAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_PEOPLE'; payload: Person[] }
  | { type: 'LOAD_DEBTS'; payload: Debt[] }
  | { type: 'LOAD_DEBT_SUMMARY'; payload: DebtSummaryResponse }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'SET_CURRENT_MONTH'; payload: string }
  | { type: 'SET_ACTIVE'; payload: boolean }; // Novo: controla se a aba está ativa

const initialState: DebtState = {
  currentMonth: (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  })(), // YYYY-MM format
  people: [
    {
      id: '1',
      name: 'João Silva',
      phone: '(11) 99999-9999',
      relationship: 'amigo',
      color: 'bg-blue-500',
      notes: 'Amigo do trabalho'
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '(11) 88888-8888',
      relationship: 'familiar',
      color: 'bg-green-500',
      notes: 'Prima'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      phone: '(11) 77777-7777',
      relationship: 'colega',
      color: 'bg-purple-500',
      notes: 'Colega da faculdade'
    }
  ],
  monthlyDebtData: [],
  debtSummary: null,
  isLoading: false,
  error: null,
  paymentMethods: [],
  isActive: false, // Inicialmente inativo
};

function debtReducer(state: DebtState, action: DebtAction): DebtState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'LOAD_PEOPLE':
      return { ...state, people: action.payload };

    case 'LOAD_DEBTS': {
      const debts = action.payload;
      const monthlyDataMap = new Map<string, DebtMonthlyData>();

      // Group debts by month
      debts.forEach(debt => {
        const monthKey = debt.date.slice(0, 7);
        const [year, month] = monthKey.split('-');
        
        if (!monthlyDataMap.has(monthKey)) {
          monthlyDataMap.set(monthKey, {
            month,
            year: parseInt(year),
            debts: [],
            totalOwed: 0,
            totalPaid: 0,
            totalPending: 0,
          });
        }

        const monthData = monthlyDataMap.get(monthKey)!;
        monthData.debts.push(debt);
      });

      // Calculate totals for each month
      const monthlyData = Array.from(monthlyDataMap.values()).map(monthData => {
        const totalOwed = monthData.debts.reduce((sum, debt) => sum + debt.amount, 0);
        const totalPaid = monthData.debts.reduce((sum, debt) => sum + debt.paid_amount, 0);
        const totalPending = totalOwed - totalPaid;

        return {
          ...monthData,
          totalOwed,
          totalPaid,
          totalPending,
        };
      });

      return { ...state, monthlyDebtData: monthlyData.sort((a, b) => 
        new Date(a.year, parseInt(a.month) - 1).getTime() - new Date(b.year, parseInt(b.month) - 1).getTime()
      )};
    }

    case 'LOAD_DEBT_SUMMARY':
      return { ...state, debtSummary: action.payload };

    case 'ADD_PERSON': {
      return { ...state, people: [...state.people, action.payload] };
    }

    case 'UPDATE_PERSON': {
      const updatedPeople = state.people.map(person =>
        person.id === action.payload.id ? action.payload : person
      );
      return { ...state, people: updatedPeople };
    }

    case 'DELETE_PERSON': {
      const filteredPeople = state.people.filter(person => person.id !== action.payload);
      return { ...state, people: filteredPeople };
    }

    case 'ADD_DEBT': {
      const newDebt = action.payload;
      const monthKey = newDebt.date.slice(0, 7);
      
      const existingMonthIndex = state.monthlyDebtData.findIndex(
        month => `${month.year}-${month.month.padStart(2, '0')}` === monthKey
      );

      if (existingMonthIndex >= 0) {
        const updatedMonthlyData = [...state.monthlyDebtData];
        updatedMonthlyData[existingMonthIndex].debts.push(newDebt);
        
        // Recalculate totals
        const debts = updatedMonthlyData[existingMonthIndex].debts;
        const totalOwed = debts.reduce((sum, debt) => sum + debt.amount, 0);
        const totalPaid = debts.reduce((sum, debt) => sum + debt.paid_amount, 0);
        const totalPending = totalOwed - totalPaid;
        
        updatedMonthlyData[existingMonthIndex] = {
          ...updatedMonthlyData[existingMonthIndex],
          totalOwed,
          totalPaid,
          totalPending,
        };

        return { ...state, monthlyDebtData: updatedMonthlyData };
      } else {
        const [year, month] = monthKey.split('-');
        const newMonthData: DebtMonthlyData = {
          month,
          year: parseInt(year),
          debts: [newDebt],
          totalOwed: newDebt.amount,
          totalPaid: newDebt.paid_amount,
          totalPending: newDebt.amount - newDebt.paid_amount,
        };

        return {
          ...state,
          monthlyDebtData: [...state.monthlyDebtData, newMonthData].sort((a, b) => 
            new Date(a.year, parseInt(a.month) - 1).getTime() - new Date(b.year, parseInt(b.month) - 1).getTime()
          ),
        };
      }
    }

    case 'UPDATE_DEBT': {
      const updatedDebt = action.payload;
      const monthKey = updatedDebt.date.slice(0, 7);
      
      const monthIndex = state.monthlyDebtData.findIndex(
        month => `${month.year}-${month.month.padStart(2, '0')}` === monthKey
      );

      if (monthIndex >= 0) {
        const updatedMonthlyData = [...state.monthlyDebtData];
        const debtIndex = updatedMonthlyData[monthIndex].debts.findIndex(
          debt => debt.id === updatedDebt.id
        );

        if (debtIndex >= 0) {
          updatedMonthlyData[monthIndex].debts[debtIndex] = updatedDebt;
          
          // Recalculate totals
          const debts = updatedMonthlyData[monthIndex].debts;
          const totalOwed = debts.reduce((sum, debt) => sum + debt.amount, 0);
          const totalPaid = debts.reduce((sum, debt) => sum + debt.paid_amount, 0);
          const totalPending = totalOwed - totalPaid;
          
          updatedMonthlyData[monthIndex] = {
            ...updatedMonthlyData[monthIndex],
            totalOwed,
            totalPaid,
            totalPending,
          };

          return { ...state, monthlyDebtData: updatedMonthlyData };
        }
      }
      return state;
    }

    case 'DELETE_DEBT': {
      const debtId = action.payload;
      const updatedMonthlyData = state.monthlyDebtData.map(monthData => {
        const filteredDebts = monthData.debts.filter(debt => debt.id !== debtId);
        
        if (filteredDebts.length === monthData.debts.length) {
          return monthData; // No change
        }

        const totalOwed = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
        const totalPaid = filteredDebts.reduce((sum, debt) => sum + debt.paid_amount, 0);
        const totalPending = totalOwed - totalPaid;

        return {
          ...monthData,
          debts: filteredDebts,
          totalOwed,
          totalPaid,
          totalPending,
        };
      });

      return { ...state, monthlyDebtData: updatedMonthlyData };
    }

    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };

    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };

    default:
      return state;
  }
}

interface DebtContextType {
  state: DebtState;
  dispatch: React.Dispatch<DebtAction>;
  loadPeople: () => Promise<void>;
  loadDebts: (month?: string) => Promise<void>;
  loadDebtSummary: (month: string) => Promise<void>;
  createPerson: (person: any) => Promise<void>;
  updatePerson: (id: string, person: any) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  createDebt: (debt: any) => Promise<void>;
  updateDebt: (id: string, debt: any) => Promise<void>;
  updateDebtPayment: (id: string, paymentData: any) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  paymentMethods: any[]; // Added paymentMethods to the context type
  setActive: (active: boolean) => void; // Novo: controla se a aba está ativa
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export function DebtProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(debtReducer, initialState);
  const isInitialized = useRef(false);
  const { state: financialState } = useFinancial();

  const loadPeople = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.getPeople();
      if (response.success) {
        dispatch({ type: 'LOAD_PEOPLE', payload: response.data.people });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar pessoas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadDebts = useCallback(async (month?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.getDebts(month);
      if (response.success) {
        dispatch({ type: 'LOAD_DEBTS', payload: response.data.debts });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar dívidas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadDebtSummary = useCallback(async (month: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.getDebtSummary(month);
      if (response.success) {
        dispatch({ type: 'LOAD_DEBT_SUMMARY', payload: response.data.summary });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar resumo de dívidas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createPerson = useCallback(async (person: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.createPerson(person);
      if (response.success) {
        // Reload people to get updated data
        await loadPeople();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao criar pessoa' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadPeople]);

  const updatePerson = useCallback(async (id: string, person: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.updatePerson(id, person);
      if (response.success) {
        // Reload people to get updated data
        await loadPeople();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar pessoa' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadPeople]);

  const deletePerson = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await DebtService.deletePerson(id);
      // Reload people to get updated data
      await loadPeople();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao deletar pessoa' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadPeople]);

  const createDebt = useCallback(async (debt: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.createDebt(debt);
      if (response.success) {
        // Reload debts to get updated data
        await loadDebts();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao criar dívida' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadDebts]);

  const updateDebt = useCallback(async (id: string, debt: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.updateDebt(id, debt);
      if (response.success) {
        // Reload debts to get updated data
        await loadDebts();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar dívida' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadDebts]);

  const updateDebtPayment = useCallback(async (id: string, paymentData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await DebtService.updateDebtPayment(id, paymentData);
      if (response.success) {
        // Reload debts to get updated data
        await loadDebts();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar pagamento da dívida' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadDebts]);

  const deleteDebt = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await DebtService.deleteDebt(id);
      // Reload debts to get updated data
      await loadDebts();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao deletar dívida' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadDebts]);

  const setActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_ACTIVE', payload: active });
  }, []);

  // Load initial data when component mounts and user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && state.isActive) {
      if (!isInitialized.current) {
        isInitialized.current = true;
        loadPeople();
        loadDebts();
      } else {
        // Se já foi inicializado mas a aba ficou inativa e agora está ativa novamente
        loadPeople();
        loadDebts();
      }
    }
  }, [loadPeople, loadDebts, state.isActive]);

  // Reload data when user becomes authenticated (after login)
  useEffect(() => {
    const checkAuthAndReload = () => {
      const token = localStorage.getItem('authToken');
      if (token && isInitialized.current && state.isActive) {
        // User is authenticated, reload data
        loadPeople();
        loadDebts();
      }
    };

    // Check immediately
    checkAuthAndReload();

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue) {
        checkAuthAndReload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', (e: any) => {
      if (e.detail?.key === 'authToken' && e.detail?.newValue) {
        checkAuthAndReload();
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', (e: any) => {});
    };
  }, [loadPeople, loadDebts]);

  // Reload data when current month changes
  useEffect(() => {
    if (isInitialized.current && state.isActive) {
      loadDebts(state.currentMonth);
    }
  }, [state.currentMonth, loadDebts, state.isActive]);

  return (
    <DebtContext.Provider value={{ 
      state: { ...state, paymentMethods: financialState.paymentMethods }, 
      dispatch, 
      loadPeople, 
      loadDebts, 
      loadDebtSummary, 
      createPerson, 
      updatePerson, 
      deletePerson, 
      createDebt, 
      updateDebt, 
      updateDebtPayment, 
      deleteDebt,
      paymentMethods: financialState.paymentMethods,
      setActive,
    }}>
      {children}
    </DebtContext.Provider>
  );
}

export function useDebt() {
  const context = useContext(DebtContext);
  if (context === undefined) {
    throw new Error('useDebt must be used within a DebtProvider');
  }
  return context;
} 