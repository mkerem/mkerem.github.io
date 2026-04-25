#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--dry-run" ]]; then
  echo "cd $ROOT_DIR"
  echo "npm install"
  echo "npm run dev"
  exit 0
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Books Wrapped on http://localhost:8787"
exec npm run dev
