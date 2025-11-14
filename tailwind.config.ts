import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      fontFamily: {
        sans: ["var(--font-base)", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        bg: 'hsl(var(--bg))',
        'bg-elevated': 'hsl(var(--bg-elevated))',
        panel: 'hsl(var(--panel))',
        text: 'hsl(var(--text))',
        'text-muted': 'hsl(var(--text-muted))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          '600': 'hsl(var(--primary-600))',
          '700': 'hsl(var(--primary-700))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        chip: 'hsl(var(--chip))',
        outline: 'hsl(var(--outline))',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--text))",
        card: {
          DEFAULT: "hsl(var(--panel))",
          foreground: "hsl(var(--text))",
        },
        popover: {
          DEFAULT: "hsl(var(--bg-elevated))",
          foreground: "hsl(var(--text))",
        },
        secondary: {
          DEFAULT: "hsl(var(--chip))",
          foreground: "hsl(var(--text))",
        },
        muted: {
          DEFAULT: "hsl(var(--chip))",
          foreground: "hsl(var(--text-muted))",
        },
        accent: {
          DEFAULT: "hsl(var(--chip))",
          foreground: "hsl(var(--text))",
        },
        destructive: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--text))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
