/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.html',
      './src/**/*.vue',
      './src/**/*.jsx',
      './src/**/*.js',
      './src/**/*.ts',
      './src/**/*.tsx',
    ],
  },
  theme: {
    extend: {
      extend: {
        colors: {
          'main': '#FF9792'
        }
      },
    },
  },
  plugins: [],
}

