import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        panel: "var(--color-panel)",
        "panel-strong": "var(--color-panel-strong)",
        border: "var(--color-border)",
        electric: "var(--color-electric)",
        coral: "var(--color-coral)",
        sun: "var(--color-sun)",
        mint: "var(--color-mint)",
        violet: "var(--color-violet)",
        berry: "var(--color-berry)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        glow: "var(--shadow-glow)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      backgroundImage: {
        "color-field": "var(--background-color-field)",
        "accent-band": "var(--background-accent-band)",
      },
    },
  },
};

export default config;
