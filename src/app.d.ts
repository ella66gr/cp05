// src/app.d.ts
import type { Database } from './lib/types';

declare global {
	namespace App {
		interface Locals {}
		interface PageData {}
		interface Error {}
		interface Platform {}
	}
}

// Declare environment variables
declare module '$env/static/private' {
	export const DATABASE_URL: string;
}

export {};