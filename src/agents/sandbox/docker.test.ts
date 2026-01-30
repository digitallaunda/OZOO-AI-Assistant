/**
 * Tests for Docker security validation
 * Added in Phase 1 security hardening
 */

import { describe, expect, it } from "vitest";
import { execDocker } from "./docker.js";

describe("Docker Security Validation", () => {
  describe("execDocker input validation", () => {
    it("should reject shell metacharacters in arguments", async () => {
      await expect(
        execDocker(["run", "test;rm -rf /"]),
      ).rejects.toThrow(/suspicious characters/);

      await expect(
        execDocker(["run", "test|whoami"]),
      ).rejects.toThrow(/suspicious characters/);

      await expect(
        execDocker(["run", "test`whoami`"]),
      ).rejects.toThrow(/suspicious characters/);

      await expect(
        execDocker(["run", "test$(whoami)"]),
      ).rejects.toThrow(/suspicious characters/);
    });

    it("should reject path traversal attempts", async () => {
      await expect(
        execDocker(["run", "../../../etc/passwd"]),
      ).rejects.toThrow(/suspicious characters/);

      await expect(
        execDocker(["run", "test/../admin"]),
      ).rejects.toThrow(/suspicious characters/);
    });

    it("should reject flag injection", async () => {
      await expect(
        execDocker(["run", "  --privileged"]),
      ).rejects.toThrow(/suspicious characters/);

      await expect(
        execDocker(["run", "-v /:/host"]),
      ).rejects.toThrow(/suspicious characters/);
    });

    it("should reject invalid container names", async () => {
      await expect(
        execDocker(["port", "test@container", "8080/tcp"]),
      ).rejects.toThrow(/Invalid container name/);

      await expect(
        execDocker(["port", "test container", "8080/tcp"]),
      ).rejects.toThrow(/Invalid container name/);

      await expect(
        execDocker(["port", "test{container}", "8080/tcp"]),
      ).rejects.toThrow(/Invalid container name/);
    });

    it("should accept valid container names", async () => {
      // These should pass validation (though docker command will fail)
      const validNames = [
        "test-container",
        "test_container",
        "test.container",
        "test123",
        "a",
      ];

      for (const name of validNames) {
        // Will fail at docker execution, but should pass validation
        await expect(
          execDocker(["inspect", name], { allowFailure: true }),
        ).resolves.toBeDefined();
      }
    });

    it("should reject non-array arguments", async () => {
      await expect(
        execDocker("not-an-array" as any),
      ).rejects.toThrow(/must be an array/);

      await expect(
        execDocker(null as any),
      ).rejects.toThrow(/must be an array/);
    });

    it("should reject non-string array items", async () => {
      await expect(
        execDocker(["run", 123 as any]),
      ).rejects.toThrow(/Invalid docker argument type/);

      await expect(
        execDocker(["run", null as any]),
      ).rejects.toThrow(/Invalid docker argument type/);
    });

    it("should reject excessively long arguments", async () => {
      const longString = "a".repeat(1001);
      await expect(
        execDocker(["run", longString]),
      ).rejects.toThrow(/too long/);
    });

    it("should reject excessively long container names", async () => {
      const longName = "a".repeat(64);
      await expect(
        execDocker(["inspect", longName]),
      ).rejects.toThrow(/too long/);
    });
  });
});
