#!/usr/bin/env bash
# Regenerates the Linux visual-regression baselines inside the same Playwright image
# CI uses, so pixels match regardless of the developer's OS. The repository is copied
# into the container (node_modules are platform-specific), tests run against the
# deterministic mock upstream, and the new PNGs are copied back into the working tree.
#
#   pnpm test:e2e:visual:update        (wraps this script)
#
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.62.1-noble"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SNAPSHOTS="tests/e2e/visual.spec.ts-snapshots"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required to produce Linux baselines" >&2
  exit 1
fi

docker run --rm \
  -v "$ROOT:/host" \
  -e CI=1 \
  -e HOME=/root \
  -w /work \
  "$IMAGE" \
  bash -lc '
    set -euo pipefail
    mkdir -p /work
    # Copy sources only; dependencies are installed fresh for Linux.
    tar -C /host \
      --exclude=./node_modules --exclude=./.next --exclude=./coverage --exclude=./test-results --exclude=./playwright-report \
      --exclude="./tests/e2e/visual.spec.ts-snapshots/*-darwin.png" --exclude="./tests/e2e/visual.spec.ts-snapshots/*-win32.png" \
      -cf - . | tar -C /work -xf -
    corepack enable
    corepack pnpm install --frozen-lockfile
    corepack pnpm exec playwright test tests/e2e/visual.spec.ts --project=chromium --update-snapshots --reporter=list
    rm -f /host/'"$SNAPSHOTS"'/*-linux.png
    mkdir -p "/host/'"$SNAPSHOTS"'"
    cp '"$SNAPSHOTS"'/*-linux.png "/host/'"$SNAPSHOTS"'/"
  '

echo "Linux baselines written to $SNAPSHOTS"
