// tailwind.config.js (CP04 - Blue Color Scheme)

import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: 'class', // Enable class-based dark mode
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	plugins: [
		// Note: In Tailwind v4, these are handled differently
		// We'll include them for compatibility but they may not be needed
		require('flowbite/plugin'),
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554'
				},
				secondary: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617'
				}
			},
			fontFamily: {
				sans: ['Inter', ...fontFamily.sans],
				display: ['Inter', 'system-ui', 'sans-serif']
			}
		}
	}
};

export default config;