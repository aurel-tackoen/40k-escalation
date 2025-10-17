import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.yellow.500'),
              '&:hover': {
                color: theme('colors.yellow.400'),
              },
            },
            h1: {
              color: theme('colors.yellow.500'),
            },
            h2: {
              color: theme('colors.yellow.500'),
            },
            h3: {
              color: theme('colors.yellow.500'),
            },
            h4: {
              color: theme('colors.yellow.500'),
            },
            strong: {
              color: theme('colors.yellow.400'),
            },
            code: {
              color: theme('colors.yellow.400'),
              backgroundColor: theme('colors.gray.800'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.yellow.500'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
  ],
}
