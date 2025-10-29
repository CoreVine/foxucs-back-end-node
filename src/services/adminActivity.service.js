const { AdminActivityLog } = require('../models');
const loggingService = require('../infrastructure/logging.service');

const logger = loggingService.getLogger();

/**
 * Admin activity logging helper
 *
 * Usage patterns (recommended):
 *
 * 1) Fire-and-forget (recommended for request flow performance):
 *    // don't await — best-effort logging
 *    adminActivity.log({ admin_id: admin.id, action: 'create_user', resource: 'users', resource_id: user.id, route: req.originalUrl, ip: req.ip });
 *
 * 2) Await when you need the log entry for immediate processing (rare):
 *    const entry = await adminActivity.log({ admin_id, action: 'delete', resource: 'ads', resource_id });
 *
 * Fields:
 *  - admin_id (number) REQUIRED for any log to be created
 *  - action (string) REQUIRED: e.g. 'login', 'create_user', 'assign_roles'
 *  - resource (string) OPTIONAL: e.g. 'users', 'roles', 'ads'
 *  - resource_id (number|string) OPTIONAL: id of the affected resource
 *  - route (string) OPTIONAL: request originalUrl or route path
 *  - ip (string) OPTIONAL: request.ip
 *  - user_agent (string) OPTIONAL: request.headers['user-agent']
 *  - metadata (object) OPTIONAL: arbitrary JSON for contextual info (keep small)
 *
 * Notes:
 *  - The service swallows DB write errors and logs them — it will not throw. This prevents logging failures from breaking the request flow.
 *  - Keep metadata small and serializable. Avoid storing large objects or secrets.
 *  - Use `activityLogger.middleware` for automatic request->log wiring on routes. Manual calls are for business events inside controllers/services.
 */
const adminActivity = {
  async log({ admin_id = null, action, resource = null, resource_id = null, route = null, ip = null, user_agent = null, metadata = null }) {
    if (!admin_id || !action) {
      logger && logger.warn && logger.warn('[AdminActivity] Missing admin_id or action, skipping log', { admin_id, action });
      return null;
    }

    try {
      const entry = await AdminActivityLog.create({
        admin_id,
        action,
        resource,
        resource_id,
        route,
        ip,
        user_agent,
        metadata,
      });
      return entry;
    } catch (err) {
      logger && logger.error && logger.error('[AdminActivity] Failed to write activity log', { message: err.message, stack: err.stack });
      // swallow error to avoid impacting request flow
      return null;
    }
  },
};

module.exports = adminActivity;

