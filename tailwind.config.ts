import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          medium: 'var(--primary-medium)',
          light: 'var(--primary-light)',
        },
        light: 'var(--light)',
        gray: 'var(--gray)',
        border: 'var(--border-color)',
        'card-border': 'var(--card-border)',
        'input-border': 'var(--input-border)',
      },
      spacing: {
        '70': '17.5rem',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
        'card': 'var(--card-border)',
        'input': 'var(--input-border)',
      },
    },
  },
  plugins: [],
}
export default config
