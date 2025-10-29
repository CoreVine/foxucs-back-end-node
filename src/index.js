const dotenv = require("dotenv");
const expressService = require("./infrastructure/express.service");
const sequelizeService = require("./infrastructure/sequelize.service");
const awsService = require("./infrastructure/aws.service");
const emailService = require("./infrastructure/email.service");
const redisService = require("./infrastructure/redis.service");
dotenv.config();

const services = [expressService, awsService, sequelizeService, emailService, redisService/*, smsService*/ ];

(async () => {
  try {
    for (const service of services) {
      await service.init();
    }
    // Import logging service after initialization to avoid circular dependencies
    const loggingService = require("./infrastructure/logging.service");
    const logger = loggingService.getLogger();
    logger.info("Server initialized successfully");
    //PUT ADDITIONAL CODE HERE...
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
})();
