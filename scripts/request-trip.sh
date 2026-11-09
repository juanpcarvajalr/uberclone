#!/usr/bin/env bash
# AI-assisted: see docs/AI_LOG.md #46, #47
# Wrapper: adb reverse (emulator ↔ WSL inbox) + passenger CLI.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android platform-tools or add adb to PATH." >&2
  exit 1
fi

echo "adb reverse tcp:8765 tcp:8765"
set +e
if command -v timeout >/dev/null 2>&1; then
  timeout 8s adb reverse tcp:8765 tcp:8765
  adb_status=$?
else
  adb reverse tcp:8765 tcp:8765
  adb_status=$?
fi
set -e

if [[ "$adb_status" -eq 124 ]]; then
  echo "Warning: adb reverse timed out; continuing with the passenger script." >&2
elif [[ "$adb_status" -ne 0 ]]; then
  echo "Warning: adb reverse failed (exit $adb_status); continuing with the passenger script." >&2
fi

echo "Running passenger trip request script..."
exec node --import ./scripts/registerEsmResolve.mjs scripts/createTripRequest.mjs "$@"
