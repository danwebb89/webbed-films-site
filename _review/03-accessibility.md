# Accessibility Audit — webbedfilms.com

**Status: WARNINGS** -- Lighthouse scores 100/100 but manual review reveals several issues below AA compliance that automated tools miss.

**Date:** 2026-03-17
**Audited by:** Claude Code (source review + Chrome DevTools + Lighthouse)

---

## Lighthouse Results

- Accessibility: **100**/100
- Best Practices: **100**/100
- SEO: **100**/100

Lighthouse passed all 44 automated checks. However, Lighthouse only catches ~30% of real accessibility issues. The findings below come from manual source code review and calculated contrast ratios.

---

## Colour Contrast

Contrast ratios calculated using WCAG 2.1 relative luminance formula. WCAG AA requires 4.5:1 for normal text (< 18pt / < 14pt bold) and 3:1 for large text (>= 18pt / >= 14pt bold).

### Passing

| Combination | Ratio | Verdict |
|---|---|---|
| Warm white `#f0ede8` on `#0a0a0a` | **16.95:1** | Pass AA/AAA |
| Warm white `#f0ede8` on `#000000` | **17.98:1** | Pass AA/AAA |
| Gold `#c8a96e` on `#000000` | **9.36:1** | Pass AA/AAA |
| Gold `#c8a96e` on `#0a0a0a` | **8.82:1** | Pass AA/AAA |
| Gold `#c8a96e` on `#111111` (footer) | **8.41:1** | Pass AA/AAA |
| Warm white on header bg (~`rgba(0,0,0,0.85)`) | **17.77:1** | Pass AA/AAA |
| Gold on header bg | **9.24:1** | Pass AA/AAA |
| Muted text `rgba(240,237,232,0.55)` on `#0a0a0a` | **5.53:1** | Pass AA |
| Muted text on `#111` (footer copy) | **5.27:1** | Pass AA |

### Failing / Borderline

| Combination | Ratio | Verdict | Where |
|---|---|---|---|
| Contact coords `rgba(200,169,110,0.35)` on `#0a0a0a` | **2.01:1** | Fail AA/AAA | `contact.html` line 292, `.contact-coords` |
| Form placeholder `rgba(255,255,255,0.15)` on black | **1.39:1** | Fail AA | `contact.html` lines 415-416, `.form-input::placeholder` |
| Grade monitor labels `rgba(240,237,232,0.16)` on `#050505` | **~1.5:1** | Fail AA | `css/grade-monitor.css` line 41, `.mon-label` |
| Status bar text `rgba(240,237,232,0.2)` on `#0a0a0a` | **~1.7:1** | Fail AA | `css/grade-monitor.css` line 416, `.sb-text` |
| Monitor year `rgba(240,237,232,0.3)` on dark bg | **~2.1:1** | Fail AA | `css/grade-monitor.css` line 252, `#monitor-year` |
| BTS photo loading text `rgba(240,237,232,0.2)` | **~1.7:1** | Fail AA | `css/film-page.css` line 330, `.bts-photo span` |
| Idle message `rgba(255,255,255,0.4)` on `#050505` | **~2.6:1** | Fail AA (body), borderline large | `css/grade-monitor.css` line 178, `.idle-msg` |
| Monitor close button `rgba(240,237,232,0.32)` on dark bg | **~2.2:1** | Fail AA | `css/grade-monitor.css` line 265, `#monitor-close` |

Summary:

- The primary colour combinations (gold on black, warm white on black) all pass handsomely.
- Low-opacity decorative/ambient text throughout the grade-monitor UI and contact page coords consistently fails WCAG AA. Some of this is arguably decorative (timecodes, status bar) but the monitor close button and idle message are functional text that need to be legible.

---

## Skip-to-Content Link

- **Not present on any page.**

All 14 HTML files were checked. None contain a skip-to-content/skip-to-main link.

**Finding:**

- The fixed header contains 10+ nav links. Keyboard users must tab through all of them on every page load to reach main content.

---

## Focus Indicators

**Explicit focus styles found in source:**

| File | Selector | Style |
|---|---|---|
| `webbed-films.html` line 289 | `.poster-card:focus-visible` | `outline: 2px solid var(--accent); outline-offset: 6px;` |
| `contact.html` line 418 | `.form-input:focus, .form-textarea:focus` | `border-bottom-color: var(--color-gold); box-shadow: gold glow` |
| `css/style.css` line 115 | `.has-dropdown:focus-within .dropdown` | Makes dropdown visible on focus (functional) |

