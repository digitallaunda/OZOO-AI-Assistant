/**
 * Tests for cache utilities
 */

import { describe, expect, it, vi } from "vitest";
import { LRUCache, memoizeAsync, memoizeSync, SlidingWindowRateLimiter } from "./cache-utils.js";

describe("Cache Utils", () => {
  describe("LRUCache", () => {
    it("should store and retrieve values", () => {
      const cache = new LRUCache<string>();
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null for missing keys", () => {
      const cache = new LRUCache<string>();
      expect(cache.get("missing")).toBeNull();
    });

    it("should respect max size with LRU eviction", () => {
      const cache = new LRUCache<string>({ maxSize: 2 });
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3"); // Should evict key1

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBe("value2");
      expect(cache.get("key3")).toBe("value3");
    });

    it("should evict least recently used", () => {
      const cache = new LRUCache<string>({ maxSize: 2 });
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.get("key1"); // Access key1, making it more recent
      cache.set("key3", "value3"); // Should evict key2 (less recent)

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBeNull();
      expect(cache.get("key3")).toBe("value3");
    });

    it("should respect TTL", async () => {
      const cache = new LRUCache<string>({ ttlMs: 100 });
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get("key1")).toBeNull();
    });

    it("should call onEvict callback", () => {
      const onEvict = vi.fn();
      const cache = new LRUCache<string>({ maxSize: 1, onEvict });

      cache.set("key1", "value1");
      cache.set("key2", "value2"); // Evicts key1

      expect(onEvict).toHaveBeenCalledOnce();
    });

    it("should prune expired entries", async () => {
      const cache = new LRUCache<string>({ ttlMs: 100 });
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      await new Promise((resolve) => setTimeout(resolve, 150));
      const pruned = cache.pruneExpired();

      expect(pruned).toBe(2);
      expect(cache.size()).toBe(0);
    });

    it("should provide accurate statistics", () => {
      const cache = new LRUCache<string>({ maxSize: 10 });
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.get("key1"); // Access twice

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
      expect(stats.avgAccessCount).toBe(1.5); // key1: 2, key2: 1
    });
  });

  describe("memoizeAsync", () => {
    it("should cache function results", async () => {
      const fn = vi.fn().mockResolvedValue("result");
      const memoized = memoizeAsync(fn);

      const result1 = await memoized("arg1");
      const result2 = await memoized("arg1"); // Should use cache

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should cache different args separately", async () => {
      const fn = vi.fn((arg: string) => Promise.resolve(`result-${arg}`));
      const memoized = memoizeAsync(fn);

      await memoized("arg1");
      await memoized("arg2");
      await memoized("arg1"); // Cache hit

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should respect TTL", async () => {
      const fn = vi.fn().mockResolvedValue("result");
      const memoized = memoizeAsync(fn, { ttlMs: 100 });

      await memoized("arg1");
      await new Promise((resolve) => setTimeout(resolve, 150));
      await memoized("arg1"); // Should call fn again

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("memoizeSync", () => {
    it("should cache sync function results", () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoizeSync(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledOnce();
    });
  });
});
