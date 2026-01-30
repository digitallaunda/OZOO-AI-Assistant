/**
 * Tests for rate limiter utilities
 */

import { describe, expect, it, vi } from "vitest";
import { RateLimiter, SlidingWindowRateLimiter, withRateLimit } from "./rate-limiter.js";

describe("Rate Limiter", () => {
  describe("RateLimiter (Token Bucket)", () => {
    it("should allow requests within limit", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      expect(limiter.checkLimit("user1").allowed).toBe(true);
      expect(limiter.checkLimit("user1").allowed).toBe(true);
      expect(limiter.checkLimit("user1").allowed).toBe(true);
    });

    it("should block requests exceeding limit", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.checkLimit("user1");
      limiter.checkLimit("user1");
      const blocked = limiter.checkLimit("user1");

      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it("should track remaining count", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      const status1 = limiter.checkLimit("user1");
      expect(status1.remaining).toBe(4);

      const status2 = limiter.checkLimit("user1");
      expect(status2.remaining).toBe(3);
    });

    it("should reset after window expires", async () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 100 });

      limiter.checkLimit("user1"); // Use up limit
      expect(limiter.checkLimit("user1").allowed).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(limiter.checkLimit("user1").allowed).toBe(true);
    });

    it("should call onLimitExceeded callback", () => {
      const onExceeded = vi.fn();
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000, onLimitExceeded: onExceeded });

      limiter.checkLimit("user1");
      limiter.checkLimit("user1"); // Exceeds limit

      expect(onExceeded).toHaveBeenCalledWith("user1");
    });

    it("should track limits per key separately", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.checkLimit("user1");
      limiter.checkLimit("user1");
      limiter.checkLimit("user2");

      expect(limiter.checkLimit("user1").allowed).toBe(false);
      expect(limiter.checkLimit("user2").allowed).toBe(true);
    });

    it("should reset specific key", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });

      limiter.checkLimit("user1");
      expect(limiter.checkLimit("user1").allowed).toBe(false);

      limiter.reset("user1");
      expect(limiter.checkLimit("user1").allowed).toBe(true);
    });

    it("should provide status without incrementing", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      limiter.checkLimit("user1"); // Count: 1
      const status = limiter.getStatus("user1");

      expect(status.remaining).toBe(2); // Should still be 2
    });

    it("should cleanup expired buckets", async () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 100 });

      limiter.checkLimit("user1");
      limiter.checkLimit("user2");

      await new Promise((resolve) => setTimeout(resolve, 150));
      const cleaned = limiter.cleanup();

      expect(cleaned).toBe(2);
    });
  });

  describe("SlidingWindowRateLimiter", () => {
    it("should allow requests within sliding window", () => {
      const limiter = new SlidingWindowRateLimiter({ maxRequests: 3, windowMs: 1000 });

      expect(limiter.checkLimit("user1").allowed).toBe(true);
      expect(limiter.checkLimit("user1").allowed).toBe(true);
      expect(limiter.checkLimit("user1").allowed).toBe(true);
    });

    it("should block when window is full", () => {
      const limiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.checkLimit("user1");
      limiter.checkLimit("user1");

      expect(limiter.checkLimit("user1").allowed).toBe(false);
    });

    it("should slide the window over time", async () => {
      const limiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 200 });

      limiter.checkLimit("user1");
      limiter.checkLimit("user1");
      expect(limiter.checkLimit("user1").allowed).toBe(false);

      // Wait for first request to exit window
      await new Promise((resolve) => setTimeout(resolve, 250));
      expect(limiter.checkLimit("user1").allowed).toBe(true);
    });
  });

  describe("withRateLimit", () => {
    it("should allow function execution when under limit", async () => {
      const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });
      const fn = vi.fn().mockResolvedValue("success");

      const result = await withRateLimit("user1", fn, limiter);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should throw when limit exceeded", async () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      const fn = vi.fn().mockResolvedValue("success");

      await withRateLimit("user1", fn, limiter);

      await expect(withRateLimit("user1", fn, limiter)).rejects.toThrow(/Rate limit exceeded/);
    });

    it("should call onExceeded callback", async () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
      const fn = vi.fn().mockResolvedValue("success");
      const onExceeded = vi.fn().mockReturnValue("fallback");

      await withRateLimit("user1", fn, limiter);
      const result = await withRateLimit("user1", fn, limiter, {
        onExceeded,
        throwOnExceeded: false,
      });

      expect(result).toBe("fallback");
      expect(onExceeded).toHaveBeenCalledOnce();
    });
  });
});
