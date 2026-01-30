import { describe, expect, it } from "vitest";

import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "ozzo", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "ozzo", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "ozzo", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "ozzo", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "ozzo", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "ozzo", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "ozzo", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "ozzo"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "ozzo", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "ozzo", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "ozzo", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "ozzo", "status", "--timeout=2500"], "--timeout")).toBe("2500");
    expect(getFlagValue(["node", "ozzo", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "ozzo", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "ozzo", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "ozzo", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "ozzo", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "ozzo", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "ozzo", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "ozzo", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "ozzo", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "ozzo", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["node", "ozzo", "status"],
    });
    expect(nodeArgv).toEqual(["node", "ozzo", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["node-22", "ozzo", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "ozzo", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["node-22.2.0.exe", "ozzo", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "ozzo", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["node-22.2", "ozzo", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "ozzo", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["node-22.2.exe", "ozzo", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "ozzo", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["/usr/bin/node-22.2.0", "ozzo", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "ozzo", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["nodejs", "ozzo", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "ozzo", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["node-dev", "ozzo", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "ozzo", "node-dev", "ozzo", "status"]);

    const directArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["ozzo", "status"],
    });
    expect(directArgv).toEqual(["node", "ozzo", "status"]);

    const bunArgv = buildParseArgv({
      programName: "ozzo",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "ozzo",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "ozzo", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "ozzo", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "ozzo", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "ozzo", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "ozzo", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "ozzo", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "ozzo", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "ozzo", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
