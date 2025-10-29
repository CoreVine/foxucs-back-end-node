# Cloudinary setup and safe usage

This doc explains how to configure Cloudinary credentials for local development and how to test uploads using the project's CloudinaryService.

IMPORTANT: These credentials are sensitive. Do NOT commit secrets to version control. Use environment variables, direnv, or a secret manager.

1) Environment variables (temporary, zsh)

Run these commands in your terminal (zsh) to set variables for the current shell session:

```bash
export CLOUDINARY_CLOUD_NAME="<your-cloud-name>"
export CLOUDINARY_API_KEY="<your-api-key>"
export CLOUDINARY_API_SECRET="<your-api-secret>"
```

If you want to apply the values the user provided for a quick local test, substitute them (example shown below). Only do this on your development machine.

```bash
export CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
export CLOUDINARY_API_KEY="275416113413271"
export CLOUDINARY_API_SECRET="F9cAUdFB_A7Ep5vcG33uwsWjM78"
```

2) Persisting for your shell (safer: use direnv)

- Minimal approach (adds to `~/.zshrc`) — NOT recommended for shared machines or CI:

```bash
# add to end of ~/.zshrc
echo 'export CLOUDINARY_CLOUD_NAME="your_cloud_name"' >> ~/.zshrc
echo 'export CLOUDINARY_API_KEY="your_api_key"' >> ~/.zshrc
echo 'export CLOUDINARY_API_SECRET="your_api_secret"' >> ~/.zshrc
# reload
source ~/.zshrc
```

- Recommended for per-project secrets: use `direnv` or a `.env` file plus `dotenv` or `cross-env` in your run scripts.

3) Using a .env file (do NOT commit)

Create a `.env` file in the project root and add it to `.gitignore`.

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=275416113413271
CLOUDINARY_API_SECRET=F9cAUdFB_A7Ep5vcG33uwsWjM78
```

Then in development you can load values using `dotenv` in your startup script (if your project uses it). The project's `CloudinaryService` reads from `process.env` so it works as soon as the variables exist.

4) Using a secrets manager (production)

For production, use a secrets manager (AWS Secrets Manager, Azure Key Vault, Google Secret Manager, or Vault). Inject environment variables into your runtime rather than putting secrets in files.

5) How the project uses these env vars

`src/infrastructure/cloudinary.service.js` expects these env variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The service exposes `init()` which configures the Cloudinary SDK from `process.env`:

```js
const CloudinaryService = require('./src/infrastructure/cloudinary.service');
CloudinaryService.init();
```

Controllers that upload files (for example `src/controllers/profile.controller.js`) call `CloudinaryService.init()` before uploading; therefore you just need to ensure env vars are set before starting the server.

6) Test upload script

A small helper is added at `scripts/test-cloudinary.js`.

Usage (zsh):

```bash
# set env vars first (one-liner example)
export CLOUDINARY_CLOUD_NAME="your_cloud_name"; export CLOUDINARY_API_KEY="275416113413271"; export CLOUDINARY_API_SECRET="F9cAUdFB_A7Ep5vcG33uwsWjM78"

# run test (replace with a real local file)
node scripts/test-cloudinary.js path/to/image.jpg
```

Expected output on success:

```
[test-cloudinary] Uploading path/to/image.jpg
[test-cloudinary] Upload successful: https://res.cloudinary.com/...
```

7) Safety & rotation

- If these credentials were accidentally exposed/committed, rotate them immediately in your Cloudinary console and update your environment.
- Use least-privilege API keys in production and rotate regularly.

8) Troubleshooting

- If you see warnings about missing config when starting the server, verify the env variables are present in the environment that started the server (for example your process manager or systemd/env file).
- Errors from Cloudinary will be logged by the project's logging service; check server logs for details.

If you want, I can:
- Add a GitHub Actions/CI secret configuration snippet for deploying these env vars to your staging/production jobs.
- Add a `dotenv`-based loader for local development and ensure `.env` is in `.gitignore`.

