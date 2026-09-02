#!/usr/bin/env bash
# Starts the deterministic mock upstream, builds the app against it, and serves it on
# the port Lighthouse CI audits. Used by lighthouserc.json so budgets are measured on
# stable, network-independent pages.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PORT="${LHCI_APP_PORT:-3001}"
MOCK_PORT="${MOCK_UPSTREAM_PORT:-3901}"

cd "$ROOT"

MOCK_UPSTREAM_PORT="$MOCK_PORT" node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/e2e/mock-upstream/server.ts &
MOCK_PID=$!
trap 'kill "$MOCK_PID" 2>/dev/null || true' EXIT

export NEXT_PUBLIC_NETWORK="${NEXT_PUBLIC_NETWORK:-mainnet}"
export NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:${MOCK_PORT}"
export NEXT_PUBLIC_RPC_URL="http://127.0.0.1:${MOCK_PORT}/rpc"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://randomwalknft.com}"
export NEXT_PUBLIC_API_URLS=""
export NEXT_PUBLIC_RPC_URLS=""

corepack pnpm build
exec corepack pnpm exec next start --hostname 127.0.0.1 --port "$APP_PORT"
