# ZecTox Portfolio - Architecture & Agent Guidelines

## 1. Project Context & Identity
- **Project Name:** ZecTox Portfolio
- **Owner:** Tejas Kedare (Shopify Developer & Consultant)
- **Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+), bundled via Vite.
- **Aesthetic/Design:** Premium, high-end "luxury" feel. High contrast, clean typography, glassmorphism, subtle gradients, and dark mode support. 
- **Performance:** Must be incredibly fast and maintain high Lighthouse SEO/Performance scores.

## 2. Comprehensive Website Structure
The website is a multi-page portfolio and blog with the following core structure:

### A. Homepage (`index.html`)
- **Hero Section:** Introduction, primary CTA.
- **Services/Skills:** Grid highlighting core offerings (e.g., Theme Dev, Migrations).
- **Projects Section:** A grid of `.project-card` elements. Uses a `.projects-filter` bar to filter projects dynamically via JS `data-category` matching.
- **Testimonials:** An infinite horizontal marquee (`.testimonials-carousel`). Uses CSS keyframe animation (`scroll-testimonials`), gradient fade masks, and glassmorphic `.testimonial-card` designs with dynamic SVG avatars and Lucide SVG quotes.
- **FAQ:** Accordion style implementation for common questions.
- **Contact:** Links to email/socials.

### B. Blog Ecosystem (`/blog/`)
- Contains deep-dive technical articles on Shopify, SEO, and Development.
- Each blog is carefully optimized with BreadcrumbList and Article JSON-LD schema.

## 3. Core Architectural Rules
- **No Scratch Files:** **NEVER** create `scratch.mjs`, `test.js`, or any temporary processing scripts inside the main repository folder. If temporary scripts are needed, write them exclusively to the agent's internal memory (`<appDataDir>/brain/<conversation-id>/scratch/`).
- **Smooth Scrolling (Lenis):** The site uses **Lenis** (`lenis.min.js`) for site-wide smooth scrolling.
  - DO NOT use `scroll-behavior: smooth` in CSS, as it completely breaks Lenis.
  - DO NOT use `overflow-x: clip` on the `body` globally, as it conflicts with Lenis.
  - For anchor link scrolling, ALWAYS use `window.lenis.scrollTo(element, { offset: -50 })` instead of native `scrollIntoView`.
- **Night Mode (Dark Theme):** Every single UI component added must have a corresponding `.night-mode` or `body.night-mode` CSS override in `styles.css`. Ensure contrast is always perfectly readable. Toggle logic is handled in JS and persisted in `localStorage`.
- **Section Spacing:** Maintain strict rhythm. Use existing `.content-section` padding (120px desktop, 60px/80px mobile) uniformly.

## 4. CSS & Styling Deep Dive (`styles.css`)
- **Layouts:** Relies heavily on CSS Grid for projects and Flexbox for carousels and alignment.
- **Testimonials Magic:**
  - Masking: `-webkit-mask-image: linear-gradient(...)` is used to fade out carousel edges.
  - Hover Pausing: The marquee animation pauses on hover via `.testimonials-track:hover { animation-play-state: paused; }`.
  - Glassmorphism: Achieved using `linear-gradient` backgrounds, subtle borders (`rgba`), and multi-layered `box-shadows`.
- **Typography:** Uses a clean sans-serif font stack. Quote icons are sourced from Lucide SVGs (stroke-based, highly elegant).

## 5. JavaScript Logic (`public/script.js`)
- **Scroll Reveals:** Uses `IntersectionObserver` to add a `.visible` class to elements (`.card`, `.project-card`, `.stat-card`) as they enter the viewport.
- **Filtering:** Project tabs remove/add the `.hidden` class to project cards based on categories.
- **FAQ Accordion:** Toggles `max-height` for smooth expanding/collapsing.
- **Mobile Menu:** Controls the sidebar and overlay toggling (`.active` class).

## 6. SEO & Structured Data
- The site heavily relies on JSON-LD Schema (`application/ld+json`). 
- **Homepage:** Contains `Person` schema, and `ProfessionalService` schema (which includes `AggregateRating` and `Review` blocks mirroring the visible testimonials).
- **Blog Pages:** Contain `Article` and `BreadcrumbList` schemas.
- Ensure all images have descriptive `alt` tags and `loading="lazy"` attributes where appropriate.

## 7. UI/UX Guidelines
- **Micro-animations:** Always include hover interactions (like `transform: translateY(-8px) scale(1.02)`) on cards. Use bezier transition curves (e.g., `cubic-bezier(0.16, 1, 0.3, 1)` or `0.4, 0, 0.2, 1`).
- **Icons:** Use high-quality SVG icons (like Lucide or carefully curated paths). Avoid raster images for simple graphics. Ensure SVGs look crisp in both light and night modes.

## 8. Code Quality & Formatting
- **Zero Inline Styles:** You must NEVER use `style="..."` attributes on HTML elements. All styling must be abstracted into semantic CSS classes or utility classes within `styles.css`.
- **DRY SVG Usage:** Avoid repeating massive raw SVG blocks inline. If a complex SVG is used repeatedly, try to componentize it or rely on lightweight SVG icons like Lucide.
- **HTML Indentation:** When mutating HTML, you must guarantee semantic indentation and avoid creating massive one-line strings of markup.

## 9. Content Preservation on UI Overhauls
- **Zero Content Loss:** When redesigning a UI section, creating a 'V2' variant, or significantly altering the layout for aesthetic purposes, you must **NEVER omit existing text content, statistics, buttons, or functional elements** (e.g. `.hero-proof` items, `.hero-metrics`, `.stat-card` elements). 
- **1:1 Mapping:** Always ensure 100% of the original informational content is mapped into the new design, styled appropriately to match the new aesthetic. Do not sacrifice information for visual simplicity unless explicitly requested by the user.
