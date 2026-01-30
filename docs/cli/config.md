---
summary: "CLI reference for `ozzo config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
---

# `ozzo config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `ozzo configure`).

## Examples

```bash
ozzo config get browser.executablePath
ozzo config set browser.executablePath "/usr/bin/google-chrome"
ozzo config set agents.defaults.heartbeat.every "2h"
ozzo config set agents.list[0].tools.exec.node "node-id-or-name"
ozzo config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
ozzo config get agents.defaults.workspace
ozzo config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
ozzo config get agents.list
ozzo config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
ozzo config set agents.defaults.heartbeat.every "0m"
ozzo config set gateway.port 19001 --json
ozzo config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
