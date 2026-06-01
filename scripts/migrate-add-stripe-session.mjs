/**
 * Migration: Add stripe_session_id to orders table
 *
 * Run once with: node scripts/migrate-add-stripe-session.mjs
 *
 * This adds the stripe_session_id column needed by the Stripe webhook
 * handler to store idempotency keys and prevent duplicate orders.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('🔄 Running migration: add stripe_session_id to orders...');

  // 1. Add stripe_session_id column (idempotent - won't fail if already exists)
  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE
  `;
  console.log('✅ Added stripe_session_id column to orders table');

  // 2. Add status 'paid' to any existing enum or check constraint if needed
  //    (most schemas use TEXT for status, so this is a no-op in that case)
  try {
    await sql`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT
    `;
    console.log('✅ Added stripe_payment_intent column to orders table');
  } catch (err) {
    console.log('ℹ️  stripe_payment_intent column may already exist:', err.message);
  }

  // 3. Add role column to auth_users if it doesn't exist
  await sql`
    ALTER TABLE auth_users
    ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  `;
  console.log('✅ Ensured role column exists on auth_users table');

  console.log('\n🎉 Migration complete!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
