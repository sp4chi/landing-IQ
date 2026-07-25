/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F1B2D',
          800: '#192841',
          700: '#233756',
          600: '#344c73',
          100: '#E8ECF2',
          50: '#F2F5F9',
        },
        offwhite: '#FAFAF8',
        amber: {
          DEFAULT: '#F5A623',
          hover: '#E09212',
          light: '#FFF8EC',
        },
        brand: {
          dark: '#0F1B2D',
          light: '#FAFAF8',
          accent: '#F5A623',
          border: '#E2E8F0',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(15, 27, 45, 0.04), 0 1px 3px rgba(15, 27, 45, 0.02)',
        'card': '0 4px 20px rgba(15, 27, 45, 0.06)',
        'amber-glow': '0 0 20px rgba(245, 166, 35, 0.35)',
      }
    },
  },
  plugins: [],
}
