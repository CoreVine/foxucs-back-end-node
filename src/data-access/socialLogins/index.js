const { SocialLogin } = require('../../models');
const BaseRepository = require('../base.repository');
const { DatabaseError } = require('sequelize');

class SocialLoginRepository extends BaseRepository {
  constructor() {
    super(SocialLogin);
  }

  async findByProviderToken(provider_token) {
    try {
      return await this.model.findOne({
        where: { provider_token },
        include: [{ model: require('../../models').User, as: 'user' }]
      });
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async createSocialLogin(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
}

module.exports = SocialLoginRepository;
