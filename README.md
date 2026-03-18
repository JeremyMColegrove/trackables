# Trackable

Trackable is a production-focused Next.js application for managing shareable trackable items, structured form submissions, and API usage tracking.

## Local development

Install dependencies and start the dev server:

```bash
npm ci
npm run dev
```

## Production build

This app is configured for Next.js standalone output.

Build and run it locally:

```bash
npm run build
npm run start:standalone
```

The standalone server listens on `PORT` and respects `HOSTNAME`, so for container usage the runtime defaults to:

- `PORT=3000`
- `HOSTNAME=0.0.0.0`

## Docker

Build the image:

```bash
docker build -t trackable .
```

Run the container:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key \
  -e CLERK_SECRET_KEY=your_clerk_secret_key \
  -e CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_signing_secret \
  trackable
```

The Docker image uses a multi-stage build:

- installs dependencies in a dedicated layer
- builds the Next.js app with `output: "standalone"`
- copies only `public`, `.next/static`, and `.next/standalone` into the final runtime image

## Required environment

At minimum, production deployments should provide:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`

Add any other environment variables required by your deployment platform in the same way.
