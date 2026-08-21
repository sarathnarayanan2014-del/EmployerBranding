import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// If you deploy to GitHub Pages at https://<user>.github.io/<repo>/,
// set base to '/<repo>/'. If you deploy to a custom domain or the
// root of github.io, leave it as '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
