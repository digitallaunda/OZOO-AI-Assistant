import { z } from "zod";
import { createSubsystemLogger } from "../logging/subsystem.js";
import { parseBooleanValue } from "../utils/boolean.js";

const log = createSubsystemLogger("env");
const loggedEnv = new Set<string>();

// Centralized environment variable validation schema
const envSchema = z.object({
  // Node.js / Runtime
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  VITEST: z.string().optional(),
  HOME: z.string().optional(),
  USERPROFILE: z.string().optional(),
  HOMEDRIVE: z.string().optional(),
  HOMEPATH: z.string().optional(),
  SSH_TTY: z.string().optional(),
  NO_COLOR: z.string().optional(),
  FORCE_COLOR: z.string().optional(),

  // OZZO Configuration
  OZZO_STATE_DIR: z.string().optional(),
  OZZO_AGENT_DIR: z.string().optional(),
  OZZO_CONFIG_PATH: z.string().optional(),
  OZZO_SKIP_CANVAS_HOST: z.string().optional(),
  OZZO_SKIP_CHANNELS: z.string().optional(),
  OZZO_IMAGE_BACKEND: z.enum(["sips", "sharp"]).optional(),
  OZZO_TTS_PREFS: z.string().optional(),
  OZZO_BUNDLED_PLUGINS_DIR: z.string().optional(),
  OZZO_DEBUG_MEMORY_EMBEDDINGS: z.string().optional(),
  OZZO_EAGER_CHANNEL_OPTIONS: z.string().optional(),
  OZZO_NO_RESPAWN: z.string().optional(),
  OZZO_NODE_OPTIONS_READY: z.string().optional(),
  OZZO_PROFILE: z.string().optional(),
  OZZO_LIVE_TEST: z.string().optional(),
  PI_CODING_AGENT_DIR: z.string().optional(),

  // AI Provider API Keys
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_TTS_BASE_URL: z.string().url().or(z.string().length(0)).optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  XI_API_KEY: z.string().optional(),
  ZAI_API_KEY: z.string().optional(),
  Z_AI_API_KEY: z.string().optional(),
  CHUTES_CLIENT_ID: z.string().optional(),

  // Messaging Platform Tokens
  DISCORD_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_APP_TOKEN: z.string().optional(),
  WHATSAPP_SESSION: z.string().optional(),
  SIGNAL_NUMBER: z.string().optional(),

  // Other
  NODE_OPTIONS: z.string().optional(),
});

// Export validated environment with proper typing
export type ValidatedEnv = z.infer<typeof envSchema>;

let validatedEnv: ValidatedEnv | null = null;

/**
 * Get validated environment variables with type safety.
 * Call validateEnv() first during application startup.
 */
export function getEnv(): ValidatedEnv {
  if (!validatedEnv) {
    // Auto-validate on first access if not already validated
    validatedEnv = validateEnv();
  }
  return validatedEnv;
}

/**
 * Validate all environment variables at application startup.
 * Throws detailed error if validation fails.
 */
export function validateEnv(): ValidatedEnv {
  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `  - ${path}: ${issue.message} (got: ${JSON.stringify((process.env as Record<string, unknown>)[path])})`;
      });
      log.error("Environment variable validation failed:");
      for (const issue of issues) {
        log.error(issue);
      }
      throw new Error(
        `Invalid environment variables:\n${issues.join("\n")}\n\nPlease fix the above issues and restart.`,
      );
    }
    throw error;
  }
}

type AcceptedEnvOption = {
  key: string;
  description: string;
  value?: string;
  redact?: boolean;
};

function formatEnvValue(value: string, redact?: boolean): string {
  if (redact) return "<redacted>";
  const singleLine = value.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 160) return singleLine;
  return `${singleLine.slice(0, 160)}…`;
}

export function logAcceptedEnvOption(option: AcceptedEnvOption): void {
  if (process.env.VITEST || process.env.NODE_ENV === "test") return;
  if (loggedEnv.has(option.key)) return;
  const rawValue = option.value ?? process.env[option.key];
  if (!rawValue || !rawValue.trim()) return;
  loggedEnv.add(option.key);
  log.info(`env: ${option.key}=${formatEnvValue(rawValue, option.redact)} (${option.description})`);
}

export function normalizeZaiEnv(): void {
  if (!process.env.ZAI_API_KEY?.trim() && process.env.Z_AI_API_KEY?.trim()) {
    process.env.ZAI_API_KEY = process.env.Z_AI_API_KEY;
  }
}

export function isTruthyEnvValue(value?: string): boolean {
  return parseBooleanValue(value) === true;
}

export function normalizeEnv(): void {
  normalizeZaiEnv();
}
