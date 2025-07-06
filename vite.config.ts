//vite.config.ts
//This is a Vite configuration file for a SvelteKit project with Tailwind CSS support.

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		port: 5173,
		host: true // Allows access from other devices on network
	}
});
