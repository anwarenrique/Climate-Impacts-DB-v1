const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    // "**/*.{html, js, ejs}",
    // "**/**/*.{html, js, ejs}",
    "./views/**/*.ejs",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  plugins: [require("tw-elements/dist/plugin.cjs")],
  darkMode: "class",
  // safelist: ["animate-[tada_1s]"],
  theme: {
    screens: {
      xs: "361px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        "primary-color": "#10B981",
        "secondary-color": "r#111827",
        "dark-primary": "#031E15",
        navblack: "#0F1419",
        climagray: "#F0F0F0",
      },
      backgroundImage: {
        "trees-cut": "url('/img/mattpalmer.jpg')",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
};
