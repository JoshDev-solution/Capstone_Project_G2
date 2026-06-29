// This script runs at Railway startup to push the database schema.
// It's placed in prisma/ because Railway's Nixpacks copies this directory to runtime.
// prisma.config.ts at the project root is NOT copied, so we generate it here.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Generate prisma.config.js at runtime if it doesn't exist
const configPath = path.join(process.cwd(), 'prisma.config.js');
if (!fs.existsSync(configPath)) {
  const config = [
    'const { defineConfig } = require("@prisma/config");',
    'module.exports = defineConfig({',
    '  datasource: {',
    '    url: process.env.DATABASE_URL,',
    '  },',
    '  migrations: {',
    '    seed: "node dist/seed.js",',
    '  },',
    '});',
  ].join('\n');
  fs.writeFileSync(configPath, config);
  console.log('Generated prisma.config.js for runtime');
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set!');
  process.exit(1);
}

console.log('DATABASE_URL is set, pushing schema...');

try {
  execSync('npx prisma db push --schema=./prisma/schema.prisma', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Database schema pushed successfully!');
  
  // Run the seed script to ensure default users/roles exist
  console.log('Running database seed script...');
  execSync('npx prisma db seed', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Database seeded successfully!');
} catch (error) {
  console.error('Failed to push or seed database:', error.message);
  process.exit(1);
}
