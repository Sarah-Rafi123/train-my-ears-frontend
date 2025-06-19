/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Root level files
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",

    // All src directory files (comprehensive coverage)
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/**/**/*.{js,jsx,ts,tsx}",

    // Specific src subdirectories for explicit coverage
    "./src/assets/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/components/ui/**/*.{js,jsx,ts,tsx}",
    "./src/components/ui/buttons/**/*.{js,jsx,ts,tsx}",
    "./src/components/ui/dropdown/**/*.{js,jsx,ts,tsx}",
    "./src/components/ui/widgets/**/*.{js,jsx,ts,tsx}",
    "./src/components/layout/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/screens/game/**/*.{js,jsx,ts,tsx}",
    "./src/screens/home/**/*.{js,jsx,ts,tsx}",
    "./src/screens/leaderboard/**/*.{js,jsx,ts,tsx}",
    "./src/screens/login/**/*.{js,jsx,ts,tsx}",
    "./src/screens/menu/**/*.{js,jsx,ts,tsx}",
    "./src/screens/register/**/*.{js,jsx,ts,tsx}",
    "./src/screens/sample/**/*.{js,jsx,ts,tsx}",
    "./src/screens/selectInstrument/**/*.{js,jsx,ts,tsx}",
    "./src/screens/socialRegister/**/*.{js,jsx,ts,tsx}",
    "./src/screens/stats/**/*.{js,jsx,ts,tsx}",

    // Other common directories
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",

    // NativeWind preset files
    "./node_modules/nativewind/dist/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['NATS-Regular'], // Make NATS the default font
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
    plugins:[],
  },
}
