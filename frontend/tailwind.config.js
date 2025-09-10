export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          white: "#ffffff",
          darkblue: "#123361",
          cyan: "#39A5D8",
          darkcyan: "#1180B8",
        },
      },
      fontFamily: {
        title: ["Montserrat", "sans-serif"],
        body: ["Poppins", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [ ],
};
