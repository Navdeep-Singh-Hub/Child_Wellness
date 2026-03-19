import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          green: '#4CAF50',
          sky: '#60A5FA',
          yellow: '#FACC15',
        },
        ocean: {
          blue: '#38BDF8',
          coral: '#FB7185',
          green: '#34D399',
        },
        jungle: {
          green: '#22C55E',
          leaf: '#4ADE80',
          yellow: '#FACC15',
        },
      },
      minHeight: {
        screen: '100dvh',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
