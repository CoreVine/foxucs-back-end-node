const db = require('../src/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connection OK');
    // show model attributes to confirm models loaded
    console.log('Models:', Object.keys(db));
    console.log('User attributes:', Object.keys(db.User.rawAttributes));
    await db.sequelize.close();
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
})();