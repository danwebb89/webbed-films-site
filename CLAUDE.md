# Webbed Films website

`webbedfilms.com` (and `www`): Webbed Films' static marketing site. Plain HTML, CSS and JS, with no build step, framework or npm. Serve the folder as-is.
The screening room `watch.webbedfilms.com` is a separate project (`~/Projects/webbed-watch`).

## Layout
- 11 top-level pages, plus 4 film pages in `webbed-films/`. The nav and footer are copied into every page, so change them everywhere.
- `css/` (style, film-page, grade-monitor) and `js/` (nav, flourishes, daily-quote, grade-monitor).
- `data/portfolio.json` is fetched from the site root. Don't move it.
- The contact form posts to Formspree.
- The Watch link must always point to `watch.webbedfilms.com` (never `.uk`).

## Media
- Video, images and audio are gitignored. They live in `assets/` and reach the server by rsync, not git. Never commit new media.
- Use lowercase file extensions (`.jpg`, not `.JPG`). nginx on Unraid is case-sensitive.
- Since 14 Oct no media is tracked in git (the soundtrack mp3s and `logo.png` used to be). After the code moves, `deploy.sh` puts back any media file that git removed.

## Live runtime
- **Unraid** `192.168.10.25` (SSH key `~/.ssh/id_ed25519_unraid`), container `Webbed-Films-Site` (`nginx:alpine`, port 8082).
- **Serves** `/mnt/apps_vms/appdata/webbed-films-site`, which is a git checkout of this repo. `/mnt/user/appdata/webbed-films-site` is the same folder, because appdata is cache-only on the `apps_vms` pool.
- The `nginx.conf` and `docker-compose.yml` in that folder are untracked server files. `nginx.conf` is bind-mounted read-only into the container.
- **Cloudflare:** zone `webbedfilms.com`; the tunnel sends `webbedfilms.com` and `www` to :8082.
  - Don't touch `revelstoke.webbedfilms.com`. It's the Revelstoke Studio mirror, and Dan's Safari web app uses it.
  - Ask Dan before any DNS or tunnel change.
- **GitHub:** `danwebb89/webbed-films-site` is a **public** repo. Never commit secrets.

## Deploy
Commit your changes on `main` first. The deploy never stages or commits anything. Untracked code files are never deployed, but media in `assets/` is rsynced whether it's tracked or not.
1. `./deploy.sh --dry-run`: shows the code diff against the server and the media that would sync. It changes nothing.
2. `./deploy.sh`: syncs media, pushes `main`, then moves the server's code. It checks the home page and every changed HTML page, and rolls the code back if any fail. Then it purges only the changed URLs from Cloudflare.
   - It prints a one-line rollback command at the end.
   - A rollback only resets the server: fix or revert the commit on `main` before deploying again.
- `CF_API_TOKEN` comes from Dan's interactive zsh environment. From a non-interactive shell, run `zsh -ic './deploy.sh'`, otherwise the purge is skipped with a warning.

## Permissions
Pre-approved (agreed with Dan 14 Oct 2026). Just do it, then tell Dan:
- Deploys with `./deploy.sh`, once the dry run looks right, and check the changed pages live in a browser afterwards.
- Editing the server's `nginx.conf` (back it up first, and write it in place, because it's a single-file bind mount) and reloading nginx with `docker exec Webbed-Films-Site nginx -s reload`.

Ask first: container or template changes, restarts outside the above, and anything else on Unraid.

## History
- `_review/` holds an audit from March 2026; `_review/2026-07-03-current-audit.md` is untracked and not ours: leave it alone.
- The Codex-era briefing is in `docs/archive/AGENTS.codex.md`. It's history, not rules.
