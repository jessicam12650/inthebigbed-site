import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F2EDE6",
        ink: "#1C1C1A",
        rust: "#D4845A",
        emergency: "#C84B31",
        sage: "#6B9E7A",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontWeight: {
        body: "400",
        sub: "700",
        head: "900",
      },
      borderRadius: {
        sm: "4px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,28,26,0.04)",
        pop: "0 8px 24px rgba(28,28,26,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
