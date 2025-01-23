import { defineConfig } from "vitest/config";
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default defineConfig({
    plugins: [
        sveltekit(),
        SvelteKitPWA({
			manifest: {
				short_name: 'A Simple Notes App',
				name: 'A Simple Notes App',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: "#ffffff",
				background_color: "#ffffff"
			}
		})
    ],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
