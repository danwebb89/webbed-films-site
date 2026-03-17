# Performance Audit — webbedfilms.com

**Status: ISSUES FOUND**

Audited: 2026-03-17
Tool: Chrome DevTools MCP + source code review + Lighthouse

---

## Lighthouse Scores (Desktop)

| Category | Score |
|---|---|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Performance trace metrics (lab, desktop, no throttling):
- **LCP:** 267 ms (good)
- **CLS:** 0.02 (good)
- Render-blocking: 2 CSS requests (style.css + Google Fonts), ~4ms each

---

## Homepage Request Summary

10 requests total on initial load:

| Asset | Size | Cache |
|---|---|---|
| index.html | ~23 KB | 300s / CF dynamic |
| Google Fonts CSS | gzipped | private, 86400s |
| css/style.css | ~13 KB | 604800s (7 days) |
| assets/images/logo-new.png | **9.6 MB** | 2592000s (30 days), immutable |
| js/nav.js | ~1.5 KB | 604800s |
| js/flourishes.js | ~9.2 KB | 604800s |
| Cinzel woff2 | ~20 KB (est) | Google CDN |
| Inter woff2 | ~20 KB (est) | Google CDN |
| homebackground.mp4 | **126 MB** | 2592000s, immutable |
| homebackground.mp4 (range) | (duplicate 206) | same |

**Estimated homepage weight: ~136 MB** (dominated by video + logo PNG)

---

## Findings

### Images

#### :red_circle: CRITICAL — Logo PNG is 9.6 MB, served uncompressed
- **File:** `assets/images/logo-new.png` (10,104,977 bytes)
- **Declared dimensions:** `width="6045" height="2335"` (line 183 of `index.html`)
- **Displayed at:** max-height 72px (CSS `.logo` rule, `css/style.css` line 47)
- This is a 6045x2335 PNG being scaled down to ~186x72 in the browser. The intrinsic resolution is ~84x the display area.
- **Fix:** Resize to ~400px wide, convert to WebP. Expected size: ~15-30 KB (99.7% reduction).
- This image is the LCP element. Lighthouse also flags that it lacks `fetchpriority="high"`.
- **Appears on every page** (14 HTML files reference `logo-new.png`).

#### :red_circle: CRITICAL — Portfolio thumbnail PNGs are 5-31 MB each, unoptimised
- Full-resolution PNGs in `assets/images/`:
  - `The Rite of Rosemary Poster.png` — **31 MB**
  - `Barts Cancer Institute - Launch Your Career.png` — **21 MB**
  - `Redrow x GB Snowsport.png` — **15 MB**
  - `WEBBED FILMS NEW LOGO.png` — **11 MB**
  - `Camp Crusoe - Summer Camp.png` — **9 MB**
  - `The Understudy.png` — **7 MB**
  - `This is Brickwood.png` — **6 MB**
  - Plus ~15 more PNGs ranging from 2-7 MB each
- These are the source files that get served as background-images via the JS `loadImage()` function on `work.html` (line 841).
- The `loadImage()` function tries `800w/` first, then falls back to full-size originals. However, only JPG/PNG/AVIF extensions are tried -- many originals are PNG format.
- **Fix:** Convert all portfolio thumbnails to WebP/AVIF. The 800w/ directory has properly-sized JPGs (~60-130 KB each) which is good, but the fallback path still serves multi-MB PNGs.

#### :red_circle: CRITICAL — About page portrait images are 5-9 MB with no lazy loading
- `assets/images/Portrait 1.jpg` — **8.9 MB** (3848x5776)
- Referenced on `about.html` line 524 with `srcset` pointing to 400w/800w/1200w variants.
- The `sizes` attribute says `200px`, so the browser should pick 400w. However, the full-size fallback `src` is 8.9 MB.
- **No `loading="lazy"` attribute** on any of the 3 portrait images (`about.html` lines 524-545).
- These are above-the-fold on the about page, so eager loading is acceptable, but the enormous fallback src is not.

#### :yellow_circle: WARNING — No WebP/AVIF used for portfolio thumbnails
- Only 2 AVIF files found in the entire codebase: `The Sidecar Guys.avif` in root and 800w.
- All other images are JPEG or PNG.
- The `loadImage()` function on `work.html` tries extensions `['jpg', 'png', 'avif']` (line 823), which is the right idea, but there are almost no AVIF files to find.
- **Fix:** Generate WebP versions of all 800w thumbnails. Add `'webp'` to the IMG_EXTS array and place it first.

