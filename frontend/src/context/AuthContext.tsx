import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthState, User, LoginCredentials, RegisterData } from '../types';
import { useState } from 'react';

// Action Types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'AUTH_CHECK_COMPLETE' };

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading while checking auth
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_CHECK_COMPLETE':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.solidtechsolutions.com.br';

// API Service
class AuthService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
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
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await this.makeRequest<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (!response.success) {
      throw new Error('Login failed');
    }
    
    // Mapeia os campos do backend para o que o frontend espera
    return {
      user: response.data.user,
      token: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  }

  static async register(data: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await this.makeRequest<{ success: boolean; data: { user: User; token: string; refreshToken: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.success) {
      throw new Error('Registration failed');
    }
    
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await this.makeRequest<{ success: boolean; data: { user: User } }>('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.success) {
      throw new Error('Failed to get current user');
    }
    
    return response.data.user;
  }

  static async logout(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }
  }
}

// Context
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isRegistering, setIsRegistering] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Check for existing session on mount and listen for storage changes
  useEffect(() => {
    const checkAuth = async () => {
      // Don't make request if currently registering or just registered
      if (isRegistering || justRegistered) {
        return;
      }
      
      // Don't make request if user is already authenticated
      if (state.isAuthenticated) {
        return;
      }
      
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await AuthService.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
          localStorage.removeItem('authToken');
          console.warn('Invalid token, removed from storage');
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Token inválido' });
        }
      } else {
        dispatch({ type: 'AUTH_CHECK_COMPLETE' });
      }
    };

    // Initial check
    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue === null) {
          dispatch({ type: 'LOGOUT' });
        } else if (e.newValue && !state.isAuthenticated && !isRegistering && !justRegistered) {
          checkAuth();
        }
      }
    };

    // Listen for storage events (for cross-tab synchronization)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === 'authToken') {
        if (e.detail.newValue === null) {
          dispatch({ type: 'LOGOUT' });
        } else if (e.detail.newValue && !state.isAuthenticated && !isRegistering && !justRegistered) {
          checkAuth();
        }
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener);

    // Periodic check for manual localStorage changes (every 5 seconds)
    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (state.isAuthenticated && !currentToken) {
        dispatch({ type: 'LOGOUT' });
      } else if (!state.isAuthenticated && currentToken && !isRegistering && !justRegistered) {
        checkAuth();
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener);
      clearInterval(intervalId);
    };
  }, [state.isAuthenticated, isRegistering, justRegistered]);

  // Reset justRegistered flag after a delay
  useEffect(() => {
    if (justRegistered) {
      const timer = setTimeout(() => {
        setJustRegistered(false);
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [justRegistered]);

  // Helper function to dispatch localStorage change events
  const dispatchStorageEvent = useCallback((key: string, newValue: string | null) => {
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key, newValue }
    }));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await AuthService.login(credentials);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      dispatchStorageEvent('authToken', response.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erro ao fazer login' 
      });
    }
  }, [dispatchStorageEvent]);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setIsRegistering(true);
    dispatch({ type: 'REGISTER_START' });

    try {
      const response = await AuthService.register(data);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.user });
      setIsRegistering(false);
      setJustRegistered(true);
    } catch (error) {
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erro ao criar conta' 
      });
      setIsRegistering(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      dispatchStorageEvent('authToken', null);
      dispatch({ type: 'LOGOUT' });
    }
  }, [dispatchStorageEvent]);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 