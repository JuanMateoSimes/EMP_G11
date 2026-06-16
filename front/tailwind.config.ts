import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        navy: "#12355b",
        signal: "#ffd12d",
        mist: "#eef3f6",
        line: "#d9e1e8"
      },
      boxShadow: {
        panel: "0 12px 32px rgba(17, 24, 39, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
