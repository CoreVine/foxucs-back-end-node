const { User } = require('../../models');
const BaseRepository = require('../base.repository');
const { DatabaseError, Op } = require("sequelize");

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }
    async findByEmail(email){
        try {
            return await this.model.findOne({
                where: { email }
            });
        } catch (error) {
            throw new DatabaseError(error);
        }
    }
    async createUnverifiedUser(data) {
    try {
      return await this.model.create({
        ...data,
        is_email_verified: false,
        is_phone_verified: false
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
  async markEmailVerified(userId) {
    try {
      return await this.model.update(
        { is_email_verified: true },
        { where: { user_id: userId } }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
    async markPhoneVerified(userId) {
    try {
      return await this.model.update(
        { is_phone_verified: true },
        { where: { user_id: userId } }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
    async findByPhone(phone){
        try {
            return await this.model.findOne({
                where: { phone_number: phone }
            });
        } catch (error) {
            throw new DatabaseError(error);
        }
    }
    async findByEmailOrPhone(email, phone) {
        try {
            return await this.model.findOne({
                where: {
                    [Op.or]: [
                        email ? { email } : null,
                        phone ? { phone_number: phone } : null
                    ].filter(Boolean)
                }
            });
        } catch (error) {
            throw new DatabaseError(error);
        }
    }
    async findById(id){
        try {
            return await this.model.findByPk(id);
        } catch (error) {
            throw new DatabaseError(error);
        }
    }
 // New: convenience search used by registration/login flows
    async findOneByEmailOrUsername({ email, username }) {
        try {
            return await this.model.findOne({
                where: {
                    [Op.or]: [
                        email ? { email } : null,
                        username ? { username } : null
                    ].filter(Boolean)
                }
            });
        } catch (error) {
            throw new DatabaseError(error);
        }
    }

    async findOneByPhoneOrUsername({ phone_number, username }) {
        try {
            return await this.model.findOne({
                where: {
                    [Op.or]: [
                        phone_number ? { phone_number } : null,
                        username ? { username } : null
                    ].filter(Boolean)
                }
            });
        } catch (error) {
            throw new DatabaseError(error);
        }
    }

    async createUser(userData){
        try {
            return await this.model.create(userData);
        } catch (error) {
            throw new DatabaseError(error);
        }
    }
}


module.exports = UserRepository;
