#!/usr/bin/env node
// Run SQL migrations against DATABASE_URL using node-postgres
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required to run migrations.');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf-8');

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Connected to database. Running migrations...');
    await client.query(sql);
    console.log('Migrations applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
