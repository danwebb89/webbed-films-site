#!/bin/bash
set -e

# Deploy script for Webbed Films website
# 1. Commits and pushes code to GitHub
# 2. Syncs assets to Unraid server via rsync
# 3. Purges Cloudflare cache for webbedfilms.com

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
UNRAID_IP="192.168.10.25"
UNRAID_USER="root"
UNRAID_PATH="/mnt/user/appdata/webbed-films-site/assets/"
SSH_KEY="$HOME/.ssh/id_ed25519_unraid"
CF_ZONE_ID="8b36b64a00523c5759aab251d3746484"

echo "=== Webbed Films Deploy ==="

# Step 1: Git commit and push
echo ""
echo "[1/3] Committing and pushing to GitHub..."
git add -A
git commit -m "Deploy: ${TIMESTAMP}" || echo "Nothing to commit."
git push

# Step 2: Rsync assets to Unraid
echo ""
echo "[2/3] Syncing assets to Unraid (${UNRAID_IP})..."
rsync \
  --archive \
  --verbose \
  --progress \
  --exclude='*.DS_Store' \
  -e "ssh -i ${SSH_KEY}" \
  assets/ \
  "${UNRAID_USER}@${UNRAID_IP}:${UNRAID_PATH}"

# Step 3: Purge Cloudflare cache
echo ""
echo "[3/3] Purging Cloudflare cache for webbedfilms.com..."
if [ -z "${CF_API_TOKEN}" ]; then
  echo "WARNING: CF_API_TOKEN not set — skipping cache purge."
else
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"purge_everything":true}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('Cache purged successfully.' if d.get('success') else f'Cache purge failed: {d}')"
fi

echo ""
echo "=== Deploy complete ==="
