# ZecTox Portfolio - Architecture & Agent Guidelines

## 1. Project Context & Identity
- **Project Name:** ZecTox Portfolio
- **Owner:** Tejas Kedare (Shopify Developer & Consultant)
- **Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+), bundled via Vite.
- **Aesthetic/Design:** Premium, high-end "luxury" feel. High contrast, clean typography, glassmorphism, subtle gradients, and dark mode support. 
- **Performance:** Must be incredibly fast and maintain high Lighthouse SEO/Performance scores.

## 2. Comprehensive Website Structure
The website is a multi-page portfolio and blog with the following core structure:
- **`index.html` (Source of Truth):** The homepage. Contains the primary implementation of the global Header and Footer, Hero Section, Services, Projects grid, Testimonials marquee, FAQ, and Contact.
- **`/blog/`:** Contains deep-dive technical articles. These are individual static HTML files that share the global layout.
- **`styles.css`:** The global stylesheet containing all design tokens, layout logic, and responsive breakpoints.
- **`script.js`:** The global JavaScript logic, containing intersection observers, Lenis configuration, Swup SPA logic, and event listeners.

## 3. Core Architectural Rules
- **No Scratch Files:** **NEVER** create `scratch.mjs`, `test.js`, or any temporary processing scripts inside the main repository folder. Write them exclusively to the agent's internal memory (`<appDataDir>/brain/<conversation-id>/scratch/`).
- **Smooth Scrolling (Lenis):** The site uses **Lenis** (`lenis.min.js`) for site-wide smooth scrolling.
  - DO NOT use `scroll-behavior: smooth` in CSS, as it completely breaks Lenis.
  - DO NOT use `overflow-x: clip` on the `body` globally, as it conflicts with Lenis.
  - For anchor link scrolling, ALWAYS use `window.lenis.scrollTo(element, { offset: -50 })` instead of native `scrollIntoView`.
- **Night Mode (Dark Theme):** Every single UI component added must have a corresponding `.night-mode` or `body.night-mode` CSS override in `styles.css`. Ensure contrast is always perfectly readable. Toggle logic is handled in JS and persisted in `localStorage`.
- **Section Spacing:** Maintain strict rhythm. Use existing `.content-section` padding (120px desktop, 60px/80px mobile) uniformly.
- **Theme Before Paint:** Every page carries a small inline script immediately after `<body>` that reads `localStorage.nightMode` (falling back to `prefers-color-scheme`) and adds `.night-mode` to `<body>` before first paint. Do not move it into `<head>` (`document.body` does not exist yet) and do not remove it — without it, dark-mode visitors get a white flash on every single page load. `script.js` reads the resulting class back; it must never re-derive the theme from `localStorage` itself.
- **Reduced Motion:** `script.js` sets a global `prefersReducedMotion`. Lenis, the custom cursor, the SplitType hero animation and the page curtain are all skipped when it is true, and `styles.css` has a matching `@media (prefers-reduced-motion: reduce)` block. Any new animation must be covered by both.

## 4. SPA / Swup Integration Guardrails (CRITICAL)
This project operates as a Single Page Application (SPA) using Swup. To prevent the site from breaking during transitions, you **MUST** adhere to these rules:

### A. FOUC (Flash of Unstyled Content) Prevention
- **Absolute CSS Paths:** You must ALWAYS use absolute paths for the global stylesheet (`<link rel="stylesheet" href="/styles.css">`). 
- **WHY:** Swup tracks assets by their exact string. If `index.html` uses `href="styles.css"` and `blog.html` uses `href="../styles.css"`, Swup thinks they are different files. It will unload the CSS and fetch the new one, causing a jarring white flash of unstyled content during page transitions.

### B. Anchor Tag & Lightbox Interception
- **`data-no-swup` for External UI:** Swup automatically intercepts clicks on ALL `<a>` tags. If you add a lightbox library (like GLightbox) that relies on clicking an image `<a>` tag, Swup will hijack the click and attempt to navigate the browser to the image URL.
- **FIX:** You must configure Swup's `ignoreVisit` callback in `script.js` to ignore the lightbox selector (e.g., `(url, { el }) => el.closest('[data-glightbox]')`), or add the `data-no-swup` attribute to the HTML links.

### C. Script Evaluation & Memory Leaks
- **No Global `let`/`const`:** NEVER use `let` or `const` for global variables in scripts that are re-evaluated. Always use `var` or attach state to the `window` object (e.g., `window.swupInstance`) to prevent `SyntaxError: Identifier has already been declared`.
- **`optin: true` Script Reloading:** We use `SwupScriptsPlugin({ optin: true })`. This means `<script>` tags inside the `<body>` will NOT be automatically re-evaluated upon navigation, preventing massive memory leaks. Only scripts in the `<head>` with `data-swup-reload-script` are re-evaluated.
- **Safe Animation Loops:** Always null-check instances inside high-frequency loops (like `gsap.ticker` or `requestAnimationFrame`). E.g., `if (window.lenis) window.lenis.raf(...)` to prevent fatal TypeErrors during page teardowns.
- **Animate History:** Always explicitly pass `animateHistoryBrowsing: true` to Swup if the user expects back/forward browser buttons to trigger exit/entrance animations.
- **Head Synchronization:** We rely on `SwupHeadPlugin` to ensure SEO `<title>` and `<meta>` tags are automatically updated during client-side routing.

