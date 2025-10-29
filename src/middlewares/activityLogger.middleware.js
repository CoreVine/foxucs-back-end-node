const adminActivity = require('../services/adminActivity.service');

/**
 * activityLogger(actionName, resource?)
 * Logs action after the response finishes with status and minimal metadata
 */
module.exports = function activityLogger(actionName, resource = null) {
  return (req, res, next) => {
    const start = Date.now();

    function afterFinish() {
      res.removeListener('finish', afterFinish);
      const duration = Date.now() - start;
      const adminId = req.adminId || (req.admin && req.admin.id) || null;
      const status = res.statusCode;
      const action = actionName || `${req.method} ${req.path}`;

      // Store minimal metadata: status and duration
      const metadata = { status, duration };

      // Fire-and-forget logging
      try {
        if (adminId) {
          adminActivity.log({ admin_id: adminId, action, resource, route: req.originalUrl, ip: req.ip, user_agent: req.headers['user-agent'], metadata });
        }
      } catch (e) {
        // swallow logging errors
        console.error('Activity log failed', e.message);
      }
    }

    res.on('finish', afterFinish);
    next();
  };
};
