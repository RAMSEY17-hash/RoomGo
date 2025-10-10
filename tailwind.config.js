/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // Fichiers à scanner pour générer les classes Tailwind
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  // Mode sombre basé sur une classe
  darkMode: "class",

  theme: {
    extend: {
      // Couleurs personnalisées (exemples à partir de ton globals.css)
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
      },

      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
    },
  },

  plugins: [
    // Plugin pour classes personnalisées si nécessaire
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".border-border": {
          borderColor: "var(--border)",
        },
        ".outline-ring": {
          outlineColor: "var(--ring)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    }),

    // Plugin tw-animate-css si installé
    require("tw-animate-css"),
  ],
};
