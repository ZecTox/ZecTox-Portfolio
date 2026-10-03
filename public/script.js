
// Navigation functionality
// Visitors who ask for reduced motion get the same site without the smooth-scroll
// hijack, the trailing cursor, the hero character animation or the page curtain.
var prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Dynamically load Lenis Smooth Scrolling so it works site-wide automatically
(function loadLenis() {
  if (prefersReducedMotion) return;
  const lenisScript = document.createElement("script");
  lenisScript.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
  lenisScript.integrity = "sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed";
  lenisScript.crossOrigin = "anonymous";
  lenisScript.onload = () => {
    if (typeof Lenis !== "undefined") {
      window.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        window.lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
          if (window.lenis) window.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        document.dispatchEvent(new CustomEvent("lenisAndGsapReady"));
      } else {
        function raf(time) {
          window.lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }
  };
  document.head.appendChild(lenisScript);

  // Also load Lenis CSS
  const lenisStyle = document.createElement("link");
  lenisStyle.rel = "stylesheet";
  lenisStyle.href = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.css";
  lenisStyle.integrity = "sha384-pAFowDtEJGvoq8dGiFmgKkO1h5cvbHkCysvXumyjfJBsi8qJwG429whEp2xanR+c";
  lenisStyle.crossOrigin = "anonymous";
  document.head.appendChild(lenisStyle);
})();



// Declare Swup instance
var swupInstance = null;
var cursorInitializedGlobal = false;
var xTo, yTo, xToRing, yToRing;

// Handle specific hash scroll on load (especially for redirects from other pages)
function handleHashScroll() {
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
      // Immediate scroll attempt
      if (window.lenis) {
        window.lenis.scrollTo(targetElement, { immediate: true });
      } else {
        targetElement.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }
      // Small fallback just in case layout shifts happen
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo(targetElement, { immediate: true });
        } else {
          targetElement.scrollIntoView({
            behavior: "auto",
            block: "start",
          
    });
        }
      }, 100);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", handleHashScroll);
} else {
  handleHashScroll();
}

