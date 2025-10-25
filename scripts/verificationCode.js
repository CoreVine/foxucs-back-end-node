// javascript
/**
 * Tests for src/models/verificationCode.js init()
 *
 * Plan:
 * 1. Create in-memory Sequelize instance
 * 2. Call VerificationCode.init(sequelize)
 * 3. Assert model is registered
 * 4. Inspect rawAttributes for fields and metadata (allowNull, primaryKey, autoIncrement, defaultValue, unique)
 * 5. Assert verify_type is ENUM with expected values
 * 6. Inspect model.options for tableName, timestamps, createdAt/updatedAt, indexes
 * 7. Build empty instance and call validate() to ensure required fields enforce validation
 * 8. Close sequelize instance
 */

const { Sequelize, ValidationError } = require('sequelize');
const VerificationCode = require('./verificationCode');

describe('VerificationCode model init', () => {
  let sequelize;
  let Model;

  beforeAll(async () => {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
    // Initialize model
    VerificationCode.init(sequelize);
    // Sync so indexes/options are applied (not strictly necessary for attribute checks, but safe)
    await sequelize.sync({ force: true });
    Model = sequelize.models.VerificationCode;
  });

  afterAll(async () => {
    if (sequelize) await sequelize.close();
  });

  test('model is registered on sequelize', () => {
    expect(Model).toBeDefined();
    expect(Model.name).toBe('VerificationCode');
  });

  test('defines expected attributes with correct metadata', () => {
    const attrs = Model.rawAttributes;

    // Required attributes exist
    const expectedAttrs = [
      'id', 'email', 'phone', 'code', 'type', 'verified',
      'reset_token', 'token_used', 'attempt_count', 'expires_at',
      'verify_type', 'created_at', 'updated_at'
    ];
    expectedAttrs.forEach((a) => {
      expect(attrs).toHaveProperty(a);
    });

    // id primary key & autoIncrement
    expect(attrs.id.primaryKey).toBe(true);
    expect(attrs.id.autoIncrement).toBe(true);

    // email & phone allow null
    expect(attrs.email.allowNull).toBe(true);
    expect(attrs.phone.allowNull).toBe(true);

    // code and type are required (allowNull=false)
    expect(attrs.code.allowNull).toBe(false);
    expect(attrs.type.allowNull).toBe(false);

    // expires_at required
    expect(attrs.expires_at.allowNull).toBe(false);

    // verify_type is present and not null
    expect(attrs.verify_type.allowNull).toBe(false);

    // verified default value
    expect(attrs.verified.defaultValue).toBe(false);

    // token_used default value
    expect(attrs.token_used.defaultValue).toBe(false);

    // attempt_count default value
    expect(attrs.attempt_count.defaultValue).toBe(0);

    // reset_token unique
    // unique can be boolean or object; check attribute._unique or attribute.unique
    const isUnique = attrs.reset_token.unique === true || attrs.reset_token._isUnique === true;
    expect(isUnique).toBeTruthy();
  });

  test('verify_type is an ENUM with expected values', () => {
    const verifyTypeAttr = Model.rawAttributes.verify_type;
    const type = verifyTypeAttr.type;
    // Sequelize's ENUM stores values in type.values
    expect(Array.isArray(type.values)).toBe(true);
    expect(type.values).toEqual(expect.arrayContaining(['phone', 'email']));
  });

  test('model options set correctly (tableName, timestamps, createdAt/updatedAt)', () => {
    const opts = Model.options;
    expect(opts.tableName).toBe('verification_codes');
    expect(opts.timestamps).toBe(true);
    expect(opts.createdAt).toBe('created_at');
    expect(opts.updatedAt).toBe('updated_at');
  });

  test('indexes include expected named indexes and fields', () => {
    const indexes = Model.options.indexes || [];
    const findByName = (name) => indexes.find((idx) => idx.name === name);

    const idx1 = findByName('tride_verification_code_email_type_idx');
    expect(idx1).toBeDefined();
    // idx1.fields may be array of strings or objects { attribute }
    const fields1 = (idx1.fields || []).map(f => (typeof f === 'string' ? f : (f.attribute || f.name)));
    expect(fields1).toEqual(expect.arrayContaining(['email', 'type']));

    const idx2 = findByName('tride_verification_code_reset_token_idx');
    expect(idx2).toBeDefined();
    const fields2 = (idx2.fields || []).map(f => (typeof f === 'string' ? f : (f.attribute || f.name)));
    expect(fields2).toEqual(expect.arrayContaining(['reset_token']));

    const idx3 = findByName('tride_verification_code_expires_at_idx');
    expect(idx3).toBeDefined();
    const fields3 = (idx3.fields || []).map(f => (typeof f === 'string' ? f : (f.attribute || f.name)));
    expect(fields3).toEqual(expect.arrayContaining(['expires_at']));
  });

  test('validation rejects instance missing required fields', async () => {
    const instance = Model.build({});
    await expect(instance.validate()).rejects.toThrow(ValidationError);
  });
});