**Missing focus styles:**

- No global `:focus-visible` or `:focus` rule in `css/style.css` for links (`a`), buttons, or other interactive elements.
- The browser default focus ring (typically a thin blue outline) is the only indicator on:
  - All nav links (`.main-nav a`)
  - Social sidebar icon links (`.social-sidebar a`)
  - Footer social icon links (`.footer-social a`)
  - Homepage play button (`#play-btn`)
  - Homepage close button (`#close-btn`)
  - Mobile nav close button (`.mobile-nav-close`)
  - Hamburger button (`.hamburger`)
  - Film page play circles (`.play-circle`)
  - BTS arrow buttons (`.bts-arrow`)
  - Lightbox navigation buttons (`.lb-close`, `.lb-prev`, `.lb-next`)
  - All links on about.html, contact.html, the-suite.html
  - Grade monitor clip blocks (`.clip-block`) -- these are `div` elements with click handlers but no `tabindex` attribute (JS adds `tabindex` to track headers but not clip blocks themselves)
- The custom cursor (`cursor: none !important` in `.wf-cursor-active *`) hides the system cursor on hover devices, which is fine, but the **browser default focus outline may clash with the dark aesthetic** since it is typically a light blue colour that was not designed for this palette.

**Recommendation:** Add a site-wide `:focus-visible` rule in `css/style.css` that provides a visible gold outline consistent with the design language. For example:
```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

---

## Keyboard Navigation

### Tab Order

The tab order follows DOM source order, which is logical across all pages:
1. Logo link (home)
2. Nav links (About, The Suite, Work dropdown, Originals dropdown, Revelstoke, Watch, Contact)
3. Hamburger button (hidden on desktop via `display:none`)
4. Main content interactive elements
5. Footer social links

### Dropdown Menus

- The `.has-dropdown:focus-within .dropdown` rule in `css/style.css` line 115 correctly opens dropdown menus when a child receives focus. This means keyboard users can tab into Work and Originals submenus.

### Issues

- **Grade monitor clip blocks** (`work.html`, `documentary.html`, `corporate.html`, `features.html`, `shorts.html`): These are `div.clip-block` elements created by JavaScript. They have click handlers but the JS only adds `role="button"` and `tabindex="0"` to track header elements (line 927 of `work.html`), not to the individual clip blocks. Clip blocks are not focusable via keyboard.
  - Files affected: `work.html`, `documentary.html`, `corporate.html`, `features.html`, `shorts.html`
  - Line: ~957 (JS creates `.clip-block` elements without tabindex)

- **BTS photo strip** (`rosemary.html`, `christmas-claret.html`): `.bts-photo` elements are `div` containers set up with click handlers for the lightbox but are not keyboard-focusable (no `tabindex`).

- **Homepage reel overlay**: Once the reel video overlay is open, Tab does not focus the close button. The overlay uses `pointer-events: all` but does not trap focus. Pressing Escape works (keyboard handler exists at `index.html` line 442), but a keyboard-only user might not discover the close button via Tab.

- **Mobile nav overlay**: The mobile nav has `role="dialog"` but does not implement focus trapping. When open, Tab can move focus to elements behind the overlay.

---

## ARIA Labels and Roles

### Present and Correct

| Element | ARIA | File(s) |
|---|---|---|
| `<nav class="main-nav">` | `aria-label="Main navigation"` | All 14 HTML files |
| `<button class="hamburger">` | `aria-label="Open menu"`, `aria-expanded="false/true"` (toggled by JS) | All 14 HTML files |
| `<div class="mobile-nav">` | `role="dialog"`, `aria-label="Navigation menu"` | All 14 HTML files |
| `<button class="mobile-nav-close">` | `aria-label="Close menu"` | All 14 HTML files |
| Social sidebar links | `aria-label="Instagram"`, `"Threads"`, `"X (Twitter)"`, `"Facebook"`, `"LinkedIn"` | All files with sidebar |
| Footer social links | Same aria-labels as sidebar | All files |
| Social SVGs | `aria-hidden="true"` | All files |
| `<aside class="social-sidebar">` | `aria-label="Social media links"` | `index.html`, `about.html` (pages with sidebar) |
| Grade monitor regions | `role="region"` + `aria-label` on `#monitor`, `#timeline-panel`, `#track-sidebar`, `#mobile-track-list` | `work.html` |
| Poster cards | `aria-label="The Rite of Rosemary"` etc. | `webbed-films.html` |
| Quote marks | `aria-hidden="true"` | `about.html` |
| Currently-editing strip | `aria-hidden="true"` | `index.html` |
| Contact background video | `aria-hidden="true"` | `contact.html` |
| Film page background videos | `aria-hidden="true"` | `webbed-films/ngs.html`, `blackout.html`, `christmas-claret.html`, `rosemary.html` |
| BTS lightbox buttons | `aria-label="Close lightbox"`, `"Previous photo"`, `"Next photo"` | `rosemary.html`, `christmas-claret.html` |
| BTS arrow buttons | `aria-label="Scroll left"`, `"Scroll right"` | `rosemary.html`, `christmas-claret.html` |
| Copy email button | `aria-label="Copy email address to clipboard"` | `contact.html` |
| Copy tooltip | `aria-live="polite"` | `contact.html` |
| Contact section | `aria-label="Contact details and enquiry form"` | `contact.html` |
| Contact social nav | `aria-label="Social media"` | `contact.html` |

