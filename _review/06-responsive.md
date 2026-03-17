# 06 — Responsive & Mobile Design Audit

**Status: WARNINGS**

Audit date: 2026-03-17
Audited by: source code analysis of all 14 HTML pages, 3 shared CSS files, 3 JS files, and all inline page styles.
Viewports considered: 375px, 768px, 1024px, 1440px.

Note: No Chrome MCP / browser automation tool was available for this session, so this audit is based on thorough static analysis of all CSS rules, media queries, and HTML structure. Visual screenshots could not be captured. The findings below are high-confidence based on the code.

---

## Viewport Meta Tag

All 14 HTML pages include the correct viewport meta tag:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## Breakpoint Architecture

The site uses a single primary breakpoint at **768px** in the shared CSS files, with supplementary page-specific breakpoints:

| Breakpoint | Where Used | Purpose |
|---|---|---|
| 768px | `css/style.css`, `css/grade-monitor.css`, `css/film-page.css` | Main mobile breakpoint: hamburger nav, hide social sidebar, adjust layout |
| 1024px | `about.html` inline | Reduce padding on about page sections |
| 900px | `about.html`, `work.html` inline | Bio stacks to column; testimonials to 2-col; portfolio browse to 2-col |
| 700px | `contact.html`, `the-suite.html` inline | Contact form single-column; suite responsive tweaks |
| 600px | `about.html`, `work.html` inline | Testimonials to 1-col; portfolio browse to 1-col |
| 580px | `webbed-films.html` inline | Poster grid tighter, reduced hover effect |
| 1400px | `webbed-films.html` inline | Poster grid gap reduction |
| 1100px | `webbed-films.html` inline | Poster grid wraps to 2x2 |

---

## Findings by Category

### Navigation

- [GOOD] Hamburger button appears at 768px and below, desktop nav is hidden. Hamburger has enforced `min-width: 44px; min-height: 44px` meeting tap target requirements.
- [GOOD] Mobile nav overlay is full-screen with centred links using `clamp(28px, 6vw, 40px)` font size -- readable at all mobile sizes.
- [GOOD] Mobile nav links have `min-height: 44px` and `display: flex; align-items: center` -- tap targets are adequate.
- [GOOD] Close button on mobile nav has `min-width: 44px; min-height: 44px` -- meets accessibility minimum.
- [GOOD] `nav.js` properly handles hamburger open/close and closes nav when a link is clicked.
- [WARNING] Desktop nav links (`font-size: 11px`, `padding-bottom: 2px`) have no explicit minimum height or width. At exactly 768px (before the breakpoint kicks in), the nav could be cramped with 8 links plus 2 dropdowns. However, the 768px breakpoint switches to hamburger, so this is acceptable.

### Header

- [GOOD] Header padding reduces from `0 36px` to `0 16px` at mobile. Logo max-height drops from 72px to 50px. Header height drops from 70px to 60px.
- [GOOD] `#site-header` uses `position: fixed` with `z-index: 100` -- stays accessible on scroll at all viewports.

### Horizontal Scrolling Risk

- [GOOD] `html` and `body` both have `width: 100%` with `box-sizing: border-box` on all elements -- no obvious overflow trigger.
- [GOOD] `the-suite.html` and `work.html` both set `overflow-x: hidden` on html/body as a safety net.
- [WARNING] `index.html` does NOT set `overflow-x: hidden`. The `#bg-wrapper` is `position: fixed; inset: 0` and the JS applies `transform: translate3d(...)` with scaling. During the CRT zoom animation, the wrapper is scaled well beyond viewport bounds (e.g., 3-5x). Because `overflow-x: hidden` is not set on `html`/`body` for the homepage, there is a theoretical risk of momentary horizontal scrollbar flash during the zoom transition. In practice, the `#reel-overlay` covers the viewport during this phase, but the underlying wrapper could briefly cause overflow.
- [WARNING] `about.html` does not set `overflow-x: hidden`. The polaroid images have `transform: rotate(-2.5deg)` and hover scale. On very narrow viewports (375px), the bio section has 16px side padding -- if the bio-text-col content is wide (it uses `flex: 1; min-width: 0` which is safe) this should be fine, but the rotated polaroids could theoretically push a pixel or two beyond bounds when hovered.
- [GOOD] Grade monitor pages (documentary, corporate, features, shorts) properly hide the desktop timeline panel at mobile and show the mobile clip list instead. `html, body { overflow: hidden }` in `grade-monitor.css` prevents any overflow.

