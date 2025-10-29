const { Profile } = require('../../models');
const BaseRepository = require('../base.repository');
const { DatabaseError } = require('sequelize');

class ProfileRepository extends BaseRepository {
  constructor() {
    super(Profile);
  }

  async findByUserId(userId) {
    try {
      return await this.model.findOne({ where: { user_id: userId } });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async createProfile(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
}

module.exports = ProfileRepository;
