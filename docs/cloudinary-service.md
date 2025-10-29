# CloudinaryService — usage guide

This doc explains how to use `src/infrastructure/cloudinary.service.js` from controllers and middleware.

Summary

- `CloudinaryService.init()` — configures the SDK from env vars.
- `CloudinaryService.uploadFile(filePath, options)` — upload a file by path.
- `CloudinaryService.uploadBuffer(buffer, filename, options)` — upload from a Buffer (multer memory storage) by writing to a temp file first.

Environment variables

The service reads these environment variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Set them before starting the app (see `docs/cloudinary-setup.md`).

Controller examples

1) Disk-backed multer (multer stores file on disk as `req.file.path`)

```js
const CloudinaryService = require('../infrastructure/cloudinary.service');

// in your handler
async function uploadProfile(req, res, next) {
  try {
    // ensure cloudinary configured
    CloudinaryService.init();

    if (req.file && req.file.path) {
      // upload as image (default)
      const result = await CloudinaryService.uploadFile(req.file.path, { folder: 'profiles' });
      // result.secure_url contains the uploaded URL
      return res.json({ url: result.secure_url });
    }

    return res.status(400).json({ message: 'No file uploaded' });
  } catch (err) {
    next(err);
  }
}
```

2) Memory-backed multer (use `uploadBuffer`)

```js
// multer configured with memoryStorage
// req.file.buffer available
const result = await CloudinaryService.uploadBuffer(req.file.buffer, req.file.originalname, { folder: 'profiles' });
```

3) Non-image files (documents, text) — use raw resource type

```js
// Upload a text file
const result = await CloudinaryService.uploadFile('/tmp/file.txt', { folder: 'docs', resource_type: 'raw' });
// or via buffer
const result = await CloudinaryService.uploadBuffer(buffer, 'file.txt', { folder: 'docs', resource_type: 'raw' });
```

API options and examples

- `folder` — logical folder inside your Cloudinary account.
- `public_id` — set a public id to control the filename.
- `resource_type` — `'image'` (default) or `'raw'` for non-image files.
- `transformation` — Cloudinary transformations for images.

Example with transformation:

```js
const result = await CloudinaryService.uploadFile('/tmp/photo.jpg', {
  folder: 'profiles',
  transformation: [{ width: 400, height: 400, crop: 'fill' }]
});
```

Error handling

- The service throws Cloudinary SDK errors (which include messages from the API). Wrap calls in try/catch in controllers and pass errors to your error handler.
- The service logs errors via the project's logging service.

Best practices

- Call `CloudinaryService.init()` during app bootstrap or at the start of controllers that perform uploads.
- Prefer `uploadBuffer` for multer memory storage to avoid re-reading the uploaded buffer separately.
- Use `{ resource_type: 'raw' }` for non-image files.
- Keep metadata small and avoid sending secrets to the upload options.

Testing locally

- Use `scripts/test-cloudinary.js` to test uploads. Example:

```bash
CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... node scripts/test-cloudinary.js path/to/file.jpg
```

Security

- Do not commit Cloudinary API keys to the repo. Use `.env`, direnv, or secret managers.
- Rotate keys if they were exposed.

If you want, I can:
- Add auto-detection of `resource_type` based on file MIME and set `resource_type: 'raw'` automatically for non-image files.
- Add an optional streaming uploader to avoid writing to disk in `uploadBuffer`.

