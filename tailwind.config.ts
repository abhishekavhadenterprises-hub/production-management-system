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
        apple: {
          bg: "#F5F5F7",
          card: "#FFFFFF",
          border: "#E5E5EA",
          "border-subtle": "#EBEBF0",
          text: {
            primary: "#1D1D1F",
            secondary: "#6E6E73",
            tertiary: "#86868B",
            muted: "#A1A1A6",
          },
          blue: {
            DEFAULT: "#007AFF",
            hover: "#0058B3",
            subtle: "#E8F2FE",
            border: "#B2D7FD",
          },
          green: {
            DEFAULT: "#34C759",
            subtle: "#EAF8EF",
            text: "#1E823B",
          },
          amber: {
            DEFAULT: "#FF9500",
            subtle: "#FFF6E9",
            text: "#A65F00",
          },
          red: {
            DEFAULT: "#FF3B30",
            subtle: "#FFEBEA",
            text: "#B82218",
          },
        },
      },
      borderRadius: {
        apple: "14px",
        "apple-card": "16px",
        "apple-lg": "18px",
        "apple-xl": "22px",
      },
      boxShadow: {
        "apple-card": "0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)",
        "apple-hover": "0 2px 4px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)",
        "apple-dropdown": "0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "\"Inter\"",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
