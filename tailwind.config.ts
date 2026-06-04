import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#f8f9fa", 100: "#f1f3f5", 200: "#e9ecef", 300: "#dee2e6",
          400: "#ced4da", 500: "#adb5bd", 600: "#868e96", 700: "#495057",
          800: "#343a40", 900: "#212529", 950: "#0d0f12",
        },
        brand: {
          50: "#ebfaf3", 100: "#c8f3df", 200: "#92e6bf", 300: "#5bd89e",
          400: "var(--brand, #3bcb85)", 500: "var(--brand-500, #22b573)",
          600: "#16945d", 700: "#12764b", 800: "#115e3c", 900: "#0f4d32", 950: "#062b1b",
        },
        accent: {
          50: "#f0f4ff", 100: "#dbe4ff", 200: "#bac8ff", 300: "#91a7ff",
          400: "var(--accent, #748ffc)", 500: "var(--accent-500, #5c7cfa)",
          600: "#4c6ef5", 700: "#4263eb", 800: "#3b5bdb", 900: "#364fc7", 950: "#1e2a6e",
        },
        amber: {
          50: "#fff9db", 100: "#fff3bf", 200: "#ffec99", 300: "#ffe066",
          400: "#ffd43b", 500: "#fcc419", 600: "#fab005", 700: "#f59f00",
          800: "#f08c00", 900: "#e67700", 950: "#7a3d00",
        },
        theme: {
          bg: "var(--bg)", "bg-secondary": "var(--bg-secondary)", "bg-elevated": "var(--bg-elevated)",
          text: "var(--text)", "text-secondary": "var(--text-secondary)",
          "text-muted": "var(--text-tertiary)", border: "var(--border)", "border-strong": "var(--border-strong)",
        },
        "text": {
          primary: "var(--text)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
        },
        "semantic": {
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
          info: "var(--info)",
        },

      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["SF Mono", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "glass-border": "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        "glow-green": "radial-gradient(50% 50% at 50% 0%, rgba(107,227,164,0.15) 0%, transparent 100%)",
        "glow-amber": "radial-gradient(50% 50% at 50% 0%, rgba(242,192,99,0.15) 0%, transparent 100%)",
        "glow-accent": "radial-gradient(50% 50% at 50% 0%, rgba(92,124,250,0.15) 0%, transparent 100%)",
        "glow-brand": "radial-gradient(50% 50% at 50% 0%, color-mix(in srgb, var(--brand) 20%, transparent) 0%, transparent 100%)",
        "hero-gradient": "radial-gradient(ellipse at top, color-mix(in srgb, var(--brand) 10%, transparent) 0%, transparent 60%)",
        "radial-fade": "radial-gradient(ellipse at center, var(--bg-elevated) 0%, transparent 100%)",
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-sm": "0 4px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-lg": "0 16px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glow-green": "0 0 20px rgba(107,227,164,0.12), 0 0 60px rgba(107,227,164,0.06)",
        "glow-amber": "0 0 20px rgba(242,192,99,0.12), 0 0 60px rgba(242,192,99,0.06)",
        "glow-accent": "0 0 20px rgba(92,124,250,0.12), 0 0 60px rgba(92,124,250,0.06)",
        "glow-brand": "0 0 30px color-mix(in srgb, var(--brand) 15%, transparent), 0 0 80px color-mix(in srgb, var(--brand) 6%, transparent)",
        "elevated": "0 4px 24px rgba(0,0,0,0.30)",
        "elevated-lg": "0 8px 48px rgba(0,0,0,0.40)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "sweep": "sweep 6s linear infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "stagger-in": "stagger-in 0.4s ease-out forwards",
        "count-up": "count-up 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-down": "slide-down 0.3s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%": { opacity: "0.6" },
          "100%": { opacity: "1" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "stagger-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}

export default config
