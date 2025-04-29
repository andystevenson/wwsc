import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	// @ts-expect-error - this is a valid Vite config
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['svelte-maplibre-gl', 'svelte-maplibre']
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
