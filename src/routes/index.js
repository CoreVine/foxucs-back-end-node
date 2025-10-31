const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Default route
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' });
});

// Dynamically load all route files in this directory
// This allows you to add new route files without modifying this index file
fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && 
           file !== path.basename(__filename) && 
           file.slice(-3) === '.js';
  })
  .forEach(file => {
    const route = require(path.join(__dirname, file));
    // Some files in this directory may be commented-out or not export a Router.
    // Ensure the required module is an express Router (or middleware function) before using it.
    const isRouter = (r) => {
      if (!r) return false;
      if (typeof r === 'function') return true; // middleware or Router
      if (typeof r === 'object' && (Array.isArray(r.stack) || typeof r.use === 'function')) return true;
      return false;
    };

    if (file === 'auth.routes.js' && isRouter(route)) {
      router.use('/auth', route);
    } else if (isRouter(route)) {
      router.use(route);
    } else {
      // skip non-router modules (e.g., commented-out route files)
      // console.warn(`Skipping non-router file: ${file}`);
    }
  });

module.exports = router;
