# Link & Asset Audit — webbedfilms.com

**Status: WARNINGS**

Reviewed: 2026-03-17
Scope: All 14 HTML pages, all CSS/JS assets, all external links, portfolio data, redirect behaviour

---

## Internal Links

### HTML Page Links

All 14 internal pages resolve correctly on the live site:

- `index.html` — 200 OK
- `about.html` — 200 OK
- `contact.html` — 200 OK
- `work.html` — 200 OK
- `the-suite.html` — 200 OK
- `webbed-films.html` — 200 OK
- `documentary.html` — 200 OK
- `corporate.html` — 200 OK
- `features.html` — 200 OK
- `shorts.html` — 200 OK
- `webbed-films/rosemary.html` — 200 OK
- `webbed-films/ngs.html` — 200 OK
- `webbed-films/blackout.html` — 200 OK
- `webbed-films/christmas-claret.html` — 200 OK

Navigation links are consistent across all pages, including the subpages in `/webbed-films/` which correctly use `../` relative paths for parent-directory references.

### CSS & JS Assets

- `css/style.css` — 200 OK (loaded by all 14 pages)
- `css/grade-monitor.css` — 200 OK (loaded by documentary, corporate, features, shorts, work)
- `css/film-page.css` — 200 OK (loaded by rosemary, ngs, blackout, christmas-claret)
- `js/nav.js` — 200 OK (loaded by all 14 pages)
- `js/flourishes.js` — 200 OK (loaded by all 14 pages)
- `js/daily-quote.js` — loaded only by `contact.html` (correct)

### Data Files

- `data/portfolio.json` — 200 OK, valid JSON with 4 categories (shorts: 22, features: 7, documentary: 16, corporate: 20)

### Image & Media Assets

- `assets/images/logo-new.png` — 200 OK (serves PNG binary, ~9.6MB)
- `assets/images/logo.png` — 200 OK (serves PNG binary, ~131KB)
- `assets/images/favicon.png` — 200 OK (serves PNG binary, ~37KB)

---

## External Links

### Social Media Links (used in sidebar + footer on every page)

- `https://www.instagram.com/webbedfilms/` — 200 OK, public profile accessible
- `https://www.threads.net/@webbedfilms` — 301 redirect to `https://www.threads.com/@webbedfilms` (profile loads)
- `https://x.com/webbedfilms_uk` — page loads (requires JS; standard for X/Twitter)
- `https://www.facebook.com/webbedfilms` — page loads (some content behind login wall, standard for Facebook)
- `https://www.linkedin.com/in/danwebb89` — returns HTTP 999 (LinkedIn blocks non-browser requests; standard anti-scraping behaviour, link is correct)

### Navigation External Links

- `https://www.revelstokefilms.com` — 200 OK, Squarespace site loads correctly
- `https://watch.webbedfilms.com` — 200 OK, "Webbed Films Screening Room" loads

### Portfolio Links (from portfolio.json)

- `https://watch.webbedfilms.com/watch.html?film=embers` — 200 OK (spot-checked)
- `https://screeningroom.insight.tv/show/the-sidecar-guys` — 200 OK
- `https://www.youtube.com/watch?v=Bln8ffo6mE0` (Louis Theroux Podcast) — not spot-checked but standard YouTube URL format

### Contact Form

- `https://formspree.io/f/xpwrqzkp` — returns 405 on GET (expected; only accepts POST submissions)
- Form action URL is correctly configured

---

## Redirect & Protocol Behaviour

### www vs non-www

- `https://webbedfilms.com` — 200 OK (serves content directly, NO redirect to www)
- `https://www.webbedfilms.com` — 200 OK (serves content directly)

Both serve the same content. The `og:url` meta tags all reference `https://www.webbedfilms.com/...` as the canonical URL.

### HTTP vs HTTPS

- `http://webbedfilms.com` — 200 OK (serves content over plain HTTP, NO redirect to HTTPS)

---

## Findings

### Critical

(none)

### Warnings

