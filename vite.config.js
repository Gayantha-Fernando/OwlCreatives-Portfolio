import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures relative paths for assets, fixing GitHub Pages 404s
    build: {
        assetsDir: 'assets', // Optional: keeps assets in assets folder
    }
});
