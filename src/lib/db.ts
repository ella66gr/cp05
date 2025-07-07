// src/lib/db.ts - Using SvelteKit environment variables
import { Pool } from 'pg';
import { DATABASE_URL } from '$env/static/private';
import type { DatabaseProfile, ProfileData } from './types';

// Validate environment variables
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Please check your .env file.');
}

console.log('Database URL loaded:', DATABASE_URL ? '✅ Found' : '❌ Missing');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test if profiles table exists
    const result = await client.query("SELECT to_regclass('profiles') as table_exists");
    if (result.rows[0].table_exists) {
      console.log('✅ Profiles table found');
    } else {
      console.warn('⚠️ Profiles table not found - you may need to create it');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Call test connection in development
if (process.env.NODE_ENV !== 'production') {
  testDatabaseConnection().catch(console.error);
}

export async function saveProfile(profile: DatabaseProfile) {
  console.log('🔄 Attempting to save profile to database...');
  console.log('📝 Profile data:', {
    name: profile.profile_name,
    description: profile.profile_description?.substring(0, 50) + '...',
    isActive: profile.is_active,
    hasJson: !!profile.profile_json
  });
  
  const { profile_name, profile_description, is_active, profile_json } = profile;

  const query = `
    INSERT INTO profiles (profile_name, profile_description, is_active, profile_json)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created_at;
  `;

  const values = [
    profile_name,
    profile_description || '',
    is_active,
    profile_json // Your schema expects JSONB directly, not stringified
  ];

  const client = await pool.connect();
  try {
    console.log('📝 Executing database query...');
    const result = await client.query(query, values);
    console.log('✅ Profile saved successfully with ID:', result.rows[0].id);
    
    return {
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    };
  } catch (error) {
    console.error('❌ Database save error:', error);
    console.error('❌ Query values:', values);
    throw error;
  } finally {
    client.release();
  }
}

export async function getProfile(id: string): Promise<DatabaseProfile | null> {
  const query = `
    SELECT id, profile_name, profile_description, is_active, profile_json, created_at, updated_at
    FROM profiles 
    WHERE id = $1;
  `;

  const client = await pool.connect();
  try {
    const result = await client.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      profile_name: row.profile_name,
      profile_description: row.profile_description,
      is_active: row.is_active,
      profile_json: row.profile_json // Already parsed as object due to JSONB
    };
  } finally {
    client.release();
  }
}

export async function getAllProfiles(): Promise<Array<{
  id: string;
  profile_name: string;
  profile_description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}>> {
  const query = `
    SELECT id, profile_name, profile_description, is_active, created_at, updated_at
    FROM profiles 
    ORDER BY updated_at DESC;
  `;

  const client = await pool.connect();
  try {
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateProfile(id: string, profile: DatabaseProfile) {
  const { profile_name, profile_description, is_active, profile_json } = profile;

  const query = `
    UPDATE profiles 
    SET profile_name = $1, profile_description = $2, is_active = $3, profile_json = $4
    WHERE id = $5
    RETURNING id, updated_at;
  `;

  const values = [
    profile_name,
    profile_description || '',
    is_active,
    profile_json, // JSONB, not stringified
    id
  ];

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Profile not found');
    }
    return {
      id: result.rows[0].id,
      updated_at: result.rows[0].updated_at
    };
  } finally {
    client.release();
  }
}

export async function deleteProfile(id: string): Promise<boolean> {
  const query = `DELETE FROM profiles WHERE id = $1 RETURNING id;`;

  const client = await pool.connect();
  try {
    const result = await client.query(query, [id]);
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

// Helper function to validate profile data before database operations
export function validateProfileForDatabase(profile: DatabaseProfile): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!profile.profile_name || profile.profile_name.trim().length === 0) {
    errors.push('Profile name is required');
  }

  if (profile.profile_name && profile.profile_name.length > 255) {
    errors.push('Profile name must be less than 255 characters');
  }

  if (profile.profile_description && profile.profile_description.length > 1000) {
    errors.push('Profile description must be less than 1000 characters');
  }

  if (!profile.profile_json) {
    errors.push('Profile data is required');
  }

  // Validate the JSON structure
  if (profile.profile_json) {
    const requiredFields = ['profile_name', 'metadata'];
    for (const field of requiredFields) {
      if (!(field in profile.profile_json)) {
        errors.push(`Profile JSON missing required field: ${field}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}