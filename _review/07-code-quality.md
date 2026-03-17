# Code Quality Review -- webbedfilms.com

**Status: WARNINGS**

Reviewed: 2026-03-17
Scope: All 14 HTML files, 3 CSS files, 3 JS files, data/portfolio.json, deploy.sh, .gitignore

---

## HTML

### :green_circle: Good -- Solid foundation across all pages

- All 14 HTML files have `<!DOCTYPE html>` and `<html lang="en">`.
- Every page includes `<meta charset="UTF-8">`, viewport meta, and `<meta name="description">`.
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) present on every page.
- Semantic elements used consistently: `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`.
- Hamburger button has `aria-label="Open menu"` and `aria-expanded` attribute toggled by JS.
- Mobile nav uses `role="dialog"` and `aria-label`.
- All external links have `target="_blank" rel="noopener noreferrer"`.
- Decorative elements marked with `aria-hidden="true"` throughout grade-monitor pages.
- No deprecated elements found (no `<center>`, `<font>`, `<marquee>`, etc.).

### :yellow_circle: Warning -- Indentation inconsistency in mobile nav

Every HTML file has the Watch link in the mobile nav indented with an extra leading space, breaking the `<li>` alignment:

```html
<!-- All pages, e.g. index.html line 234 -->
      <li><a href="https://www.revelstokefilms.com" ...>Revelstoke</a></li>
        <li><a href="https://watch.webbedfilms.com" ...>Watch</a></li>
      <li><a href="contact.html">Contact</a></li>
```

The `<li>` containing the Watch link is indented 8 spaces instead of 6. Functionally harmless but present in all 14 files.

**Files:** All `.html` files (index.html:234, about.html:480, contact.html:637, shorts.html:86, documentary.html:86, corporate.html:86, features.html:86, work.html, the-suite.html, webbed-films.html, webbed-films/rosemary.html, webbed-films/ngs.html, webbed-films/blackout.html, webbed-films/christmas-claret.html)

### :yellow_circle: Warning -- Logo image has enormous intrinsic dimensions

```html
<img src="assets/images/logo-new.png" alt="Webbed Films" class="logo"
     onerror="this.style.display='none'" width="6045" height="2335">
```

The `width="6045" height="2335"` attributes are the raw file dimensions. While CSS constrains rendering to `max-height: 72px`, these large attributes cause the browser to reserve a 6045x2335 layout slot before CSS loads, potentially causing layout shift. Consider providing more realistic `width`/`height` values matching the rendered size (e.g. `width="186" height="72"`) or adding `srcset` with appropriately sized images.

**Files:** All 14 HTML files.

### :yellow_circle: Warning -- Inline `onerror` handler on logo image

```html
onerror="this.style.display='none'"
```

Inline event handlers are a mild Content Security Policy (CSP) concern. If you ever add a CSP `script-src` header, this will break. Not critical for a static portfolio but worth noting for future-proofing.

### :green_circle: Good -- Favicon present and correct

All 14 pages reference `assets/images/favicon.png` (or `../assets/images/favicon.png` for pages in `webbed-films/`). The file `assets/images/favicon.png` exists in the repo. Both `rel="icon"` and `rel="apple-touch-icon"` are included on every page.

---

## CSS

### :green_circle: Good -- Well-organised custom properties

`css/style.css` defines a clean set of CSS custom properties at `:root`:

```css
--bg, --text, --accent, --color-gold, --color-muted
--font-heading, --font-display, --font-chalk, --font-ui
--header-h
```

These are used consistently throughout the codebase. Colour values like `#0a0a0a`, `#f0ede8`, `#c8a96e` are almost always referenced via custom properties rather than hardcoded.

### :green_circle: Good -- Clear file organisation

- `css/style.css` (515 lines) -- global layout, header, nav, footer, cursor, transitions, mobile breakpoint.
- `css/grade-monitor.css` (443 lines) -- shared NLE-themed UI for category pages (documentary, corporate, features, shorts).
- `css/film-page.css` (719 lines) -- shared layout for film originals pages (rosemary, ngs, blackout, christmas-claret).
- Page-specific overrides kept in inline `<style>` blocks, which is a reasonable approach for a no-build-step site.

### :yellow_circle: Warning -- Duplicate `text-transform` declaration

In `about.html` inline styles, lines 291-293:

