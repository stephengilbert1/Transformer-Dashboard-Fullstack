import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    
  ],
  theme: {
    extend: {
      colors: {
        patagonia: {
          orange: "#f26d21",
          pink: "#d92545",
          blue: "#1059ab",
          purple: "#8a07bd",
          black: "#000000",
          background: "#f8f8f8",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
