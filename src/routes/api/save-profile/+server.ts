// src/routes/api/save-profile/+server.ts - Updated server route
import { json, error } from '@sveltejs/kit';
import { saveProfile, validateProfileForDatabase } from '$lib/db';
import type { DatabaseProfile } from '$lib/types';

export async function POST({ request }) {
  try {
    const profile: DatabaseProfile = await request.json();
    
    // Validate the profile data
    const validation = validateProfileForDatabase(profile);
    if (!validation.isValid) {
      return json(
        { 
          success: false, 
          errors: validation.errors 
        }, 
        { status: 400 }
      );
    }
    
    // Save to database
    const result = await saveProfile(profile);
    
    return json({ 
      success: true, 
      id: result.id,
      created_at: result.created_at,
      message: 'Profile saved successfully'
    });
    
  } catch (err) {
    console.error('Database save error:', err);
    
    return json(
      { 
        success: false, 
        error: 'Failed to save profile to database',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET method to retrieve profiles
export async function GET({ url }) {
  try {
    const profileId = url.searchParams.get('id');
    
    if (profileId) {
      // Get specific profile
      const { getProfile } = await import('$lib/db');
      const profile = await getProfile(profileId); // UUID string, not parseInt
      
      if (!profile) {
        return json({ success: false, error: 'Profile not found' }, { status: 404 });
      }
      
      return json({ success: true, profile });
    } else {
      // Get all profiles
      const { getAllProfiles } = await import('$lib/db');
      const profiles = await getAllProfiles();
      
      return json({ success: true, profiles });
    }
    
  } catch (err) {
    console.error('Database retrieval error:', err);
    
    return json(
      { 
        success: false, 
        error: 'Failed to retrieve profiles from database',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}