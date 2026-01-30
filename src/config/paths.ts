import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { OzzoConfig } from "./types.js";

/**
 * Nix mode detection: When OZZO_NIX_MODE=1, the gateway is running under Nix.
 * In this mode:
 * - No auto-install flows should be attempted
 * - Missing dependencies should produce actionable Nix-specific error messages
 * - Config is managed externally (read-only from Nix perspective)
 */
export function resolveIsNixMode(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OZZO_NIX_MODE === "1";
}

export const isNixMode = resolveIsNixMode();

const LEGACY_STATE_DIRNAME = ".ozzo";
const NEW_STATE_DIRNAME = ".ozzo";
const CONFIG_FILENAME = "ozzo.json";
const LEGACY_CONFIG_FILENAME = "ozzo.json";

function legacyStateDir(homedir: () => string = os.homedir): string {
  return path.join(homedir(), LEGACY_STATE_DIRNAME);
}

function newStateDir(homedir: () => string = os.homedir): string {
  return path.join(homedir(), NEW_STATE_DIRNAME);
}

export function resolveLegacyStateDir(homedir: () => string = os.homedir): string {
  return legacyStateDir(homedir);
}

export function resolveNewStateDir(homedir: () => string = os.homedir): string {
  return newStateDir(homedir);
}

/**
 * State directory for mutable data (sessions, logs, caches).
 * Can be overridden via OZZO_STATE_DIR (preferred) or OZZO_STATE_DIR (legacy).
 * Default: ~/.ozzo (legacy default for compatibility)
 * If ~/.ozzo exists and ~/.ozzo does not, prefer ~/.ozzo.
 */
export function resolveStateDir(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const override = env.OZZO_STATE_DIR?.trim() || env.OZZO_STATE_DIR?.trim();
  if (override) return resolveUserPath(override);
  const legacyDir = legacyStateDir(homedir);
  const newDir = newStateDir(homedir);
  const hasLegacy = fs.existsSync(legacyDir);
  const hasNew = fs.existsSync(newDir);
  if (!hasLegacy && hasNew) return newDir;
  return legacyDir;
}

function resolveUserPath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("~")) {
    const expanded = trimmed.replace(/^~(?=$|[\\/])/, os.homedir());
    return path.resolve(expanded);
  }
  return path.resolve(trimmed);
}

export const STATE_DIR = resolveStateDir();

/**
 * Config file path (JSON5).
 * Can be overridden via OZZO_CONFIG_PATH (preferred) or OZZO_CONFIG_PATH (legacy).
 * Default: ~/.ozzo/ozzo.json (or $*_STATE_DIR/ozzo.json)
 */
export function resolveCanonicalConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
): string {
  const override = env.OZZO_CONFIG_PATH?.trim() || env.OZZO_CONFIG_PATH?.trim();
  if (override) return resolveUserPath(override);
  return path.join(stateDir, CONFIG_FILENAME);
}

/**
 * Resolve the active config path by preferring existing config candidates
 * (new/legacy filenames) before falling back to the canonical path.
 */
export function resolveConfigPathCandidate(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const candidates = resolveDefaultConfigCandidates(env, homedir);
  const existing = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (existing) return existing;
  return resolveCanonicalConfigPath(env, resolveStateDir(env, homedir));
}

/**
 * Active config path (prefers existing legacy/new config files).
 */
export function resolveConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
  homedir: () => string = os.homedir,
): string {
  const override = env.OZZO_CONFIG_PATH?.trim() || env.OZZO_CONFIG_PATH?.trim();
  if (override) return resolveUserPath(override);
  const stateOverride = env.OZZO_STATE_DIR?.trim() || env.OZZO_STATE_DIR?.trim();
  const candidates = [
    path.join(stateDir, CONFIG_FILENAME),
    path.join(stateDir, LEGACY_CONFIG_FILENAME),
  ];
  const existing = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (existing) return existing;
  if (stateOverride) return path.join(stateDir, CONFIG_FILENAME);
  const defaultStateDir = resolveStateDir(env, homedir);
  if (path.resolve(stateDir) === path.resolve(defaultStateDir)) {
    return resolveConfigPathCandidate(env, homedir);
  }
  return path.join(stateDir, CONFIG_FILENAME);
}

export const CONFIG_PATH = resolveConfigPathCandidate();

/**
 * Resolve default config path candidates across new + legacy locations.
 * Order: explicit config path → state-dir-derived paths → new default → legacy default.
 */
export function resolveDefaultConfigCandidates(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string[] {
  const explicit = env.OZZO_CONFIG_PATH?.trim() || env.OZZO_CONFIG_PATH?.trim();
  if (explicit) return [resolveUserPath(explicit)];

  const candidates: string[] = [];
  const ozzoStateDir = env.OZZO_STATE_DIR?.trim();
  if (ozzoStateDir) {
    candidates.push(path.join(resolveUserPath(ozzoStateDir), CONFIG_FILENAME));
    candidates.push(path.join(resolveUserPath(ozzoStateDir), LEGACY_CONFIG_FILENAME));
  }
  const legacyStateDirOverride = env.OZZO_STATE_DIR?.trim();
  if (legacyStateDirOverride) {
    candidates.push(path.join(resolveUserPath(legacyStateDirOverride), CONFIG_FILENAME));
    candidates.push(path.join(resolveUserPath(legacyStateDirOverride), LEGACY_CONFIG_FILENAME));
  }

  candidates.push(path.join(newStateDir(homedir), CONFIG_FILENAME));
  candidates.push(path.join(newStateDir(homedir), LEGACY_CONFIG_FILENAME));
  candidates.push(path.join(legacyStateDir(homedir), CONFIG_FILENAME));
  candidates.push(path.join(legacyStateDir(homedir), LEGACY_CONFIG_FILENAME));
  return candidates;
}

export const DEFAULT_GATEWAY_PORT = 18789;

/**
 * Gateway lock directory (ephemeral).
 * Default: os.tmpdir()/ozzo-<uid> (uid suffix when available).
 */
export function resolveGatewayLockDir(tmpdir: () => string = os.tmpdir): string {
  const base = tmpdir();
  const uid = typeof process.getuid === "function" ? process.getuid() : undefined;
  const suffix = uid != null ? `ozzo-${uid}` : "ozzo";
  return path.join(base, suffix);
}

const OAUTH_FILENAME = "oauth.json";

/**
 * OAuth credentials storage directory.
 *
 * Precedence:
 * - `OZZO_OAUTH_DIR` (explicit override)
 * - `$*_STATE_DIR/credentials` (canonical server/default)
 * - `~/.ozzo/credentials` (legacy default)
 */
export function resolveOAuthDir(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
): string {
  const override = env.OZZO_OAUTH_DIR?.trim();
  if (override) return resolveUserPath(override);
  return path.join(stateDir, "credentials");
}

export function resolveOAuthPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
): string {
  return path.join(resolveOAuthDir(env, stateDir), OAUTH_FILENAME);
}

export function resolveGatewayPort(cfg?: OzzoConfig, env: NodeJS.ProcessEnv = process.env): number {
  const envRaw = env.OZZO_GATEWAY_PORT?.trim();
  if (envRaw) {
    const parsed = Number.parseInt(envRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const configPort = cfg?.gateway?.port;
  if (typeof configPort === "number" && Number.isFinite(configPort)) {
    if (configPort > 0) return configPort;
  }
  return DEFAULT_GATEWAY_PORT;
}
