/** @type {import('tailwindcss').Config} */
require("tailwindcss-animate");
module.exports = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      Orbitron:['Orbitron']

      },
      
    extend: {   backgroundImage: {
      'border-input-gradient': 'linear-gradient(90deg, rgba(227, 43, 144, 1), rgba(125, 24, 79, 1))',
      'LineProgress-gradient': 'linear-gradient(90deg, rgba(18, 237, 96, 1),rgba(40, 181, 51, 1),rgba(112, 227, 11, 1))',
      'LineProgress-done': 'linear-gradient(90deg, rgba(227, 43, 144, 1), rgba(125, 24, 79, 1))',
      'workbox-gradient':'linear-gradient(90deg, rgba(255, 255, 255, 0.1),rgba(255, 255, 255, 0.05))',
      'slider-gradient':'linear-gradient(90deg, #E32B90 0%, #7D184F 100%)',
      'btn-gradient':"linear-gradient(90deg, rgba(18, 183, 242, 1),rgba(19, 79, 171, 1))",
      'sidebar-bg':'linear-gradient(180deg, #000c2b, #022640 86%)',
      'sidebar-active':"linear-gradient(180deg, #12b7f240, #134fab40)",
      'button-color':'linear-gradient(90deg, rgba(18, 183, 242, 1),rgba(19, 79, 171, 1)    )'

    },
      colors: {
        'blue': '#1fb6ff',
        'purple': '#7e5bef',
        'orange': '#ff7849',
         "darkbg":"#090F15",
         "grayborder":"#DCDCDC",
         "darktext":"#667D94",
         "loadbg":"#9d9d9d",
         "darkbox":"#0C1621",
         "black":"#000000",
         "darkGraytext":"#667D94",
         "lightGray":"#A5BBD0"
      },
    },
    screens: {
      'smPro': {'min': '430px'},
      'phone': {'max': '500px'},
      'minphone': {'min': '500px'},
      'middlePro': {'max': '350px'},
      'middllarge': {'max': '380px'},
      'doublesm': {'max': '340px'},
      'sm': {'min': '640px', 'max': '767px'},
       'mdPro':{'min': '640px'},
      'esm': {'max': '767px'},
      'gridBox': {'min': '1110px'},
      'bigPhone':{'max': '770px'},
      'sm': '640px',
      // => @media (min-width: 640px) { ... }
      
      'md': '768px',
      // => @media (min-width: 768px) { ... }
      
      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }
      'sxl':{'max': '1020px'},
      'xl': '1280px',
      '2xl': '1300px',
      "bigPc":{'min': '1700px'}
    },
  },
  plugins: [],
}




