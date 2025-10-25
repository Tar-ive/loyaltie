#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read the seed SQL file
const sqlFile = process.argv[2] || 'supabase/seed/clay_pit_seed.sql';
const sql = fs.readFileSync(sqlFile, 'utf8');

// Connection string from env
const password = 'loyaltie2025';
const host = 'aws-1-us-east-2.pooler.supabase.com';
const user = 'postgres.jfromyfuluqkzvobjcii';
const database = 'postgres';
const port = '6543';

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;

// Write SQL to temp file
const tmpFile = '/tmp/seed_temp.sql';
fs.writeFileSync(tmpFile, sql);

// Try to execute with psql if available, otherwise provide instructions
try {
  execSync(`which psql`, { stdio: 'ignore' });
  console.log('Executing seed file with psql...');
  execSync(`PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${user} -d ${database} -f ${tmpFile}`, {
    stdio: 'inherit'
  });
  console.log('✓ Seed data loaded successfully!');
} catch (error) {
  console.error('psql not found. Please install PostgreSQL client or use Supabase Dashboard SQL Editor.');
  console.error(`\nConnection string: ${connectionString}`);
  console.error(`\nSQL file location: ${sqlFile}`);
  process.exit(1);
}
