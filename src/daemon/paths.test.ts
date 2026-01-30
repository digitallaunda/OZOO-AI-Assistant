import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".ozzo"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", OZZO_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".ozzo-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", OZZO_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".ozzo"));
  });

  it("uses OZZO_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", OZZO_STATE_DIR: "/var/lib/ozzo" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/ozzo"));
  });

  it("expands ~ in OZZO_STATE_DIR", () => {
    const env = { HOME: "/Users/test", OZZO_STATE_DIR: "~/ozzo-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/ozzo-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { OZZO_STATE_DIR: "C:\\State\\ozzo" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\ozzo");
  });
});