// Lightweight blog consultation prompt
(function () {
  const CONFIG = {
    // Shown once the reader is actually invested in the article, not 7s after arrival.
    scrollTrigger: 0.45,
    dwellFallback: 45000,
    frequencyHours: 24,
    bookingLink: "/#schedule",
    directCalLink: "https://cal.com/zectox/30min",
  };

  function initBlogPrompt() {
    const path = window.location.pathname;
    const isBlogArticle =
      path.startsWith("/blog/") && path !== "/blog/" && path !== "/blog";
    if (!isBlogArticle) return;

    const lastSeen = localStorage.getItem("blogPromptSeen");
    if (lastSeen) {
      const timeSince = Date.now() - parseInt(lastSeen, 10);
      const hoursSince = timeSince / (1000 * 60 * 60);
      if (hoursSince < CONFIG.frequencyHours) {
        return;
      }
    }

    const style = document.createElement("style");
    style.textContent = `
            .blog-consult-prompt {
                position: fixed;
                right: 24px;
                bottom: 24px;
                z-index: 9998;
                width: min(360px, calc(100vw - 32px));
                padding: 20px;
                border-radius: 22px;
                background: rgba(255, 255, 255, 0.96);
                border: 1px solid rgba(17, 24, 39, 0.08);
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16);
                transform: translateY(24px);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease, transform 0.3s ease;
                backdrop-filter: blur(16px);
            }

            .blog-consult-prompt.active {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }

            .blog-consult-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                border-radius: 999px;
                border: none;
                background: rgba(17, 24, 39, 0.06);
                color: #4b5563;
                cursor: pointer;
                font-size: 1.1rem;
            }

            .blog-consult-kicker {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                padding: 8px 12px;
                border-radius: 999px;
                background: rgba(0, 128, 96, 0.1);
                color: #006b51;
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.03em;
                text-transform: uppercase;
            }

            .blog-consult-prompt h3 {
                margin: 0 0 10px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 1.18rem;
                line-height: 1.3;
                color: #111827;
            }

            .blog-consult-prompt p {
                margin: 0 0 16px;
                color: #6d7175;
                line-height: 1.65;
                font-size: 0.95rem;
            }

            .blog-consult-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .blog-consult-actions a,
            .blog-consult-actions button {
                min-height: 42px;
                padding: 0 14px;
                border-radius: 999px;
                border: 1px solid rgba(17, 24, 39, 0.1);
                font-size: 0.9rem;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                cursor: pointer;
            }

            .blog-consult-primary {
                background: linear-gradient(135deg, #00855f, #00614a);
                color: #ffffff;
                border: none;
                box-shadow: 0 14px 32px rgba(0, 200, 120, 0.2);
            }

            .blog-consult-secondary {
                background: rgba(255, 255, 255, 0.9);
                color: #111827;
            }

            body.night-mode .blog-consult-prompt {
                background: rgba(15, 23, 42, 0.96);
                border-color: rgba(255, 255, 255, 0.08);
                box-shadow: 0 20px 50px rgba(2, 8, 23, 0.35);
            }

            body.night-mode .blog-consult-close {
                background: rgba(255, 255, 255, 0.08);
                color: #cbd5e1;
            }

            body.night-mode .blog-consult-prompt h3 {
                color: #f8fafc;
            }

            body.night-mode .blog-consult-prompt p {
                color: #cbd5e1;
            }

            body.night-mode .blog-consult-kicker {
                background: rgba(0, 232, 138, 0.14);
                color: #00e88a;
            }

            body.night-mode .blog-consult-secondary {
                background: rgba(255, 255, 255, 0.04);
                border-color: rgba(255, 255, 255, 0.08);
                color: #f8fafc;
            }

            @media (max-width: 640px) {
                .blog-consult-prompt {
                    right: 16px;
                    left: 16px;
                    bottom: 16px;
                    width: auto;
                }

                .blog-consult-actions {
                    flex-direction: column;
                }

                .blog-consult-actions a,
                .blog-consult-actions button {
                    width: 100%;
                }
            }
        `;
    document.head.appendChild(style);

    const prompt = document.createElement("aside");
    prompt.className = "blog-consult-prompt";
    prompt.innerHTML = `
            <button class="blog-consult-close" type="button" aria-label="Dismiss consultation prompt">&times;</button>
            <span class="blog-consult-kicker">
                <i class="fas fa-calendar-check"></i>
                Need Shopify help?
            </span>
            <h3>Want help turning this advice into real store improvements?</h3>
            <p>Book a short discovery call if you want support with Shopify performance, migrations, theme work, or technical audits.</p>
            <div class="blog-consult-actions">
                <a href="${CONFIG.bookingLink}" class="blog-consult-primary">
                    <i class="fas fa-arrow-right"></i>
                    Open booking section
                </a>
                <a href="${CONFIG.directCalLink}" target="_blank" rel="noopener" class="blog-consult-secondary">
                    <i class="fas fa-up-right-from-square"></i>
                    Open calendar
                </a>
            </div>
        `;
    document.body.appendChild(prompt);

    const dismissPrompt = () => {
      prompt.classList.remove("active");
      localStorage.setItem("blogPromptSeen", Date.now().toString());
      setTimeout(() => {
        if (prompt.parentNode) {
          prompt.parentNode.removeChild(prompt);
        }
      }, 300);
    };

    prompt
      .querySelector(".blog-consult-close")
      ?.addEventListener("click", dismissPrompt);

    // Ask only after the reader has engaged: 45% of the way down the article, or a
    // long dwell as a fallback for short posts that never scroll that far.
    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      window.removeEventListener("scroll", onScroll);
      clearTimeout(dwellTimer);
      prompt.classList.add("active");
    };
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= CONFIG.scrollTrigger) reveal();
    };
    const dwellTimer = setTimeout(reveal, CONFIG.dwellFallback);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogPrompt);
  } else {
    initBlogPrompt();
  }
})();

