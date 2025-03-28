import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      '4xl': { max: '1600px' },
      '3xl': { max: '1440px' },
      '2xl': { max: '1366px' },
      xl: { max: '1280px' },
      lg: { max: '1024px' },
      md: { max: '768px' },
      sm: { max: '640px' },
      xs: { max: '376px' },
      se: { max: '340px' },
    },

    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },

    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#4E4C72',
        primary: '#6373F7',
        secondary: '#FD7876',
        pink: '#F2A1F4',
        info: '#2BC7EC',
        success: '#78D999',
        card: '#F5F5F5',
        border: '#D8E9F6',
      },

      spacing: {
        navbar: 'var(--navbar-h)',
      },

      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },

      boxShadow: {
        DEFAULT: '0px 4px 8px 0px rgba(99, 115, 247, 0.25)',
        danger: '0px 4px 8px 0px rgba(255, 73, 74, 0.25)',
        pack: '16px 16px 16px 0px rgba(253, 120, 118, 0.2)',
        news: '16px 16px 16px 0px rgba(242, 161, 244, 0.25)',
        recently: '0px 4px 24px 0px rgba(99, 115, 247, 0.25)',
      },

      dropShadow: {
        DEFAULT: '0px 4px 8px rgba(99, 115, 247, 0.25)',
        danger: '0px 4px 8px 0px rgba(255, 73, 74, 0.25)',
        pack: '16px 16px 16px rgba(253, 120, 118, 0.2)',
        text: '0px 4px 8px rgba(0,0,0,0.5)',
        news: '16px 16px 16px rgba(242, 161, 244, 0.25)',
        recently: '0px 4px 24px rgba(99, 115, 247, 0.25)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animated'),
    // require("daisyui"),
    // require("flowbite/plugin"),
    plugin(({ addComponents, matchUtilities, theme }) => {
      matchUtilities(
        {
          'stroke-width': (value) => ({
            strokeWidth: value,
          }),
        },
        {
          values: theme('space'),
        },
      )

      addComponents({
        // '.svg-text-stroke-number': {
        //   fill: 'white',
        //   stroke: '#FD7876',
        //   strokeWidth: '12px',
        //   strokeLinejoin: 'round',
        // },

        '.svg-text-stroke': {
          stroke: 'currentColor',
          strokeLinejoin: 'round',
        },
      })
    }),
  ],
}
export default config
