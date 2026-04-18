#!/usr/bin/env bash

set -euo pipefail

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  compose_cmd=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  compose_cmd=(docker-compose)
else
  echo "Docker Compose is required. Install Docker Desktop or docker-compose." >&2
  exit 1
fi

# Extract host GPU group IDs so WebKit sandbox can use hardware acceleration
export VIDEO_GID=$(stat -c "%g" /dev/dri/card0 2>/dev/null || echo "44")
export RENDER_GID=$(stat -c "%g" /dev/dri/renderD128 2>/dev/null || echo "109")
export USER_ID=$(id -u)

"${compose_cmd[@]}" up -d vivant-dev

# Ensure groups exist inside the container so WebKit sandbox doesn't drop them
"${compose_cmd[@]}" exec -u root vivant-dev bash -c "
  getent group host_video >/dev/null || groupadd -g $VIDEO_GID host_video
  getent group host_render >/dev/null || groupadd -g $RENDER_GID host_render
  usermod -aG host_video,host_render developer
"

"${compose_cmd[@]}" exec vivant-dev bash
