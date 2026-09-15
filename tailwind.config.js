/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        strong: "rgb(var(--strong) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-fg": "rgb(var(--accent-fg) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        /* Amber text on a warning tint; see --warning-ink. */
        "warning-ink": "rgb(var(--warning-ink) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        /* The lighter half of the header gradient. */
        accent2: "rgb(var(--accent2) / <alpha-value>)",
        /* Decorative hues, used only to colour-code the tiles and rail
           icons. They deliberately shadow Tailwind's own violet/teal/rose
           so a raw palette class cannot slip past the token layer. */
        violet: "rgb(var(--violet) / <alpha-value>)",
        teal: "rgb(var(--teal) / <alpha-value>)",
        rose: "rgb(var(--rose) / <alpha-value>)",
      },
      fontFamily: {
        /* Headings and figures. Poppins is rounder and reads friendlier
           than Inter at display sizes; Inter still carries all body copy
           and every table, where Poppins is too wide. */
        display: [
          "Poppins",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        pop: "0 10px 30px -12px rgb(0 0 0 / 0.28)",
        /* Cards sit on the page rather than being drawn on it. */
        card: "0 1px 2px 0 rgb(15 23 34 / 0.04), 0 8px 20px -12px rgb(15 23 34 / 0.16)",
        /* The two figures the page leads with sit a step further forward. */
        lift: "0 2px 4px -1px rgb(15 23 34 / 0.06), 0 14px 30px -14px rgb(15 23 34 / 0.26)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "scale-in": {
          from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-out": { from: { opacity: 1 }, to: { opacity: 0 } },
        /* The phone drawer: it comes from the edge it is anchored to, so the
           gesture that opened it and the motion that answers agree. */
        "drawer-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "drawer-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        /* Rail rows deal themselves in from the left, one after the next. */
        "nav-in": {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        /* The active row's marker grows out of its own middle. */
        "mark-in": {
          from: { opacity: 0, transform: "translateY(-50%) scaleY(0.2)" },
          to: { opacity: 1, transform: "translateY(-50%) scaleY(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "fade-out": "fade-out 0.2s ease-in forwards",
        "scale-in": "scale-in 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
        "drawer-in": "drawer-in 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
        "drawer-out": "drawer-out 0.2s cubic-bezier(0.4, 0, 1, 1) forwards",
        "nav-in": "nav-in 0.34s cubic-bezier(0.16, 1, 0.3, 1) both",
        "mark-in": "mark-in 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
