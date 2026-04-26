import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'blog');
const files = (await readdir(blogDir)).filter(file => file.endsWith('.html'));

const sharedSidebar = `        <nav class="sidebar">
            <div class="sidebar-header">
                <div class="night-mode-toggle">
                    <label class="toggle-switch">
                        <input type="checkbox" id="nightModeToggle" aria-label="Toggle Night Mode">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Night Mode</span>
                </div>
            </div>

            <div class="nav-section">
                <a href="/" class="nav-item">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </a>
                <a href="/#experience" class="nav-item">
                    <i class="fas fa-briefcase"></i>
                    <span>Experience</span>
                </a>
                <a href="/#projects" class="nav-item">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Stores</span>
                </a>
                <a href="/blog/" class="nav-item active">
                    <i class="fas fa-blog"></i>
                    <span>Blog</span>
                </a>
                <a href="/#contact" class="nav-item">
                    <i class="fas fa-envelope"></i>
                    <span>Contact</span>
                </a>
            </div>
        </nav>`;

const sharedHeader = `            <header class="header">
                <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle mobile menu">
                    <i class="fas fa-bars"></i>
                </button>

                <div class="header-left">
                    <a href="/" class="brand-lockup">
                        <span id="page-title" class="brand-title">Tejas Kedare</span>
                        <span class="brand-subtitle">Shopify Developer Portfolio</span>
                    </a>
                    <nav class="desktop-nav" aria-label="Primary">
                        <a href="/" class="nav-item desktop-nav-link">Home</a>
                        <a href="/#experience" class="nav-item desktop-nav-link">Experience</a>
                        <a href="/#projects" class="nav-item desktop-nav-link">Stores</a>
                        <a href="/blog/" class="nav-item desktop-nav-link active">Blog</a>
                        <a href="/#contact" class="nav-item desktop-nav-link">Contact</a>
                    </nav>
                </div>
                <div class="header-right">
                    <button class="theme-toggle-button" id="themeToggleButton" type="button" aria-pressed="false">
                        <i class="fas fa-moon"></i>
                        Night Mode
                    </button>
                    <a href="/#schedule" class="schedule-btn-nav">
                        <i class="fas fa-calendar-check"></i>
                        Schedule Meeting
                    </a>
                    <button class="btn-secondary" id="downloadResumeBtn">
                        <i class="fas fa-download"></i>
                        Download Resume
                    </button>
                    <a href="/#contact" class="btn-primary">
                        <i class="fas fa-envelope"></i>
                        Contact Me
                    </a>
                </div>
            </header>`;

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(blogDir, file);
    const original = await readFile(filePath, 'utf8');

    let html = original
        .replace(/<link href="\.\.\/styles\.css" rel="stylesheet">/g, '<link href="/styles.css" rel="stylesheet">')
        .replace(/<script src="\.\.\/script\.js"><\/script>/g, '<script src="/script.js"></script>')
        .replace(/href="\.\.\/#(overview|experience|projects|testimonials|faq|skills|resume|schedule|contact)"/g, 'href="/#$1"')
        .replace(/window\.location\.href='\.\.\/#(schedule|contact)'/g, "window.location.href='/#$1'")
        .replace(/\s*<!-- Vercel Speed Insights -->\s*<script>window\.si = window\.si \|\| function \(\) \{ \(window\.si\.q = window\.si\.q \|\| \[\]\)\.push\(arguments\); \};<\/script>\s*<script defer src="\/_vercel\/speed-insights\/script\.js"><\/script>\s*/g, '\n')
        .replace(/<nav class="sidebar">[\s\S]*?<\/nav>/, sharedSidebar)
        .replace(/<header class="header">[\s\S]*?<\/header>/, sharedHeader);

    if (html !== original) {
        await writeFile(filePath, html);
        updatedFiles += 1;
    }
}

console.log(`Updated blog shells in ${updatedFiles} files.`);
