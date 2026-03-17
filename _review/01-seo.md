# SEO Audit: webbedfilms.com

**Status: ISSUES FOUND**

Audited 2026-03-17 against source code and live site (https://webbedfilms.com).
14 HTML files checked: index.html, about.html, contact.html, the-suite.html, webbed-films.html, work.html, documentary.html, corporate.html, features.html, shorts.html, webbed-films/ngs.html, webbed-films/blackout.html, webbed-films/christmas-claret.html, webbed-films/rosemary.html.

---

## 1. Page Titles and Meta Descriptions

🟢 **All 14 pages have a `<title>` tag.** Titles are descriptive and include the brand name "Webbed Films".

🟡 **index.html title is just "Webbed Films" (line 8).** Should be more descriptive for the homepage, e.g. "Webbed Films | Daniel Webb — Editor, Writer, Director" to improve click-through from search results.

🟡 **webbed-films.html title is just "Webbed Films" (line 8).** Identical to the homepage title. Should be "Originals — Webbed Films" or similar to differentiate in search results and browser tabs.

🟢 **All 14 pages have a `<meta name="description">`.** Descriptions are unique per page and reasonably well-written.

---

## 2. Open Graph Meta Tags

🟢 **All 14 pages have `og:title`, `og:description`, `og:url`, and `og:type`.** URLs are absolute and use the canonical `www.webbedfilms.com` domain.

🟢 **All 14 pages have `og:image`.** Film pages use film-specific images (posters/stills). About page uses the portrait image.

🔴 **No `og:site_name` on any page.** This should be present on every page: `<meta property="og:site_name" content="Webbed Films">`. Without it, social previews may not show the site brand consistently.

🟡 **Homepage and most pages use `logo.png` as the `og:image` (e.g. index.html line 12, contact.html line 12).** A logo is typically poor for social sharing previews. A showreel frame or hero image would generate much better engagement when shared on social media. Ideal OG image dimensions are 1200x630px.

---

## 3. Twitter Card Meta Tags

🔴 **No Twitter Card meta tags on any page.** Zero instances of `twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, or `twitter:image` across the entire site. Without these, X/Twitter will fall back to Open Graph tags, but the preview may be suboptimal (e.g. small card instead of large image card).

**Recommended minimum for every page:**
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@webbedfilms_uk">
```

---

## 4. Canonical URLs

🔴 **No `<link rel="canonical">` on any page.** This is important to prevent duplicate content issues (e.g. `webbedfilms.com` vs `www.webbedfilms.com` vs trailing-slash variants). Every page should have:
```html
<link rel="canonical" href="https://www.webbedfilms.com/PAGE.html">
```

---

## 5. Heading Hierarchy

🔴 **8 out of 14 pages have NO `<h1>` tag:**
- `index.html` — no h1 at all (the homepage has no visible heading)
- `the-suite.html` — no h1
- `webbed-films.html` — no h1
- `work.html` — no h1
- `documentary.html` — no h1
- `corporate.html` — no h1
- `features.html` — no h1
- `shorts.html` — no h1

Every page must have exactly one `<h1>`. Search engines rely heavily on `<h1>` to understand page topic.

🟢 **6 pages have a single `<h1>` and it is correctly used:**
- `about.html` line 495: `<h1 class="filmstrip-name">Daniel Webb</h1>`
- `contact.html` line 648: `<h1>Got a story worth telling?</h1>`
- `webbed-films/ngs.html` line 115: `<h1>NGS</h1>`
- `webbed-films/blackout.html` line 115: `<h1>Blackout</h1>`
- `webbed-films/christmas-claret.html` line 116: `<h1>A Christmas Claret</h1>`
- `webbed-films/rosemary.html` line 242: `<h1>The Rite of Rosemary</h1>`

🟡 **No `<h2>` or `<h3>` tags found anywhere on the site.** The heading hierarchy is completely flat. Sections like "Tools of the Trade", "What People Say", "Synopsis", "Behind the Scenes", "Soundtrack" etc. use `<p>` tags with label classes instead of semantic headings. This hurts both SEO and accessibility.

---

## 6. Image Alt Text

🟢 **All `<img>` tags in the source have `alt` attributes.** Verified both in source and on the live homepage via JS (zero images missing alt).

🟡 **BTS images use generic alt text** like "Behind the scenes 1", "Behind the scenes 2", etc. (e.g. `webbed-films/ngs.html` lines 146-234). More descriptive alt text would help image search visibility, e.g. "Daniel Pellegrino and Henry Neville on set of NGS".

🟡 **Portfolio poster images on webbed-films.html have adequate but minimal alt text:** "The Rite of Rosemary poster", "NGS poster", "Blackout poster", "A Christmas Claret poster" (lines 416-446). Could benefit from more descriptive text mentioning "short film" to aid discoverability.

🟢 **About page portrait images have good alt text:** "Daniel Webb", "Daniel Webb", "Daniel Webb on set" (lines 529-545).

🟢 **Header logo on every page has `alt="Webbed Films"`.**

---

## 7. Sitemap and Robots.txt

🔴 **No sitemap.xml exists.** Live URL https://webbedfilms.com/sitemap.xml returns 404. No sitemap file in the source code. A sitemap is essential for a 14-page site to ensure all pages are discovered and indexed.

**Recommended sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.webbedfilms.com/</loc></url>
  <url><loc>https://www.webbedfilms.com/about.html</loc></url>
  <url><loc>https://www.webbedfilms.com/the-suite.html</loc></url>
  <url><loc>https://www.webbedfilms.com/work.html</loc></url>
  <url><loc>https://www.webbedfilms.com/documentary.html</loc></url>
  <url><loc>https://www.webbedfilms.com/corporate.html</loc></url>
  <url><loc>https://www.webbedfilms.com/features.html</loc></url>
  <url><loc>https://www.webbedfilms.com/shorts.html</loc></url>
  <url><loc>https://www.webbedfilms.com/webbed-films.html</loc></url>
  <url><loc>https://www.webbedfilms.com/webbed-films/rosemary.html</loc></url>
  <url><loc>https://www.webbedfilms.com/webbed-films/ngs.html</loc></url>
  <url><loc>https://www.webbedfilms.com/webbed-films/blackout.html</loc></url>
  <url><loc>https://www.webbedfilms.com/webbed-films/christmas-claret.html</loc></url>
  <url><loc>https://www.webbedfilms.com/contact.html</loc></url>
</urlset>
```

🟢 **robots.txt exists** (served by Cloudflare managed rules). It allows search crawlers (`Allow: /`) and blocks AI training bots (GPTBot, ClaudeBot, CCBot, etc.). The `Content-Signal: search=yes,ai-train=no` header is correctly set.

🟡 **robots.txt does not reference the sitemap.** Once a sitemap is created, add: `Sitemap: https://www.webbedfilms.com/sitemap.xml`
Note: The robots.txt is Cloudflare-managed, so this line would need to be added via Cloudflare dashboard or a custom robots.txt file deployed to the site root.

---

## 8. Structured Data / JSON-LD

🔴 **No JSON-LD structured data on any page.** Zero instances of `<script type="application/ld+json">` across the entire site.

For a freelance film editor's portfolio site, the following schemas would be highly beneficial:

**Homepage / About page — `Person` schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Daniel Webb",
  "jobTitle": "Film & Video Editor",
  "url": "https://www.webbedfilms.com",
  "image": "https://www.webbedfilms.com/assets/images/Portrait%201.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Gravesend",
    "addressRegion": "Kent",
    "addressCountry": "GB"
  },
  "sameAs": [
    "https://www.instagram.com/webbedfilms/",
    "https://www.threads.net/@webbedfilms",
    "https://x.com/webbedfilms_uk",
    "https://www.facebook.com/webbedfilms",
    "https://www.linkedin.com/in/danwebb89"
  ]
}
```

**Film pages — `Movie` or `ShortFilm` schema** with director, cast, and description.

---

## 9. URL Structure

🟢 **Clean, readable URLs.** Filenames are lowercase, hyphenated, and descriptive: `documentary.html`, `the-suite.html`, `webbed-films/rosemary.html`.

🟡 **`.html` extensions in URLs.** Modern best practice is extensionless URLs (e.g. `/about` instead of `/about.html`). This could be achieved with nginx rewrite rules. Low priority but worth noting.

🟡 **Film pages are nested under `/webbed-films/`** which is the "Originals" brand. The URL structure is logical but the parent page is named `webbed-films.html` (at root) while child pages are in `webbed-films/` directory, creating a slight naming inconsistency.

---

## 10. Social Links

🟢 **All social links are correct across every page:**
- Instagram: `https://www.instagram.com/webbedfilms/` (@webbedfilms)
- Threads: `https://www.threads.net/@webbedfilms` (@webbedfilms)
- X/Twitter: `https://x.com/webbedfilms_uk` (@webbedfilms_uk)
- Facebook: `https://www.facebook.com/webbedfilms` (@webbedfilms)
- LinkedIn: `https://www.linkedin.com/in/danwebb89`

