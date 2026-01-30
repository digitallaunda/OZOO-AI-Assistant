# OZOO Test Suite

This directory contains the core test suite for OZOO, migrated from the ozzo repository.

## Structure

```
test/
├── fixtures/           # Test fixtures and mock data
│   └── child-process-bridge/
│       └── child.js   # Child process bridge fixture
├── helpers/           # Test helper utilities
│   ├── envelope-timestamp.ts
│   ├── inbound-contract.ts
│   ├── normalize-text.ts
│   ├── paths.ts
│   ├── poll.ts
│   └── temp-home.ts
├── mocks/            # Mock implementations
│   └── baileys.ts   # WhatsApp Baileys mock
├── auto-reply.retry.test.ts
├── gateway.multi.e2e.test.ts
├── global-setup.ts
├── inbound-contract.providers.test.ts
├── media-understanding.auto.e2e.test.ts
├── provider-timeout.e2e.test.ts
├── setup.ts
└── test-env.ts
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test test/gateway.multi.e2e.test.ts
```

## Test Categories

### Unit Tests
- Provider contract validation
- Text normalization
- Path utilities
- Polling helpers

### Integration Tests
- Auto-reply retry logic
- Multi-provider inbound contracts
- Media understanding

### E2E Tests
- Multi-gateway orchestration
- Provider timeout and fallback
- Media transcription auto-detection
- WebSocket + HTTP protocol compliance

## Environment Variables

Tests use the `OZZO_*` prefix for environment variables:
- `OZZO_CONFIG_PATH`
- `OZZO_STATE_DIR`
- `OZZO_GATEWAY_PORT`
- `OZZO_GATEWAY_TOKEN`
- `OZZO_TEST_FAST`
- `OZZO_LIVE_TEST`
- etc.

## Test Isolation

All tests run in isolated environments with:
- Temporary HOME directories
- Isolated config/state directories
- Mocked channel plugins
- Snapshot/restore of environment variables

This ensures tests never contaminate developer config or state.
