# Webbed Films — Claude Code Briefing

## What this project is
Static portfolio website for Dan Webb / Webbed Films. Fully static HTML/CSS/JS — no backend, no build step, no package.json. Serve the directory as-is.

## Tech stack
- 14 HTML files with inline styles + 3 shared CSS files (css/style.css, css/home.css, css/portfolio.css)
- 3 vanilla JS files: nav.js, flourishes.js, daily-quote.js
- Portfolio data in data/portfolio.json (fetched client-side)
- Google Fonts via CDN (Cinzel, Cormorant Garamond, Inter, Rock Salt)
- No framework, no npm, no bundler

## Important rules
- NEVER commit video, image, or audio files to Git. These are excluded in .gitignore and synced separately via rsync. If you add new media references in HTML, the actual files go via rsync, not Git.
- All video/image/audio files live locally under assets/ and are rsynced to Unraid at /mnt/user/appdata/webbed-films-site/assets/
- Always use lowercase file extensions (.jpg not .JPG) — Unraid is case-sensitive and uppercase extensions cause 403s
- The Watch nav link must always point to watch.webbedfilms.com (never .uk)

## Production infrastructure
- **Unraid server:** 192.168.10.25
- **SSH key:** ~/.ssh/id_ed25519_unraid
- **App lives at:** /mnt/user/appdata/webbed-films-site/ (the same folder as /mnt/apps_vms/appdata/webbed-films-site/; appdata is cache-only on the apps_vms pool)
- **Media lives at:** /mnt/user/appdata/webbed-films-site/assets/
- **Container:** webbed-films-site (nginx:alpine, port 8082)
- **Cloudflare tunnel:** chatgpt-bridge (ID: 646cc955-badb-4972-9c7f-e067cf9e8614)
- **Live URLs:** https://webbedfilms.com and https://www.webbedfilms.com
- **GitHub repo:** https://github.com/danwebb89/webbed-films-site

## How to deploy changes
Commit your changes on `main` first. The deploy never stages or commits anything, and untracked files are never deployed.
1. `./deploy.sh --dry-run`: shows the code diff against the server and the media that would sync. It changes nothing.
2. `./deploy.sh`: pushes `main`, syncs media first, then moves the code and checks the home page and every changed HTML page (rolls the code back if any fail), then purges only the changed URLs from Cloudflare.

It prints a one-line rollback command at the end.

## How to update media
- New videos, images, or audio: add them to the correct assets/ subfolder locally, then run ./deploy.sh (dry run first). Rsync handles the upload automatically
- Never add media files to Git

## Nginx config
Located at /mnt/user/appdata/webbed-films-site/nginx.conf
- Gzip enabled
- 30-day cache headers for video and images
- 7-day cache for CSS/JS
- 404 fallback configured

## File permissions on Unraid
New files rsynced to Unraid must be readable by Nginx (644). If images are not loading, check permissions on Unraid with:
ssh -i ~/.ssh/id_ed25519_unraid root@192.168.10.25 'chmod -R 644 /mnt/user/appdata/webbed-films-site/assets/'

## Environment variables
- CF_API_TOKEN — Cloudflare API token, stored in ~/.zshrc on Dan's Mac. Used by deploy.sh to purge cache. Never hardcode this.

## Known things to be aware of
- Nav and footer are duplicated across all 14 HTML files — changes to shared elements must be replicated manually across every page
- portfolio.json must be fetched from the document root — do not move it
- The Client Area nav link is a placeholder (href="#") — do not remove it, it will be built out later
- BTS gallery on rosemary.html loads 180+ JPGs — no lazy loading currently
