import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bekon: {
          'off-white': '#F8F5F0',
          cream: '#EDE8DF',
          'near-black': '#1A1A1A',
          gold: '#B8963E',
          'gold-light': '#CBA84A',
          'gold-dark': '#9A7C2E',
          sage: '#4A7C3F',
          'sage-light': '#5A9A4D',
          border: '#E0D9CE',
          'text-muted': '#6B6560',
          'text-secondary': '#3D3936',
          'whatsapp': '#25D366',
          error: '#C0392B',
          success: '#27AE60',
          warning: '#F39C12',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.1', fontWeight: '300' }],
        'display-l': ['56px', { lineHeight: '1.15', fontWeight: '300' }],
        'display-m': ['42px', { lineHeight: '1.2', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)',
        'md': '0 4px 6px rgba(26,26,26,0.05), 0 2px 4px rgba(26,26,26,0.04)',
        'lg': '0 10px 15px rgba(26,26,26,0.08), 0 4px 6px rgba(26,26,26,0.04)',
        'xl': '0 20px 25px rgba(26,26,26,0.10), 0 8px 10px rgba(26,26,26,0.04)',
        'gold': '0 4px 20px rgba(184,150,62,0.20)',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'standard': '300ms',
        'slow': '500ms',
        'cinematic': '800ms',
      },
      maxWidth: {
        'container': '1280px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'counter': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'counter': 'counter 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