function initGSAPAnimations() {
    if (typeof gsap === "undefined") return;

    // 1. Cinematic Hero Text Reveal
    if (!prefersReducedMotion && typeof SplitType !== 'undefined') {
        const heroTitle = document.querySelector('.hero-text h1, .hero-text h2');
        if (heroTitle) {
            const split = new SplitType(heroTitle, { types: 'words, chars' });
            gsap.from(split.chars, {
                y: 100,
                opacity: 0,
                rotationZ: 10,
                duration: 1,
                stagger: 0.02,
                ease: "power4.out",
                delay: 0.2
            });
            
            const heroSiblings = document.querySelectorAll('.hero-text > :not(h1):not(h2), .hero-profile-card');
            gsap.fromTo(heroSiblings, 
                { y: 30, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.8 }
            );
        }
    } else {
        const heroContent = document.querySelector(".hero-content");
        if (heroContent) {
            gsap.fromTo(heroContent.children, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.2 });
        }
    }

    const heroStats = document.querySelector(".hero-metrics");
    if (heroStats) {
      gsap.fromTo(heroStats.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 1 });
    }

    // 2. Infinite Marquee for Testimonials
    const track = document.querySelector('.testimonials-track');
    const carousel = document.querySelector('.testimonials-carousel');
    
    if (track && carousel) {
        const children = Array.from(track.children);
        children.forEach(child => track.appendChild(child.cloneNode(true)));

        setTimeout(() => {
            const scrollWidth = track.scrollWidth / 2;
            const tween = gsap.to(track, {
                x: -scrollWidth,
                ease: "none",
                duration: 360,
                repeat: -1
            });
            
            carousel.addEventListener('mouseenter', () => tween.pause());
            carousel.addEventListener('mouseleave', () => tween.play());
        }, 100);
    }

    // 3. Staggered reveals.
    // These selectors must track the markup: .project-card/.projects-grid and
    // .services-grid were removed in the work-section rebuild, so the old entries
    // silently animated nothing.
    const staggerSections = [
        { selector: '.case-card',   trigger: '.featured-work' },
        { selector: '.stat-card',   trigger: '.stats-grid' },
        { selector: '.process-step', trigger: '.process-steps' },
        { selector: '.exp-card',    trigger: '.experience-section' },
        { selector: '.skill-category', trigger: '.skills-grid' },
        { selector: '.contact-card', trigger: '.contact-grid' },
        { selector: '.faq-item',    trigger: '.faq-container' }
    ];

    staggerSections.forEach(sec => {
        const elements = gsap.utils.toArray(sec.selector);
        const trigger = document.querySelector(sec.trigger);
        if (!elements.length || !trigger) return;
        if (prefersReducedMotion) {
            gsap.set(elements, { clearProps: 'all' });
            return;
        }
        gsap.fromTo(
            elements,
            { y: 40, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out",
                scrollTrigger: { trigger: trigger, start: "top 85%", once: true }
            }
        );
    });

    // 4. Count the headline figures up as they come into view.
    //    Fail-safe by construction: the real value stays in the DOM until the
    //    trigger actually fires, and is written back verbatim on completion, so a
    //    missing ScrollTrigger or a thrown tween can never leave a visitor
    //    looking at "0". Only a plain number with an optional "+" qualifies --
    //    "B2C + B2B" must not be read as the number 2.
    gsap.utils.toArray('.stat-value, .hero-metric strong').forEach((el) => {
        const raw = el.textContent.trim();
        const m = raw.match(/^([\d,]+)(\+?)$/);
        if (!m) return;
        const target = parseInt(m[1].replace(/,/g, ''), 10);
        if (!Number.isFinite(target) || target <= 0) return;
        if (prefersReducedMotion) return;

        const grouped = m[1].includes(',');
        const suffix = m[2];
        const render = (v) => {
            const n = Math.round(v);
            el.textContent = (grouped ? n.toLocaleString('en-US') : String(n)) + suffix;
        };
        const restore = () => { el.textContent = raw; };

        ScrollTrigger.create({
            trigger: el,
            start: 'top 92%',
            once: true,
            onEnter: () => {
                const counter = { v: 0 };
                render(0);
                gsap.to(counter, {
                    v: target,
                    duration: Math.min(1.8, 0.8 + target / 10000),
                    ease: 'power2.out',
                    onUpdate: () => render(counter.v),
                    onComplete: restore,
                    onInterrupt: restore
                });
            }
        });
    });

    // 5. ScrollTrigger for Section Titles
    if (!prefersReducedMotion) {
        gsap.utils.toArray(".section-header, .section-title").forEach((header) => {
          gsap.fromTo(header, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: header, start: "top 90%", once: true } });
        });
    }

    // 6. Slow drift on the featured case screenshots. Subtle: 6% over the whole
    //    scroll past, enough to feel alive without becoming a distraction.
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.case-media img').forEach((img) => {
            gsap.fromTo(img, { yPercent: -3 }, {
                yPercent: 3, ease: 'none',
                scrollTrigger: { trigger: img.closest('.case-card'), start: 'top bottom', end: 'bottom top', scrub: 0.5 }
            });
        });
    }


}