```css
.software-icon span {
  /* ... */
  text-transform: uppercase;
  color: rgba(240, 237, 232, 0.85);
  text-transform: none;
}
```

`text-transform` is declared twice. The second value (`none`) wins, making the first (`uppercase`) dead code. Remove the `text-transform: uppercase` line.

**File:** `/about.html`, inline `<style>`, lines 291-293.

### :yellow_circle: Warning -- Some hardcoded colour values that could use custom properties

Several inline `<style>` blocks use raw colour values where custom properties exist:

- `#0d0d0d` used in many pages for `html { background: #0d0d0d; }` -- could be a `--bg-dark` variable.
- `rgba(240,237,232,0.55)` appears repeatedly -- already aliased as `--color-muted` in style.css but written out raw in `grade-monitor.css` (lines 40, 244) and `film-page.css` (lines 275, 276).
- `#111` used for footer background in `style.css:265` is close to but not the same as `--bg` (`#0a0a0a`).

Not critical, but extracting these into custom properties would improve consistency.

### :yellow_circle: Warning -- Duplicate `@keyframes ken-burns`

`@keyframes ken-burns` is defined in both `css/grade-monitor.css` (line 97) and `css/film-page.css` (line 51). They have different end values (`scale(1.08)` vs `scale(1.18)`), which is intentional, but having same-named keyframes in two shared CSS files is fragile. If both CSS files are ever loaded on the same page, one definition will silently override the other.

**Files:** `css/grade-monitor.css:97`, `css/film-page.css:51`

### :green_circle: Good -- Consistent mobile breakpoint

All responsive media queries use `@media (max-width: 768px)` as the primary breakpoint, with supplementary breakpoints at `600px`, `700px`, and `900px` where needed. No conflicting breakpoints found.

### :yellow_circle: Warning -- `cursor: none !important` specificity bomb

```css
/* style.css line 374 */
@media (hover: hover) {
  .wf-cursor-active * { cursor: none !important; }
}
```

The universal selector with `!important` overrides all cursor styles site-wide. This is necessary for the custom cursor feature but makes it impossible to set `cursor: pointer` on any element via CSS alone. Currently managed by JS state, so it works, but the `!important` is worth documenting.

### :green_circle: Good -- No unused CSS files

The CLAUDE.md mentions `css/home.css` and `css/portfolio.css` but these no longer exist. `style.css` has a comment `/* -- Homepage overrides (merged from home.css) -- */` confirming these were intentionally merged. The CLAUDE.md is outdated on this point -- it references 3 shared CSS files but there are actually 3 different ones (`style.css`, `grade-monitor.css`, `film-page.css`).

---

## JavaScript

### :green_circle: Good -- No console.log statements

Zero instances of `console.log`, `console.warn`, `console.error`, `console.debug`, or `console.info` found anywhere in the codebase.

### :green_circle: Good -- All JS wrapped in IIFEs

All three JS files (`nav.js`, `flourishes.js`, `daily-quote.js`) and all inline scripts use immediately-invoked function expressions with `'use strict'` where appropriate. No global variable leaks.

### :green_circle: Good -- portfolio.json error handling

All 5 pages that fetch `data/portfolio.json` (shorts.html, documentary.html, corporate.html, features.html, work.html) include a `.catch()` handler:

```js
fetch('data/portfolio.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    buildTimeline(data[PAGE_CATEGORY] || []);
    startPlayhead();
  })
  .catch(function () {
    startPlayhead();
    var sb = document.getElementById('sb-count');
    if (sb) sb.textContent = TRACK_LABEL + ' PROJECTS';
  });
```

On failure, the UI degrades gracefully -- the playhead still runs and the status bar shows a generic message. The `data[PAGE_CATEGORY] || []` fallback handles missing categories.

### :yellow_circle: Warning -- fetch() does not check response.ok

```js
.then(function (r) { return r.json(); })
```

If the server returns a 404 or 500 with an HTML error page, `r.json()` will throw a parse error, which is caught by `.catch()`. However, it would be cleaner to check `r.ok` first:

```js
.then(function (r) {
  if (!r.ok) throw new Error(r.status);
  return r.json();
})
```

This gives a clearer failure path and avoids relying on JSON parse failure as the error detection mechanism.

**Files:** `shorts.html:443`, `documentary.html:440`, `corporate.html:443`, `features.html:433`, `work.html:1308`

