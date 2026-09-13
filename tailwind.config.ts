import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#EAF4FB",
        ink: "#040E1B",
        navy: "#0B1F3A",
        sky: "#7EC8F0",
        "sky-deep": "#5BB8E8",
        cream: "#FFF9F0",
        gold: "#F5C84B",
        "gold-deep": "#E8B84A",
        live: "#22C55E",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "1.75rem",
        pill: "9999px",
      },
      boxShadow: {
        chunky:
          "0 8px 0 0 rgba(11,31,58,0.78), 0 24px 60px rgba(11,31,58,0.18), inset 0 3px 0 rgba(255,255,255,0.9)",
        "chunky-sm":
          "0 4px 0 0 rgba(11,31,58,0.65), 0 12px 32px rgba(11,31,58,0.14), inset 0 2px 0 rgba(255,255,255,0.85)",
        nav: "0 4px 0 0 rgba(11,31,58,0.55), 0 8px 32px rgba(11,31,58,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
