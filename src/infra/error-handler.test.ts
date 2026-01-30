/**
 * Tests for error handler utilities
 */

import { describe, expect, it, vi } from "vitest";
import {
  isRetryableError,
  safeJsonParse,
  withErrorHandling,
  withErrorHandlingSync,
  withRetry,
} from "./error-handler.js";

describe("Error Handler", () => {
  describe("withErrorHandling", () => {
    it("should execute function successfully", async () => {
      const result = await withErrorHandling(
        async () => "success",
        { operation: "test" },
      );
      expect(result).toBe("success");
    });

    it("should handle errors and rethrow by default", async () => {
      await expect(
        withErrorHandling(
          async () => {
            throw new Error("test error");
          },
          { operation: "test" },
        ),
      ).rejects.toThrow("test error");
    });

    it("should return fallback on error when rethrow=false", async () => {
      const result = await withErrorHandling(
        async () => {
          throw new Error("test error");
        },
        { operation: "test" },
        { fallback: "fallback-value", rethrow: false },
      );
      expect(result).toBe("fallback-value");
    });

    it("should call onError callback", async () => {
      const onError = vi.fn();
      await expect(
        withErrorHandling(
          async () => {
            throw new Error("test error");
          },
          { operation: "test" },
          { onError },
        ),
      ).rejects.toThrow();
      expect(onError).toHaveBeenCalledOnce();
    });
  });

  describe("withErrorHandlingSync", () => {
    it("should execute sync function successfully", () => {
      const result = withErrorHandlingSync(() => "success", { operation: "test" });
      expect(result).toBe("success");
    });

    it("should handle sync errors", () => {
      expect(() =>
        withErrorHandlingSync(
          () => {
            throw new Error("sync error");
          },
          { operation: "test" },
        ),
      ).toThrow("sync error");
    });
  });

  describe("withRetry", () => {
    it("should succeed on first attempt", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await withRetry(fn);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should retry on failure", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw after max attempts", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("always fails"));
      await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 })).rejects.toThrow(
        "always fails",
      );
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should call onRetry callback", async () => {
      const onRetry = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      await withRetry(fn, { maxAttempts: 2, baseDelayMs: 10, onRetry });
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe("isRetryableError", () => {
    it("should detect retryable errors", () => {
      expect(isRetryableError(new Error("Connection timeout"))).toBe(true);
      expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true);
      expect(isRetryableError(new Error("Network error"))).toBe(true);
      expect(isRetryableError(new Error("Rate limit exceeded"))).toBe(true);
    });

    it("should reject non-retryable errors", () => {
      expect(isRetryableError(new Error("Invalid input"))).toBe(false);
      expect(isRetryableError(new Error("Not found"))).toBe(false);
      expect(isRetryableError("not an error")).toBe(false);
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const result = safeJsonParse('{"key":"value"}', { operation: "test" });
      expect(result).toEqual({ key: "value" });
    });

    it("should return fallback on invalid JSON", () => {
      const result = safeJsonParse("invalid json", { operation: "test" }, { default: true });
      expect(result).toEqual({ default: true });
    });

    it("should return null on invalid JSON without fallback", () => {
      const result = safeJsonParse("invalid json", { operation: "test" });
      expect(result).toBeNull();
    });
  });
});
