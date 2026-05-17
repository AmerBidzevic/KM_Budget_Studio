#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

runner="npx"
if command -v npx >/dev/null 2>&1; then
  runner="npx"
else
  echo "npx is required to run Expo." >&2
  exit 1
fi

case "${1:-}" in
  --help)
    echo "Usage: ./script/build_and_run.sh [--ios|--android|--web|--tunnel|--export-web]"
    ;;
  --ios)
    "$runner" expo start --ios
    ;;
  --android)
    "$runner" expo start --android
    ;;
  --web)
    "$runner" expo start --web
    ;;
  --tunnel)
    "$runner" expo start --tunnel
    ;;
  --export-web)
    "$runner" expo export --platform web
    ;;
  *)
    "$runner" expo start
    ;;
esac
