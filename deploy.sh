#!/bin/bash
# Deploy webbedfilms.com to Unraid (container Webbed-Films-Site, nginx on :8082).
#
# Deploys committed code only. It never stages or commits anything, so commit
# your changes first. Untracked files are left alone and never deployed.
#
#   ./deploy.sh --dry-run   show what would change; touches nothing
#   ./deploy.sh             push main, move the server checkout to it, sync
#                           media, health-check (rolls the code back on
#                           failure), purge the changed URLs from Cloudflare
#
# /mnt/user/appdata/webbed-films-site and /mnt/apps_vms/appdata/webbed-films-site
# are the same folder (the appdata share is cache-only on the apps_vms pool).
# That folder is what the container serves.
set -euo pipefail

DRY_RUN=0
case "${1:-}" in
  --dry-run|-n) DRY_RUN=1 ;;
  "") ;;
  *) echo "Usage: $0 [--dry-run]" >&2; exit 2 ;;
esac

cd "$(dirname "$0")"

UNRAID="root@192.168.10.25"
SSH_KEY="$HOME/.ssh/id_ed25519_unraid"
SITE_DIR="/mnt/apps_vms/appdata/webbed-films-site"
LOCAL_CHECK="http://192.168.10.25:8082/"
PUBLIC_CHECK="https://webbedfilms.com/"
export CF_ZONE_ID="8b36b64a00523c5759aab251d3746484"
export CF_API_TOKEN="${CF_API_TOKEN:-}"