🟢 **All social links have `target="_blank"` and `rel="noopener noreferrer"`.**

🟢 **All social links have appropriate `aria-label` attributes** for accessibility.

🟢 **Social links are consistent** across the sidebar (index.html), footer (all pages), contact page details section, and film page footers.

---

## 11. Additional Observations

🟡 **No `lang` attribute issues.** All pages have `<html lang="en">`.

🟢 **Favicon is set** on all pages: `<link rel="icon" type="image/png" href="assets/images/favicon.png">` and `<link rel="apple-touch-icon">`.

🟡 **No `<meta name="author">` tag** on any page. Adding `<meta name="author" content="Daniel Webb">` would be a minor improvement.

🟡 **The `og:image` for about.html uses a space in the filename** (`Portrait%201.jpg`, line 12). While URL-encoded, some social crawlers handle spaces poorly. Consider renaming the source image to `portrait-1.jpg`.

---

## Summary of Critical Issues (Priority Order)

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | 🔴 Critical | 8 pages missing `<h1>` tag | Major SEO signal missing; search engines cannot determine page topic |
| 2 | 🔴 Critical | No `<link rel="canonical">` on any page | Duplicate content risk between www/non-www and other URL variants |
| 3 | 🔴 Critical | No sitemap.xml | Search engines may not discover or index all 14 pages |
| 4 | 🔴 Critical | No JSON-LD structured data | Missing rich result opportunities; no entity association in Knowledge Graph |
| 5 | 🔴 Critical | No Twitter Card meta tags | Poor social preview on X/Twitter |
| 6 | 🔴 Critical | No `og:site_name` on any page | Inconsistent brand attribution in social previews |
| 7 | 🟡 Warning | No `<h2>`/`<h3>` heading hierarchy anywhere | Flat heading structure hurts content semantics |
| 8 | 🟡 Warning | Homepage and many pages use logo.png as og:image | Poor social sharing previews |
| 9 | 🟡 Warning | Generic BTS image alt text | Missed image search optimisation |
| 10 | 🟡 Warning | Homepage title too generic ("Webbed Films") | Low CTR in search results |
| 11 | 🟡 Warning | Duplicate title on webbed-films.html ("Webbed Films") | Cannot be distinguished from homepage in SERPs |
