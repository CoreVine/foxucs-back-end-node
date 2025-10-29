# Admin Activity Service

This document explains how to use the `adminActivity` logging service in the codebase.

Location

- Service code: `src/services/adminActivity.service.js`
- Middleware that uses it: `src/middlewares/activityLogger.middleware.js`
- Admin activity model: `src/models/AdminActivityLog.js`

Purpose

The service provides a lightweight way to persist admin audit actions to `admin_activity_logs`. It's intended for audit, troubleshooting and security telemetry.

Design principles

- Best-effort writes: logging failures are swallowed and only recorded to the app logger. This avoids breaking business flows because of logging issues.
- Keep metadata small and serializable (JSON). Don't store secrets or large blobs.
- Prefer fire-and-forget calls in request handlers for minimal latency impact. Only `await` the call if you need the DB row synchronously.

API

The service exposes a single method:

- `adminActivity.log(options)` — creates a log entry and returns the created instance, or `null` on failure.

Options (object)

- `admin_id` (number) — required. Admin who performed the action.
- `action` (string) — required. Action name (e.g. `login`, `create_user`, `assign_roles`).
- `resource` (string) — optional. Resource type affected (e.g. `users`, `roles`).
- `resource_id` (string|number) — optional. ID of the resource affected.
- `route` (string) — optional. Request route or URL.
- `ip` (string) — optional. Request IP.
- `user_agent` (string) — optional. Request User-Agent header.
- `metadata` (object) — optional. Arbitrary JSON with contextual fields.

Examples

1) Fire-and-forget (recommended):

```js
// inside a controller after creating a user
adminActivity.log({
  admin_id: req.adminId,
  action: 'create_user',
  resource: 'users',
  resource_id: newUser.id,
  route: req.originalUrl,
  ip: req.ip,
  user_agent: req.headers['user-agent'],
  metadata: { note: 'created via admin panel' }
});

// do not await; logging is best-effort
```

2) Await the entry when you need it immediately (rare):

```js
const entry = await adminActivity.log({ admin_id, action: 'delete', resource: 'ads', resource_id: adId });
if (entry) {
  // use entry.id or other fields
}
```

3) Use from middleware (already wired):

The project provides `activityLogger(actionName, resource)` middleware located at `src/middlewares/activityLogger.middleware.js`.
It automatically calls `adminActivity.log` after the response finishes with minimal metadata (status, duration). Example usage in a route:

```js
router.post('/admin/:id/roles', adminAuth, requireRole('super_admin'), activityLogger('assign_roles', 'roles'), adminController.assignRoles);
```

Querying logs

- The admin controller exposes an endpoint `GET /admin/activity` that returns recent logs for the current admin (see `src/controllers/admin.controller.js`).
- Raw SQL example to inspect logs:

```sql
SELECT * FROM admin_activity_logs WHERE admin_id = 1 ORDER BY created_at DESC LIMIT 100;
```

Performance & safety notes

- Because writes are swallowed on error, investigate failures via the application logger; the service logs failures via the logging service.
- Avoid logging extremely sensitive fields in `metadata`. If you need to store sensitive audit data, ensure you redact or encrypt it according to your security policy.

Extending

- You can extend the middleware to include additional contextual fields (e.g., `tenant_id`) by passing an extended metadata object.
- If activity logging becomes high-volume, consider batching writes or routing logs to an append-only store (Redis stream, Kafka) and processing them asynchronously.

Contact

If you want a different default format for `metadata`, or want the middleware to record additional request context, open a PR or request the change in the `#backend` channel.
