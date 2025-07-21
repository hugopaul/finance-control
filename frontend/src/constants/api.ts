// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  
  // Finance
  FINANCE: {
    TRANSACTIONS: '/finance/transactions',
    GOALS: '/finance/goals',
  },
  
  // Debts
  DEBTS: {
    PEOPLE: '/debts/people',
    DEBTS: '/debts',
  },
  
  // Config
  CONFIG: {
    CATEGORIES: '/config/categories',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Acesso negado.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro interno do servidor.',
  UNKNOWN_ERROR: 'Erro desconhecido.',
  VALIDATION_ERROR: 'Dados inválidos.',
} as const; 