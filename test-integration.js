import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

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

console.log('=== Starting Programmatic Integration Test ===');
console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Loaded ✅' : 'Missing ❌');
console.log('Postgres URL:', process.env.DATABASE_URL ? 'Loaded ✅' : 'Missing ❌');
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Loaded ✅' : 'Missing ❌');

async function runTests() {
  // Test 1: Neon Database Connectivity
  if (process.env.DATABASE_URL) {
    try {
      console.log('\n--- Test 1: Checking Neon PostgreSQL connectivity ---');
      const sql = neon(process.env.DATABASE_URL);
      
      // Check if table auth_users exists
      try {
        const users = await sql`SELECT * FROM auth_users LIMIT 1`;
        console.log('Neon Database Connection: SUCCESS! 🎉');
        console.log('Table "auth_users" exists and is queryable.');
      } catch (err) {
        if (err.message.includes('relation "auth_users" does not exist')) {
          console.log('Neon Database Connection: SUCCESS! 🎉');
          console.log('⚠️ WARNING: Table "auth_users" does not exist. Did you run the migrations inside docs/DATABASE_MIGRATIONS.sql?');
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('❌ Neon Connection Failed:', err.message);
    }
  } else {
    console.log('\n❌ Test 1 Skipped: DATABASE_URL not set.');
  }

  // Test 2: Stripe Integration
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      console.log('\n--- Test 2: Checking Stripe Payments SDK & Key ---');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'CampusOne Test T-Shirt',
                description: 'Verifying full-flow storefront payment integration',
              },
              unit_amount: 1500, // $15.00
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4000/orders?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:4000/cart',
        customer_email: 'test-user@campusone.edu',
      });

      console.log('Stripe SDK Integration: SUCCESS! 🎉');
      console.log('Generated Stripe Checkout URL:', session.url);
    } catch (err) {
      console.error('❌ Stripe checkout creation failed:', err.message);
    }
  } else {
    console.log('\n❌ Test 2 Skipped: STRIPE_SECRET_KEY not set.');
  }
}

runTests();
