#!/usr/bin/env bash
set -euo pipefail

if ! command -v convex >/dev/null 2>&1; then
  echo "[ERROR] convex CLI not found. Install with: npm i -g convex" >&2
  exit 1
fi

echo "[INFO] Checking Convex GitHub status..."
STATUS_JSON=$(convex run github:getStatus || true)
if [[ -z "${STATUS_JSON}" ]]; then
  echo "[ERROR] getStatus returned empty. Is Convex logged in and project linked?" >&2
  exit 2
fi
echo "[DEBUG] getStatus: ${STATUS_JSON}"

USERNAME=$(python3 - <<'PY'
import json,sys
s=sys.stdin.read()
try:
  d=json.loads(s)
  print(d.get('username',''))
except Exception:
  print('')
PY
<<<"$STATUS_JSON")
HASTOKEN=$(python3 - <<'PY'
import json,sys
s=sys.stdin.read()
try:
  d=json.loads(s)
  print('true' if d.get('hasToken') else 'false')
except Exception:
  print('false')
PY
<<<"$STATUS_JSON")

if [[ -z "${USERNAME}" ]]; then
  echo "[ERROR] Missing username from getStatus. Ensure GITHUB_USERNAME is set in Convex env." >&2
  exit 3
fi

if [[ "${HASTOKEN}" != "true" ]]; then
  echo "[WARN] GITHUB_TOKEN not set in Convex env; contributions and pinned via GraphQL will be disabled." >&2
else
  echo "[INFO] Convex token detected."
fi

echo "[INFO] Testing profile for username='${USERNAME}'..."
convex run github:getProfile --username "${USERNAME}" >/dev/null && echo "[OK] getProfile" || { echo "[ERROR] getProfile failed" >&2; exit 4; }

echo "[INFO] Testing pinned for username='${USERNAME}'..."
convex run github:getPinned --username "${USERNAME}" --limit 3 >/dev/null && echo "[OK] getPinned" || {
  echo "[ERROR] getPinned failed" >&2; if [[ "${HASTOKEN}" != "true" ]]; then echo "[HINT] Without token, pinned falls back to recent repos."; fi; exit 5; }

if [[ "${HASTOKEN}" == "true" ]]; then
  echo "[INFO] Testing contributions for username='${USERNAME}'..."
  convex run github:getContributions --username "${USERNAME}" >/dev/null && echo "[OK] getContributions" || { echo "[ERROR] getContributions failed" >&2; exit 6; }
else
  echo "[SKIP] getContributions (no token)"
fi

echo "[SUCCESS] Convex GitHub integration looks good. Username=${USERNAME}, hasToken=${HASTOKEN}"
