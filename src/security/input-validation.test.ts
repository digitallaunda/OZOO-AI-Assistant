/**
 * Tests for input validation utilities
 * Added in Phase 2 security hardening
 */

import { describe, expect, it } from "vitest";
import {
  containsDangerousPattern,
  escapeHtml,
  isSafeForShell,
  parseIntSafe,
  sanitizeString,
  validateEmail,
  validateIdentifier,
  validatePhoneE164,
  validatePort,
  validateStringArray,
  validateUrl,
  validateUuid,
} from "./input-validation.js";

describe("Input Validation", () => {
  describe("containsDangerousPattern", () => {
    it("should detect shell injection patterns", () => {
      expect(containsDangerousPattern("test;rm -rf /").safe).toBe(false);
      expect(containsDangerousPattern("test|whoami").safe).toBe(false);
      expect(containsDangerousPattern("test`whoami`").safe).toBe(false);
      expect(containsDangerousPattern("test$(whoami)").safe).toBe(false);
      expect(containsDangerousPattern("test{value}").safe).toBe(false);
    });

    it("should detect path traversal", () => {
      expect(containsDangerousPattern("../etc/passwd").safe).toBe(false);
      expect(containsDangerousPattern("test/../admin").safe).toBe(false);
    });

    it("should detect flag injection", () => {
      expect(containsDangerousPattern("  --privileged").safe).toBe(false);
      expect(containsDangerousPattern(" -v /:/host").safe).toBe(false);
    });

    it("should allow safe strings", () => {
      expect(containsDangerousPattern("hello-world").safe).toBe(true);
      expect(containsDangerousPattern("test_123").safe).toBe(true);
      expect(containsDangerousPattern("normal text").safe).toBe(true);
    });
  });

  describe("sanitizeString", () => {
    it("should trim whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });

    it("should enforce max length", () => {
      const long = "a".repeat(2000);
      expect(sanitizeString(long, 100)).toHaveLength(100);
    });

    it("should remove null bytes", () => {
      expect(sanitizeString("hello\0world")).toBe("helloworld");
    });

    it("should remove control characters", () => {
      expect(sanitizeString("hello\x01\x02world")).toBe("helloworld");
    });

    it("should preserve newlines and tabs", () => {
      expect(sanitizeString("hello\nworld\ttab")).toBe("hello\nworld\ttab");
    });
  });

  describe("validateIdentifier", () => {
    it("should accept valid identifiers", () => {
      expect(validateIdentifier("test-container")).toBe("test-container");
      expect(validateIdentifier("test_container")).toBe("test_container");
      expect(validateIdentifier("test.container")).toBe("test.container");
      expect(validateIdentifier("test123")).toBe("test123");
    });

    it("should reject invalid identifiers", () => {
      expect(() => validateIdentifier("test@container")).toThrow();
      expect(() => validateIdentifier("test container")).toThrow();
      expect(() => validateIdentifier("test;container")).toThrow();
    });

    it("should enforce max length", () => {
      const long = "a".repeat(100);
      expect(() => validateIdentifier(long, 50)).toThrow();
    });
  });

  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("test@example.com")).toBe("test@example.com");
      expect(validateEmail("user.name@domain.co.uk")).toBe("user.name@domain.co.uk");
    });

    it("should reject invalid emails", () => {
      expect(() => validateEmail("not-an-email")).toThrow();
      expect(() => validateEmail("@example.com")).toThrow();
      expect(() => validateEmail("test@")).toThrow();
    });
  });

  describe("validatePhoneE164", () => {
    it("should accept valid E.164 phone numbers", () => {
      expect(validatePhoneE164("+1234567890")).toBe("+1234567890");
      expect(validatePhoneE164("+442071234567")).toBe("+442071234567");
    });

    it("should normalize formatted numbers", () => {
      expect(validatePhoneE164("+1 (234) 567-8900")).toBe("+12345678900");
      expect(validatePhoneE164("+1-234-567-8900")).toBe("+12345678900");
    });

    it("should reject invalid phone numbers", () => {
      expect(() => validatePhoneE164("1234567890")).toThrow(); // Missing +
      expect(() => validatePhoneE164("+0123456789")).toThrow(); // Starts with 0
      expect(() => validatePhoneE164("abc")).toThrow();
    });
  });

  describe("validateUrl", () => {
    it("should accept valid URLs", () => {
      expect(validateUrl("https://example.com")).toBe("https://example.com");
      expect(validateUrl("http://localhost:8080")).toBe("http://localhost:8080");
    });

    it("should reject invalid URLs", () => {
      expect(() => validateUrl("not-a-url")).toThrow();
      expect(() => validateUrl("ftp://example.com")).toThrow();
    });

    it("should block javascript: URLs", () => {
      expect(() => validateUrl("javascript:alert(1)")).toThrow();
      expect(() => validateUrl("JavaScript:alert(1)")).toThrow();
    });

    it("should block data: URLs", () => {
      expect(() => validateUrl("data:text/html,<script>alert(1)</script>")).toThrow();
    });
  });

  describe("validateUuid", () => {
    it("should accept valid UUIDs", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(validateUuid(uuid)).toBe(uuid);
    });

    it("should reject invalid UUIDs", () => {
      expect(() => validateUuid("not-a-uuid")).toThrow();
      expect(() => validateUuid("550e8400-invalid")).toThrow();
    });
  });

  describe("parseIntSafe", () => {
    it("should parse valid integers", () => {
      expect(parseIntSafe("123")).toBe(123);
      expect(parseIntSafe(456)).toBe(456);
    });

    it("should enforce min/max bounds", () => {
      expect(() => parseIntSafe("5", 10, 100)).toThrow(/too small/);
      expect(() => parseIntSafe("150", 10, 100)).toThrow(/too large/);
      expect(parseIntSafe("50", 10, 100)).toBe(50);
    });

    it("should reject invalid numbers", () => {
      expect(() => parseIntSafe("abc")).toThrow();
      expect(() => parseIntSafe("12.34")).toThrow(/Invalid number/);
    });
  });

  describe("validatePort", () => {
    it("should accept valid ports", () => {
      expect(validatePort(8080)).toBe(8080);
      expect(validatePort("3000")).toBe(3000);
    });

    it("should reject invalid ports", () => {
      expect(() => validatePort(0)).toThrow();
      expect(() => validatePort(65536)).toThrow();
      expect(() => validatePort(-1)).toThrow();
    });
  });

  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      expect(escapeHtml("<script>alert(1)</script>")).toBe(
        "&lt;script&gt;alert(1)&lt;&#x2F;script&gt;",
      );
      expect(escapeHtml('Hello "World" & \'Friends\'')).toBe(
        "Hello &quot;World&quot; &amp; &#x27;Friends&#x27;",
      );
    });
  });

  describe("isSafeForShell", () => {
    it("should detect unsafe shell characters", () => {
      expect(isSafeForShell("test;rm")).toBe(false);
      expect(isSafeForShell("test|grep")).toBe(false);
      expect(isSafeForShell("test`cmd`")).toBe(false);
    });

    it("should allow safe strings", () => {
      expect(isSafeForShell("hello-world")).toBe(true);
      expect(isSafeForShell("test_123")).toBe(true);
      expect(isSafeForShell("normal text")).toBe(true);
    });
  });

  describe("validateStringArray", () => {
    it("should validate arrays of strings", () => {
      const result = validateStringArray(["a", "b", "c"]);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should reject non-arrays", () => {
      expect(() => validateStringArray("not-array")).toThrow(/must be an array/);
      expect(() => validateStringArray(123)).toThrow(/must be an array/);
    });

    it("should reject arrays with non-strings", () => {
      expect(() => validateStringArray(["a", 123, "c"])).toThrow(/must be a string/);
    });

    it("should enforce array length limit", () => {
      const long = Array(101).fill("a");
      expect(() => validateStringArray(long, 100)).toThrow(/Array too long/);
    });

    it("should sanitize string items", () => {
      const result = validateStringArray(["  hello  ", "world\0"]);
      expect(result).toEqual(["hello", "world"]);
    });
  });
});
