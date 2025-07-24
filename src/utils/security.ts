// Security utilities for input validation and error handling

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { isValid: false, error: "Email is required" };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length > 320) {
    return { isValid: false, error: "Email address is too long" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password must be less than 128 characters" };
  }
  
  // Check for basic password strength
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthChecks = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar];
  const strengthScore = strengthChecks.filter(Boolean).length;
  
  if (strengthScore < 2) {
    return { 
      isValid: false, 
      error: "Password should contain at least 2 of: lowercase, uppercase, numbers, special characters" 
    };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// Rate limiting utility for client-side
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < this.maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
}

// Standardized error messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please enter a valid email address",
  EMAIL_REQUIRED: "Email address is required",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  PASSWORD_TOO_LONG: "Password must be less than 128 characters",
  PASSWORD_WEAK: "Password should contain at least 2 of: lowercase, uppercase, numbers, special characters",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please try again later",
  GENERIC_ERROR: "Something went wrong. Please try again",
  UNAUTHORIZED: "You are not authorized to perform this action",
  NETWORK_ERROR: "Network error. Please check your connection",
} as const;

// Log security events (client-side logging)
export const logSecurityEvent = (event: string, details?: Record<string, any>) => {
  console.warn(`[SECURITY] ${event}`, details);
  
  // In production, you might want to send this to a monitoring service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'security_event', {
      event_category: 'security',
      event_label: event,
      custom_map: details
    });
  }
};