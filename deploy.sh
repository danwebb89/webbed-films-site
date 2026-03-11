#!/bin/bash
set -e

# Deploy script for Webbed Films website
# 1. Commits and pushes code to GitHub
# 2. Syncs assets to Unraid server via rsync

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
UNRAID_IP="192.168.10.25"
UNRAID_USER="root"
UNRAID_PATH="/mnt/user/appdata/webbed-films-site/assets/"
SSH_KEY="$HOME/.ssh/id_ed25519_unraid"

echo "=== Webbed Films Deploy ==="

# Step 1: Git commit and push
echo ""
echo "[1/2] Committing and pushing to GitHub..."
git add -A
git commit -m "Deploy: ${TIMESTAMP}" || echo "Nothing to commit."
git push

# Step 2: Rsync assets to Unraid
echo ""
echo "[2/2] Syncing assets to Unraid (${UNRAID_IP})..."
rsync \
  --archive \
  --verbose \
  --progress \
  --exclude='*.DS_Store' \
  -e "ssh -i ${SSH_KEY}" \
  assets/ \
  "${UNRAID_USER}@${UNRAID_IP}:${UNRAID_PATH}"

echo ""
echo "=== Deploy complete ==="
