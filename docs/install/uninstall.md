---
summary: "Uninstall Ozzo completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Ozzo from a machine
  - The gateway service is still running after uninstall
---

# Uninstall

Two paths:
- **Easy path** if `ozzo` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
ozzo uninstall
```

Non-interactive (automation / npx):

```bash
ozzo uninstall --all --yes --non-interactive
npx -y ozzo uninstall --all --yes --non-interactive
```

Manual steps (same result):

1) Stop the gateway service:

```bash
ozzo gateway stop
```

2) Uninstall the gateway service (launchd/systemd/schtasks):

```bash
ozzo gateway uninstall
```

3) Delete state + config:

```bash
rm -rf "${OZOOBOT_STATE_DIR:-$HOME/.ozzobot}"
```

If you set `OZOOBOT_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4) Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/ozzo
```

5) Remove the CLI install (pick the one you used):

```bash
npm rm -g ozzo
pnpm remove -g ozzo
bun remove -g ozzo
```

6) If you installed the macOS app:

```bash
rm -rf /Applications/Ozzo.app
```

Notes:
- If you used profiles (`--profile` / `OZOOBOT_PROFILE`), repeat step 3 for each state dir (defaults are `~/.ozzobot-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `ozzo` is missing.

### macOS (launchd)

Default label is `bot.ozoo.gateway` (or `bot.ozoo.<profile>`; legacy `com.ozzobot.*` may still exist):

```bash
launchctl bootout gui/$UID/bot.ozoo.gateway
rm -f ~/Library/LaunchAgents/bot.ozoo.gateway.plist
```

If you used a profile, replace the label and plist name with `bot.ozoo.<profile>`. Remove any legacy `com.ozzobot.*` plists if present.

### Linux (systemd user unit)

Default unit name is `ozzo-gateway.service` (or `ozzo-gateway-<profile>.service`):

```bash
systemctl --user disable --now ozzo-gateway.service
rm -f ~/.config/systemd/user/ozzo-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Ozzo Gateway` (or `Ozzo Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Ozzo Gateway"
Remove-Item -Force "$env:USERPROFILE\.ozzobot\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.ozzobot-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://ozzo.bot/install.sh` or `install.ps1`, the CLI was installed with `npm install -g ozzo@latest`.
Remove it with `npm rm -g ozzo` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `ozzo ...` / `bun run ozzo ...`):

1) Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2) Delete the repo directory.
3) Remove state + workspace as shown above.
