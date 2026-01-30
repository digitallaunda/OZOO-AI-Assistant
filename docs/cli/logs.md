---
summary: "CLI reference for `ozzo logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
---

# `ozzo logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:
- Logging overview: [Logging](/logging)

## Examples

```bash
ozzo logs
ozzo logs --follow
ozzo logs --json
ozzo logs --limit 500
```

