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
  
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password must be less than 128 characters" };
  }
  
  // Enhanced password strength requirements
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthChecks = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar];
  const strengthScore = strengthChecks.filter(Boolean).length;
  
  if (strengthScore < 3) {
    return { 
      isValid: false, 
      error: "Password must contain at least 3 of: lowercase, uppercase, numbers, special characters" 
    };
  }
  
  // Check for common weak patterns
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^abc123/i,
    /(.)\1{2,}/, // Repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      return { isValid: false, error: "Password contains common weak patterns" };
    }
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
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
  PASSWORD_TOO_LONG: "Password must be less than 128 characters",
  PASSWORD_WEAK: "Password must contain at least 3 of: lowercase, uppercase, numbers, special characters",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please try again later",
  GENERIC_ERROR: "Something went wrong. Please try again",
  UNAUTHORIZED: "You are not authorized to perform this action",
  NETWORK_ERROR: "Network error. Please check your connection",
  SUSPICIOUS_ACTIVITY: "Suspicious activity detected. Please try again later",
  ACCOUNT_LOCKED: "Account temporarily locked due to security concerns",
} as const;

// Enhanced security event logging
export const logSecurityEvent = (event: string, details?: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  const logData = {
    event,
    timestamp,
    ...details,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };
  
  console.warn(`[SECURITY] ${event}`, logData);
  
  // Send to analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'security_event', {
      event_category: 'security',
      event_label: event,
      custom_map: details
    });
  }

  // Store critical security events in localStorage for debugging
  if (typeof window !== 'undefined' && ['login_failed', 'signup_failed', 'rate_limited', 'suspicious_activity'].includes(event)) {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      existingEvents.push(logData);
      // Keep only last 50 events
      const recentEvents = existingEvents.slice(-50);
      localStorage.setItem('security_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to store security event:', error);
    }
  }
};