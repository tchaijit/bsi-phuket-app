#!/usr/bin/env node

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
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

const sql = postgres(process.env.DATABASE_URL);

async function addPartnerType() {
  try {
    console.log('🚀 Adding partner_type column...\n');

    // Check if column exists
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'partners' AND column_name = 'partner_type'
    `;

    if (columnCheck.length > 0) {
      console.log('✅ Column partner_type already exists!');
    } else {
      // Add column
      await sql`
        ALTER TABLE partners
        ADD COLUMN partner_type VARCHAR(20) NOT NULL DEFAULT 'partner'
      `;
      console.log('✅ Added partner_type column');

      // Add constraint
      await sql`
        ALTER TABLE partners
        ADD CONSTRAINT partners_partner_type_check
        CHECK (partner_type IN ('partner', 'competitor', 'opportunity'))
      `;
      console.log('✅ Added CHECK constraint');

      // Add index
      await sql`
        CREATE INDEX idx_partners_partner_type ON partners(partner_type)
      `;
      console.log('✅ Created index');

      console.log('\n✅ Successfully added partner_type column!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  } finally {
    await sql.end();
  }
}

addPartnerType();
