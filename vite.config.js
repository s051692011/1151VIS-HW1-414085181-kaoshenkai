import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative assets also work when the built dist folder is hosted on GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [vue()],
})