### :red_circle: Critical -- Massive code duplication across category pages

The inline `<script>` blocks on `shorts.html`, `documentary.html`, `corporate.html`, and `features.html` contain virtually identical code (~320 lines each). The only differences between them are:

- `PAGE_CATEGORY` string (`'shorts'`, `'documentary'`, `'corporate'`, `'features'`)
- `CLIP_COLORS` array order
- `TRACK_LABEL` string
- Minor `buildRuler()` count value (16 vs 22)

This is approximately 1,280 lines of duplicated JavaScript. Functions like `initNoise()`, `initTimecode()`, `loadImage()`, `buildTimeline()`, `buildRuler()`, `hoverClip()`, `clearHover()`, `showIdleClip()`, `getClipAtPlayhead()`, `startPlayhead()`, `initDragScroll()`, and `initAnimations()` are copy-pasted verbatim.

**Recommendation:** Extract into a shared `js/grade-monitor.js` file that reads `PAGE_CATEGORY`, `CLIP_COLORS`, and `TRACK_LABEL` from data attributes on the `<div id="grade-ui">` element. This would reduce ~1,280 lines to ~320 lines plus a 3-line config block per page.

### :yellow_circle: Warning -- Continuous requestAnimationFrame noise rendering

The `initNoise()` function on category pages runs `requestAnimationFrame(draw)` indefinitely, generating a full-frame noise texture on every animation frame. This writes to every pixel of a canvas sized to the monitor panel (~800x400 at typical viewport). The canvas opacity is `0.055` (nearly invisible). This is a significant ongoing CPU/battery cost for a barely-visible effect.

**Files:** Inline scripts in `shorts.html:170-181`, `documentary.html:188-199`, `corporate.html`, `features.html`

### :yellow_circle: Warning -- `initTimecode()` runs requestAnimationFrame indefinitely

The timecode counter calls `requestAnimationFrame(tick)` on every frame forever, even though a timecode display updating at 25fps would only need ~40ms intervals. Using `requestAnimationFrame` means it runs at 60fps+ on high-refresh displays, doing unnecessary DOM writes.

**Files:** Same category pages, inline scripts.

### :green_circle: Good -- Graceful degradation for touch devices

`flourishes.js` checks `window.matchMedia('(hover: none)')` and skips custom cursor injection on touch devices. The magnetic nav links are also disabled on touch. Good practice.

### :green_circle: Good -- Page transitions handle edge cases

`flourishes.js` page transitions correctly:
- Skip links with `#` anchors
- Skip `mailto:` and `tel:` links
- Skip links with `target="_blank"`
- Skip clicks with modifier keys (Ctrl/Cmd for new tab)
- Use `sessionStorage` to coordinate incoming/outgoing transitions

### :green_circle: Good -- Contact form has proper validation

The contact form in `contact.html` includes:
- Client-side validation with visual error states (shake animation)
- Email regex validation
- Honeypot field (`_gotcha`) for bot prevention
- Hidden `_replyto` field synced with email input
- Disabled submit button after submission
- Success state on redirect back (`?sent=true`)
- Clipboard API fallback for copy-email button

---

## Data (portfolio.json)

### :green_circle: Good -- Valid JSON structure

The file is valid JSON with 4 categories (`shorts`, `features`, `documentary`, `corporate`). Each entry has `title` and `slug`. Shorts/documentary/corporate entries have `link` (nullable). Features entries have `available` (boolean).

### :yellow_circle: Warning -- Inconsistent schema between categories

- `shorts`, `documentary`, `corporate` entries have: `{ title, slug, link }`
- `features` entries have: `{ title, slug, available }` -- no `link` field

The JS handles this gracefully (`clip.link` is undefined for features, so `window.open` is never called), but the schema inconsistency could trip up future maintenance.

### :yellow_circle: Warning -- Possible slug/link mismatches

- "The Wiggie" has slug `the-wiggie` but link contains `the-wiggy` (different spelling).
- "Prodomal" has slug `prodomal` but link contains `prodromal` (different spelling).
- "IN NAM 22" has slug `in-nam-22` but link contains `in-nam-20` (different number).

These may be intentional (PeerTube slugs differ from display slugs) but are worth verifying.

**File:** `data/portfolio.json`, lines 16, 21, 46.

