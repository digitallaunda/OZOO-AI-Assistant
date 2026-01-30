/**
 * Centralized input validation utilities
 * Security best practices for OZOO
 * Added in Phase 1 security hardening
 */

// Common validation patterns
export const VALIDATION_PATTERNS = {
  // Alphanumeric with common separators
  SAFE_IDENTIFIER: /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/,
  // Email validation (basic)
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Phone number (E.164 format)
  PHONE_E164: /^\+[1-9]\d{1,14}$/,
  // UUID v4
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  // URL (basic)
  URL: /^https?:\/\/.+$/,
} as const;

// Dangerous patterns that should be blocked
export const DANGEROUS_PATTERNS = {
  // Shell metacharacters
  SHELL_INJECTION: /[;&|`$(){}[\]<>]/,
  // Path traversal
  PATH_TRAVERSAL: /\.\./,
  // Flag injection (starts with dash)
  FLAG_INJECTION: /^\s*-/,
  // SQL injection keywords
  SQL_INJECTION: /(\b(union|select|insert|update|delete|drop|exec|execute)\b)|(-{2})|\/\*/i,
  // Script tags
  XSS_SCRIPT: /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  // Event handlers
  XSS_EVENTS: /on\w+\s*=/i,
} as const;

/**
 * Validate string against a safe pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  errorMessage: string,
): void {
  if (!pattern.test(value)) {
    throw new Error(errorMessage);
  }
}

/**
 * Check if string contains dangerous patterns
 */
export function containsDangerousPattern(value: string): {
  safe: boolean;
  matched?: keyof typeof DANGEROUS_PATTERNS;
} {
  for (const [key, pattern] of Object.entries(DANGEROUS_PATTERNS)) {
    if (pattern.test(value)) {
      return {
        safe: false,
        matched: key as keyof typeof DANGEROUS_PATTERNS,
      };
    }
  }
  return { safe: true };
}

/**
 * Sanitize string for safe usage
 */
export function sanitizeString(value: string, maxLength = 1000): string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }

  // Trim and enforce max length
  let sanitized = value.trim().slice(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove control characters (except newline, tab, carriage return)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized;
}

/**
 * Validate and sanitize identifier (container names, IDs, etc.)
 */
export function validateIdentifier(value: string, maxLength = 63): string {
  const sanitized = sanitizeString(value, maxLength);

  if (!VALIDATION_PATTERNS.SAFE_IDENTIFIER.test(sanitized)) {
    throw new Error(
      `Invalid identifier: must be alphanumeric with optional .-_ (got: ${sanitized.slice(0, 50)})`,
    );
  }

  return sanitized;
}

/**
 * Validate email address
 */
export function validateEmail(value: string): string {
  const sanitized = sanitizeString(value, 254); // Max email length per RFC

  if (!VALIDATION_PATTERNS.EMAIL.test(sanitized)) {
    throw new Error(`Invalid email address: ${sanitized.slice(0, 50)}`);
  }

  return sanitized;
}

/**
 * Validate phone number (E.164 format)
 */
export function validatePhoneE164(value: string): string {
  const sanitized = value.trim().replace(/[\s()-]/g, ""); // Allow common formatting

  if (!VALIDATION_PATTERNS.PHONE_E164.test(sanitized)) {
    throw new Error(`Invalid phone number: must be E.164 format (e.g., +1234567890)`);
  }

  return sanitized;
}

/**
 * Validate URL
 */
export function validateUrl(value: string): string {
  const sanitized = sanitizeString(value, 2048); // Max URL length

  if (!VALIDATION_PATTERNS.URL.test(sanitized)) {
    throw new Error(`Invalid URL: must start with http:// or https://`);
  }

  // Additional security: block javascript: and data: URLs
  if (sanitized.toLowerCase().startsWith("javascript:") || sanitized.toLowerCase().startsWith("data:")) {
    throw new Error("Invalid URL: javascript: and data: URLs are not allowed");
  }

  return sanitized;
}

/**
 * Validate UUID
 */
export function validateUuid(value: string): string {
  const sanitized = sanitizeString(value, 36);

  if (!VALIDATION_PATTERNS.UUID_V4.test(sanitized)) {
    throw new Error(`Invalid UUID: ${sanitized}`);
  }

  return sanitized;
}

/**
 * Safe parseInt with validation
 */
export function parseIntSafe(
  value: string | number,
  min?: number,
  max?: number,
): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number: ${String(value)}`);
  }

  if (min !== undefined && parsed < min) {
    throw new Error(`Number too small: ${parsed} < ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new Error(`Number too large: ${parsed} > ${max}`);
  }

  return parsed;
}

/**
 * Validate port number
 */
export function validatePort(value: string | number): number {
  return parseIntSafe(value, 1, 65535);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Check if value is safe for shell execution
 */
export function isSafeForShell(value: string): boolean {
  return !DANGEROUS_PATTERNS.SHELL_INJECTION.test(value);
}

/**
 * Validate array of strings
 */
export function validateStringArray(
  value: unknown,
  maxLength = 100,
  itemMaxLength = 1000,
): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Value must be an array");
  }

  if (value.length > maxLength) {
    throw new Error(`Array too long: ${value.length} > ${maxLength}`);
  }

  return value.map((item, index) => {
    if (typeof item !== "string") {
      throw new Error(`Array item ${index} must be a string`);
    }
    return sanitizeString(item, itemMaxLength);
  });
}
