import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Discord color scheme using CSS variables
        discord: {
          // Background colors
          'bg-primary': 'var(--discord-bg-primary)',
          'bg-secondary': 'var(--discord-bg-secondary)',
          'bg-tertiary': 'var(--discord-bg-tertiary)',
          'bg-accent': 'var(--discord-bg-accent)',
          'bg-accent-hover': 'var(--discord-bg-accent-hover)',
          'bg-overlay': 'var(--discord-bg-overlay)',

          // Text colors
          'text-primary': 'var(--discord-text-primary)',
          'text-secondary': 'var(--discord-text-secondary)',
          'text-muted': 'var(--discord-text-muted)',
          'text-link': 'var(--discord-text-link)',
          'text-accent': 'var(--discord-text-accent)',

          // Border colors
          'border-primary': 'var(--discord-border-primary)',
          'border-secondary': 'var(--discord-border-secondary)',
          'border-accent': 'var(--discord-border-accent)',

          // Status colors
          'status-online': 'var(--discord-status-online)',
          'status-away': 'var(--discord-status-away)',
          'status-offline': 'var(--discord-status-offline)',
          'status-dnd': 'var(--discord-status-dnd)',

          // Scrollbar colors
          'scrollbar': 'var(--discord-scrollbar)',
          'scrollbar-hover': 'var(--discord-scrollbar-hover)',
        },
      },
      fontFamily: {
        sans: ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'message-slide-in': 'messageSlideIn 0.3s ease-out',
      },
      keyframes: {
        messageSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;