---

## File and Folder Structure

### :green_circle: Good -- Sensible layout

```
/
  index.html, about.html, contact.html, ...  (10 root-level pages)
  webbed-films/                               (4 film-specific pages)
    rosemary.html, ngs.html, blackout.html, christmas-claret.html
  css/                                        (3 shared stylesheets)
    style.css, grade-monitor.css, film-page.css
  js/                                         (3 shared scripts)
    nav.js, flourishes.js, daily-quote.js
  data/
    portfolio.json
  assets/
    images/, video/, audio/                   (rsynced, not in git)
  deploy.sh
  .gitignore
```

Clean separation between code (git-tracked) and media (rsync-only). The `webbed-films/` subdirectory for originals pages uses correct relative paths (`../css/`, `../assets/`).

### :green_circle: Good -- Naming conventions are consistent

- HTML files: lowercase, hyphenated (`the-suite.html`, `christmas-claret.html`).
- CSS files: lowercase, hyphenated (`grade-monitor.css`, `film-page.css`).
- JS files: lowercase, hyphenated (`daily-quote.js`).
- CSS classes: lowercase, hyphenated BEM-ish naming (`film-hero-title`, `clip-block`, `is-visible`, `is-playing`).

### :yellow_circle: Warning -- CLAUDE.md references outdated CSS file names

CLAUDE.md line 7 says:
> 14 HTML files with inline styles + 3 shared CSS files (css/style.css, css/home.css, css/portfolio.css)

The actual CSS files are `style.css`, `grade-monitor.css`, and `film-page.css`. The files `home.css` and `portfolio.css` do not exist.

### :yellow_circle: Warning -- `daily-quote.js` filename is misleading

The file `js/daily-quote.js` is actually a tagline rotator for the contact page (cycles every 30 seconds, picks randomly). The name suggests a daily-changing inspirational quote. A name like `tagline-rotator.js` or `contact-taglines.js` would better describe its function.

### :yellow_circle: Warning -- `--font-chalk` custom property is unused

`style.css` line 9 defines `--font-chalk: 'Permanent Marker', cursive` but this font is never referenced in any CSS rule across the entire codebase. The Google Fonts link does load Permanent Marker, so this is wasted bandwidth (~20KB).

Similarly, the CLAUDE.md mentions "Rock Salt" as a loaded font, but Rock Salt is not in any Google Fonts link tag and `--font-chalk` references "Permanent Marker" instead. The CLAUDE.md entry is stale.

---

## Comments

### :green_circle: Good -- Well-commented CSS

All three CSS files use clear section headers with box-drawing characters:

```css
/* ══ ZONE 1: MONITOR ══════════════════════════════════════ */
/* ── Staggered entrance ── */
```

Non-obvious logic is explained, e.g.:
- `style.css:93`: `/* The "Work" parent should never get the active underline -- only sub-items */`
- `style.css:370`: `/* wf-cursor-active class added by JS on non-touch devices */`
- `style.css:475`: `/* bio-text needs position:relative for the absolute line */`

### :green_circle: Good -- JS files have descriptive headers

`flourishes.js` has numbered sections with explanatory comments for each feature (cursor, magnetic nav, timeline, page transitions). Each section explains what it does and when it activates.

---

## Summary of Findings

| Severity | Count | Description |
|----------|-------|-------------|
| :red_circle: Critical | 1 | ~1,280 lines of duplicated JS across 4 category pages |
| :yellow_circle: Warning | 12 | Schema inconsistencies, dead CSS, outdated docs, hardcoded colours, perf concerns |
| :green_circle: Good | 15 | Valid HTML, good a11y, clean CSS architecture, proper error handling, no console.logs |

### Priority recommendations:

1. **Extract shared grade-monitor JS** into a single `js/grade-monitor.js` file. This is the single biggest maintainability improvement available.
2. **Fix portfolio.json slug mismatches** (Wiggie/Wiggy, Prodomal/Prodromal, IN NAM 22/20) -- verify these are intentional.
3. **Remove unused `--font-chalk` property** and the Permanent Marker font from Google Fonts links to save bandwidth.
4. **Update CLAUDE.md** to reflect actual CSS file names and font list.
5. **Fix duplicate `text-transform`** in about.html inline styles.
6. **Add `response.ok` check** to portfolio.json fetch calls.
