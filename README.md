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
docker build -t jeremycolegrove/trackable:latest .
```

Or use Docker Compose:

```bash
npm run docker:build
```

Build architecture-specific Docker images:

```bash
npm run docker:build:amd64
npm run docker:build:arm64
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

Run with Docker Compose:

```bash
npm run docker:up
```

This Compose setup now runs three services together from [docker-compose.yml](/Users/jeremy/Documents/Github/trackable/docker-compose.yml):

- `trackable` for the Next.js app
- `postgres` for the application database
- `cloudflared` for the Cloudflare Tunnel connection

Postgres stores its data in [data](/Users/jeremy/Documents/Github/trackable/data) via a bind mount at `./data/postgres`, so the database survives container restarts on the device.

The application connects to Postgres through the Compose service hostname `postgres`, not `localhost`.

Before starting the full stack, replace the placeholder `TUNNEL_TOKEN` value in [docker-compose.yml](/Users/jeremy/Documents/Github/trackable/docker-compose.yml) with your actual Cloudflare tunnel token.

Build only:

```bash
npm run docker:build
```

That command builds both image variants:

- `jeremycolegrove/trackable:amd64`
- `jeremycolegrove/trackable:arm64`

For architecture-specific image builds:

```bash
npm run docker:build:amd64
npm run docker:build:arm64
```

Then start the already-built image:

```bash
npm run docker:up
```

If you want a different host port, set `TRACKABLE_PORT` too:

```bash
TRACKABLE_PORT=8080 npm run docker:up
```

The Docker image uses a multi-stage build:

- installs dependencies in a dedicated layer
- builds the Next.js app with `output: "standalone"`
- copies only `public`, `.next/static`, and `.next/standalone` into the final runtime image

Notes on target platforms:

- `npm run build` builds the Next.js project for the current machine environment.
- `npm run docker:build:amd64` builds a Linux `amd64` image.
- `npm run docker:build:arm64` builds a Linux `arm64` image, which is the correct Docker target for Apple Silicon machines like an M4 Pro.
- The Docker build already runs the Next.js production build inside the target image build, so the app bundle is created for that target container architecture.

## Required environment

At minimum, production deployments should provide:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`

Add any other environment variables required by your deployment platform in the same way.
