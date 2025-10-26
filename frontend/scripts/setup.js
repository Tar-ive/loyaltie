#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Clay Pit Chat Frontend...\n');

// Check if Node.js version is sufficient
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.log(`❌ Node.js version 18+ is required. Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js ${nodeVersion} detected\n`);

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.log('❌ Failed to install dependencies');
  process.exit(1);
}

// Create .env.local if it doesn't exist
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file\n');
} else {
  console.log('✅ .env.local already exists\n');
}

// Check if backend is running
console.log('🔍 Checking backend connection...');
try {
  execSync('curl -s http://localhost:8000/health', { stdio: 'pipe' });
  console.log('✅ Backend is running on http://localhost:8000\n');
} catch (error) {
  console.log('⚠️  Backend is not running. Please start the backend server first.');
  console.log('   Run: cd ../backend && python main.py\n');
}

console.log('🎉 Setup complete!\n');
console.log('To start the development server:');
console.log('  npm run dev\n');
console.log('Then open http://localhost:3000 in your browser\n');
console.log('Make sure your backend is running on http://localhost:8000');
