# Security Audit: webbedfilms.com

**Status: ISSUES FOUND**

Audited: 2026-03-17
Target: https://webbedfilms.com (Cloudflare Tunnel -> nginx:alpine on Unraid)

---

## Critical Issues

### 1. .git directory publicly accessible
**Severity:** CRITICAL

The entire `.git` directory is served by nginx with HTTP 200 responses. An attacker can reconstruct the full repository history, including any files ever committed.

| URL | Status | Content |
|---|---|---|
| `https://webbedfilms.com/.git/config` | 200 | Exposes remote origin URL (`https://github.com/danwebb89/webbed-films-site.git`) |
| `https://webbedfilms.com/.git/HEAD` | 200 | Exposes current branch ref |

**Impact:** Full source code disclosure. An attacker can use tools like `git-dumper` to clone the entire repository from the exposed `.git` directory, recovering all commit history and any sensitive data that was ever committed.

**Fix:** Add to nginx.conf:
```nginx
location ~ /\.git {
    deny all;
    return 404;
}
```

### 2. deploy.sh publicly accessible
**Severity:** CRITICAL

`https://webbedfilms.com/deploy.sh` returns HTTP 200 with the full deployment script contents, exposing:
- Internal server IP: `192.168.10.25`
- SSH key path: `$HOME/.ssh/id_ed25519_unraid`
- SSH username: `root`
- Internal file paths: `/mnt/user/appdata/webbed-films-site/assets/`
- Cloudflare Zone ID: `8b36b64a00523c5759aab251d3746484`
- Deployment workflow details (git pull, rsync, cache purge)

**Fix:** Block shell scripts in nginx.conf:
```nginx
location ~* \.(sh|bash)$ {
    deny all;
    return 404;
}
```

### 3. CLAUDE.md publicly accessible
**Severity:** CRITICAL

`https://webbedfilms.com/CLAUDE.md` returns HTTP 200, exposing the full project briefing document containing:
- Server IP, SSH key path, deployment paths
- Cloudflare tunnel ID: `061fbc19-449d-42e8-b827-b4cbdbdd953c`
- Container name and port: `webbed-films-site`, port 8082
- GitHub repo URL
- Full deployment workflow and infrastructure details

**Fix:** Block markdown and dotfiles in nginx.conf:
```nginx
location ~* \.(md|markdown)$ {
    deny all;
    return 404;
}
```

### 4. .gitignore publicly accessible
**Severity:** MODERATE

`https://webbedfilms.com/.gitignore` returns HTTP 200, revealing project structure and file organization details.

**Fix:** Covered by the dotfile block rule (see recommendation below).

### 5. nginx.conf publicly accessible
**Severity:** MODERATE

`https://webbedfilms.com/nginx.conf` returns HTTP 200, exposing the full nginx configuration including all security headers, CSP policy, caching rules, and location blocks. This gives attackers a complete map of the server configuration.

**Fix:** Block config files:
```nginx
location ~* (nginx\.conf|\.conf)$ {
    deny all;
    return 404;
}
```

---

## SSL/TLS and Transport Security

### 6. HTTP does not redirect to HTTPS
**Severity:** WARNING

Requesting `http://webbedfilms.com` returns HTTP 200 OK directly, serving the full page over plain HTTP without redirecting to HTTPS. The Cloudflare tunnel appears to serve content on both HTTP and HTTPS.

