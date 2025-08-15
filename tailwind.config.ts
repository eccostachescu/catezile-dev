import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // CZ Design System colors
        "cz-bg": "hsl(var(--cz-bg))",
        "cz-surface": "hsl(var(--cz-surface))",
        "cz-ink": "hsl(var(--cz-ink))",
        "cz-ink-muted": "hsl(var(--cz-ink-muted))",
        "cz-border": "hsl(var(--cz-border))",
        "cz-primary": "hsl(var(--cz-primary))",
        "cz-primary-600": "hsl(var(--cz-primary-600))",
        "cz-accent": "hsl(var(--cz-accent))",
        "cz-success": "hsl(var(--cz-success))",
        "cz-danger": "hsl(var(--cz-danger))",
        "cz-overlay": "hsl(var(--cz-overlay))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['34px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
        'h2': ['28px', { lineHeight: '34px', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '28px' }],
      },
      backgroundImage: {
        'cz-hero': 'linear-gradient(180deg, #0B1020 0%, #11172A 45%, #0B1020 100%)',
        'cz-chip': 'linear-gradient(135deg, rgba(108,140,255,.18), rgba(255,200,87,.10))',
      },
      boxShadow: {
        'cz-hover': '0 8px 30px rgba(0,0,0,0.25)',
        'cz-card': '0 4px 16px rgba(0,0,0,0.15)',
      },
      transitionTimingFunction: {
        'cz-smooth': 'cubic-bezier(.2,.8,.2,1)',
      },
      transitionDuration: {
        'cz-fast': '180ms',
        'cz-normal': '220ms',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
