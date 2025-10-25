#!/usr/bin/env node
const fs = require('fs');

const seedFile = 'supabase/seed/clay_pit_seed.sql';
let content = fs.readFileSync(seedFile, 'utf8');

// Find and extract the customer_segments section
const segmentsStart = content.indexOf('-- Customer segments\n\ninsert into public.customer_segments');
const segmentsEnd = content.indexOf('\n\n-- Segment membership');
const segmentsSection = content.substring(segmentsStart, segmentsEnd);

// Find the discounts section
const discountsStart = content.indexOf('-- Discounts\n\ninsert into public.discounts');

// Remove segments from its current location
content = content.substring(0, segmentsStart) + content.substring(segmentsEnd);

// Insert segments before discounts
const newDiscountsStart = content.indexOf('-- Discounts\n\ninsert into public.discounts');
content = content.substring(0, newDiscountsStart) +
          segmentsSection + '\n\n' +
          content.substring(newDiscountsStart);

// Write back
fs.writeFileSync(seedFile, content);
console.log('✓ Fixed seed file ordering - customer_segments now before discounts');
