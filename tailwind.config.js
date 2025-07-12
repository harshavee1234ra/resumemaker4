/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High-contrast dark mode color palette
        dark: {
          // Background colors - avoiding pure black for eye strain reduction
          bg: {
            primary: '#121212',    // Main background
            secondary: '#1E1E1E',  // Card/panel backgrounds
            tertiary: '#2A2A2A',   // Elevated surfaces
            quaternary: '#363636', // Interactive elements
          },
          // Text colors - ensuring high contrast ratios
          text: {
            primary: '#FFFFFF',    // Primary text (7:1 contrast ratio)
            secondary: '#E0E0E0',  // Secondary text (6.5:1 contrast ratio)
            tertiary: '#CCCCCC',   // Tertiary text (5.5:1 contrast ratio)
            muted: '#B3B3B3',      // Muted text (4.5:1 contrast ratio)
            disabled: '#808080',   // Disabled text (3:1 contrast ratio)
          },
          // Border colors
          border: {
            primary: '#404040',    // Primary borders
            secondary: '#333333',  // Secondary borders
            muted: '#2A2A2A',      // Subtle borders
          },
          // Interactive states
          hover: {
            bg: '#2A2A2A',         // Hover backgrounds
            border: '#4A4A4A',     // Hover borders
          },
          focus: {
            ring: '#3B82F6',       // Focus ring color
            bg: '#1E3A8A',         // Focus backgrounds
          }
        }
      },
      // Custom contrast utilities
      contrast: {
        'aa': '4.5',     // WCAG AA compliance
        'aaa': '7',      // WCAG AAA compliance
      }
    },
  },
  plugins: [],
};