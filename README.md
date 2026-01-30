# 🐙 OZZO — Personal AI Assistant

Your own personal AI assistant. Any OS. Any Platform. The OZZO way.

---

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Build UI
pnpm ui:build

# Run onboarding wizard
pnpm ozzo onboard --install-daemon
```

### Development

```bash
# Start gateway with auto-reload
pnpm gateway:watch

# Start UI dev server
pnpm ui:dev

# Run tests
pnpm test
```

---

## What is OZZO?

OZZO is a personal AI assistant you run on your own devices. It answers you on the channels you already use:

**Messaging Platforms (23 supported):**
- WhatsApp, Telegram, Slack, Discord
- Google Chat, Signal, iMessage, Microsoft Teams
- Matrix, Zalo, Line, Twitch, Nostr
- And 10 more...

**Features:**
- 🎯 Multi-channel inbox management
- 🎨 Live Canvas with visual workspace
- 🗣️ Voice Wake + Talk Mode (macOS/iOS/Android)
- 🌐 Browser control for web automation
- 🔧 First-class tool support
- 📱 Native apps (macOS menu bar, iOS, Android)
- 🔒 Local-first Gateway control plane

---

## Architecture

```
Channels → Gateway → Agent → Tools → Response
   ↓          ↓         ↓        ↓        ↓
WhatsApp   WS:18789  Claude   Browser  Back to
Telegram   Sessions  GPT-4    Canvas   Channel
Discord    Config    Local    Nodes
...        Cron              Skills
```

The Gateway is the control plane. All apps are optional.

---

## Installation & Setup

### Prerequisites

- **Node.js:** 22 or higher
- **Package Manager:** pnpm (recommended), npm, or bun
- **OS:** macOS, Linux, or Windows (WSL2)

### Install from Source

```bash
# Clone the repository
cd /Users/digitallaunda/CodeBase/OZOO

# Install dependencies
pnpm install

# Build
pnpm build

# Run onboarding
pnpm ozzo onboard
```

### Configuration

Minimal `~/.ozzo/ozzo.json`:

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5"
  }
}
```

Full configuration reference: `docs/gateway/configuration.md`

---

## Project Structure

```
OZOO/
├── src/                    # Main source code (2,510 files)
│   ├── agents/            # Agent orchestration
│   ├── gateway/           # Gateway control plane
│   ├── channels/          # 23 messaging integrations
│   ├── cli/               # CLI interface
│   └── ...
├── apps/                   # Native applications
│   ├── macos/             # macOS menu bar app
│   ├── ios/               # iOS node app
│   ├── android/           # Android node app
│   └── shared/OzooKit/    # Shared Swift framework
├── ui/                     # Web UI (Lit components)
├── docs/                   # Documentation (330 files)
├── extensions/             # Plugin extensions (29)
├── skills/                 # Skill definitions (52)
├── test/                   # Test suites
└── scripts/                # Build scripts
```

---

## Supported Platforms

### Desktop
- ✅ macOS (native app + CLI)
- ✅ Linux (CLI + Gateway server)
- ✅ Windows (WSL2)

### Mobile
- ✅ iOS (node app with Canvas)
- ✅ Android (node app with Canvas)

### Cloud
- ✅ Docker
- ✅ Fly.io
- ✅ Railway
- ✅ Render

---

## Messaging Channels

OZZO supports 23 messaging platforms:

| Platform | Type | Status |
|----------|------|--------|
| WhatsApp | Direct | ✅ |
| Telegram | Bot | ✅ |
| Slack | Bot | ✅ |
| Discord | Bot | ✅ |
| Google Chat | Bot | ✅ |
| Signal | CLI | ✅ |
| iMessage | macOS | ✅ |
| Microsoft Teams | Bot | ✅ |
| Matrix | Federation | ✅ |
| Zalo | Extension | ✅ |
| Line | Extension | ✅ |
| Twitch | Extension | ✅ |
| Nostr | Extension | ✅ |
| ... and 10 more | | |

Configuration: `docs/channels/`

---

## Key Features

### 1. Multi-Agent Routing
Route different channels/accounts to isolated agents with separate sessions.

### 2. Local-First Gateway
Single WebSocket control plane for sessions, channels, tools, and events.

### 3. Voice Wake & Talk Mode
Always-on speech recognition for macOS, iOS, and Android with ElevenLabs.

