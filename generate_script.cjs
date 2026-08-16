const fs = require('fs');

const orig = fs.readFileSync('public/script.js.bak', 'utf-8');

// The lenis load function is at the top.
const lenisPart = orig.substring(0, orig.indexOf('document.addEventListener("DOMContentLoaded"'));

// The hash scroll logic
const hashScrollRegex = /\/\/ Handle specific hash scroll on load[\s\S]*?handleHashScroll\(\);\n}/;
const hashScrollMatch = orig.match(hashScrollRegex);
const hashScrollPart = hashScrollMatch ? hashScrollMatch[0] : '';

// The blog prompt
const blogPromptRegex = /\/\/ Lightweight blog consultation prompt[\s\S]*\}\)\(\);/;
const blogPromptMatch = orig.match(blogPromptRegex);
const blogPromptPart = blogPromptMatch ? blogPromptMatch[0] : '';

// The GSAP animations function (inside IIFE)
const gsapPartRegex = /function initGSAPAnimations\(\) \{[\s\S]*?\}\n\n\/\/ Custom Cursor/m;
const gsapPartMatch = orig.match(gsapPartRegex);
let gsapFunc = gsapPartMatch[0].replace(/\n\/\/ Custom Cursor/, '');

// GLightbox logic
const glightboxRegex = /\/\/ Initialize GLightbox for premium modal galleries[\s\S]*?\}\);\n    \}/;
const glightboxMatch = orig.match(glightboxRegex);
let glightboxPart = glightboxMatch ? glightboxMatch[0] : '';

// DOMContentLoaded inner code (UI logic)
const uiRegex = /document\.addEventListener\("DOMContentLoaded", function \(\) \{([\s\S]*?)\}\);\n\n\/\/ Scroll-triggered/;
const uiMatch = orig.match(uiRegex);
let uiPart = uiMatch ? uiMatch[1] : '';

const newScript = `
${lenisPart}

// Declare Swup instance
let swupInstance = null;
let cursorInitializedGlobal = false;
let xTo, yTo, xToRing, yToRing;

${hashScrollPart}

${blogPromptPart}

${gsapFunc}

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
    ${uiPart}

    ${glightboxPart}

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
        plugins: [new SwupScriptsPlugin()],
        animationSelector: '[class*="transition-fade"]',
        containers: ['#swup']
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
`;

fs.writeFileSync('public/script.js', newScript);
console.log("Successfully generated script.js");
