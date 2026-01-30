// Default service labels (for backward compatibility and when no profile specified)
export const GATEWAY_LAUNCH_AGENT_LABEL = "bot.ozoo.gateway";
export const GATEWAY_SYSTEMD_SERVICE_NAME = "ozzo-gateway";
export const GATEWAY_WINDOWS_TASK_NAME = "Ozzo Gateway";
export const GATEWAY_SERVICE_MARKER = "ozzo";
export const GATEWAY_SERVICE_KIND = "gateway";
export const NODE_LAUNCH_AGENT_LABEL = "bot.ozoo.node";
export const NODE_SYSTEMD_SERVICE_NAME = "ozzo-node";
export const NODE_WINDOWS_TASK_NAME = "Ozzo Node";
export const NODE_SERVICE_MARKER = "ozzo";
export const NODE_SERVICE_KIND = "node";
export const NODE_WINDOWS_TASK_SCRIPT_NAME = "node.cmd";
export const LEGACY_GATEWAY_LAUNCH_AGENT_LABELS = ["com.ozzo.gateway", "com.steipete.ozzo.gateway"];
export const LEGACY_GATEWAY_SYSTEMD_SERVICE_NAMES: string[] = [];
export const LEGACY_GATEWAY_WINDOWS_TASK_NAMES: string[] = [];

export function normalizeGatewayProfile(profile?: string): string | null {
  const trimmed = profile?.trim();
  if (!trimmed || trimmed.toLowerCase() === "default") return null;
  return trimmed;
}

export function resolveGatewayProfileSuffix(profile?: string): string {
  const normalized = normalizeGatewayProfile(profile);
  return normalized ? `-${normalized}` : "";
}

export function resolveGatewayLaunchAgentLabel(profile?: string): string {
  const normalized = normalizeGatewayProfile(profile);
  if (!normalized) {
    return GATEWAY_LAUNCH_AGENT_LABEL;
  }
  return `bot.ozoo.${normalized}`;
}

export function resolveLegacyGatewayLaunchAgentLabels(profile?: string): string[] {
  const normalized = normalizeGatewayProfile(profile);
  if (!normalized) {
    return [...LEGACY_GATEWAY_LAUNCH_AGENT_LABELS];
  }
  return [...LEGACY_GATEWAY_LAUNCH_AGENT_LABELS, `com.ozzo.${normalized}`];
}

export function resolveGatewaySystemdServiceName(profile?: string): string {
  const suffix = resolveGatewayProfileSuffix(profile);
  if (!suffix) return GATEWAY_SYSTEMD_SERVICE_NAME;
  return `ozzo-gateway${suffix}`;
}

export function resolveGatewayWindowsTaskName(profile?: string): string {
  const normalized = normalizeGatewayProfile(profile);
  if (!normalized) return GATEWAY_WINDOWS_TASK_NAME;
  return `Ozzo Gateway (${normalized})`;
}

export function formatGatewayServiceDescription(params?: {
  profile?: string;
  version?: string;
}): string {
  const profile = normalizeGatewayProfile(params?.profile);
  const version = params?.version?.trim();
  const parts: string[] = [];
  if (profile) parts.push(`profile: ${profile}`);
  if (version) parts.push(`v${version}`);
  if (parts.length === 0) return "Ozzo Gateway";
  return `Ozzo Gateway (${parts.join(", ")})`;
}

export function resolveNodeLaunchAgentLabel(): string {
  return NODE_LAUNCH_AGENT_LABEL;
}

export function resolveNodeSystemdServiceName(): string {
  return NODE_SYSTEMD_SERVICE_NAME;
}

export function resolveNodeWindowsTaskName(): string {
  return NODE_WINDOWS_TASK_NAME;
}

export function formatNodeServiceDescription(params?: { version?: string }): string {
  const version = params?.version?.trim();
  if (!version) return "Ozzo Node Host";
  return `Ozzo Node Host (v${version})`;
}
