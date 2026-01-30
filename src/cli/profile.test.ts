import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "ozzo",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "ozzo", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "ozzo", "--dev", "gateway"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "ozzo", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "ozzo", "--profile", "work", "status"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "ozzo", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "ozzo", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "ozzo", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "ozzo", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join("/home/peter", ".ozzo-dev");
    expect(env.OZZO_PROFILE).toBe("dev");
    expect(env.OZZO_STATE_DIR).toBe(expectedStateDir);
    expect(env.OZZO_CONFIG_PATH).toBe(path.join(expectedStateDir, "ozzo.json"));
    expect(env.OZZO_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      OZZO_STATE_DIR: "/custom",
      OZZO_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.OZZO_STATE_DIR).toBe("/custom");
    expect(env.OZZO_GATEWAY_PORT).toBe("19099");
    expect(env.OZZO_CONFIG_PATH).toBe(path.join("/custom", "ozzo.json"));
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("ozzo doctor --fix", {})).toBe("ozzo doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("ozzo doctor --fix", { OZZO_PROFILE: "default" })).toBe(
      "ozzo doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("ozzo doctor --fix", { OZZO_PROFILE: "Default" })).toBe(
      "ozzo doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("ozzo doctor --fix", { OZZO_PROFILE: "bad profile" })).toBe(
      "ozzo doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(
      formatCliCommand("ozzo --profile work doctor --fix", { OZZO_PROFILE: "work" }),
    ).toBe("ozzo --profile work doctor --fix");
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("ozzo --dev doctor", { OZZO_PROFILE: "dev" })).toBe(
      "ozzo --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("ozzo doctor --fix", { OZZO_PROFILE: "work" })).toBe(
      "ozzo --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("ozzo doctor --fix", { OZZO_PROFILE: "  jbozzo  " })).toBe(
      "ozzo --profile jbozzo doctor --fix",
    );
  });

  it("handles command with no args after ozzo", () => {
    expect(formatCliCommand("ozzo", { OZZO_PROFILE: "test" })).toBe(
      "ozzo --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm ozzo doctor", { OZZO_PROFILE: "work" })).toBe(
      "pnpm ozzo --profile work doctor",
    );
  });
});