While the HSTS header is present (so returning visitors' browsers will enforce HTTPS), first-time visitors can be served over unencrypted HTTP.

**Fix:** Enable "Always Use HTTPS" in Cloudflare dashboard (SSL/TLS > Edge Certificates) to force a 301 redirect from HTTP to HTTPS.

### 7. HSTS header present but could be stronger
**Severity:** GOOD (minor improvement possible)

Current: `strict-transport-security: max-age=31536000; includeSubDomains`

This is good. Could optionally add `preload` directive and submit to the HSTS preload list for maximum protection:
`max-age=31536000; includeSubDomains; preload`

---

## Security Headers

### Headers present (from HTTPS response)

| Header | Value | Verdict |
|---|---|---|
| `strict-transport-security` | `max-age=31536000; includeSubDomains` | GOOD |
| `content-security-policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'self';` | GOOD (see notes) |
| `x-content-type-options` | `nosniff` | GOOD |
| `x-frame-options` | `SAMEORIGIN` | GOOD |
| `referrer-policy` | `strict-origin-when-cross-origin` | GOOD |
| `permissions-policy` | `camera=(), microphone=(), geolocation=()` | GOOD |

### 8. CSP allows 'unsafe-inline' for scripts
**Severity:** WARNING

The `script-src 'self' 'unsafe-inline'` directive is necessary because every HTML page contains inline `<script>` blocks. This weakens XSS protection since injected inline scripts would be allowed to execute.

**Recommendation:** Move inline scripts to external `.js` files and remove `'unsafe-inline'` from `script-src`. Alternatively, use CSP nonces (e.g., `script-src 'self' 'nonce-{random}'`), though this requires server-side nonce generation which is impractical for a static site.

All 14 HTML files contain inline `<script>` tags after the external script includes.

### 9. CSP allows 'unsafe-inline' for styles
**Severity:** INFO

The `style-src 'self' 'unsafe-inline'` directive is used because pages contain substantial inline `<style>` blocks. This is common and lower-risk than script inline, but could be improved by moving inline styles to external CSS files.

### 10. Missing X-Permitted-Cross-Domain-Policies header
**Severity:** INFO

Not present. Minor hardening measure to prevent Flash/Acrobat cross-domain data loading.
Add: `X-Permitted-Cross-Domain-Policies: none`

### 11. Server header reveals Cloudflare
**Severity:** INFO

`server: cloudflare` is sent. This is standard for Cloudflare-proxied sites and cannot be changed.

---

## Portfolio Data

### 12. portfolio.json is publicly accessible
**Severity:** GOOD

`https://webbedfilms.com/data/portfolio.json` returns HTTP 200. The file contains only public-facing data: film titles, slugs, watch URLs, and availability flags. No API keys, passwords, internal IPs, or email addresses are present. This is expected and safe since it is fetched client-side.

**Note:** The portfolio.json response is missing the security headers that HTML responses have (no CSP, no Referrer-Policy, no Permissions-Policy, no X-Frame-Options). Only `x-content-type-options: nosniff` is present. The nginx config should apply security headers to JSON responses as well.

---

## Mixed Content

### 13. No mixed content issues found
**Severity:** GOOD

All `http://` references in the source code are:
- SVG namespace declarations (`xmlns="http://www.w3.org/2000/svg"`) -- not actual resource loads
- `document.createElementNS('http://www.w3.org/2000/svg', ...)` calls -- not network requests
- Data URI SVG references -- inline, not network requests

All actual resource URLs (Google Fonts, social links, watch links) use HTTPS or relative paths.

---

## .env File

### 14. .env properly returns 404
**Severity:** GOOD

`https://webbedfilms.com/.env` returns HTTP 404. No environment variables are exposed.

---

## Inline Scripts

### 15. Every HTML page contains inline JavaScript
**Severity:** WARNING

All 14 HTML files have inline `<script>` blocks after the external `nav.js` and `flourishes.js` includes. These are page-specific scripts for:
- `index.html`: Video zoom/play reel overlay (~115 lines)
- `work.html`, `the-suite.html`: Scroll animations and SVG generation
- `contact.html`: Form handling
- Portfolio pages: Grid/card interactions
- Originals pages: Gallery and video players

Moving these to external files (e.g., `js/home.js`, `js/work.js`) would allow removing `'unsafe-inline'` from the CSP `script-src` directive.

---

## Summary of Recommendations (Priority Order)

1. **IMMEDIATE:** Block `.git` directory, `deploy.sh`, `CLAUDE.md`, `nginx.conf`, `.gitignore` in nginx.conf. A single rule covers most of these:
   ```nginx
   # Block dotfiles, shell scripts, markdown, and config files
   location ~ /\. {
       deny all;
       return 404;
   }
   location ~* \.(sh|bash|md|conf)$ {
       deny all;
       return 404;
   }
   ```

2. **IMMEDIATE:** Enable "Always Use HTTPS" in Cloudflare dashboard to force HTTP-to-HTTPS redirect.

3. **SHORT-TERM:** Move inline scripts to external JS files and remove `'unsafe-inline'` from CSP `script-src`.

4. **SHORT-TERM:** Apply security headers consistently to all response types (JSON, CSS, JS), not just HTML.

5. **OPTIONAL:** Add `preload` to HSTS header and submit to hstspreload.org.

6. **OPTIONAL:** Add `X-Permitted-Cross-Domain-Policies: none` header.

---

## URLs Tested

| URL | Status | Issue? |
|---|---|---|
| `https://webbedfilms.com` | 200 | No |
| `http://webbedfilms.com` | 200 | Yes -- no HTTPS redirect |
| `https://webbedfilms.com/.git/config` | 200 | **CRITICAL** -- git config exposed |
| `https://webbedfilms.com/.git/HEAD` | 200 | **CRITICAL** -- git HEAD exposed |
| `https://webbedfilms.com/deploy.sh` | 200 | **CRITICAL** -- deploy script exposed |
| `https://webbedfilms.com/CLAUDE.md` | 200 | **CRITICAL** -- project config exposed |
| `https://webbedfilms.com/.gitignore` | 200 | Moderate -- project structure exposed |
| `https://webbedfilms.com/nginx.conf` | 200 | Moderate -- server config exposed |
| `https://webbedfilms.com/.env` | 404 | No (correctly blocked) |
| `https://webbedfilms.com/data/portfolio.json` | 200 | No (public data, expected) |
