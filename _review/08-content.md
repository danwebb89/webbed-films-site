# Content & Copy Review

**Status: WARNINGS**

Reviewed: 2026-03-17
Scope: All 14 HTML files, portfolio.json, all visible text content

---

## Findings

### Developer Comments Left in Production Code

- :red_circle: **HTML comment "DROP logo.png INTO assets/images/"** visible in source
  - File: `/Users/danielwebb/Claude Code/webbed-films-website/index.html`, line 182
  - Text: `<!-- DROP logo.png INTO assets/images/ -->`
  - This is a developer reminder left in production markup. Not visible to users in the browser, but visible in View Source and could appear unprofessional if a potential client inspects the code.

- :yellow_circle: **HTML comment "UPDATE PROJECT NAME HERE"** in source
  - File: `/Users/danielwebb/Claude Code/webbed-films-website/index.html`, line 288
  - Text: `<!-- UPDATE PROJECT NAME HERE -->`
  - Developer note above the "currently in post" ticker. Not visible to users but should be removed for clean production code.

### Inconsistency: Surround Sound Specification

- :yellow_circle: **About page says "5.1 surround" but The Suite page says "7.1"**
  - File: `/Users/danielwebb/Claude Code/webbed-films-website/about.html`, line 516
  - Text: `Dark room, 5.1 surround, colour-accurate displays`
  - File: `/Users/danielwebb/Claude Code/webbed-films-website/the-suite.html`, line 9 (meta description) and line 819 (spec data)
  - The Suite page consistently references "7.1 + Subwoofer" throughout. The About page bio should be updated to match: "7.1 surround" instead of "5.1 surround".

### Incorrect Comment in Contact Form Script

- :yellow_circle: **Comment says "FormSubmit.co" but form actually uses Formspree**
  - File: `/Users/danielwebb/Claude Code/webbed-films-website/contact.html`, line 886
  - Text: `/* Form submits natively to FormSubmit.co */`
  - The form action is `https://formspree.io/f/xpwrqzkp` (Formspree), not FormSubmit.co. The comment is stale and misleading.

### Possible Spelling Error in Portfolio Data

- :yellow_circle: **"Prodomal" may be misspelled -- should it be "Prodromal"?**
  - File: `/Users/danielwebb/Claude Code/webbed-films-website/data/portfolio.json`, line 21
  - The title field reads `"Prodomal"` but the link slug reads `prodromal`. "Prodromal" is a medical/psychological term. The title displayed to users on the Shorts timeline will show "Prodomal" which appears to be a typo. However, this could be an intentional creative title -- Dan should verify.

### No 404 Page

- :red_circle: **No custom 404.html page exists**
  - No file matching `404*` was found in the project directory.
  - The CLAUDE.md mentions "404 fallback configured" in nginx, but without a custom 404.html, users hitting a broken URL will see nginx's default 404 page, which will not match the site aesthetic at all.
  - Recommendation: Create a `404.html` with the site's header, footer, dark aesthetic, and a message directing users back to the homepage.

### Copyright Year

- :green_circle: **Copyright year is correct (2026) across all 14 pages**
  - Every footer contains `&copy; 2026 Webbed Films`. Verified in:
    - `index.html` (line 299)
    - `about.html` (line 646)
    - `contact.html` (line 718)
    - `work.html`, `the-suite.html`, `webbed-films.html`
    - `documentary.html`, `corporate.html`, `features.html`, `shorts.html`
    - All four originals pages (`rosemary.html`, `ngs.html`, `blackout.html`, `christmas-claret.html`)

### About Page Completeness

- :green_circle: **About page is fully complete and well-written**
  - Rich biographical text (10 paragraphs) covering background, philosophy, tools, approach
  - Three portrait photos in polaroid frames
  - "Tools of the Trade" section with DaVinci Resolve, Premiere Pro, Avid Media Composer icons
  - Six testimonials with names, roles, and companies
  - Internal links to The Suite page and Contact page
  - Clear communication of what Dan does: film/video editor, writer, director

### Contact Information

- :green_circle: **Contact information is clear and comprehensive**
  - Email: `dan@webbedfilms.com` with copy-to-clipboard button
  - Location: Gravesend, UK (with coordinates)
  - Contact form with name, email, message fields (submits to Formspree)
  - Five social media links: Instagram, Threads, X, Facebook, LinkedIn
  - Social links also present in sidebar (homepage) and footer (all pages)

### Site Purpose & Communication

- :green_circle: **The site clearly communicates what Dan does and who for**
  - Meta description: "Editor, writer, and director based in Kent, UK"
  - About page filmstrip header: "Editor . Writer . Director"
  - Bio covers documentary, short film, feature film, branded content
  - Awards mentioned: Cannes Dolphins, LENs awards, EVCOMs
  - Portfolio organized into clear categories: Documentary, Corporate, Features, Shorts, Originals
  - Four original short films showcased with dedicated pages

### Placeholder Text / Lorem Ipsum

- :green_circle: **No placeholder text, Lorem Ipsum, or TODO markers found in visible content**
  - All page content is real and complete
  - Form placeholder text (e.g. "Your full name", "you@example.com", "Tell us about your project...") is appropriate and intentional

### Tone & Voice Consistency

- :green_circle: **Tone is consistent across all pages**
  - First-person, conversational but professional
  - Confident without being arrogant
  - Film-industry vernacular used naturally
  - The bio has strong personal voice: "Not casually obsessed", "No AI doing the cutting. Just ears, eyes and instinct."
  - Testimonials provide third-party validation

### Meta Descriptions & Open Graph Tags

- :green_circle: **All 14 pages have proper meta descriptions and OG tags**
  - Every page has: title, meta description, og:title, og:description, og:image, og:url, og:type
  - OG images reference appropriate assets (logo.png for most pages, specific images for About and film pages)

### Navigation Consistency

- :green_circle: **Navigation is consistent across all pages**
  - Same nav structure on all 14 pages (with correct relative paths for subdirectory pages)
  - Mobile nav overlay present on all pages
  - Watch link correctly points to `https://watch.webbedfilms.com` (not .uk) on all pages

---

## Summary

| Severity | Count | Items |
|----------|-------|-------|
| :red_circle: Critical | 2 | No custom 404 page; developer comment in production HTML |
| :yellow_circle: Warning | 4 | 5.1 vs 7.1 inconsistency; "Prodomal" possible typo; stale FormSubmit.co comment; "UPDATE PROJECT NAME HERE" comment |
| :green_circle: Good | 8 | Copyright year correct; About page complete; contact info clear; site purpose clear; no placeholder text; consistent tone; all meta tags present; nav consistent |
