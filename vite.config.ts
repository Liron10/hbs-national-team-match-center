import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_BASE ?? '/hbs-national-team-match-center/',
  plugins: [react(), tailwindcss()],
})
