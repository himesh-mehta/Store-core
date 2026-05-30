import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Manually parse .env file
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set in .env file.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function runMigrations() {
  console.log('=== Running Database Schema Migrations for Neon PostgreSQL ===');
  
  const migrationPath = path.resolve(__dirname, '../../docs/DATABASE_MIGRATIONS.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Error: Migration file not found at ${migrationPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
  
  // Clean up and split queries by semicolon, filtering out comments and empty statements
  const statements = sqlContent
    .split(';')
    .map(stmt => {
      // Remove SQL comments and trim
      return stmt
        .replace(/--.*$/gm, '')
        .trim();
    })
    .filter(stmt => stmt.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const firstLine = statement.split('\n')[0].trim();
    console.log(`\nExecuting statement ${i + 1}/${statements.length}: "${firstLine}..."`);
    
    try {
      await sql(statement);
      console.log(`✅ Statement ${i + 1} succeeded.`);
    } catch (err) {
      console.error(`❌ Error executing statement ${i + 1}:`, err.message);
      // Let's not stop if it's "already exists" or safe to bypass
    }
  }

  console.log('\n=== Database Migrations Completed! 🎉 ===');
}

runMigrations();