function initCursor() {
    if (prefersReducedMotion) return;
    if (typeof gsap === "undefined") return;
    if (window.innerWidth < 1080) return; // Disable custom cursor on mobile/tablet
    
    const cursor = document.querySelector('.custom-cursor');
    const ring = document.querySelector('.cursor-ring');
    if (!cursor || !ring) return;

    if (!cursorInitializedGlobal) {
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        gsap.set(ring, { xPercent: -50, yPercent: -50 });
        
        xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
        yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});
            
        xToRing = gsap.quickTo(ring, "x", {duration: 0.5, ease: "power3"});
        yToRing = gsap.quickTo(ring, "y", {duration: 0.5, ease: "power3"});

        window.addEventListener("mousemove", e => {
            xTo(e.clientX);
            yTo(e.clientY);
            xToRing(e.clientX);
            yToRing(e.clientY);
        });
        cursorInitializedGlobal = true;
    }

    // Tie to the page controller: .nav-item lives in the sidebar, which survives
    // Swup navigations, so untracked listeners would stack up there.
    const signal = window.__pageListeners ? window.__pageListeners.signal : undefined;
    const interactives = document.querySelectorAll('a, button, .project-card, .btn, .nav-item');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 0, duration: 0.3 });
            gsap.to(ring, { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'transparent', backdropFilter: 'blur(4px)', duration: 0.3 });
        }, { signal });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3 });
            gsap.to(ring, { width: 40, height: 40, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', backdropFilter: 'none', duration: 0.3 });
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
        }, { signal });
        el.addEventListener('mousemove', (e) => {
            if(el.classList.contains('project-card')) return; 
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            gsap.to(el, { x: x*0.05, y: y*0.05, duration: 0.5, ease: "power3.out" });
        }, { signal });
    });
}

