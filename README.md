# alex-0d18-voltmart

A Next.js storefront with catalog browsing, cart checkout, order confirmation, admin product/order management, PostgreSQL persistence, private S3-compatible object storage for product images, and platform email notifications.

## Requirements

- Node.js 20.19 or newer
- npm
- PostgreSQL 16 or compatible PostgreSQL database
- S3-compatible private object storage using the exact `OBJECT_STORAGE_*` variables in `.env.example`

## Environment

Copy `.env.example` to the runtime environment and replace every placeholder value.

Required production variables:

- `DATABASE_URL`
- `SELF_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `OBJECT_STORAGE_ACCESS_KEY_ID`
- `OBJECT_STORAGE_SECRET_ACCESS_KEY`
- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_PREFIX`
- `OBJECT_STORAGE_ENDPOINT`
- `OBJECT_STORAGE_REGION`
- `OBJECT_STORAGE_FORCE_PATH_STYLE`

Email notification variables:

- `MCTAI_EMAIL_URL`
- `MCTAI_EMAIL_APP_TOKEN`

If the email variables are absent, checkout still succeeds and the admin notification is skipped. Object storage variables are required when image upload or image signing routes are used. The app stores relative object keys in PostgreSQL and prepends `OBJECT_STORAGE_PREFIX` at every S3 operation.

## Local Verification

```bash
npm ci
export DATABASE_URL="postgresql://..."
npm run prisma:migrate
npm run build
npm test
npm run test:e2e
```

`npm run test:e2e` starts the app on `0.0.0.0:8080`, seeds the catalog, runs the shopping/admin order flow, and requires a reachable PostgreSQL database.

## Self-Hosted Deployment

This app is prepared for a bare file/directory deployment. Do not use Docker for this deployment path.

1. Install dependencies and generate Prisma artifacts on the build machine:

   ```bash
   npm ci
   npm run prisma:generate
   ```

2. Run database migrations against the production PostgreSQL database:

   ```bash
   export DATABASE_URL="postgresql://..."
   npm run prisma:migrate
   ```

3. Build the standalone server bundle:

   ```bash
   npm run build
   ```

4. Create a release directory and copy the generated files:

   ```bash
   mkdir -p release/.next
   cp -R .next/standalone/. release/
   cp -R .next/static release/.next/static
   cp -R public release/public
   ```

5. Provide the production environment variables to the process manager. Keep real secrets out of the copied directory unless your host explicitly manages secret files.

6. Start the server from the release directory:

   ```bash
   cd release
   HOSTNAME=0.0.0.0 PORT=8080 NODE_ENV=production node server.js
   ```

The checked-in `npm start` script also runs Next on `0.0.0.0:8080` from a full source checkout. For the standalone release directory, use `node server.js`.

## Operational Notes

- Persistent state must stay in PostgreSQL; do not use SQLite, JSON files, in-memory storage, or local volumes for app data.
- The object storage bucket is private. Browser image reads go through `/api/img/...`, which signs a fresh `GetObject` URL per request.
- `OBJECT_STORAGE_PREFIX` must already include its trailing slash and is concatenated directly with relative object keys.
- Admin sessions are cookie-based and signed with `ADMIN_SESSION_SECRET`; rotate the secret to invalidate all admin sessions.
- The production server listens on port `8080` by default in the provided scripts and deployment command.