#### :green_circle: GOOD — Suite page and BTS galleries use srcset + lazy loading
- `the-suite.html` has proper `srcset` with 400w/800w/1200w breakpoints, `sizes` attribute, and `loading="lazy"` on all 15 gallery images.
- `webbed-films/rosemary.html` BTS gallery (213 images) has identical proper implementation with `srcset`, `sizes`, and `loading="lazy"`.
- Same pattern on `blackout.html`, `ngs.html`, `christmas-claret.html`.

---

### Video

#### :yellow_circle: WARNING — Homepage background video is 126 MB
- **File:** `assets/video/homebackground.mp4` (131,886,870 bytes)
- Autoplays on index.html (line 270): `<video id="bg-video" src="assets/video/homebackground.mp4" autoplay muted loop playsinline>`
- No `poster` attribute — shows black frame until video loads.
- No `preload` attribute (defaults to browser heuristic, most browsers will preload `metadata` or more for autoplay).
- 126 MB is very heavy for a background video. Consider:
  - Re-encoding at lower bitrate (target ~10-20 MB for a looping background)
  - Adding a `poster` frame so there is visual content before video loads
  - Using multiple resolutions with `<source>` for mobile vs desktop

#### :green_circle: GOOD — Showreel video has `preload="none"`
- `index.html` line 281: `<video id="reel" src="assets/video/showreel.mp4" playsinline preload="none">`
- Only loads when user clicks play. Correct approach.

---

### Fonts

#### :yellow_circle: WARNING — 4 font families loaded, including one unused on most pages
- Google Fonts URL loads: **Cinzel** (3 weights), **Cormorant Garamond** (4 variants), **Inter** (3 weights), **Permanent Marker** (1 weight)
- `display=swap` is correctly set in the Google Fonts URL.
- `Permanent Marker` (`--font-chalk` in CSS) appears to be used only for the Blackout film page chalk-style text, yet it is loaded on every single page via the shared Google Fonts `<link>`.
- **Preconnect hints present:** `fonts.googleapis.com` and `fonts.gstatic.com` with `crossorigin`. Good.
- Only 2 font files were actually downloaded on homepage load (Cinzel woff2 + Inter woff2). Cormorant Garamond and Permanent Marker are not rendered on the homepage, so the browser defers their download (good browser behavior), but the CSS itself is still render-blocking.
- **Fix:** Remove Permanent Marker from the shared font URL; load it only on pages that use it (`blackout.html`). Consider reducing Cinzel to 2 weights (300 and 700 -- 400 is rarely distinct from 300 in Cinzel).

#### :green_circle: GOOD — `display=swap` prevents invisible text during font load
- Applied via the Google Fonts CSS URL parameter.

---

### CSS & JS

#### :green_circle: GOOD — Total JS payload is minimal
- `nav.js`: 1.5 KB
- `flourishes.js`: 9.2 KB
- `daily-quote.js`: 7.6 KB (only loaded on contact.html)
- **Total shared JS:** ~10.7 KB across 2 files. Excellent for a static site.

#### :yellow_circle: WARNING — JS files lack `defer` or `async` attributes
- All `<script>` tags on every page use bare `<script src="...">` without `defer` or `async`.
- Example: `index.html` lines 330-331.
- Because they are placed at the end of `<body>`, this is not a major issue in practice, but adding `defer` is a best practice that enables the browser to begin parsing them earlier.
- **Fix:** Add `defer` to all external script tags.

#### :yellow_circle: WARNING — Render-blocking CSS includes Google Fonts
- The Google Fonts `<link rel="stylesheet">` is render-blocking (confirmed by performance trace).
- Duration was only ~4ms in the trace (fast connection), but on slower connections this blocks first paint.
- **Fix:** Consider using `<link rel="preload" as="style" onload="this.rel='stylesheet'">` pattern for Google Fonts to make it non-render-blocking. Or self-host the font files.

#### :green_circle: GOOD — CSS payload is small
- `style.css`: 13 KB
- `grade-monitor.css`: 12 KB (loaded only on category pages)
- `film-page.css`: 18 KB (loaded only on film pages)
- Plus inline `<style>` blocks per page (reasonable for a no-build-step site).

#### :yellow_circle: WARNING — Large inline CSS/JS in HTML files
- `work.html` is 54 KB with ~600 lines of inline CSS and ~500 lines of inline JS. This is not cached separately and re-downloaded on every visit.
- `the-suite.html` is 66 KB, `rosemary.html` is 66 KB, `blackout.html` is 64 KB.
- Not critical given the static nature, but extracting the shared grade-monitor JS into a separate cacheable file would reduce repeat-visit payload.