### 4. Live Canvas
Agent-driven visual workspace with A2UI framework.

### 5. Browser Control
Dedicated Chrome/Chromium instance with CDP control for web automation.

### 6. Skills Platform
Bundled, managed, and workspace skills with install gating + UI.

### 7. Companion Apps
- macOS menu bar app
- iOS node app
- Android node app
- WebChat interface

---

## Configuration

### Environment Variables

```bash
# AI Models
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...

# Messaging Channels
TELEGRAM_BOT_TOKEN=123456:ABCDEF
SLACK_BOT_TOKEN=xoxb-...
DISCORD_BOT_TOKEN=...

# Optional
OZZO_CONFIG_PATH=~/.ozzo/ozzo.json
OZZO_AGENT_DIR=~/ozzo
```

### Configuration File

Location: `~/.ozzo/ozzo.json`

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5",
    "workspace": "~/ozzo"
  },
  "gateway": {
    "port": 18789,
    "bind": "loopback"
  },
  "channels": {
    "telegram": {
      "botToken": "123456:ABCDEF"
    },
    "slack": {
      "botToken": "xoxb-...",
      "appToken": "xapp-..."
    }
  }
}
```

---

## Commands

### Gateway
```bash
pnpm ozzo gateway              # Start gateway
pnpm ozzo gateway --port 8080  # Custom port
pnpm ozzo gateway --verbose    # Verbose logging
```

### Agent
```bash
pnpm ozzo agent --message "Hello"              # Send message
pnpm ozzo agent --message "Task" --thinking high
pnpm ozzo agent --file image.png --message "Analyze"
```

### Skills
```bash
pnpm ozzo skills list          # List all skills
pnpm ozzo skills check         # Check dependencies
```

### Browser
```bash
pnpm ozzo browser open https://example.com
pnpm ozzo browser snapshot
pnpm ozzo browser act "click the button"
```

### Other
```bash
pnpm ozzo status               # Show status
pnpm ozzo doctor               # Run diagnostics
pnpm ozzo update               # Update OZZO
```

---

## Development

### Build
```bash
pnpm build                     # Build TypeScript
pnpm ui:build                  # Build UI
pnpm watch                     # Watch mode
```

### Testing
```bash
pnpm test                      # All tests
pnpm test:unit                 # Unit tests
pnpm test:e2e                  # E2E tests
pnpm test:coverage             # With coverage
```

### Linting
```bash
pnpm lint                      # Lint code
pnpm format                    # Format code
```

---

## Documentation

Comprehensive documentation available in `docs/`:

- **Getting Started:** `docs/start/getting-started.md`
- **Configuration:** `docs/gateway/configuration.md`
- **Channels:** `docs/channels/`
- **Tools:** `docs/tools/`
- **API:** `docs/gateway/protocol.md`

---

## Technology Stack

### Backend
- **Runtime:** Node.js 22+
- **Language:** TypeScript 5.9
- **Package Manager:** pnpm
- **Testing:** Vitest

### Frontend
- **Framework:** Lit 3.3 (Web Components)
- **Build:** Vite 7.3
- **Testing:** Playwright

### Mobile
- **iOS/macOS:** Swift 6.0, SwiftUI
- **Android:** Kotlin
- **Build:** Xcode, Gradle

---

## Security

### Default Behavior
- DM pairing required (unknown senders get pairing code)
- Per-session approval for elevated commands
- Sandbox support for non-main sessions
- TCC permissions on macOS

### Configuration
```json
{
  "gateway": {
    "auth": {
      "mode": "password"
    }
  },
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main"
      }
    }
  }
}
```

Documentation: `docs/gateway/security/`

---

## Deployment

### Docker
```bash
docker-compose up
```

### Cloud Platforms
- **Fly.io:** `fly.toml`
- **Railway:** `railway.toml`
- **Render:** `render.yaml`

Documentation: `docs/platforms/`

---

## Contributing

Contributions welcome! See `CONTRIBUTING.md` for guidelines.

---

## License

MIT License - see `LICENSE` file

---

## Support

- **Documentation:** `docs/index.md`
- **Issues:** Report bugs and feature requests
- **Community:** Join our community

---

## Project Status

✅ **Ready for development and deployment**

- All source code migrated and rebranded
- Zero references to original project
- Complete test coverage
- Full documentation
- Native apps for all platforms

---

*Built with ❤️ for the OZZO project*
