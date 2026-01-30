/**
 * Rate limiting utilities for API calls and operations
 * Added in Phase 2 for API protection and quota management
 */

export type RateLimiterOptions = {
  maxRequests: number;
  windowMs: number;
  onLimitExceeded?: (key: string) => void;
};

export type RateLimitStatus = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Token bucket rate limiter
 */
export class RateLimiter {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  private maxRequests: number;
  private windowMs: number;
  private onLimitExceeded?: (key: string) => void;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.onLimitExceeded = options.onLimitExceeded;
  }

  /**
   * Check if request is allowed and increment counter
   */
  checkLimit(key: string): RateLimitStatus {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    // Create new bucket if doesn't exist or expired
    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 0,
        resetAt: now + this.windowMs,
      };
      this.buckets.set(key, bucket);
    }

    // Check if limit exceeded
    if (bucket.count >= this.maxRequests) {
      this.onLimitExceeded?.(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
      };
    }

    // Increment counter
    bucket.count++;

    return {
      allowed: true,
      remaining: this.maxRequests - bucket.count,
      resetAt: bucket.resetAt,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.buckets.clear();
  }

  /**
   * Get current status without incrementing
   */
  getStatus(key: string): RateLimitStatus {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetAt: now + this.windowMs,
      };
    }

    return {
      allowed: bucket.count < this.maxRequests,
      remaining: Math.max(0, this.maxRequests - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  /**
   * Cleanup expired buckets
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, bucket] of this.buckets.entries()) {
      if (now >= bucket.resetAt) {
        this.buckets.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalBuckets: number;
    activeBuckets: number;
    expiredBuckets: number;
  } {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const bucket of this.buckets.values()) {
      if (now >= bucket.resetAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      totalBuckets: this.buckets.size,
      activeBuckets: active,
      expiredBuckets: expired,
    };
  }
}

/**
 * Sliding window rate limiter (more accurate but higher memory)
 */
export class SlidingWindowRateLimiter {
  private timestamps = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;
  private onLimitExceeded?: (key: string) => void;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.onLimitExceeded = options.onLimitExceeded;
  }

  /**
   * Check if request is allowed
   */
  checkLimit(key: string): RateLimitStatus {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create timestamp array
    let stamps = this.timestamps.get(key) ?? [];

    // Remove timestamps outside window
    stamps = stamps.filter((ts) => ts > windowStart);

    // Check limit
    if (stamps.length >= this.maxRequests) {
      this.onLimitExceeded?.(key);
      const oldestStamp = stamps[0] ?? now;
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestStamp + this.windowMs,
      };
    }

    // Add current timestamp
    stamps.push(now);
    this.timestamps.set(key, stamps);

    return {
      allowed: true,
      remaining: this.maxRequests - stamps.length,
      resetAt: now + this.windowMs,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.timestamps.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.timestamps.clear();
  }

  /**
   * Cleanup old timestamps
   */
  cleanup(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let cleaned = 0;

    for (const [key, stamps] of this.timestamps.entries()) {
      const filtered = stamps.filter((ts) => ts > windowStart);
      if (filtered.length === 0) {
        this.timestamps.delete(key);
        cleaned++;
      } else if (filtered.length < stamps.length) {
        this.timestamps.set(key, filtered);
      }
    }

    return cleaned;
  }
}

/**
 * Wrap async function with rate limiting
 */
export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  limiter: RateLimiter | SlidingWindowRateLimiter,
  options?: {
    onExceeded?: () => T | Promise<T>;
    throwOnExceeded?: boolean;
  },
): Promise<T> {
  const status = limiter.checkLimit(key);

  if (!status.allowed) {
    if (options?.throwOnExceeded !== false) {
      const waitMs = status.resetAt - Date.now();
      throw new Error(
        `Rate limit exceeded for ${key}. Retry after ${Math.ceil(waitMs / 1000)}s`,
      );
    }

    if (options?.onExceeded) {
      return await Promise.resolve(options.onExceeded());
    }

    throw new Error(`Rate limit exceeded for ${key}`);
  }

  return await fn();
}
