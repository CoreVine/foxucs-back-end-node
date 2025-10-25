// ...existing code...
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  { ...config, logging: config.logging || false }
);

const db = {};
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const fullPath = path.join(__dirname, file);
    const required = require(fullPath);

    // support CJS export function or { default: fn } (babel/ts)
    const modelDef = (typeof required === 'function') ? required : (required && required.default);

    if (typeof modelDef !== 'function') {
      console.warn(`Skipping "${file}" — module does not export a model function.`);
      return;
    }

    let model;
    
    // Handle both class-based and function-based models
    if (modelDef.prototype instanceof Sequelize.Model) {
      // Class-based model
      model = modelDef;
      model.init(sequelize, Sequelize.DataTypes);
    } else {
      // Function-based model
      model = modelDef(sequelize, Sequelize.DataTypes);
    }

    if (!model || !model.name) {
      console.warn(`Skipping "${file}" — returned value is not a valid Sequelize model.`);
      return;
    }

    db[model.name] = model;
  });

// call associate
Object.keys(db).forEach((name) => {
  if (db[name].associate) db[name].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;