### Missing

| Element | Issue | File | Line |
|---|---|---|---|
| `#play-btn` | Has `title="Play reel"` but no `aria-label`. Content is `&#9654;` (play triangle character) which screen readers may announce as "black right-pointing triangle". | `index.html` | 278 |
| `#close-btn` | Has `title="Close (Esc)"` but no `aria-label`. Content is `&#x2715;` which may be announced as "multiplication x". | `index.html` | 282 |
| Background videos on `index.html`, `about.html`, `webbed-films.html`, `the-suite.html` | Missing `aria-hidden="true"`. The film-page originals and contact page correctly include it, but these four do not. | `index.html` line 270, `about.html` line 423, `webbed-films.html` line 343, `the-suite.html` line 372 |
| Film page play circle buttons (`.play-circle`) | No `aria-label`. Content is `&#9654;` (play symbol). | `css/film-page.css` (used in all 4 originals pages) |
| Film page close button (`#film-close-btn`) | No `aria-label`. Content is `&#x2715;`. | Originals HTML files |
| Grade monitor close button (`#monitor-close`) | Has text content "ESC CLOSE" but this may not be clear to screen readers as a button function. Consider `aria-label="Close project preview"`. | `work.html` and category pages |

---

## Language Attribute

- `<html lang="en">` is present on **all 14 HTML files**. No issues.

---

## prefers-reduced-motion

- **Not implemented anywhere in the codebase.**

A search for `prefers-reduced-motion` across all HTML, CSS, and JS files returned zero results.

The site uses the following animations that should respect this preference:

| Animation | File | Impact |
|---|---|---|
| Ken Burns zoom on hero images | `css/film-page.css` line 52, `css/grade-monitor.css` line 97 | Continuous motion |
| Film strip reel scrolling | `about.html` line 104, `@keyframes filmReel` | Continuous looping motion |
| Poster card entrance animations | `webbed-films.html` line 149, `@keyframes wf-card-in` | Entrance animation |
| Poster image breathing/zoom | `webbed-films.html` line 171, `@keyframes poster-breathe` | Continuous 25s loop |
| Sheen drift on poster cards | `webbed-films.html` line 228, `@keyframes sheen-drift` | Continuous 8s loop |
| Page transition overlay fade | `js/flourishes.js` line 196+ | Page transition |
| Magnetic nav link movement | `js/flourishes.js` line 100+ | Interactive motion |
| Scroll-linked timeline fill | `js/flourishes.js` line 152+ | Scroll-driven |
| Custom cursor movement | `js/flourishes.js` line 18+ | Cursor following |
| Contact hero entrance animations | `contact.html` line 87, `@keyframes c-fade-up` | Entrance animation |
| Scroll-in animations (`.anim`) | `about.html` | Scroll-triggered reveals |
| Play button glow breathing | `css/film-page.css` line 598, `@keyframes glow-breathe` | Continuous pulse |
| Idle wash gradient shift | `css/grade-monitor.css` line 153, `@keyframes idle-wash` | 20s continuous loop |
| CRT blink animation | `css/style.css` line 468, `@keyframes ce-blink` | Blinking dot |
| Scroll pulse indicator | `css/film-page.css` line 192, `@keyframes scroll-pulse` | Continuous loop |
| Shimmer sweep on contact label | `contact.html` line 142, `@keyframes c-shimmer` | Entrance animation |

