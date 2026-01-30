/**
 * Centralized error handling utilities
 * Added in Phase 2 for better error management
 */

import { createSubsystemLogger } from "../logging/subsystem.js";

const log = createSubsystemLogger("error");

export type ErrorContext = {
  operation: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
};

export type ErrorSeverity = "info" | "warn" | "error" | "fatal";

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  options?: {
    fallback?: T;
    onError?: (error: Error) => void;
    severity?: ErrorSeverity;
    rethrow?: boolean;
  },
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const severity = options?.severity ?? "error";

    // Log with context
    const logMessage = `${context.operation} failed: ${err.message}`;
    const logContext = {
      ...context.metadata,
      error: err.message,
      stack: err.stack,
      userId: context.userId,
      sessionId: context.sessionId,
    };

    switch (severity) {
      case "info":
        log.info(logMessage, logContext);
        break;
      case "warn":
        log.warn(logMessage, logContext);
        break;
      case "error":
        log.error(logMessage, logContext);
        break;
      case "fatal":
        log.error(`FATAL: ${logMessage}`, logContext);
        break;
    }

    // Custom error callback
    if (options?.onError) {
      try {
        options.onError(err);
      } catch (callbackError) {
        log.warn("Error in error handler callback", { callbackError });
      }
    }

    // Return fallback or rethrow
    if (options?.rethrow !== false) {
      throw err;
    }

    if (options?.fallback !== undefined) {
      return options.fallback;
    }

    throw err;
  }
}

/**
 * Wrap sync function with error handling
 */
export function withErrorHandlingSync<T>(
  fn: () => T,
  context: ErrorContext,
  options?: {
    fallback?: T;
    onError?: (error: Error) => void;
    severity?: ErrorSeverity;
    rethrow?: boolean;
  },
): T {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const severity = options?.severity ?? "error";

    const logMessage = `${context.operation} failed: ${err.message}`;
    const logContext = {
      ...context.metadata,
      error: err.message,
      stack: err.stack,
      userId: context.userId,
      sessionId: context.sessionId,
    };

    switch (severity) {
      case "info":
        log.info(logMessage, logContext);
        break;
      case "warn":
        log.warn(logMessage, logContext);
        break;
      case "error":
        log.error(logMessage, logContext);
        break;
      case "fatal":
        log.error(`FATAL: ${logMessage}`, logContext);
        break;
    }

    if (options?.onError) {
      try {
        options.onError(err);
      } catch (callbackError) {
        log.warn("Error in error handler callback", { callbackError });
      }
    }

    if (options?.rethrow !== false) {
      throw err;
    }

    if (options?.fallback !== undefined) {
      return options.fallback;
    }

    throw err;
  }
}

/**
 * Retry async operation with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 10000;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delayMs = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);

      if (options.onRetry) {
        options.onRetry(attempt, lastError);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError ?? new Error("Retry failed");
}

/**
 * Check if error is retryable (network, timeout, etc.)
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const retryablePatterns = [
    "timeout",
    "econnrefused",
    "enotfound",
    "econnreset",
    "etimedout",
    "network",
    "temporarily unavailable",
    "rate limit",
    "too many requests",
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  value: string,
  context: ErrorContext,
  fallback?: T,
): T | null {
  return withErrorHandlingSync(
    () => JSON.parse(value) as T,
    context,
    {
      fallback: fallback ?? null,
      severity: "warn",
      rethrow: false,
    },
  );
}
