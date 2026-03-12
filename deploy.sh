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
CF_API_TOKEN="WKTFJCBuar2JyZONtktSjqvo7TFa1Ici-Q2Lfb-e"

echo "=== Webbed Films Deploy ==="

# Step 1: Git commit and push
echo ""
echo "[1/5] Committing and pushing to GitHub..."
git add -A
git commit -m "Deploy: ${TIMESTAMP}" || echo "Nothing to commit."
git push

# Step 2: Pull latest code on Unraid
echo ""
echo "[2/5] Pulling latest code on Unraid..."
ssh -i "${SSH_KEY}" "${UNRAID_USER}@${UNRAID_IP}" \
  "cd /mnt/user/appdata/webbed-films-site && git fetch origin && git reset --hard origin/main"

# Step 3: Rsync assets to Unraid
echo ""
echo "[3/5] Syncing assets to Unraid (${UNRAID_IP})..."
rsync \
  --archive \
  --verbose \
  --progress \
  --exclude='*.DS_Store' \
  -e "ssh -i ${SSH_KEY}" \
  assets/ \
  "${UNRAID_USER}@${UNRAID_IP}:${UNRAID_PATH}"

# Step 4: Fix permissions so nginx can read all assets
echo ""
echo "[4/5] Fixing file permissions on Unraid..."
ssh -i "${SSH_KEY}" "${UNRAID_USER}@${UNRAID_IP}" \
  "find ${UNRAID_PATH} -type f -exec chmod 644 {} + && find ${UNRAID_PATH} -type d -exec chmod 755 {} +"

# Step 5: Purge Cloudflare cache
echo ""
echo "[5/5] Purging Cloudflare cache for webbedfilms.com..."
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
