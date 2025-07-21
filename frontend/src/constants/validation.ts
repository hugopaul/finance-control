// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Email inválido',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Senha deve ter pelo menos 6 caracteres',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Nome deve ter entre 2 e 50 caracteres',
  },
  PHONE: {
    PATTERN: /^\(\d{2}\) \d{4,5}-\d{4}$/,
    MESSAGE: 'Telefone deve estar no formato (11) 99999-9999',
  },
  AMOUNT: {
    MIN: 0.01,
    MESSAGE: 'Valor deve ser maior que zero',
  },
  DESCRIPTION: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    MESSAGE: 'Descrição deve ter entre 3 e 100 caracteres',
  },
} as const;

// Form Validation Messages
export const FORM_MESSAGES = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'Email inválido',
  PASSWORD_TOO_SHORT: 'Senha deve ter pelo menos 6 caracteres',
  PASSWORDS_DONT_MATCH: 'Senhas não coincidem',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_AMOUNT: 'Valor inválido',
  INVALID_DATE: 'Data inválida',
  DESCRIPTION_TOO_SHORT: 'Descrição muito curta',
  DESCRIPTION_TOO_LONG: 'Descrição muito longa',
} as const; 