- **No non-www to www redirect**
  - Severity: warning
  - Both `webbedfilms.com` and `www.webbedfilms.com` serve content at 200 OK with no redirect between them. This creates duplicate content for search engines. The `og:url` tags all specify `www.webbedfilms.com` as canonical, but there is no HTTP 301 redirect from the bare domain.
  - Fix: Add a Cloudflare Page Rule or redirect rule to 301 redirect `webbedfilms.com/*` to `https://www.webbedfilms.com/$1`.

- **No HTTP to HTTPS redirect**
  - Severity: warning
  - `http://webbedfilms.com` serves content over plain HTTP with no redirect to HTTPS. HSTS header is present on HTTPS responses but HTTP visitors will never see it.
  - Fix: Enable "Always Use HTTPS" in Cloudflare SSL/TLS settings, or add a redirect rule for `http://*webbedfilms.com/*` to `https://www.webbedfilms.com/$1`.

- **Threads link uses old domain (301 redirect)**
  - Severity: minor warning
  - All pages link to `https://www.threads.net/@webbedfilms` which 301 redirects to `https://www.threads.com/@webbedfilms`. The redirect works, but updating to the new URL avoids the extra hop.
  - Files affected: All 14 HTML files (sidebar social link + footer social link)

- **og:image references `logo.png` (not `logo-new.png`)**
  - Severity: minor warning
  - 9 pages (index, contact, work, the-suite, webbed-films, documentary, corporate, features, shorts) use `og:image` pointing to `assets/images/logo.png`. The actual site logo used in `<img>` tags across all pages is `assets/images/logo-new.png`. Both files exist and load, but the OG image may show an outdated logo when shared on social media.
  - The remaining pages use specific images (about.html uses Portrait 1.jpg; film pages use their respective posters).

- **logo-new.png is 9.6 MB**
  - Severity: warning
  - `assets/images/logo-new.png` is approximately 9.6 MB. This is extremely large for a logo image and will slow initial page load on every page. The `width="6045" height="2335"` attributes confirm the source image is massive (6045x2335px).
  - Fix: Create an optimised version at a reasonable display size (e.g., 600px wide) and serve the full-res only if needed.

- **CLAUDE.md lists "Rock Salt" font but code uses "Permanent Marker"**
  - Severity: informational
  - `/CLAUDE.md` line 10 says the site uses "Rock Salt" but the actual font loaded via Google Fonts and defined in `css/style.css` as `--font-chalk` is "Permanent Marker". This is a documentation discrepancy only; the live site works correctly with Permanent Marker.

### Good

- All 14 internal HTML pages load correctly with 200 status
- All CSS files (style.css, grade-monitor.css, film-page.css) load correctly
- All JS files (nav.js, flourishes.js, daily-quote.js) load correctly
- `data/portfolio.json` loads and parses as valid JSON
- All Watch nav links correctly point to `watch.webbedfilms.com` (`.com`, not `.uk`) as required by project rules
- Social media profile links all resolve to valid profiles (Instagram, Threads, X, Facebook, LinkedIn)
- Revelstoke Films external link loads correctly
- watch.webbedfilms.com screening room is accessible
- Portfolio links to external services (Insight TV, YouTube) resolve
- Formspree contact form endpoint is valid
- favicon.png and apple-touch-icon load correctly
- Subpage navigation paths (../index.html, ../about.html, etc.) are all correct
- HSTS header present on HTTPS responses
- Content-Security-Policy header is well-configured
- All `og:url` tags use consistent `https://www.webbedfilms.com/` prefix

---

## Summary Table

| Check | Result |
|---|---|
| Internal page links (14 pages) | PASS |
| CSS/JS assets | PASS |
| Portfolio data JSON | PASS |
| Favicon & logo images | PASS (logo-new.png oversized) |
| Social media links | PASS (Threads uses old domain) |
| External nav links (Revelstoke, Watch) | PASS |
| Portfolio external links | PASS |
| Contact form endpoint | PASS |
| www redirect | FAIL (no redirect) |
| HTTP-to-HTTPS redirect | FAIL (no redirect) |
| og:image consistency | WARNING (logo.png vs logo-new.png) |