### D. Listener Lifetime (CRITICAL)
Swup only swaps `#swup`. The sidebar, `window` and `document` survive every navigation, so a listener attached in `initPage()` without cleanup is attached **again** on each visit and never removed — after ten navigations the scroll handler runs ten times per frame.
- `initPage()` opens with an `AbortController` stored on `window.__pageListeners` and aborts the previous one.
- **Every** `addEventListener` inside `initPage()` (and inside `initCursor()`, which it calls) must pass `{ signal }`. There is no exception for elements inside `#swup` — passing the signal there is harmless.
- `resetCurtain()` runs on `visit:end` / `visit:abort` and parks the full-screen curtain. It bails out when `swupInstance.navigating` is true, otherwise it kills the incoming visit's own tween.

## 5. Component Synchronization (The Master Sync Script)
Since this is a vanilla HTML project without a templating engine (like React or EJS), we use Node scripts to manage global components across all 43 HTML files.

- **Header & Footer Source of Truth:** The absolute source of truth for the site's `<header class="header">` and `<footer class="premium-footer">` is **`index.html`**. 
- **The Golden Rule:** If you modify the header or footer HTML in `index.html`, you **MUST run `npm run sync:components`** in the terminal immediately afterward.
- **What it does:** This script clones the components from `index.html`, automatically converts any relative hash links (e.g., `href="#overview"` becomes `href="/#overview"` so they work perfectly from nested blog pages), and injects the updated components into all other `.html` files in the repository. **DO NOT manually edit the header or footer in individual blog files.**

## 6. CSS & Styling Deep Dive
- **Layouts:** Relies heavily on CSS Grid for projects and Flexbox for carousels and alignment.
- **Testimonials Magic:**
  - Masking: `-webkit-mask-image: linear-gradient(...)` is used to fade out carousel edges.
  - Hover Pausing: The marquee animation pauses on hover via `.testimonials-track:hover { animation-play-state: paused; }`.
  - Glassmorphism: Achieved using `linear-gradient` backgrounds, subtle borders (`rgba`), and multi-layered `box-shadows`.
- **Typography:** Uses a clean sans-serif font stack. Quote icons are sourced from Lucide SVGs (stroke-based, highly elegant).

## 7. SEO & Structured Data
- The site relies on JSON-LD Schema (`application/ld+json`).
- **Homepage:** one `@graph` tying together `WebSite`, `WebPage`, `ImageObject`, `Person`, `ProfessionalService` and `FAQPage` by `@id`. Keep it as a single connected graph — separate unlinked blocks stop Google resolving the entities. The `FAQPage` block must stay in step with the visible FAQ section; mismatched copy is a structured-data violation.
- **Blog Pages:** `BlogPosting` plus `BreadcrumbList`.
- **No trailing slashes.** `vercel.json` sets `trailingSlash: false`, so `/blog/` 308-redirects to `/blog`. Never write `href="/blog/"`, and never use a trailing-slash URL in canonical tags, breadcrumb schema or the sitemap.
- **Titles ≤ 65 characters, descriptions ≤ 165**, or Google truncates them. Do not append " - Tejas Kedare" to blog titles; the brand suffix costs 15 characters and Google strips it anyway.
- **Exactly one `<h1>` per page.** The homepage `<h1>` is the hero line in `.hero-text`; section titles are `<h2>`.
- Every image needs a descriptive `alt`, explicit `width`/`height` (CLS), and `loading="lazy"` unless it is the LCP element — the LCP banner instead gets `fetchpriority="high"` plus a `<link rel="preload" as="image">`.
- **Never hotlink images.** No Unsplash, Pexels or placehold.co. Social cards and banners live in `public/`.
- `scripts/` contains an end-to-end validator workflow; `npm run build` must be followed by a check that every canonical, sitemap entry, internal link and social image resolves.

## 7a. Third-Party Assets & Fonts
- **Pin every CDN URL to an exact version and attach SRI.** Range specifiers like `unpkg.com/swup@4` cost a redirect on every load (measured at ~1 s) and let the code change under you. Everything is served from `cdn.jsdelivr.net/npm/<pkg>@<exact>` with `integrity` + `crossorigin`, and loaded with `defer` (which preserves execution order and still runs before `DOMContentLoaded`).
- **Font Awesome is self-hosted and subsetted.** `public/webfonts/*.woff2` contain only the ~54 icons the site actually uses (6 KB instead of 232 KB). **If you add an icon class that was not already in use, run `npm run build:icons`** or it renders as a blank box. That script needs `pip3 install fonttools brotli`.
- Brand webfonts (Inter, Plus Jakarta Sans) must be linked on **every** page. `styles.css` asks for them by name, so a page that omits the Google Fonts link silently falls back to system sans.

## 7b. Caching
`vercel.json` must only mark **content-hashed** paths `immutable`. `/script.js` is copied verbatim out of `public/` and is not hashed, so it is served `must-revalidate`. A blanket `/(.*).(css|js)` immutable rule means returning visitors never receive JavaScript fixes.

## 8. Code Quality & Formatting
- **Zero Inline Styles:** You must NEVER use `style="..."` attributes on HTML elements. All styling must be abstracted into semantic CSS classes or utility classes within `styles.css`.
- **DRY SVG Usage:** Avoid repeating massive raw SVG blocks inline. If a complex SVG is used repeatedly, try to componentize it or rely on lightweight SVG icons like Lucide.
- **HTML Indentation:** When mutating HTML, you must guarantee semantic indentation and avoid creating massive one-line strings of markup.

## 9. Content Preservation on UI Overhauls
- **Zero Content Loss:** When redesigning a UI section, creating a 'V2' variant, or significantly altering the layout for aesthetic purposes, you must **NEVER omit existing text content, statistics, buttons, or functional elements** (e.g. `.hero-proof` items, `.hero-metrics`, `.stat-card` elements). 
- **1:1 Mapping:** Always ensure 100% of the original informational content is mapped into the new design, styled appropriately to match the new aesthetic. Do not sacrifice information for visual simplicity unless explicitly requested by the user.
