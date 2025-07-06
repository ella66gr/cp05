// src/lib/supabaseClient.ts

// Import the Supabase client creation function
import { createClient } from '@supabase/supabase-js';

// Define your Supabase URL and public anon key
// These are environment variables injected at build time from `.env` or Vite config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Create a single Supabase client instance
// This is safe to share across your app and avoids reconnecting repeatedly
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Notes:
// - `createClient()` returns a configured Supabase client that can access
//   your database, authentication, storage, and more.
// - By using VITE_ prefixed env vars, you expose *only* these safe values to the frontend.
// - Never include the `service_role` key or anything private in a frontend-accessible file.

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase key:', supabaseAnonKey.slice(0, 8) + '...');

// 🔍 Real table connection test using 'templates'
async function testSupabaseConnection() {
	console.log('🔌 Performing Supabase connection test...');

	const { data, error } = await supabase.from('templates').select('id').limit(1);

	if (error) {
		console.error('❌ Supabase connection test failed:', error.message);
	} else {
		console.log('✅ Supabase connection test successful! Table access works.');
	}
}

// Only run the test during development
if (import.meta.env.DEV) {
	testSupabaseConnection();
}
