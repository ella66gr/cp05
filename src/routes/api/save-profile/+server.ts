// src/routes/api/save-profile/+server.ts
import { json } from '@sveltejs/kit';
import { saveProfile } from '$lib/db';

export async function POST({ request }) {
  const profile = await request.json();
  const id = await saveProfile(profile);
  return json({ success: true, id });
}