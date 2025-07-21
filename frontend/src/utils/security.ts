// Security utilities for token management and input sanitization

// Token Management
export class TokenManager {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  // Store token in memory (more secure than localStorage)
  private static token: string | null = null;
  private static refreshToken: string | null = null;

  static setToken(token: string): void {
    this.token = token;
    // For backward compatibility, also store in localStorage
    // In production, consider using httpOnly cookies instead
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    // Fallback to localStorage
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    this.refreshToken = token;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
}

// Input Sanitization
export class InputSanitizer {
  // Remove HTML tags and dangerous characters
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining < >
      .trim();
  }

  // Sanitize email input
  static sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, ''); // Remove special characters except @ . -
  }

  // Sanitize phone number
  static sanitizePhone(phone: string): string {
    return phone
      .replace(/[^\d()\s-]/g, '') // Keep only digits, parentheses, spaces, and hyphens
      .trim();
  }

  // Sanitize amount (currency)
  static sanitizeAmount(amount: string): string {
    return amount
      .replace(/[^\d.,]/g, '') // Keep only digits, dots, and commas
      .replace(/,/g, '.') // Replace comma with dot
      .replace(/\.(?=.*\.)/g, ''); // Keep only the last dot
  }

  // Sanitize name
  static sanitizeName(name: string): string {
    return name
      .replace(/[^\w\sàáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/gi, '') // Allow letters, spaces, and accented characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Sanitize description
  static sanitizeDescription(description: string): string {
    return description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining < >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Validate and sanitize URL
  static sanitizeUrl(url: string): string | null {
    try {
      const sanitized = url.trim();
      new URL(sanitized); // Validate URL
      return sanitized;
    } catch {
      return null;
    }
  }
}

// CSRF Protection
export class CSRFProtection {
  private static readonly CSRF_TOKEN_KEY = 'csrfToken';

  static generateToken(): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem(this.CSRF_TOKEN_KEY, token);
    return token;
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token;
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
  }
}

// Rate Limiting (Client-side)
export class RateLimiter {
  private static requests: Map<string, { count: number; resetTime: number }> = new Map();

  static canMakeRequest(endpoint: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = endpoint;
    const request = this.requests.get(key);

    if (!request || now > request.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (request.count >= maxRequests) {
      return false;
    }

    request.count++;
    return true;
  }

  static clearRequests(): void {
    this.requests.clear();
  }
}

// XSS Protection
export class XSSProtection {
  // Escape HTML entities
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Unescape HTML entities
  static unescapeHtml(text: string): string {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || '';
  }

  // Validate and sanitize user input
  static validateInput(input: string, type: 'text' | 'email' | 'number' | 'url'): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'number':
        return !isNaN(Number(input)) && isFinite(Number(input));
      case 'url':
        try {
          new URL(input);
          return true;
        } catch {
          return false;
        }
      default:
        return input.length > 0 && input.length <= 1000; // Reasonable text length
    }
  }
}

// Content Security Policy Helper
export class CSPHelper {
  static generateNonce(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static validateNonce(nonce: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(nonce) && nonce.length >= 16;
  }
} 