---

### Caching

#### :green_circle: GOOD — Static assets have proper cache headers
- Images: `Cache-Control: public, max-age=2592000, immutable` (30 days). Excellent.
- CSS/JS: `Cache-Control: public, max-age=604800` (7 days). Adequate.
- Video: `Cache-Control: public, max-age=2592000, immutable` (30 days). Good.
- HTML: `Cache-Control: public, max-age=300, s-maxage=3600`. Appropriate for content that changes.

#### :yellow_circle: WARNING — CSS/JS cache could be longer with cache-busting
- 7-day cache for CSS/JS means returning visitors may re-download unchanged files weekly.
- Since there is no build step to add hashes to filenames, a longer cache with manual versioning (e.g., `style.css?v=2`) would be better.

---

### Layout & CLS

#### :green_circle: GOOD — CLS is 0.02 (well under 0.1 threshold)
- Minor layout shifts caused by web font loading (Cinzel + Inter swap). Acceptable.
- Logo `<img>` has explicit `width` and `height` attributes, preventing layout shift.

---

### Missing Optimisations

#### :yellow_circle: WARNING — No `fetchpriority="high"` on LCP image
- The logo image is the LCP element. Adding `fetchpriority="high"` would hint the browser to prioritise it.
- **File:** All 14 HTML files, the `<img>` tag for `logo-new.png`.

#### :yellow_circle: WARNING — No `<meta name="theme-color">` for mobile browsers
- Minor, but affects perceived load speed on mobile.

#### :yellow_circle: WARNING — `will-change: transform` on cursor elements may waste GPU memory
- `css/style.css` lines 387-388 and 407-408: `will-change: transform` on `#cursor-dot` and `#cursor-ring`.
- These are always present in the DOM (injected by `flourishes.js`). The `will-change` property promotes them to compositor layers permanently, using GPU memory for what are essentially 8px and 36px circles.
- Low impact, but unnecessary.

---

## Priority Summary

| # | Severity | Finding | Estimated Impact |
|---|---|---|---|
| 1 | :red_circle: Critical | Logo PNG is 9.6 MB (displayed at 72px) | Save ~9.5 MB per page load |
| 2 | :red_circle: Critical | Portfolio thumbnails are 5-31 MB PNGs | Save 100+ MB on work page |
| 3 | :red_circle: Critical | About page portraits 5-9 MB, no lazy load | Save ~20 MB on about page |
| 4 | :yellow_circle: Warning | Homepage video is 126 MB, no poster | Perceived load speed |
| 5 | :yellow_circle: Warning | No WebP/AVIF for portfolio images | 50-80% size reduction |
| 6 | :yellow_circle: Warning | Permanent Marker font loaded globally | Unnecessary render-blocking CSS |
| 7 | :yellow_circle: Warning | JS files lack `defer` attribute | Minor parse optimisation |
| 8 | :yellow_circle: Warning | Google Fonts CSS is render-blocking | First paint delay on slow connections |
| 9 | :yellow_circle: Warning | No `fetchpriority="high"` on LCP image | LCP optimisation |
| 10 | :yellow_circle: Warning | CSS/JS 7-day cache without versioning | Repeat visit efficiency |
| 11 | :green_circle: Good | Suite/BTS galleries: srcset + lazy loading | Already optimised |
| 12 | :green_circle: Good | Showreel: preload=none | Already optimised |
| 13 | :green_circle: Good | display:swap on all fonts | Already optimised |
| 14 | :green_circle: Good | Total JS payload ~10.7 KB | Already minimal |
| 15 | :green_circle: Good | Image caching 30 days, immutable | Already optimised |
| 16 | :green_circle: Good | CLS 0.02 | Already excellent |
| 17 | :green_circle: Good | Lighthouse: 100/100/100 (a11y/BP/SEO) | Already excellent |

---

## Quick Wins (Highest Impact, Lowest Effort)

1. **Resize and convert `logo-new.png`** to WebP at 400px wide. Update all 14 HTML files. Expected: 9.6 MB -> ~20 KB.
2. **Add `fetchpriority="high"`** to the logo `<img>` tag on all pages.
3. **Add `loading="lazy"`** to portrait images on `about.html` (lines 524, 532, 540).
4. **Add `defer`** to all `<script src="...">` tags.
5. **Add a `poster` frame** to the homepage background video.
6. **Remove Permanent Marker** from the shared Google Fonts URL; load only on `blackout.html`.
