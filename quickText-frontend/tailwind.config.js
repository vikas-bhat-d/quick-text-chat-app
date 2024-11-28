/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,jsx,css}"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      outfit:["Outfit"]
    },
    extend: {
      colors: {
        'midnight-purple': '#7e57c2', // Dark purple
        'light-purple': '#9575cd', // Soft lavender
        'pastel-pink': '#f3e5f5', // Light pink background
        'button-purple': '#5e35b1', // Vibrant purple for buttons
        'white': '#ffffff', // White for text highlights
        'background-light': '#f5f5f5', // Light grey for background
        'text-grey': '#616161', // Neutral grey for text
        'text-purple': '#512da8', // Deep purple for headings
      },
      gradientColorStops: {
        'top': ['#7e57c2', '#9575cd', '#f3e5f5'], // Top gradient
        'right': ['#7e57c2', '#9575cd', '#f3e5f5'], // Right gradient
        'bottom': ['#7e57c2', '#9575cd', '#f3e5f5'], // Bottom gradient
        'left': ['#7e57c2', '#9575cd', '#f3e5f5'], // Left gradient
        'top-right': ['#7e57c2', '#9575cd', '#f3e5f5'], // Top-right gradient
        'bottom-right': ['#7e57c2', '#9575cd', '#f3e5f5'], // Bottom-right gradient
        'top-left': ['#7e57c2', '#9575cd', '#f3e5f5'], // Top-left gradient
        'bottom-left': ['#7e57c2', '#9575cd', '#f3e5f5'], // Bottom-left gradient
        'radial': ['#7e57c2', '#9575cd', '#f3e5f5'], // Radial gradient
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  plugins: [],
}

