import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ─── MMITPS Fintech Design Tokens ──────────────────────────────
      colors: {
        // Institutional Palette — matching the MMITPS INC logo
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Richer Emerald
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // Accent/Negative — matching logo red candles
        accent: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e", // Richer Rose/Red
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        // Surface — Deep Charcoal
        charcoal: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#bdbdbd",
          300: "#9e9e9e",
          400: "#757575",
          500: "#1a1a1a",
          600: "#141414",
          700: "#0f0f0f",
          800: "#0d0d0d",
          900: "#080808",
        },
        // Status colors — semantic aliases for clarity
        positive: {
          DEFAULT: "#22c55e",
          subtle: "rgba(34,197,94,0.12)",
        },
        negative: {
          DEFAULT: "#ef4444",
          subtle: "rgba(239,68,68,0.12)",
        },
        // Legacy Compatibility (mapping amber to the new brand for smooth transition)
        amber: {
          500: "#22c55e",
          400: "#22c55e",
          600: "#16a34a",
        },
        // Semantic aliases
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        "surface-3": "var(--color-surface-3)",
        border: "var(--color-border)",
        "border-hover": "var(--color-border-hover)",
        "border-brand": "var(--color-border-brand)",
        muted: "var(--color-muted)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
      },
      // ─── Typography ─────────────────────────────────────────────────
      fontFamily: {
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
        display: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-sm": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "display-lg": ["5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      // ─── Spacing (8-point grid) ─────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      // ─── Sharp Geometry — NO rounded-lg defaults ───────────────────
      borderRadius: {
        none: "0px",
        sm: "2px",  // sharpest
        DEFAULT: "2px",
        md: "4px",
        lg: "6px",  // max for cards
        full: "9999px",
      },
      // ─── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        "brand-sm": "0 0 12px rgba(16, 185, 129,0.15)",
        "brand-md": "0 0 24px rgba(16, 185, 129,0.25)",
        "brand-lg": "0 0 48px rgba(16, 185, 129,0.35)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(16, 185, 129,0.2)",
      },
      // ─── Animations ──────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129,0)" },
          "50%": { boxShadow: "0 0 0 4px rgba(16, 185, 129,0.2)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.25s ease-out forwards",
        "pulse-brand": "pulse-brand 2s ease-in-out infinite",
        "ticker": "ticker 30s linear infinite",
      },
      // ─── Transitions ─────────────────────────────────────────────────
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
