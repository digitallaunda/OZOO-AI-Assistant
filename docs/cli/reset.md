---
summary: "CLI reference for `ozzo reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
---

# `ozzo reset`

Reset local config/state (keeps the CLI installed).

```bash
ozzo reset
ozzo reset --dry-run
ozzo reset --scope config+creds+sessions --yes --non-interactive
```

