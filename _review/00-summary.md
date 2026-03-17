# Site Review Summary -- webbedfilms.com

**Date:** 2026-03-17
**Scope:** 14 HTML pages, 3 CSS files, 3 JS files, portfolio data, deploy config, live site behaviour

---

## Area Status

| # | Area | Status | Key Findings |
|---|------|--------|-------------|
| 01 | SEO | ISSUES FOUND | 8/14 pages missing h1, no sitemap, no canonical URLs, no JSON-LD, no Twitter Cards |
| 02 | Performance | ISSUES FOUND | Logo 9.6 MB (displayed at 72px), portfolio thumbnails 5-31 MB, 126 MB homepage video with no poster |
| 03 | Accessibility | ISSUES FOUND | No prefers-reduced-motion (15+ animations), no skip-to-content, multiple WCAG AA contrast failures |
| 04 | Security | ISSUES FOUND | .git directory publicly accessible, deploy.sh and CLAUDE.md served to the internet |
| 05 | Links & Assets | WARNINGS | No www/non-www redirect, no HTTP-to-HTTPS redirect, Threads links use old domain |
| 06 | Responsive | WARNINGS | Mobile clip pills ~20px (below 44px min), contact social links 28px, missing overflow-x:hidden on homepage |
| 07 | Code Quality | WARNINGS | ~1,280 lines duplicated JS across 4 pages, slug mismatches in portfolio.json, unused font loaded globally |
| 08 | Content | WARNINGS | No custom 404 page, developer comments in index.html, "5.1 surround" vs "7.1" contradiction |

---

## Top 10 Fixes by Impact

| Rank | Area | Issue | Why It Matters |
|------|------|-------|---------------|
| 1 | Security | .git, deploy.sh, CLAUDE.md publicly accessible | Exposes server IP, SSH key path, Cloudflare Zone ID, full infrastructure details. An attacker can reconstruct the entire repo. Add nginx deny rules for dotfiles, .sh, .md, .conf immediately. |
| 2 | Performance | Logo PNG is 9.6 MB, displayed at 72px | Every single page load downloads a 6045x2335 image scaled to 186x72. Resize to ~400px wide WebP for a 99.7% reduction. Loaded on all 14 pages. |
| 3 | Security | HTTP does not redirect to HTTPS | First-time visitors can be served over plain HTTP. Enable "Always Use HTTPS" in Cloudflare dashboard. |
| 4 | Performance | Portfolio thumbnails are 5-31 MB PNGs | The work page fallback path serves full-res originals (100+ MB total). Convert to WebP and ensure 800w variants cover all formats. |
| 5 | SEO | 8 of 14 pages have no h1 tag | Homepage, work, the-suite, webbed-films, and all 4 category pages lack h1. Search engines cannot determine page topic. |
| 6 | Accessibility | No prefers-reduced-motion support | 15+ animations including continuous loops. Users with vestibular disorders have no way to disable motion. A single CSS media query fixes this. |
| 7 | SEO | No sitemap.xml and no canonical URLs | Search engines may not discover all pages. Without canonicals, www vs non-www creates duplicate content. Both are quick additions. |
| 8 | Performance | Homepage video is 126 MB with no poster | Background video autoplays at full weight. Re-encode at lower bitrate (target 10-20 MB) and add a poster frame for perceived speed. |
| 9 | Accessibility | Low-contrast text fails WCAG AA | Contact coordinates (2.01:1), form placeholders (1.39:1), grade monitor labels (~1.5:1). Functional text like the monitor close button must be legible. |
| 10 | Code Quality | ~1,280 lines duplicated JS across 4 category pages | shorts, documentary, corporate, features share near-identical inline scripts. Extract to a shared grade-monitor.js for maintainability. |

---

## Overall Health Score: 52 / 100

**Justification:**

- **Security (-20):** Publicly exposed .git directory, deploy script, and infrastructure docs is a serious vulnerability that needs immediate attention.
- **Performance (-15):** A 9.6 MB logo on every page and 5-31 MB thumbnails make the site unusably slow on anything other than a fast connection. The foundation is good (tiny JS payload, proper caching, good CLS) but asset sizes negate it.
- **SEO (-8):** Missing h1 tags on most pages, no sitemap, no canonical URLs, and no structured data mean the site is poorly positioned for search despite having good meta descriptions and social links.
- **Accessibility (-5):** Lighthouse scores 100 but manual review reveals no reduced-motion support, no skip-to-content link, multiple contrast failures, and keyboard-inaccessible portfolio sections.
- **Positives (+):** Strong visual design foundation. All 14 pages load, all links work, security headers are well-configured (6/6 present), Lighthouse scores 100 on three categories, semantic HTML is well-structured, ARIA labels are thorough, JS payload is minimal, and caching is properly configured. The site is close to excellent once the asset sizes and security gaps are addressed.
