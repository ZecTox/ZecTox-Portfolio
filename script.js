// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const pageTitle = document.getElementById('page-title');
    const nightModeToggle = document.getElementById('nightModeToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    // Section titles mapping
    const sectionTitles = {
        'overview': 'Portfolio Dashboard',
        'experience': 'Professional Experience',
        'projects': 'Shopify Stores',
        'skills': 'Technical Skills',
        'resume': 'Resume',
        'contact': 'Contact Information'
    };

    // Night mode toggle functionality
    nightModeToggle.addEventListener('change', function() {
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
        item.addEventListener('click', function() {
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
        card.addEventListener('click', function() {
            const contactType = this.querySelector('h3').textContent.toLowerCase();
            
            switch(contactType) {
                case 'email':
                    window.location.href = 'mailto:tejaskedare.22@gmail.com', '_blank';
                    break;
                case 'linkedin':
                    window.open('https://www.linkedin.com/in/zectox/', '_blank');
                    break;
                case 'github':
                    window.open('https://github.com/ZecTox', '_blank');
                    break;
                case 'website':
                    window.open('https://zectox-portfolio.vercel.app/', '_blank');
                    break;
            }
        });
    });

    // Resume download button
    const downloadButtons = document.querySelectorAll('button');
    downloadButtons.forEach(button => {
        if (button.textContent.includes('Download Resume')) {
            button.addEventListener('click', function() {
                // Open resume in new tab
                window.open('project_images/Tejas_Kedare_Resume_Shopify.pdf', '_blank');
            });
        }
    });

    // Contact me button in header
    const contactButton = document.querySelector('.header-right .btn-primary');
    if (contactButton) {
        contactButton.addEventListener('click', function() {
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

    // Update active nav item on scroll
    window.addEventListener('scroll', function() {
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
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
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