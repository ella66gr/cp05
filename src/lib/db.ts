// src/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function saveProfile(profile: any) {
  const { profile_name, profile_description } = profile;

  const query = `
    INSERT INTO profiles (profile_name, profile_description, is_active, profile_json)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;

  const values = [
    profile_name,
    profile_description || '',
    true,
    profile
  ];

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0].id;
  } finally {
    client.release();
  }
}