const UserModel = require('../../models/User');
const BaseRepository = require('../base.repository');
const { DatabaseError, Op } = require("sequelize");

class UserRepository extends BaseRepository {
    constructor() {
        super(UserModel);
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
    async findByPhoneNumber(phoneNumber){
        try {
            return await this.model.findOne({
                where: { phone_number: phoneNumber }
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


module.exports = new UserRepository();
