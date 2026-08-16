import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

async function getHtmlFiles(dir) {
    const entries = await readdir(dir);
    const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry);
        const st = await stat(fullPath);
        if (st.isDirectory()) {
            if (entry !== 'node_modules' && entry !== '.git' && entry !== 'scripts' && entry !== 'dist') {
                return getHtmlFiles(fullPath);
            }
            return [];
        } else {
            return fullPath.endsWith('.html') ? [fullPath] : [];
        }
    }));
    return files.flat();
}

async function syncComponents() {
    const rootDir = process.cwd();
    const indexPath = path.join(rootDir, 'index.html');
    
    // Read the source of truth (index.html)
    const indexHtml = await readFile(indexPath, 'utf8');
    
    // --- Header Sync ---
    const headerRegex = /<header class="header">[\s\S]*?<\/header>/;
    const headerMatch = indexHtml.match(headerRegex);
    
    if (!headerMatch) {
        console.error("Could not find <header class=\"header\"> in index.html");
        process.exit(1);
    }
    
    let baseHeaderHTML = headerMatch[0];
    let absoluteHeaderHTML = baseHeaderHTML.replace(/href="#([a-zA-Z0-9_-]+)"/g, 'href="/#$1"');

    // --- Footer Sync ---
    const footerRegex = /<footer class="premium-footer">[\s\S]*?<\/footer>/;
    const footerMatch = indexHtml.match(footerRegex);
    
    if (!footerMatch) {
        console.error("Could not find <footer class=\"premium-footer\"> in index.html");
        process.exit(1);
    }
    
    let baseFooterHTML = footerMatch[0];
    let absoluteFooterHTML = baseFooterHTML.replace(/href="#([a-zA-Z0-9_-]+)"/g, 'href="/#$1"');
    
    // Find all HTML files
    const htmlFiles = await getHtmlFiles(rootDir);
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        const fileHtml = await readFile(file, 'utf8');
        let newHtml = fileHtml;

        // 1. Sync Header
        newHtml = newHtml.replace(headerRegex, absoluteHeaderHTML);

        // 2. Sync Footer
        // If the file already has a footer, replace it.
        if (footerRegex.test(newHtml)) {
            newHtml = newHtml.replace(footerRegex, absoluteFooterHTML);
        } else {
            // If it doesn't have a footer, inject it right before the closing </main> or </div></main> depending on structure.
            // A safe bet is right before </main>
            newHtml = newHtml.replace(/<\/main>/, `    ${absoluteFooterHTML}\n        </main>`);
        }
        
        if (newHtml !== fileHtml) {
            await writeFile(file, newHtml, 'utf8');
            updatedCount++;
        }
    }
    
    console.log(`Successfully synced header component across ${updatedCount} HTML files.`);
}

syncComponents().catch(console.error);
