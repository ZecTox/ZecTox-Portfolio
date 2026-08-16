
// Navigation functionality
// Dynamically load Lenis Smooth Scrolling so it works site-wide automatically
(function loadLenis() {
  const lenisScript = document.createElement("script");
  lenisScript.src = "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js";
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
  lenisStyle.href = "https://unpkg.com/lenis@1.1.13/dist/lenis.css";
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
    popupDelay: 7000,
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
                background: linear-gradient(135deg, #00c878, #008060);
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

    setTimeout(() => {
      prompt.classList.add("active");
    }, CONFIG.popupDelay);
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
    if (typeof SplitType !== 'undefined') {
        const heroTitle = document.querySelector('.hero-text h2');
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
            
            const heroSiblings = document.querySelectorAll('.hero-text > :not(h2), .hero-profile-card');
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
            let scrollWidth = track.scrollWidth / 2;
            let tween = gsap.to(track, {
                x: -scrollWidth,
                ease: "none",
                duration: 360,
                repeat: -1
            });
            
            carousel.addEventListener('mouseenter', () => tween.pause());
            carousel.addEventListener('mouseleave', () => tween.play());
        }, 100);
    }

    // 3. Staggered reveals
    const staggerSections = [
        { selector: '.project-card', trigger: '.projects-grid' },
        { selector: '.exp-card', trigger: '.experience-section' },
        { selector: '.card', trigger: '.services-grid' },
        { selector: '.profile-section > *', trigger: '.profile-section' }
    ];

    staggerSections.forEach(sec => {
        const elements = gsap.utils.toArray(sec.selector);
        if (elements.length > 0) {
            gsap.fromTo(
                elements,
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
                    scrollTrigger: { trigger: sec.trigger, start: "top 85%" }
                }
            );
        }
    });

    // 5. ScrollTrigger for Section Titles
    gsap.utils.toArray(".section-header, .section-title").forEach((header) => {
      gsap.fromTo(header, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: header, start: "top 90%" } });
    });

    // 6. Parallax effect for Contact CTA
    const cta = document.querySelector("#contact");
    if (cta) {
      gsap.fromTo(cta, { backgroundPositionY: '0%' }, { backgroundPositionY: '100%', ease: "none", scrollTrigger: { trigger: cta, start: "top bottom", end: "bottom top", scrub: true } });
    }


}


function initCursor() {
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

    const interactives = document.querySelectorAll('a, button, .project-card, .btn, .nav-item');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 0, duration: 0.3 });
            gsap.to(ring, { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'transparent', backdropFilter: 'blur(4px)', duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3 });
            gsap.to(ring, { width: 40, height: 40, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', backdropFilter: 'none', duration: 0.3 });
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
        });
        el.addEventListener('mousemove', (e) => {
            if(el.classList.contains('project-card')) return; 
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            gsap.to(el, { x: x*0.05, y: y*0.05, duration: 0.5, ease: "power3.out" });
        });
    });
}

function initPage() {
    
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
    });
  }

  // Load saved night mode preference
  const savedNightMode = localStorage.getItem("nightMode") === "true";
  if (savedNightMode && nightModeToggle) {
    nightModeToggle.checked = true;
    document.body.classList.add("night-mode");
  }
  syncThemeToggleUI();

  if (themeToggleButton && nightModeToggle) {
    themeToggleButton.addEventListener("click", function () {
      nightModeToggle.checked = !nightModeToggle.checked;
      nightModeToggle.dispatchEvent(new Event("change"));
    });
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
    mobileMenuToggle.addEventListener("click", toggleMobileMenu);
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileMenu);
  }

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
    });
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
    });
  });

  // Resume download button
  const downloadButtons = document.querySelectorAll("button");
  downloadButtons.forEach((button) => {
    if (button.textContent.includes("Download Resume")) {
      button.addEventListener("click", function () {
        // Open resume PDF in new tab
        window.open("/Tejas_Kedare_Resume_Shopify_Updated.pdf", "_blank");
      });
    }
  });

  // Contact me button in header
  const contactButton = document.querySelector(".header-right .btn-primary");
  if (contactButton && contactButton.tagName === "BUTTON") {
    contactButton.addEventListener("click", function () {
      // Scroll to contact section
      navItems.forEach((nav) => nav.classList.remove("active"));

      const contactNav = document.querySelector(
        '.nav-item[data-section="contact"]',
      );
      const contactSection = document.getElementById("contact");

      if (contactNav && contactSection) {
        contactNav.classList.add("active");
        if (window.lenis) {
          window.lenis.scrollTo(contactSection, { offset: -50 });
        } else {
          contactSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }

      // Close mobile menu
      closeMobileMenu();
    });
  }

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
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });

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
    });
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
    });
  }


    // Initialize GLightbox for premium modal galleries
    if (typeof GLightbox !== 'undefined') {
        const lightbox = GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: false,
            zoomable: false,
            draggable: false,
            skin: 'clean'
        });
        
        // Pause Lenis scrolling when lightbox opens
        lightbox.on('open', () => {
            if(window.lenis) window.lenis.stop();
            
            // Stop scroll/touch events from bubbling up to Lenis so it doesn't preventDefault() them
            setTimeout(() => {
                const container = document.querySelector('.glightbox-container');
                if (container) {
                    const stopPropagation = (e) => e.stopPropagation();
                    container.addEventListener('wheel', stopPropagation, { passive: false });
                    container.addEventListener('touchstart', stopPropagation, { passive: true });
                    container.addEventListener('touchmove', stopPropagation, { passive: true });
                }
            }, 100);
        });
        lightbox.on('close', () => {
            if(window.lenis) window.lenis.start();
        });
    }

    if (typeof gsap !== 'undefined') {
        setTimeout(() => {
            initGSAPAnimations();
            initCursor();
        }, 100);
    }
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

    swupInstance.hooks.replace('animation:out:await', async (visit) => {
        const curtain = document.querySelector('.page-transition-curtain');
        if (!curtain || typeof gsap === 'undefined') return;

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

    swupInstance.hooks.replace('animation:in:await', async (visit) => {
        const curtain = document.querySelector('.page-transition-curtain');
        if (!curtain || typeof gsap === 'undefined') return;

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
}

document.addEventListener("DOMContentLoaded", () => {
    initSwup();
    initPage();
    
    const curtain = document.querySelector('.page-transition-curtain');
    if (curtain && typeof gsap !== 'undefined') {
        gsap.fromTo(curtain, { y: 0 }, { y: '-100%', duration: 0.8, ease: 'power2.inOut', force3D: true, delay: 0.05, onComplete: () => { curtain.style.pointerEvents = 'none'; } });
    }
});

document.addEventListener("lenisAndGsapReady", () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(t => t.kill());
    }
    initGSAPAnimations();
});
