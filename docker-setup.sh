#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
EXTRA_COMPOSE_FILE="$ROOT_DIR/docker-compose.extra.yml"
IMAGE_NAME="${OZZO_IMAGE:-ozzo:local}"
EXTRA_MOUNTS="${OZZO_EXTRA_MOUNTS:-}"
HOME_VOLUME_NAME="${OZZO_HOME_VOLUME:-}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing dependency: $1" >&2
    exit 1
  fi
}

require_cmd docker
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose not available (try: docker compose version)" >&2
  exit 1
fi

mkdir -p "${OZZO_CONFIG_DIR:-$HOME/.ozzo}"
mkdir -p "${OZZO_WORKSPACE_DIR:-$HOME/ozzo}"

export OZZO_CONFIG_DIR="${OZZO_CONFIG_DIR:-$HOME/.ozzo}"
export OZZO_WORKSPACE_DIR="${OZZO_WORKSPACE_DIR:-$HOME/ozzo}"
export OZZO_GATEWAY_PORT="${OZZO_GATEWAY_PORT:-18789}"
export OZZO_BRIDGE_PORT="${OZZO_BRIDGE_PORT:-18790}"
export OZZO_GATEWAY_BIND="${OZZO_GATEWAY_BIND:-lan}"
export OZZO_IMAGE="$IMAGE_NAME"
export OZZO_DOCKER_APT_PACKAGES="${OZZO_DOCKER_APT_PACKAGES:-}"

if [[ -z "${OZZO_GATEWAY_TOKEN:-}" ]]; then
  if command -v openssl >/dev/null 2>&1; then
    OZZO_GATEWAY_TOKEN="$(openssl rand -hex 32)"
  else
    OZZO_GATEWAY_TOKEN="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
  fi
fi
export OZZO_GATEWAY_TOKEN

COMPOSE_FILES=("$COMPOSE_FILE")
COMPOSE_ARGS=()

write_extra_compose() {
  local home_volume="$1"
  shift
  local -a mounts=("$@")
  local mount

  cat >"$EXTRA_COMPOSE_FILE" <<'YAML'
services:
  ozzo-gateway:
    volumes:
YAML

  if [[ -n "$home_volume" ]]; then
    printf '      - %s:/home/node\n' "$home_volume" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s:/home/node/.ozzo\n' "$OZZO_CONFIG_DIR" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s:/home/node/ozzo\n' "$OZZO_WORKSPACE_DIR" >>"$EXTRA_COMPOSE_FILE"
  fi

  for mount in "${mounts[@]}"; do
    printf '      - %s\n' "$mount" >>"$EXTRA_COMPOSE_FILE"
  done

  cat >>"$EXTRA_COMPOSE_FILE" <<'YAML'
  ozzo-cli:
    volumes:
YAML

  if [[ -n "$home_volume" ]]; then
    printf '      - %s:/home/node\n' "$home_volume" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s:/home/node/.ozzo\n' "$OZZO_CONFIG_DIR" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s:/home/node/ozzo\n' "$OZZO_WORKSPACE_DIR" >>"$EXTRA_COMPOSE_FILE"
  fi

  for mount in "${mounts[@]}"; do
    printf '      - %s\n' "$mount" >>"$EXTRA_COMPOSE_FILE"
  done

  if [[ -n "$home_volume" && "$home_volume" != *"/"* ]]; then
    cat >>"$EXTRA_COMPOSE_FILE" <<YAML
volumes:
  $home_volume:
YAML
  fi
}

declare -a mounts
if [[ -n "$EXTRA_MOUNTS" ]]; then
  IFS=',' read -r -a mounts <<<"$EXTRA_MOUNTS"
fi

if [[ -n "$HOME_VOLUME_NAME" ]] || [[ ${#mounts[@]} -gt 0 ]]; then
  write_extra_compose "$HOME_VOLUME_NAME" "${mounts[@]}"
  COMPOSE_FILES+=("$EXTRA_COMPOSE_FILE")
  for f in "${COMPOSE_FILES[@]}"; do
    COMPOSE_ARGS+=(-f "$f")
  done
  COMPOSE_HINT="docker compose ${COMPOSE_ARGS[*]}"
else
  COMPOSE_HINT="docker compose"
fi

ENV_FILE="$ROOT_DIR/.env"

upsert_env() {
  local file="$1"
  shift
  local -a keys=("$@")
  local k tmp

  tmp="$(mktemp)"
  declare -A seen

  if [[ -f "$file" ]]; then
    while IFS= read -r line; do
      local replaced=false
      for k in "${keys[@]}"; do
        if [[ "$line" =~ ^"$k"= ]]; then
          printf '%s=%s\n' "$k" "${!k-}" >>"$tmp"
          seen["$k"]=1
          replaced=true
          break
        fi
      done
      if [[ "$replaced" == false ]]; then
        printf '%s\n' "$line" >>"$tmp"
      fi
    done <"$file"
  fi

  for k in "${keys[@]}"; do
    if [[ -z "${seen[$k]:-}" ]]; then
      printf '%s=%s\n' "$k" "${!k-}" >>"$tmp"
    fi
  done

  mv "$tmp" "$file"
}

upsert_env "$ENV_FILE" \
  OZZO_CONFIG_DIR \
  OZZO_WORKSPACE_DIR \
  OZZO_GATEWAY_PORT \
  OZZO_BRIDGE_PORT \
  OZZO_GATEWAY_BIND \
  OZZO_GATEWAY_TOKEN \
  OZZO_IMAGE \
  OZZO_EXTRA_MOUNTS \
  OZZO_HOME_VOLUME \
  OZZO_DOCKER_APT_PACKAGES

echo "==> Building Docker image: $IMAGE_NAME"
docker build \
  --build-arg "OZZO_DOCKER_APT_PACKAGES=${OZZO_DOCKER_APT_PACKAGES}" \
  -t "$IMAGE_NAME" \
  -f "$ROOT_DIR/Dockerfile" \
  "$ROOT_DIR"

echo ""
echo "==> Onboarding (interactive)"
echo "When prompted:"
echo "  - Gateway bind: lan"
echo "  - Gateway auth: token"
echo "  - Gateway token: $OZZO_GATEWAY_TOKEN"
echo "  - Tailscale exposure: Off"
echo "  - Install Gateway daemon: No"
echo ""
docker compose "${COMPOSE_ARGS[@]}" run --rm ozzo-cli onboard --no-install-daemon

echo ""
echo "==> Provider setup (optional)"
echo "WhatsApp (QR):"
echo "  ${COMPOSE_HINT} run --rm ozzo-cli providers login"
echo "Telegram (bot token):"
echo "  ${COMPOSE_HINT} run --rm ozzo-cli providers add --provider telegram --token <TOKEN>"
echo "Discord (bot token):"
echo "  ${COMPOSE_HINT} run --rm ozzo-cli providers add --provider discord --token <TOKEN>"
echo "Docs: https://docs.ozzo.bot/providers"

echo ""
echo "==> Starting gateway"
docker compose "${COMPOSE_ARGS[@]}" up -d ozzo-gateway

echo ""
echo "Gateway running with host port mapping."
echo "Access from tailnet devices via the host's tailnet IP."
echo "Config: $OZZO_CONFIG_DIR"
echo "Workspace: $OZZO_WORKSPACE_DIR"
echo "Token: $OZZO_GATEWAY_TOKEN"
echo ""
echo "Commands:"
echo "  ${COMPOSE_HINT} logs -f ozzo-gateway"
echo "  ${COMPOSE_HINT} exec ozzo-gateway node dist/index.js health --token \"$OZZO_GATEWAY_TOKEN\""
