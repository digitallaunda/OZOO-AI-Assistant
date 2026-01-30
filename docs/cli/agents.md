---
summary: "CLI reference for `ozzo agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
---

# `ozzo agents`

Manage isolated agents (workspaces + auth + routing).

Related:
- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
ozzo agents list
ozzo agents add work --workspace ~/ozzo-work
ozzo agents set-identity --workspace ~/ozzo --from-identity
ozzo agents set-identity --agent main --avatar avatars/ozzo.png
ozzo agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:
- Example path: `~/ozzo/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:
- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
ozzo agents set-identity --workspace ~/ozzo --from-identity
```

Override fields explicitly:

```bash
ozzo agents set-identity --agent main --name "Ozoo" --emoji "🦞" --avatar avatars/ozzo.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Ozoo",
          theme: "OZZO",
          emoji: "🦞",
          avatar: "avatars/ozzo.png"
        }
      }
    ]
  }
}
```