function initPage() {
  // Swup only swaps #swup, so the sidebar, window and document keep the listeners
  // from the previous page. Tie every listener registered here to one controller
  // and abort it on re-init, otherwise handlers stack up on each navigation.
  if (window.__pageListeners) window.__pageListeners.abort();
  window.__pageListeners = new AbortController();
  var signal = window.__pageListeners.signal;
    
  const navItems = document.querySelectorAll(".nav-item[data-section]");
  const nightModeToggle = document.getElementById("nightModeToggle");
  const themeToggleButton = document.getElementById("themeToggleButton");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const sidebar = document.querySelector(".sidebar");
  const mobileOverlay = document.getElementById("mobileOverlay");

  function syncThemeToggleUI() {
    if (!themeToggleButton || !nightModeToggle) return;
    const isNightMode = nightModeToggle.checked;
    themeToggleButton.setAttribute("aria-pressed", String(isNightMode));
    themeToggleButton.innerHTML = isNightMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }

  // Night mode toggle functionality
  if (nightModeToggle) {
    nightModeToggle.addEventListener("change", function () {
      document.body.classList.toggle("night-mode", this.checked);

      // Save preference to localStorage
      localStorage.setItem("nightMode", this.checked);
      syncThemeToggleUI();
    }, { signal });
  }

  // The pre-paint script in each page has already put <body> into the right
  // theme; read it back so both toggles show the correct state.
  const isNight = document.body.classList.contains("night-mode");
  if (nightModeToggle) nightModeToggle.checked = isNight;
  syncThemeToggleUI();

  if (themeToggleButton && nightModeToggle) {
    themeToggleButton.addEventListener("click", function () {
      nightModeToggle.checked = !nightModeToggle.checked;
      nightModeToggle.dispatchEvent(new Event("change"));
    }, { signal });
  }

  // Mobile menu functionality
  function toggleMobileMenu() {
    if (!sidebar || !mobileOverlay) return;
    sidebar.classList.toggle("open");
    mobileOverlay.classList.toggle("active");
  }

  function closeMobileMenu() {
    if (!sidebar || !mobileOverlay) return;
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("active");
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", toggleMobileMenu, { signal });
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileMenu, { signal });
  }

  // ---- All-projects modal -------------------------------------------------
  // The homepage shows three featured builds; the rest live here, filterable by
  // industry, so the work section stays one screen instead of five.
  const projectsModal = document.getElementById("projectsModal");
  if (projectsModal) {
    const panel = projectsModal.querySelector(".projects-modal-panel");
    const grid = projectsModal.querySelector(".projects-modal-grid");
    const empty = projectsModal.querySelector(".projects-modal-empty");
    const chips = [...projectsModal.querySelectorAll(".filter-chip")];
    const cards = [...projectsModal.querySelectorAll(".mini-card")];
    let lastFocused = null;

    // Cards fade in on a short stagger so sixteen of them do not land at once.
    const animateCards = (list) => {
      if (prefersReducedMotion || typeof gsap === "undefined" || !list.length) return;
      gsap.killTweensOf(list);
      gsap.fromTo(
        list,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.42, stagger: 0.025, ease: "power2.out", overwrite: true,
          onComplete: () => gsap.set(list, { clearProps: "all" }) }
      );
    };

    const focusable = () =>
      [...panel.querySelectorAll('a[href], button, summary, [tabindex]:not([tabindex="-1"])')].filter(
        (el) => el.offsetParent !== null
      );

    function openModal(e) {
      // Remember the trigger explicitly: Safari does not focus a <button> on click,
      // so document.activeElement is unreliable here.
      lastFocused = (e && e.currentTarget) || document.activeElement;
      projectsModal.hidden = false;
      document.body.style.overflow = "hidden";
      // Lenis keeps driving the page behind the overlay unless it is stopped.
      if (window.lenis) window.lenis.stop();
      const first = focusable()[0];
      if (first) first.focus();
      animateCards(cards.filter((c) => !c.hidden));
    }

    function closeModal() {
      if (typeof gsap !== "undefined") {
        gsap.killTweensOf(cards);
        gsap.set(cards, { clearProps: "all" });
      }
      projectsModal.hidden = true;
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
      if (lastFocused && document.contains(lastFocused) && lastFocused.focus) {
        lastFocused.focus();
      }
    }

    document.querySelectorAll("[data-open-projects]").forEach((btn) => {
      btn.addEventListener("click", openModal, { signal });
    });

    projectsModal.querySelectorAll("[data-close-projects]").forEach((btn) => {
      btn.addEventListener("click", closeModal, { signal });
    });

    document.addEventListener(
      "keydown",
      (e) => {
        if (projectsModal.hidden) return;
        if (e.key === "Escape") {
          closeModal();
          return;
        }
        if (e.key !== "Tab") return;
        // Trap focus inside the dialog.
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      },
      { signal }
    );

    chips.forEach((chip) => {
      chip.addEventListener(
        "click",
        () => {
          const filter = chip.dataset.filter;
          chips.forEach((c) => c.classList.toggle("is-active", c === chip));
          let shown = 0;
          cards.forEach((card) => {
            const match = filter === "all" || card.dataset.industry === filter;
            card.hidden = !match;
            if (match) shown++;
          });
          if (empty) empty.hidden = shown > 0;
          grid.scrollTop = 0;
          animateCards(cards.filter((c) => !c.hidden));
        },
        { signal }
      );
    });

    // The panel scrolls natively; stop wheel/touch reaching Lenis underneath.
    const swallow = (e) => e.stopPropagation();
    panel.addEventListener("wheel", swallow, { passive: true, signal });
    panel.addEventListener("touchmove", swallow, { passive: true, signal });
  }

  // Smooth-scroll any in-page hash link (header CTAs, hero buttons, footer).
  // Project rule: use lenis.scrollTo, never scroll-behavior or scrollIntoView.
  document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href*="#"]');
    if (!link || link.closest("[data-no-swup], .glightbox")) return;
    if (link.hasAttribute("data-section")) return; // handled by the nav-item logic

    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;

    const target = document.querySelector(url.hash);
    if (!target) return;

    e.preventDefault();

    // Resolve the destination ourselves and hand Lenis a number. Passing the
    // element lets Lenis re-measure mid-flight, and writing the hash before the
    // animation finishes makes the browser jump to the fragment underneath it --
    // between them the scroll landed at the offset instead of the section.
    const top = target.getBoundingClientRect().top + window.scrollY - 50;
    const setHash = () => {
      if (window.location.hash !== url.hash) {
        history.replaceState(null, "", url.hash);
      }
    };

    if (window.lenis) {
      window.lenis.scrollTo(top, { onComplete: setHash });
    } else {
      window.scrollTo({ top: top, behavior: "smooth" });
      setHash();
    }
  }, { signal });

  // Close mobile menu when clicking nav items
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      // Existing navigation code
      const targetSection = this.getAttribute("data-section");
      const targetElement = document.getElementById(targetSection);

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked nav item
      this.classList.add("active");

      // Scroll to target section
      if (targetElement) {
        if (window.lenis) {
          window.lenis.scrollTo(targetElement, { offset: -50 });
        } else {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }

      // Close mobile menu after navigation
      closeMobileMenu();
    }, { signal });
  });

  // Contact card click handlers
  const contactCards = document.querySelectorAll(".contact-card");
  contactCards.forEach((card) => {
    card.addEventListener("click", function () {
      const contactType = this.querySelector("h3").textContent.toLowerCase();

      switch (contactType) {
        case "email":
          window.location.href = "mailto:tejaskedare.22@gmail.com";
          break;
        case "linkedin":
          window.open("https://www.linkedin.com/in/zectox/", "_blank");
          break;
        case "github":
          window.open("https://github.com/ZecTox", "_blank");
          break;
        case "website":
          window.open("https://zectox.is-a.dev/", "_blank");
          break;
      }
    }, { signal });
  });



  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Update active nav item on scroll (debounced for performance)
  const handleScroll = debounce(function () {
    const sections = document.querySelectorAll(".content-section");
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navItems.forEach((nav) => {
      nav.classList.remove("active");
      if (nav.getAttribute("data-section") === current) {
        nav.classList.add("active");
      }
    });
  }, 100); // Debounce for 100ms

  if (navItems.length > 0) {
    window.addEventListener("scroll", handleScroll, { passive: true, signal });
  }

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  }, { signal });

  // Smooth scrolling for better UX
  // Removed document.documentElement.style.scrollBehavior = 'smooth'; as it breaks Lenis

  // Project card animations now handled by scroll reveal below

  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question, h4");
    if (!question) return;

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add("active");
      }
    }, { signal });
  });

  const loadCalendarBtn = document.getElementById("loadCalendarBtn");
  const calendarPlaceholder = document.getElementById("calendarPlaceholder");
  const calendarEmbed = document.getElementById("calendarEmbed");
  let calendarLoaded = false;

  if (loadCalendarBtn && calendarPlaceholder && calendarEmbed) {
    loadCalendarBtn.addEventListener("click", function () {
      if (calendarLoaded) {
        calendarPlaceholder.hidden = true;
        calendarEmbed.hidden = false;
        return;
      }

      calendarLoaded = true;
      loadCalendarBtn.disabled = true;
      loadCalendarBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Loading Calendar...';
      calendarPlaceholder.hidden = true;
      calendarEmbed.hidden = false;

      calendarEmbed.innerHTML = "";

      /* eslint-disable prefer-const, prefer-rest-params, @typescript-eslint/no-unused-expressions -- vendor embed from cal.com, kept verbatim */
      (function (C, A, L) {
        let p = function (a, ar) {
          a.q.push(ar);
        };
        const d = C.document;
        C.Cal =
          C.Cal ||
          function () {
            let cal = C.Cal;
            let ar = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              d.head.appendChild(d.createElement("script")).src = A;
              cal.loaded = true;
            }
            if (ar[0] === L) {
              const api = function () {
                p(api, arguments);
              };
              const namespace = ar[1];
              api.q = api.q || [];
              typeof namespace === "string"
                ? (cal.ns[namespace] = api) && p(api, ar)
                : p(cal, ar);
              return;
            }
            p(cal, ar);
          };
      })(window, "https://app.cal.com/embed/embed.js", "init");
      /* eslint-enable prefer-const, prefer-rest-params, @typescript-eslint/no-unused-expressions */

      window.Cal("init", { origin: "https://cal.com" });
      window.Cal("inline", {
        elementOrSelector: "#calendarEmbed",
        calLink: "zectox",
        layout: "month_view",
      });
      window.Cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });

      loadCalendarBtn.disabled = false;
      loadCalendarBtn.innerHTML =
        '<i class="fas fa-calendar-check"></i> Calendar Loaded';
    }, { signal });
  }


    // Initialize GLightbox for premium modal galleries
    if (typeof GLightbox !== 'undefined') {
        if (window.glightboxInstance) {
            window.glightboxInstance.destroy();
            window.glightboxInstance = null;
        }
        window.glightboxInstance = GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: false,
            zoomable: false,
            draggable: false,
            skin: 'clean'
        });
        
        // Pause Lenis scrolling when lightbox opens
        window.glightboxInstance.on('open', () => {
            if(window.lenis) window.lenis.stop();
            
            // Stop scroll/touch events from bubbling up to Lenis so it doesn't preventDefault() them
            setTimeout(() => {
                const container = document.querySelector('.glightbox-container');
                if (container) {
                    const stopPropagation = (e) => e.stopPropagation();
                    container.addEventListener('wheel', stopPropagation, { passive: false, signal });
                    container.addEventListener('touchstart', stopPropagation, { passive: true, signal });
                    container.addEventListener('touchmove', stopPropagation, { passive: true, signal });
                }
            }, 100);
        });
        window.glightboxInstance.on('close', () => {
            if(window.lenis) window.lenis.start();
        });
    }

    if (typeof gsap !== 'undefined') {
        initGSAPAnimations();
        initCursor();
    }
}

