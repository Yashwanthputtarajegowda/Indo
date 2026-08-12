import fs from 'node:fs';

const config = fs.readFileSync('config/runtime-config.js', 'utf8');

if (/INDO_API_BASE\s*=\s*window\.INDO_API_BASE\s*\|\|\s*''/.test(config)) {
  console.log('Production API URL is intentionally unset in the repository template; configure it at deployment time.');
  process.exit(0);
}

if (!/INDO_API_BASE\s*=\s*['\"]https:\/\//.test(config)) {
  console.error('Invalid INDO_API_BASE production configuration. Expected an https:// URL or an explicit deployment-time override.');
  process.exit(1);
}

console.log('Frontend production API configuration is valid.');