**Recommendation:** Add a `prefers-reduced-motion` media query in `css/style.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Or more selectively disable continuous animations while preserving one-shot entrance fades.

---

## Portfolio Items / Thumbnails

### webbed-films.html (Originals page)

- Four poster cards are `<a>` links with `aria-label` attributes naming each film.
- Images have descriptive `alt` text (e.g., "The Rite of Rosemary poster").
- Cards have `:focus-visible` styles with gold outline.
- **Keyboard accessible**: Yes, cards are standard links.

### work.html / category pages (Grade Monitor UI)

- Clip blocks in the timeline are `div` elements created by JavaScript.
- They receive click handlers but **no `tabindex` or `role` attributes**.
- Track header rows do get `role="button"` and `tabindex="0"` (line 927).
- **Keyboard accessible**: Partially. Track headers can be activated but individual project clips cannot be focused or activated via keyboard.

### Film pages (BTS galleries)

- BTS photos are `div.bts-photo` elements with click handlers for the lightbox.
- **No `tabindex`** on the photo containers, so they cannot be reached by keyboard.
- The lightbox itself has properly labelled close/prev/next buttons.
- **Keyboard accessible**: No. Photos cannot be opened via keyboard.

---

## Autoplay Video

All autoplay videos across the site are `muted` and `playsinline`, which is correct. Most are ambient noise/texture backgrounds. The background videos on `contact.html` and the originals film pages include `aria-hidden="true"`, but `index.html`, `about.html`, `webbed-films.html`, and `the-suite.html` are missing this attribute.

---

## Summary of Findings

### Critical

| # | Issue | Severity |
|---|---|---|
| 1 | No `prefers-reduced-motion` support anywhere. The site has 15+ animations including continuous loops. Users with vestibular disorders or motion sensitivity have no way to disable motion. | Critical |
| 2 | No skip-to-content link on any page. Keyboard users must tab through 10+ nav items to reach content. | Critical |

### Warnings

| # | Issue | Severity |
|---|---|---|
| 3 | No site-wide `:focus-visible` style. Interactive elements rely on browser default focus rings which may be invisible or barely visible against the dark background. Only `webbed-films.html` poster cards and contact form inputs have explicit focus styles. | Warning |
| 4 | Grade monitor clip blocks (5 pages) are not keyboard-focusable. Main portfolio browsing is inaccessible to keyboard-only users. | Warning |
| 5 | BTS gallery photos (2 pages) are not keyboard-focusable. Lightbox cannot be opened via keyboard. | Warning |
| 6 | Several low-opacity text elements fail WCAG AA contrast: contact coords (2.01:1), form placeholders (1.39:1), grade monitor labels (~1.5:1), status bar text (~1.7:1), monitor year (~2.1:1). | Warning |
| 7 | Homepage `#play-btn` and `#close-btn` lack `aria-label`. Screen readers announce the Unicode characters literally. | Warning |
| 8 | Film page play circles and close buttons lack `aria-label`. | Warning |
| 9 | Background videos on `index.html`, `about.html`, `webbed-films.html`, `the-suite.html` missing `aria-hidden="true"`. | Warning |
| 10 | Mobile nav dialog does not trap focus when open. | Warning |
| 11 | Reel overlay on index.html does not trap focus when open. | Warning |

### Good

| # | Finding | Severity |
|---|---|---|
| 12 | `<html lang="en">` present on all 14 pages. | Good |
| 13 | All images have descriptive `alt` text. | Good |
| 14 | All social icon links have `aria-label` attributes. All SVGs have `aria-hidden="true"`. | Good |
| 15 | Main nav has `aria-label="Main navigation"`. | Good |
| 16 | Hamburger button has `aria-label` and `aria-expanded` toggled by JS. | Good |
| 17 | Mobile nav has `role="dialog"` and `aria-label`. | Good |
| 18 | All autoplay videos are muted. | Good |
| 19 | Primary colour combinations (gold on black, warm white on black) all exceed 8:1 contrast. | Good |
| 20 | Muted text (55% opacity) still passes AA at 5.27-5.53:1. | Good |
| 21 | Footer copy text passes AA. | Good |
| 22 | Dropdown menus open on `:focus-within`, enabling keyboard access to sub-navigation. | Good |
| 23 | Poster cards on webbed-films.html have proper `aria-label`, alt text, and `:focus-visible` styles. | Good |
| 24 | Contact form has proper `<label>` elements associated with inputs via `for`/`id`. | Good |
| 25 | Semantic landmarks used correctly: `<header>`, `<main>`, `<footer>`, `<nav>`, `<aside>`, `<section>`, `<article>`. | Good |
| 26 | Lighthouse automated audit: 100/100 (44/44 checks passed). | Good |
