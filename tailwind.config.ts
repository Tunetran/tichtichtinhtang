import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-surface': 'var(--bg-surface)',
        'bg-envelope': 'var(--bg-envelope)',
        'bg-envelope-flap': 'var(--bg-envelope-flap)',
        primary: {
          DEFAULT: 'var(--primary)',
          fg: 'var(--primary-fg)',
        },
        accent: 'var(--accent)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          heading: 'var(--heading)',
        },
        heading: 'var(--heading)',
        border: 'var(--border)',
      },
      fontFamily: {
        'serif-title': ['var(--font-serif-title)', 'Playfair Display', 'serif'],
        serif: ['var(--font-serif-title)', 'Playfair Display', 'serif'],
        handwriting: ['var(--font-handwriting)', 'Dancing Script', 'cursive'],
        'sans-ui': ['var(--font-sans-ui)', 'Be Vietnam Pro', 'sans-serif'],
        sans: ['var(--font-sans-ui)', 'Be Vietnam Pro', 'sans-serif'],
        script: ['var(--font-handwriting)', 'Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