SSH=(ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$UNRAID")
RSYNC=(rsync --archive --itemize-changes --exclude='*.DS_Store' -e "ssh -i $SSH_KEY -o ConnectTimeout=10")

say() { printf '\n[%s] %s\n' "$1" "$2"; }
die() { echo "STOP: $*" >&2; exit 1; }
http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$1" || true; }

echo "=== Webbed Films deploy$( [ $DRY_RUN = 1 ] && echo ' (DRY RUN)') ==="

say 1/6 "Checking the local repo"
branch=$(git branch --show-current)
git diff --quiet && git diff --cached --quiet \
  || die "uncommitted changes to tracked files. Commit or stash them first."
untracked=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
[ "$untracked" -gt 0 ] && echo "Note: $untracked untracked file(s) ignored (not deployed)."
git fetch --quiet origin main
git merge-base --is-ancestor origin/main HEAD \
  || die "HEAD is behind or has diverged from origin/main. Pull first."
if [ "$branch" != main ]; then
  [ $DRY_RUN = 1 ] || die "deploy from main (you are on '$branch')."
  echo "Note: on '$branch', not main. A real deploy must run from main."
fi
new_rev=$(git rev-parse HEAD)

say 2/6 "Comparing with the server"
old_rev=$("${SSH[@]}" "git -C '$SITE_DIR' rev-parse HEAD")
git cat-file -e "$old_rev^{commit}" 2>/dev/null \
  || die "the server is on $old_rev, which isn't in this repo."
git merge-base --is-ancestor "$old_rev" "$new_rev" \
  || die "the server has commits that HEAD doesn't. Investigate before deploying."
echo "Server: $(git log -1 --format='%h %s' "$old_rev")"
echo "Deploy: $(git log -1 --format='%h %s' "$new_rev")"
if [ "$old_rev" = "$new_rev" ]; then
  echo "Code: no change."
else
  git --no-pager diff --stat "$old_rev" "$new_rev"
fi

say 3/6 "Checking media (assets/)"
preview=$("${RSYNC[@]}" --dry-run assets/ "$UNRAID:$SITE_DIR/assets/")
pending=$(printf '%s\n' "$preview" | grep '^<f' || true)
new_files=$(printf '%s\n' "$pending" | grep -c '^<f+++' || true)
all_files=$(printf '%s\n' "$pending" | grep -c '^<f' || true)
echo "Media: $new_files new file(s), $((all_files - new_files)) updated file(s)."
printf '%s\n' "$pending" | grep '^<f+++' | sed 's/^[^ ]* /  + /' | head -30 || true

if [ $DRY_RUN = 1 ]; then
  echo ""
  echo "=== Dry run complete. Nothing was changed. ==="
  exit 0
fi

say 4/6 "Updating the code"
if [ "$(git rev-parse origin/main)" != "$new_rev" ]; then
  git push origin HEAD:main
fi
"${SSH[@]}" "cd '$SITE_DIR' && git fetch --quiet origin main && git reset --quiet --hard '$new_rev'"
echo "Server checkout now at ${new_rev:0:8} (was ${old_rev:0:8})."

say 5/6 "Syncing media"
synced_out=$("${RSYNC[@]}" assets/ "$UNRAID:$SITE_DIR/assets/")
synced=$(printf '%s\n' "$synced_out" | grep '^<f' || true)
echo "Synced $(printf '%s\n' "$synced" | grep -c '^<f' || true) file(s)."
"${SSH[@]}" "find '$SITE_DIR/assets' -type f ! -perm 644 -exec chmod 644 {} + ; find '$SITE_DIR/assets' -type d ! -perm 755 -exec chmod 755 {} +"

say 6/6 "Health check and cache purge"
code=$(http_code "$LOCAL_CHECK")
if [ "$code" != 200 ]; then
  echo "Health check failed: $LOCAL_CHECK returned $code. Rolling the code back to ${old_rev:0:8}."
  "${SSH[@]}" "git -C '$SITE_DIR' reset --quiet --hard '$old_rev'"
  die "code rolled back. Media synced in this run was left in place."
fi
echo "Origin: $LOCAL_CHECK -> 200"

# Purge only what changed: served files from the code diff, plus synced media.
purge_list=$(mktemp)
trap 'rm -f "$purge_list"' EXIT
{
  [ "$old_rev" != "$new_rev" ] && git diff --name-only --diff-filter=AM "$old_rev" "$new_rev"
  printf '%s\n' "$synced" | sed -n 's/^<f[^ ]* /assets\//p'
} | grep -Ev '(^|/)\.|\.(md|sh|conf)$|^_review/' | sort -u > "$purge_list" || true

python3 -I - "$purge_list" <<'PY' || echo "WARNING: cache purge step errored; the deploy itself is fine."
import json, os, sys, urllib.parse, urllib.request

paths = [p for p in open(sys.argv[1]).read().splitlines() if p]
urls = []
for host in ("webbedfilms.com", "www.webbedfilms.com"):
    for p in paths:
        urls.append(f"https://{host}/{urllib.parse.quote(p)}")
        if p == "index.html" or p.endswith("/index.html"):
            urls.append(f"https://{host}/{urllib.parse.quote(p[:-len('index.html')])}")
if not urls:
    print("Cache: nothing to purge.")
    sys.exit(0)
token = os.environ.get("CF_API_TOKEN", "")
if not token:
    print(f"WARNING: CF_API_TOKEN not set; skipped purging {len(urls)} URL(s).")
    sys.exit(0)
done = 0
for i in range(0, len(urls), 30):  # 30 URLs per request is within every plan's limit
    batch = urls[i:i + 30]
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/zones/{os.environ['CF_ZONE_ID']}/purge_cache",
        data=json.dumps({"files": batch}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            res = json.load(r)
    except Exception as e:
        res = {"success": False, "errors": str(e)}
    if res.get("success"):
        done += len(batch)
    else:
        print("WARNING: purge failed for a batch:", res.get("errors"))
print(f"Cache: purged {done} of {len(urls)} URL(s).")
PY

echo "Public: $PUBLIC_CHECK -> $(http_code "$PUBLIC_CHECK")"
echo ""
echo "=== Deploy complete: ${old_rev:0:8} -> ${new_rev:0:8} ==="
echo "Code rollback: ssh -i $SSH_KEY $UNRAID \"git -C '$SITE_DIR' reset --hard $old_rev\""
