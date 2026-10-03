import { resolve } from 'path';
import { defineConfig } from 'vite';
import { readdirSync } from 'fs';

// Helper to find all HTML files in the blog directory
const getBlogInputs = () => {
  const root = process.cwd();
  const blogDir = resolve(root, 'blog');
  
  const inputs: Record<string, string> = {
    main: resolve(root, 'index.html'),
    blog: resolve(blogDir, 'index.html'),
    missing: resolve(root, '404.html'),
  };

  try {
    const files = readdirSync(blogDir);

    files.forEach((file) => {
      if (file.endsWith('.html') && file !== 'index.html') {
        const name = file.replace('.html', '');
        inputs[`blog-${name}`] = resolve(blogDir, file);
      }
    });
  } catch (e) {
    console.warn('Could not read blog directory:', e);
  }

  return inputs;
};

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: getBlogInputs(),
    },
  },
});
