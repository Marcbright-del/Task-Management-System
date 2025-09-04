/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-primary': 'rgb(var(--color-brand-primary) / <alpha-value>)',
        'brand-secondary': 'rgb(var(--color-brand-secondary) / <alpha-value>)',
        'base-100': 'rgb(var(--color-base-100) / <alpha-value>)',
        'base-200': 'rgb(var(--color-base-200) / <alpha-value>)',
        'base-300': 'rgb(var(--color-base-300) / <alpha-value>)',
        'base-content': 'rgb(var(--color-base-content) / <alpha-value>)',
        'base-content-secondary': 'rgb(var(--color-base-content-secondary) / <alpha-value>)',
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'info': 'rgb(var(--color-info) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'error': 'rgb(var(--color-error) / <alpha-value>)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}