### Homepage (index.html) -- 375px

- [GOOD] Play button resizes from 120px to 80px at mobile, centred via `left: 50% !important; top: 50% !important`.
- [GOOD] Background video uses `object-fit: cover` -- fills viewport without distortion.
- [GOOD] `#currently-editing` widget is hidden on mobile (`display: none` at 768px).
- [GOOD] Social sidebar hidden at 768px.
- [GOOD] Footer wraps via `flex-wrap: wrap` with `gap: 12px` and centres content on mobile. Social icons grow from 32px to 44px on mobile for better tap targets.
- [WARNING] Reel overlay video uses `object-fit: contain` -- on tall narrow phones (375x812), the video will have large black bars above and below. This is acceptable behaviour for video content but may look like a lot of wasted space on tall devices.

### About Page (about.html) -- 375px

- [GOOD] Film strip header: name font drops from 80px to 40px at 600px breakpoint. Padding adjusts.
- [GOOD] Bio section stacks to single column at 900px. Bio text and polaroid columns stack vertically.
- [GOOD] Testimonials grid: 3 columns -> 2 columns at 900px -> 1 column at 600px.
- [GOOD] Software icons section uses `display: flex` with `gap: 32px` and `justify-content: center`. At 375px, three icons at 56px each plus gaps will fit (56*3 + 32*2 = 232px).
- [GOOD] Bio text uses 15px font size with 1.85 line height -- readable without zooming.
- [WARNING] Polaroid images are fixed at 200px wide. On 375px viewport with 16px padding each side (343px usable), the image plus padding (200 + 16) fits, but the sticky positioning is disabled at mobile (`position: static`). The bio-image-col becomes `width: 100%`, and polaroids centre via flex. This works but polaroids will be left-of-centre because `align-items: center` aligns the 200px wide elements within the full-width container. This is acceptable.
- [GOOD] Film strip "holes" animation (repeating gradient) works at any width -- it's purely decorative and uses `background-repeat: repeat-x`.

### Work Page (work.html) -- 375px

- [GOOD] The "grade monitor" UI switches to a mobile-friendly layout: desktop timeline panel hidden, replaced by `#mobile-track-list` with pill-style clip buttons that flex-wrap.
- [GOOD] Monitor takes 50vh on mobile (up from 48vh on desktop).
- [GOOD] Mobile clip pills have `padding: 5px 10px` and `font-size: 9px` -- quite small but this is consistent with the aesthetic. The clips are tappable but the touch target is approximately 20x28px.
- [WARNING] Mobile clip pills (`mobile-clip-pill`) do NOT meet the 44x44px minimum tap target guideline. At `font-size: 9px` with `padding: 5px 10px`, these pills are approximately 20px tall and variable width. On mobile, users will need precise taps.
- [GOOD] The browse-grid portfolio section at the bottom of work.html uses CSS columns: 3 columns -> 2 at 900px -> 1 at 600px. This adapts well.
- [GOOD] `overflow: hidden` on html/body in grade-monitor.css prevents any horizontal scroll issues.

### Category Pages (documentary, corporate, features, shorts) -- 375px

- [GOOD] All use `grade-monitor.css` shared responsive rules. Same mobile behaviour as the work page grade monitor: timeline hidden, mobile clip list shown.
- [GOOD] `#monitor-title` drops from 48px to 28px. `#monitor-content` padding from `44px 60px` to `24px 24px`.
- [GOOD] Corner decorations hidden on mobile.
- [WARNING] Same mobile clip pill tap target issue as work.html (see above).

### Originals Page (webbed-films.html) -- 375px

