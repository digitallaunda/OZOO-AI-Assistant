---
summary: "CLI reference for `ozzo plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
---

# `ozzo plugins`

Manage Gateway plugins/extensions (loaded in-process).

Related:
- Plugin system: [Plugins](/plugin)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
ozzo plugins list
ozzo plugins info <id>
ozzo plugins enable <id>
ozzo plugins disable <id>
ozzo plugins doctor
ozzo plugins update <id>
ozzo plugins update --all
```

Bundled plugins ship with Ozzo but start disabled. Use `plugins enable` to
activate them.

All plugins must ship a `ozzo.plugin.json` file with an inline JSON Schema
(`configSchema`, even if empty). Missing/invalid manifests or schemas prevent
the plugin from loading and fail config validation.

### Install

```bash
ozzo plugins install <path-or-spec>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
ozzo plugins install -l ./my-plugin
```

### Update

```bash
ozzo plugins update <id>
ozzo plugins update --all
ozzo plugins update <id> --dry-run
```

Updates only apply to plugins installed from npm (tracked in `plugins.installs`).
