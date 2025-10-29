// Simple test script to verify Cloudinary uploads using the project's CloudinaryService.
// Usage:
// 1) Set env vars (see docs/cloudinary-setup.md) then run:
//    node scripts/test-cloudinary.js /path/to/local/image.jpg

const path = require('path');
const CloudinaryService = require('../src/infrastructure/cloudinary.service');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/test-cloudinary.js /path/to/file');
    process.exit(2);
  }

  try {
    // initialize config from env
    CloudinaryService.init && CloudinaryService.init();

    console.log('[test-cloudinary] Uploading', file);
    const res = await CloudinaryService.uploadFile(path.resolve(file), { folder: 'dev-test' });
    console.log('[test-cloudinary] Upload successful:', res.secure_url || res.url);
    process.exit(0);
  } catch (err) {
    console.error('[test-cloudinary] Upload failed:', err.message);
    process.exit(1);
  }
}

main();
