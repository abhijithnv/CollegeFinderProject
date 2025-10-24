import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-primary': '#20b2aa',
        'teal-dark': '#1a9b94',
        'grey-light': '#f8f9fa',
        'grey-medium': '#e9ecef',
        'grey-text': '#4a5568',
        'grey-dark': '#1f2937',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
} satisfies Config
