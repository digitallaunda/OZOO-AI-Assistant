/**
 * Caching utilities with LRU and TTL support
 * Added in Phase 2 for performance optimization
 */

export type CacheEntry<T> = {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
};

export type CacheOptions = {
  maxSize?: number;
  ttlMs?: number;
  onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
};

/**
 * LRU Cache with TTL support
 */
export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttlMs: number | null;
  private onEvict?: (key: string, entry: CacheEntry<T>) => void;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.ttlMs = options.ttlMs ?? null;
    this.onEvict = options.onEvict as ((key: string, entry: CacheEntry<T>) => void) | undefined;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (this.ttlMs && Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.onEvict?.(key, entry);
      return null;
    }

    // Update access tracking for LRU
    entry.accessCount++;
    entry.lastAccess = Date.now();

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    // Check if we need to evict
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
    });
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check TTL
    if (this.ttlMs && Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.onEvict?.(key, entry);
      return false;
    }

    return true;
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    const deleted = this.cache.delete(key);
    if (deleted && entry) {
      this.onEvict?.(key, entry);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.onEvict(key, entry);
      }
    }
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      if (entry) {
        this.onEvict?.(oldestKey, entry);
      }
    }
  }

  /**
   * Prune expired entries
   */
  pruneExpired(): number {
    if (!this.ttlMs) return 0;

    let pruned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
        this.onEvict?.(key, entry);
        pruned++;
      }
    }

    return pruned;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttlMs: number | null;
    oldestEntryAge: number | null;
    newestEntryAge: number | null;
    avgAccessCount: number;
  } {
    if (this.cache.size === 0) {
      return {
        size: 0,
        maxSize: this.maxSize,
        ttlMs: this.ttlMs,
        oldestEntryAge: null,
        newestEntryAge: null,
        avgAccessCount: 0,
      };
    }

    const now = Date.now();
    let oldestAge = 0;
    let newestAge = Number.POSITIVE_INFINITY;
    let totalAccessCount = 0;

    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      oldestAge = Math.max(oldestAge, age);
      newestAge = Math.min(newestAge, age);
      totalAccessCount += entry.accessCount;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttlMs,
      oldestEntryAge: oldestAge,
      newestEntryAge: newestAge,
      avgAccessCount: totalAccessCount / this.cache.size,
    };
  }
}

/**
 * Memoize async function with caching
 */
export function memoizeAsync<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  options: {
    keyGenerator?: (...args: Args) => string;
    maxSize?: number;
    ttlMs?: number;
  } = {},
): (...args: Args) => Promise<Result> {
  const cache = new LRUCache<Result>({
    maxSize: options.maxSize,
    ttlMs: options.ttlMs,
  });

  const defaultKeyGenerator = (...args: Args): string => {
    return JSON.stringify(args);
  };

  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;

  return async (...args: Args): Promise<Result> => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Memoize sync function with caching
 */
export function memoizeSync<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  options: {
    keyGenerator?: (...args: Args) => string;
    maxSize?: number;
    ttlMs?: number;
  } = {},
): (...args: Args) => Result {
  const cache = new LRUCache<Result>({
    maxSize: options.maxSize,
    ttlMs: options.ttlMs,
  });

  const defaultKeyGenerator = (...args: Args): string => {
    return JSON.stringify(args);
  };

  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;

  return (...args: Args): Result => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
