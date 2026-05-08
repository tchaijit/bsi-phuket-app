import postgres from 'postgres';

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not defined. Please add it to your .env.local file.'
  );
}

// Create postgres connection
// Using connection pooling for optimal performance
export const sql = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements to avoid cache issues after schema changes
});

// Test connection function
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully:', result[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Export types for database queries
export type PartnerRow = {
  id: string;
  name_en: string;
  name_th: string | null;
  partner_type: string | null; // Nullable for backward compatibility
  category: string;
  zone: string;
  lat: number;
  lng: number;
  strategic_note: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
};

export type ContractRow = {
  id: string;
  partner_id: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  renewal_owner: string | null;
  value: number | null;
  created_at: Date;
  updated_at: Date;
};

export type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  name: string | null;
  email: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ActivityLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: Date;
};
