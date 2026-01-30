# Changelog

Full documentation: See project documentation.

## 2026.1.29
Status: beta.

### Highlights
- Rebrand: rename the npm package/CLI to `ozzo`, move extensions to the `@ozzo/*` scope, and update bundle IDs/labels/logging subsystems.
- New channels/plugins: Twitch plugin; Google Chat (beta) with Workspace Add-on events + typing indicator.
- Security hardening: gateway auth defaults required, hook token query-param deprecation, Windows ACL audits, mDNS minimal discovery, and SSH target option injection fix.
- WebChat: image paste + image-only sends; keep sub-agent announce replies visible.
- Tooling: per-sender group tool policies + tools.alsoAllow additive allowlist.
- Memory Search: allow extra paths for memory indexing.

### Breaking
- **BREAKING:** Gateway auth mode "none" is removed; gateway now requires token/password (Tailscale Serve identity still allowed).

### Fixes
- Security: harden SSH tunnel target parsing to prevent option injection/DoS.
- Security: prevent PATH injection in exec sandbox; harden file serving; pin DNS in URL fetches; verify Twilio webhooks; fix LINE webhook timing-attack edge case; validate Tailscale Serve identity; flag loopback Control UI with auth disabled as critical.
- Gateway: prevent crashes on transient network errors, suppress AbortError/unhandled rejections, sanitize error responses, clean session locks on exit, and harden reverse proxy handling for unauthenticated proxied connects.
- Config: auto-migrate legacy state/config paths; honor state dir overrides.
- Packaging: include missing dist/shared and dist/link-understanding outputs in npm tarball installs.
- Various provider stability fixes (Telegram, Discord, BlueBubbles, Voice Call, Signal, Slack, iMessage, Matrix).

## 2026.1.24

### Highlights
- Providers: Ollama discovery + docs; Venice guide upgrades + cross-links.
- Channels: LINE plugin (Messaging API) with rich replies + quick replies.
- TTS: Edge fallback (keyless) + `/tts` auto modes.
- Exec approvals: approve in-chat via `/approve` across all channels (including plugins).
- Telegram: DM topics as separate sessions + outbound link preview toggle.

### Changes
- TTS: add Edge TTS provider fallback, defaulting to keyless Edge with MP3 retry on format failures.
- TTS: add auto mode enum (off/always/inbound/tagged) with per-session `/tts` override.
- Telegram: treat DM topics as separate sessions and keep DM history limits stable with thread suffixes.
- Web search: add Brave freshness filter parameter for time-scoped results.
- UI: refresh Control UI dashboard design system (colors, icons, typography).

### Fixes
- Web UI: fix config/debug layout overflow, scrolling, and code block sizing.
- Gateway: allow Control UI token-only auth to skip device pairing even when device identity is present.
- Matrix: decrypt E2EE media attachments with preflight size guard.
- BlueBubbles: route phone-number targets to DMs, avoid leaking routing IDs, and auto-create missing DMs (Private API required).

## Previous Versions

See full CHANGELOG history in the git repository or documentation.

## Contributing

See CONTRIBUTING.md for guidelines on how to contribute to this project.

## License

MIT License - see LICENSE file for details.
