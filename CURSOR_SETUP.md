# 🚀 Cursor Cloud Agents Setup Guide

## Step 1: Configure Cursor API Key

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "Features" → "Cloud Agents"
3. Paste your Cursor API Key

**Your API Key**: (The one you mentioned - keep it secure!)

## Step 2: Enable Cloud Agents

In Cursor, enable:
- ✅ Cloud Agent API
- ✅ Multi-agent collaboration
- ✅ Headless CLI access

## Step 3: Configure Agent Rules

Cursor will automatically read `.cursorrules` file in the project root.

Current configuration:
- Focus: Code Quality & Refactoring (Phase 2)
- Target: Large file splitting, type safety
- Standards: Max 500 LOC per file, strict TypeScript

## Step 4: Start Cloud Agents

### Via Cursor UI:
1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Search "Cursor: Start Cloud Agent"
3. Select task from `.cursorrules`

### Via CLI (Headless):
```bash
cursor-agent --project /Users/digitallaunda/CodeBase/OZOO --task "refactor-memory-manager"
```

## Recommended Agent Workflows

### Workflow 1: Memory Manager Refactoring
```bash
cursor-agent start \
  --file src/memory/manager.ts \
  --task "Split into 4 modules: core, sync, search, embeddings" \
  --max-loc 500
```

### Workflow 2: Type Safety Cleanup
```bash
cursor-agent start \
  --pattern "**/*.ts" \
  --task "Replace 'as any' with proper types" \
  --validate "pnpm lint && pnpm test"
```

### Workflow 3: TTS Refactoring
```bash
cursor-agent start \
  --file src/tts/tts.ts \
  --task "Refactor to provider pattern" \
  --test-after
```

## Multi-Agent Parallel Execution

Run multiple agents simultaneously:

```bash
# Terminal 1: Memory refactoring
cursor-agent start --task memory-refactor

# Terminal 2: Type safety
cursor-agent start --task type-safety

# Terminal 3: Pattern consistency
cursor-agent start --task pattern-consistency
```

## Monitoring Progress

Check agent status:
```bash
cursor-agent status --all
```

View logs:
```bash
cursor-agent logs --follow
```

## Integration with Git

Agents will:
- ✅ Create feature branches automatically
- ✅ Commit with descriptive messages
- ✅ Run tests before committing
- ✅ Request review for large changes

## Current Project Status

**Phase 1**: ✅ Complete (Security & Stability)
- Docker injection fixes
- XSS patches
- Env validation
- WebSocket security
- Error handlers

**Phase 2**: 🔄 In Progress (Code Quality)
- Memory manager refactoring
- Type safety improvements
- Pattern standardization

**Goal**: 58% → 95% completion

## Troubleshooting

### Agent fails to start
```bash
cursor-agent reset
cursor-agent verify-key
```

### Permission issues
```bash
cursor-agent auth --refresh
```

### API rate limits
- Cloud Agents: 1000 requests/hour
- Use `--throttle` flag for large operations

## Support

- Cursor Docs: https://cursor.sh/docs/cloud-agents
- OZOO Issues: File under `.github/ISSUE_TEMPLATE/`
- API Status: https://status.cursor.sh

---

**Ready to go!** 🚀

Start with: `cursor-agent start --task memory-refactor`
