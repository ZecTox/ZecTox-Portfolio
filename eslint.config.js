import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public/css/all.min.css'] },
  {
    files: ['**/*.{js,mjs,ts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    // The site bundle is a classic browser script, not a module.
    files: ['public/script.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
        Lenis: 'readonly',
        Swup: 'readonly',
        SwupScriptsPlugin: 'readonly',
        SwupHeadPlugin: 'readonly',
        SplitType: 'readonly',
        GLightbox: 'readonly',
      },
    },
    rules: {
      // Swup can re-evaluate this file; `let`/`const` at the top level would throw
      // "Identifier has already been declared". See .agents/AGENTS.md §4C.
      'no-var': 'off',
    },
  }
);