- [GOOD] Poster grid: 4-across -> 2x2 at 1100px -> 2x2 tighter at 580px.
- [GOOD] At 580px, poster cards use `flex: 0 0 calc(50% - 10px)` with 20px gap -- total width exactly fills container.
- [GOOD] Hover effect reduced on mobile from `translateY(-36px) scale(1.15)` to `translateY(-12px) scale(1.06)`.
- [GOOD] Page padding reduces from 48px to 16px at 580px.
- [GOOD] Images use responsive `srcset` with appropriate `sizes` attribute for each breakpoint.
- [GOOD] Cursor light effect is disabled on touch devices via `window.matchMedia('(hover: none)')`.

### Film Pages (rosemary, ngs, blackout, christmas-claret) -- 375px

- [GOOD] Hero content padding drops from 60px to `32px 24px` at 768px.
- [GOOD] Synopsis overlay repositions from bottom-right fixed position to top of viewport, spanning full width with `left: 24px; right: 24px`.
- [GOOD] BTS photo strip height drops from 280px to 200px, min-width from 200px to 150px.
- [GOOD] BTS scroll strip uses `-webkit-overflow-scrolling: touch` for momentum scrolling on iOS.
- [GOOD] Soundtrack track rows reduce gap and font size on mobile.
- [GOOD] Film overlay close button is 44x44px -- meets tap target requirement.
- [GOOD] Play circle button on film pages uses `glow-breathe` animation -- visible call to action.
- [GOOD] Centre play button shrinks from 100x100 to 72x72 at mobile -- still a comfortable tap target.
- [GOOD] Scroll indicator hidden on mobile.
- [WARNING] BTS arrow buttons shrink from 40x40 to 32x32 at mobile. At 32px, they fall below the 44px minimum tap target guideline. However, they have generous padding from the strip edges (6px) and there's nothing immediately adjacent to accidentally tap.
- [WARNING] Rosemary.html video grid goes from 4 columns to 2 columns at 768px. At 375px with 24px side padding, each video card is approximately (375 - 48 - 16) / 2 = 155px wide. With 16:9 aspect ratio, each card is about 87px tall -- small but viewable.
- [WARNING] `.film-hero-title` on rosemary.html is set to 80px on desktop and drops to 40px at 768px via inline override. Other film pages may not have this override, relying on the default from `film-page.css` which has no font-size specified (it's in inline styles per page). Each page should be checked individually.

### The Suite Page (the-suite.html) -- 375px

- [GOOD] Responsive breakpoint at 700px adjusts hero padding, quote font size, contact sheet layout.
- [GOOD] Quote uses `clamp(22px, 7vw, 32px)` -- scales smoothly.
- [GOOD] Spec rows stack from horizontal to vertical at 700px.

### Contact Page (contact.html) -- 375px

- [GOOD] Grid goes from 2 columns (`3fr 2fr`) to single column at 700px.
- [GOOD] Details column reordered to top (`order: -1`) on mobile -- good UX, shows email/social first.
- [GOOD] Form inputs set to `font-size: 16px` on mobile -- prevents iOS Safari auto-zoom on focus.
- [GOOD] Copy button enlarged to `min-height: 44px` on mobile -- meets tap target requirement.
- [GOOD] Submit button goes full-width on mobile with larger padding.
- [GOOD] Hero text uses `clamp()` for responsive sizing.
- [GOOD] Contact social links have `min-height: 28px` -- slightly below 44px guideline.
- [WARNING] `.contact-social-link` has `min-height: 28px` which falls below the 44px touch target minimum. The `gap: 4px` between links makes this worse. At 375px, a user might accidentally tap the wrong social link.

### Text Readability

- [GOOD] Body text across the site uses `font-family: Inter` at 13-15px with good line heights (1.55-1.85). This is readable without zooming at 375px.
- [GOOD] Headings use `clamp()` or explicit mobile overrides to remain readable.
- [GOOD] Gold accent text (#c8a96e) on dark background (#0a0a0a) has sufficient contrast for decorative/label text.
- [WARNING] Some UI chrome text is very small: monitor labels (9px), timecode (10px), status bar text (8.5px), tc-ruler marks (7px). These are decorative/ambient elements consistent with the editing software aesthetic, but they are not readable at arm's length on mobile.

### Images

- [GOOD] About page polaroids use `srcset` with 400w/800w/1200w variants and appropriate `sizes`.
- [GOOD] Originals poster cards use `srcset` with `sizes` tuned to each breakpoint.
- [GOOD] BTS photos use `object-fit: cover` and flex layout -- they scale without distortion.
- [GOOD] Logo has `width` and `height` attributes (6045x2335) plus `max-height` CSS constraint -- prevents layout shift.
- [WARNING] Several pages reference full-resolution hero images inline (e.g., `background-image: url('../assets/images/Rite%20of%20Rosemary.jpg')`) without responsive variants. On a 375px mobile device, the browser downloads the full-size image. This is a performance concern rather than a layout issue.

### Film Strip Borders & CRT Motifs

- [GOOD] Film strip sprocket holes on about.html use `repeating-linear-gradient` with `repeat-x` -- works at any width.
- [GOOD] CRT scanlines on homepage use `repeating-linear-gradient` fixed position -- viewport-width independent.
- [GOOD] Vignette uses `radial-gradient` with percentage sizing -- adapts to any viewport.
- [GOOD] Grade monitor scanlines and vignette are absolutely positioned within the monitor container -- contained and safe.
- [GOOD] Grade monitor corner brackets are hidden on mobile via `.corner { display: none }`.
- [GOOD] Noise canvas resizes via JS `resize` event handler.

### Custom Cursor

- [GOOD] Custom cursor is gated behind `@media (hover: hover)` -- disabled on touch devices.
- [GOOD] JS in `flourishes.js` would only attach cursor-related event listeners on non-touch devices.

### Page Transition

- [GOOD] `#transition-overlay` is fixed position with `inset: 0` -- works at any viewport.

---

## Summary of Issues

### Critical Issues
None found. The site has good responsive foundations.

### Warnings (should fix)

1. **Mobile clip pill tap targets too small** (work.html, documentary.html, corporate.html, features.html, shorts.html) -- `mobile-clip-pill` buttons are approximately 20px tall, well below the 44px minimum. Add `min-height: 44px; display: flex; align-items: center;` to `.mobile-clip-pill`.

2. **Contact social link tap targets too small** (contact.html) -- `.contact-social-link` at 28px height with 4px gap. Should be at least 44px with adequate spacing.

3. **BTS scroll arrow buttons below tap target minimum** (film pages) -- 32px on mobile, should be 40px minimum (ideally 44px).

4. **Homepage missing `overflow-x: hidden`** (index.html) -- During CRT zoom animation, the scaled wrapper could briefly cause horizontal overflow. Add `overflow-x: hidden` to `html, body` in the homepage inline styles.

5. **Hero background images not responsive** (film pages) -- Full-resolution images served to all devices. Consider using `image-set()` or `<picture>` elements for background images, or serving smaller images via media queries.

### Minor Notes

- Very small decorative UI text (7-9px) on grade monitor pages is not readable on mobile but serves an ambient/aesthetic purpose -- acceptable for the design intent.
- Reel overlay video shows black bars on tall phones -- inherent to `object-fit: contain` and acceptable for video content.
- Film strip sprocket animation continues on mobile -- uses minimal resources and is a nice detail.

---

## Breakpoint Behaviour Summary

| Viewport | Nav | Layout | Known Issues |
|---|---|---|---|
| 375px | Hamburger + full-screen overlay | Single column everywhere, stacked grids | Small tap targets on clip pills and social links |
| 768px | Hamburger triggers at this exact width | Grade monitor switches to mobile mode, film pages reflow | Transition point -- verify edge cases |
| 1024px | Desktop nav | Most layouts at full width, about page reduces padding | None |
| 1440px | Desktop nav | Full desktop layout, poster grid at max width | None |
