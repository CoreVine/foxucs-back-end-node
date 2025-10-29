const ApiErrors = require('./types/Api.error');
const SequelizeErrors = require('./types/Sequelize.error');

module.exports = {
    // API Errors
    NotFoundError: ApiErrors.NotFoundError,
    BadRequestError: ApiErrors.BadRequestError,
    ValidationError: ApiErrors.ValidationError,
    BadTokenError: ApiErrors.BadTokenError,
    TokenExpiredError: ApiErrors.TokenExpiredError,
    UnauthorizedError: ApiErrors.UnauthorizedError,
    ForbiddenError: ApiErrors.ForbiddenError,
    InternalServerError: ApiErrors.InternalServerError,
    CorsError: ApiErrors.CorsError,
    VerificationCodeExpiredError: ApiErrors.VerificationCodeExpiredError,
    VerificationCodeInvalidError: ApiErrors.VerificationCodeInvalidError,
    PasswordResetRequiredError: ApiErrors.PasswordResetRequiredError,
    InvalidResetTokenError: ApiErrors.InvalidResetTokenError,
    ResetTokenUsedError: ApiErrors.ResetTokenUsedError,
    TooManyAttemptsError: ApiErrors.TooManyAttemptsError,
    // Database Errors
    DatabaseError: SequelizeErrors.DatabaseError,
    // Utils
    isApiError: ApiErrors.isApiError,
    isDatabaseError: SequelizeErrors.isDatabaseError,
};
