const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    // "**/*.{html, js, ejs}",
    // "**/**/*.{html, js, ejs}",
    "./views/**/*.ejs",
  ],
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
      },
      backgroundImage: {
        "trees-cut": "url('/img/mattpalmer.jpg')",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
