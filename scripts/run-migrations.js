#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs schema.sql and rls.sql against the DATABASE_URL in order.
 *
 * Usage: node scripts/run-migrations.js
 *
 * Requires:
 *   - DATABASE_URL in .env.local (Supabase direct connection string)
 *   - pg package: npm install pg
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MIGRATION_FILES = [
  path.join(__dirname, '..', 'database', 'schema.sql'),
  path.join(__dirname, '..', 'database', 'rls.sql'),
  // Add incremental migrations below in order:
  path.join(__dirname, '..', 'database', 'migrations', '001_add_vector_index.sql'),
  path.join(__dirname, '..', 'database', 'migrations', '002_add_banned_users.sql'),
  path.join(__dirname, '..', 'database', 'migrations', '003_add_vector_match_rpc.sql'),
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required to run migrations.');
    console.error('   Add it to .env.local or set it as an environment variable.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const safeUrl = databaseUrl.replace(/:[^:@]+@/, ':***@');
    console.log('🔌 Connecting to database:', safeUrl);
    await client.connect();
    console.log('✅ Connected to database.\n');

    for (const filePath of MIGRATION_FILES) {
      const fileName = path.relative(path.join(__dirname, '..'), filePath);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${fileName} (file not found)`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`📄 Running ${fileName}...`);

      try {
        await client.query(sql);
        console.log(`   ✅ ${fileName} applied successfully.`);
      } catch (err) {
        console.error(`   ❌ ${fileName} failed: ${err.message}`);
        // Continue with other files instead of aborting
        // schema.sql uses IF NOT EXISTS so partial reruns are safe
      }
    }

    console.log('\n🎉 All migrations processed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    console.error('Stack:', err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
