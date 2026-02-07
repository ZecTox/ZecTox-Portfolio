// Navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const pageTitle = document.getElementById('page-title');
    const nightModeToggle = document.getElementById('nightModeToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    // Section titles mapping
    const sectionTitles = {
        'overview': 'Shopify Developer Portfolio',
        'experience': 'Professional Experience',
        'projects': 'Shopify Stores',
        'testimonials': 'Client Testimonials',
        'faq': 'Frequently Asked Questions',
        'skills': 'Technical Skills',
        'resume': 'Resume',
        'schedule': 'Schedule a Call',
        'contact': 'Contact Information'
    };

    // Night mode toggle functionality
    nightModeToggle.addEventListener('change', function () {
        document.body.classList.toggle('night-mode', this.checked);

        // Save preference to localStorage
        localStorage.setItem('nightMode', this.checked);
    });

    // Load saved night mode preference
    const savedNightMode = localStorage.getItem('nightMode') === 'true';
    if (savedNightMode) {
        nightModeToggle.checked = true;
        document.body.classList.add('night-mode');
    }

    // Mobile menu functionality
    function toggleMobileMenu() {
        sidebar.classList.toggle('open');
        mobileOverlay.classList.toggle('active');
    }

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('active');
    }

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);

    // Close mobile menu when clicking nav items
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            // Existing navigation code
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked nav item
            this.classList.add('active');

            // Scroll to target section
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update page title
                pageTitle.textContent = sectionTitles[targetSection] || 'Portfolio Dashboard';
            }

            // Close mobile menu after navigation
            closeMobileMenu();
        });
    });

    // Contact card click handlers
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('click', function () {
            const contactType = this.querySelector('h3').textContent.toLowerCase();

            switch (contactType) {
                case 'email':
                    window.location.href = 'mailto:tejaskedare.22@gmail.com';
                    break;
                case 'linkedin':
                    window.open('https://www.linkedin.com/in/zectox/', '_blank');
                    break;
                case 'github':
                    window.open('https://github.com/ZecTox', '_blank');
                    break;
                case 'website':
                    window.open('https://zectox.is-a.dev/', '_blank');
                    break;
            }
        });
    });

    // Resume download button
    const downloadButtons = document.querySelectorAll('button');
    downloadButtons.forEach(button => {
        if (button.textContent.includes('Download Resume')) {
            button.addEventListener('click', function () {
                // Open resume in new tab
                window.open('https://drive.google.com/file/d/1G7fBXyuW_6fvos6xbcTUWUTXWrX8Vy7p/view?usp=sharing', '_blank');
            });
        }
    });

    // Contact me button in header
    const contactButton = document.querySelector('.header-right .btn-primary');
    if (contactButton) {
        contactButton.addEventListener('click', function () {
            // Scroll to contact section
            navItems.forEach(nav => nav.classList.remove('active'));

            const contactNav = document.querySelector('.nav-item[data-section="contact"]');
            const contactSection = document.getElementById('contact');

            if (contactNav && contactSection) {
                contactNav.classList.add('active');
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                pageTitle.textContent = 'Contact Information';
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
        const sections = document.querySelectorAll('.content-section');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-section') === current) {
                nav.classList.add('active');
                pageTitle.textContent = sectionTitles[current] || 'Portfolio Dashboard';
            }
        });
    }, 100); // Debounce for 100ms

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Add keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add loading animation for project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Handle specific hash scroll on load (especially for redirects from other pages)
function handleHashScroll() {
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            // Immediate scroll attempt
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Small fallback just in case layout shifts happen
            setTimeout(() => {
                targetElement.scrollIntoView({
                    behavior: 'auto',
                    block: 'start'
                });
            }, 100);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleHashScroll);
} else {
    handleHashScroll();
}

// Blog Meeting Popup Logic
(function() {
    // Configuration
    const CONFIG = {
        popupDelay: 5000, // 5 seconds
        frequencyHours: 1, // Show once every 1 hours
        calLink: 'https://cal.com/zectox/30min', // Direct booking link
        // calLink: 'https://cal.com/zectox', // Alternative generic link
    };

    function initBlogPopup() {
        // 1. Check if we are on a blog page
        if (!window.location.href.includes('/blog/')) return;
        
        // 2. Check localStorage for frequency cap
        const lastSeen = localStorage.getItem('blogPopupSeen');
        if (lastSeen) {
            const timeSince = new Date().getTime() - parseInt(lastSeen);
            const hoursSince = timeSince / (1000 * 60 * 60);
            if (hoursSince < CONFIG.frequencyHours) {
                console.log('Blog popup suppressed: seen recently.');
                return;
            }
        }

        // 3. Inject CSS
        const style = document.createElement('style');
        style.textContent = `
            .blog-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s ease, visibility 0.4s;
            }

            .blog-popup-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .blog-popup-content {
                background: white; /* Fallback */
                background: rgba(255, 255, 255, 0.95);
                width: 90%;
                max-width: 1000px;  /* Wide enough for Cal.com */
                height : 100%;
                max-height: 90vh;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                position: relative;
                transform: translateY(20px);
                transition: transform 0.4s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .night-mode .blog-popup-content {
                background: rgba(30, 30, 30, 0.95);
                border-color: rgba(255, 255, 255, 0.1);
                color: #e0e0e0;
            }

            .blog-popup-overlay.active .blog-popup-content {
                transform: translateY(0);
            }

            .blog-popup-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                z-index: 10;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .blog-popup-close:hover {
                background: rgba(0,0,0,0.1);
            }
            .night-mode .blog-popup-close { color: #aaa; }
            .night-mode .blog-popup-close:hover { background: rgba(255,255,255,0.1); }

            .blog-popup-header {
                padding: 24px 24px 10px;
                text-align: center;
            }

            .blog-popup-header h3 {
                margin: 0 0 8px;
                font-size: 1.5rem;
                color: #1a1a1a;
            }
            .night-mode .blog-popup-header h3 { color: #fff; }

            .blog-popup-header p {
                margin: 0;
                color: #666;
                font-size: 0.95rem;
            }
            .night-mode .blog-popup-header p { color: #bbb; }

            .blog-popup-body {
                flex: 1;
                overflow-y: auto;
                padding: 0;
                height: 500px; /* Fixed height for iframe */
            }

            .blog-popup-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }

            .my-20{
                margin-bottom: 0px !important;
            }

        `;
        document.head.appendChild(style);

        // 4. Create DOM Elements
        const overlay = document.createElement('div');
        overlay.className = 'blog-popup-overlay';
        
        overlay.innerHTML = `
            <div class="blog-popup-content">
                <button class="blog-popup-close">&times;</button>
                <div class="blog-popup-header">
                    <h3>Need Expert Shopify Advice?</h3>
                    <p>Facing issues with your store? Book a 1:1 consultation directly.</p>
                </div>
                <div class="blog-popup-body">
                    <iframe src="${CONFIG.calLink}" class="blog-popup-iframe" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 5. Event Handlers
        const closeBtn = overlay.querySelector('.blog-popup-close');
        
        function closePopup() {
            overlay.classList.remove('active');
            // Record timestamp in localStorage
            localStorage.setItem('blogPopupSeen', new Date().getTime().toString());
            
            // Remove from DOM after transition to save memory
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }

        closeBtn.addEventListener('click', closePopup);
        
        // Close on background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });

        // 6. Trigger after delay
        setTimeout(() => {
            overlay.classList.add('active');
        }, CONFIG.popupDelay);
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlogPopup);
    } else {
        initBlogPopup();
    }
})();