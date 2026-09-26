#!/bin/bash
set -uo pipefail

# Only relevant in Claude Code on the web sandboxes, where Postgres and the
# Next.js dev server (started manually in a prior turn) do not survive a
# container resume/suspend cycle.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Start Postgres if it isn't already accepting connections.
if ! pg_isready -q 2>/dev/null; then
  (service postgresql start >/dev/null 2>&1 || sudo service postgresql start >/dev/null 2>&1) || true
  for _ in $(seq 1 15); do
    pg_isready -q 2>/dev/null && break
    sleep 1
  done
fi

# Start the Next.js dev server (in the background) if it isn't already
# serving requests, so any existing preview link comes back to life
# without needing manual intervention.
#
# Once running, treat this port-3000 process as the user's live preview,
# not a disposable test server: don't `pkill`/restart it mid-task. A
# schema change does need a restart before the running server's in-memory
# module cache reflects a freshly `prisma generate`-d client (Turbopack
# doesn't hot-reload src/generated/prisma) — for that, start a throwaway
# instance on another port (e.g. `PORT=3011 npm run dev`) for your own
# verification instead, and leave this one alone until the very end of
# the task (if at all), so the preview doesn't drop out from under the
# user repeatedly while you're iterating.
if ! curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
  cd "$CLAUDE_PROJECT_DIR"
  nohup npm run dev > /tmp/next-dev.log 2>&1 &
  disown
fi

exit 0
