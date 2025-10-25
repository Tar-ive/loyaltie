#!/usr/bin/env node
const fs = require('fs');

const seedFile = 'supabase/seed/clay_pit_seed.sql';
let content = fs.readFileSync(seedFile, 'utf8');

// Replace ARRAY["..."] with ARRAY['...']
content = content.replace(/ARRAY\["/g, "ARRAY['");
content = content.replace(/"\]/g, "']");
content = content.replace(/","/g, "','");

fs.writeFileSync(seedFile, content);
console.log('✓ Fixed array syntax - changed double quotes to single quotes');
