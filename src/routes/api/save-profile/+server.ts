// src/routes/api/save-profile/+server.ts
import { json } from '@sveltejs/kit';
import { saveProfile } from '$lib/db';

export async function POST({ request }) {
  const profile = await request.json();
  const id = await saveProfile(profile);
  return json({ success: true, id });
}

async function saveToDatabase(profile: any) {
  const response = await fetch('/api/save-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profile)
  });

  const result = await response.json();
  if (result.success) {
    console.log('Saved to DB with ID:', result.id);
  } else {
    console.error('Save failed');
  }
}