// A visit that gets interrupted (an impatient second click) can leave the curtain
// mid-animation on a full-screen, z-index 999999 layer with pointer-events: auto.
// Park it and make it inert again -- but only once nothing else is animating it,
// otherwise this races the replacement visit and kills its tween instead.
function resetCurtain() {
    if (swupInstance && swupInstance.navigating) return;
    const curtain = document.querySelector('.page-transition-curtain');
    if (!curtain) return;
    if (typeof gsap !== 'undefined') gsap.killTweensOf(curtain);
    curtain.style.pointerEvents = 'none';
    curtain.style.transform = 'translateY(-100%)';
    if (window.lenis) window.lenis.start();
}

function initSwup() {
    if (typeof Swup === 'undefined') return;
    
    swupInstance = new Swup({
        plugins: [
            new SwupScriptsPlugin({ optin: true }),
            new SwupHeadPlugin()
        ],
        animationSelector: '[class*="transition-fade"]',
        containers: ['#swup'],
        animateHistoryBrowsing: true,
        ignoreVisit: (url, { el } = {}) => !!(el && el.closest('[data-no-swup], .glightbox'))
    });

    swupInstance.hooks.replace('animation:out:await', async () => {
        const curtain = document.querySelector('.page-transition-curtain');
        if (prefersReducedMotion || !curtain || typeof gsap === 'undefined') return;

        if (window.lenis) window.lenis.stop();
        curtain.style.pointerEvents = 'auto';

        await new Promise(resolve => {
            gsap.fromTo(curtain,
                { y: '100%' },
                {
                    y: '0%',
                    duration: 0.6,
                    ease: 'power2.inOut',
                    force3D: true,
                    onComplete: resolve
                }
            );
        });
    });

    swupInstance.hooks.replace('animation:in:await', async () => {
        const curtain = document.querySelector('.page-transition-curtain');
        if (prefersReducedMotion || !curtain || typeof gsap === 'undefined') return;

        await new Promise(resolve => {
            gsap.fromTo(curtain,
                { y: '0%' },
                {
                    y: '-100%',
                    duration: 0.8,
                    ease: 'power2.inOut',
                    force3D: true,
                    delay: 0.05,
                    onComplete: () => {
                        curtain.style.pointerEvents = 'none';
                        if (window.lenis) window.lenis.start();
                        resolve();
                    }
                }
            );
        });
    });

    swupInstance.hooks.on('content:replace', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(t => t.kill());
        }
        initPage();
    });

    swupInstance.hooks.on('visit:end', resetCurtain);
    swupInstance.hooks.on('visit:abort', resetCurtain);
}

document.addEventListener("DOMContentLoaded", () => {
    initSwup();
    initPage();
    
    const curtain = document.querySelector('.page-transition-curtain');
    if (curtain && prefersReducedMotion) {
        curtain.style.animation = 'none';
        curtain.style.transform = 'translateY(-100%)';
        curtain.style.pointerEvents = 'none';
    } else if (curtain) {
        if (typeof gsap !== 'undefined') {
            // GSAP is loaded: stop CSS fallback animation and use GSAP for smooth reveal
            curtain.style.animation = 'none';
            gsap.fromTo(curtain, { y: 0 }, { 
                y: '-100%', 
                duration: 0.8, 
                ease: 'power2.inOut', 
                force3D: true, 
                delay: 0.05, 
                onComplete: () => { curtain.style.pointerEvents = 'none'; } 
            });
        }
        // If GSAP is not ready yet, the CSS animation fallback handles it automatically
    }
});

document.addEventListener("lenisAndGsapReady", () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(t => t.kill());
    }
    initGSAPAnimations();
});
