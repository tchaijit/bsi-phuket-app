#!/usr/bin/env node

/**
 * Database Migration Runner
 * Run with: node scripts/run-migration.mjs
 */

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/001_add_partner_type.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration: 001_add_partner_type.sql');

    // Execute migration (split by semicolon and run each statement)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - Added partner_type column to partners table');
    console.log('   - Created index on partner_type');
    console.log('   - Default value set to "partner" for all existing records\n');

  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('⚠️  Column partner_type already exists in the database.');
      console.log('✅ Migration already applied, skipping.\n');
    } else {
      console.error('❌ Migration failed:', error.message);
      console.error('\nFull error:', error);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

runMigration();
