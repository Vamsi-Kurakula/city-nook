// Input validation and sanitization utilities
// This file provides security measures to prevent XSS, SQL injection, and other attacks

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates user answer input (for riddle stops)
 * @param answer - User's answer to validate
 * @returns boolean indicating if answer is valid
 */
export const validateUserAnswer = (answer: string): boolean => {
  if (!answer || typeof answer !== 'string') {
    return false;
  }
  
  const sanitized = sanitizeInput(answer);
  
  // Check length limits
  if (sanitized.length < 1 || sanitized.length > 500) {
    return false;
  }
  
  // Check for potentially malicious patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /vbscript:/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(sanitized));
};

/**
 * Validates crawl ID format
 * @param crawlId - Crawl ID to validate
 * @returns boolean indicating if crawl ID is valid
 */
export const validateCrawlId = (crawlId: string): boolean => {
  if (!crawlId || typeof crawlId !== 'string') {
    return false;
  }
  
  // Crawl IDs should be alphanumeric with hyphens/underscores
  const crawlIdRegex = /^[a-zA-Z0-9_-]+$/;
  return crawlIdRegex.test(crawlId.trim());
};

/**
 * Validates user ID format (Clerk user IDs)
 * @param userId - User ID to validate
 * @returns boolean indicating if user ID is valid
 */
export const validateUserId = (userId: string): boolean => {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  
  // Clerk user IDs are typically alphanumeric with specific format
  const userIdRegex = /^[a-zA-Z0-9_-]+$/;
  return userIdRegex.test(userId.trim()) && userId.length > 0 && userId.length < 100;
};

/**
 * Rate limiting utility for API calls
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  /**
   * Check if a request is allowed
   * @param key - Unique identifier for the request (e.g., user ID, IP)
   * @returns boolean indicating if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  /**
   * Clear rate limiting data for a key
   * @param key - Key to clear
   */
  clear(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Validates and sanitizes all user inputs before database operations
 * @param data - Object containing user input data
 * @returns Sanitized data object
 */
export const sanitizeUserData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeUserData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}; 