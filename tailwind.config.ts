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
        serif: ['var(--font-serif)', 'serif'],
        script: ['var(--font-script)', 'cursive'],
        handwriting: ['var(--font-handwriting)', 'cursive', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
