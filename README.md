# Trackables

Trackables is an open source app for collecting structured responses and tracking API usage in one place.

It is built for teams that want simple forms, event logging, and a self-hostable setup without a large amount of product overhead.

Hosted version: [trackables.org](https://trackables.org)

## What It Does

Trackables supports two main workflows:

- Form-based collection for feedback, surveys, and structured submissions
- API-based event tracking with API keys, metadata, and history

## Big Features

### Forms and Responses

- Create trackable forms for feedback, surveys, and intake flows
- Build forms from reusable field types like ratings, checkboxes, notes, and short text
- Share forms publicly or keep them restricted
- Allow anonymous responses when needed
- Review submitted responses inside the dashboard

### API Usage Tracking

- Create API ingestion trackables for logs and usage events
- Generate API keys for authenticated workspaces
- Store both aggregate counts and individual events
- Attach metadata to events for filtering and later analysis
- Explore usage history from the dashboard

### Sharing and Access

- Organize trackables inside workspaces
- Invite teammates and manage access with workspace roles
- Support public access, private access, and more controlled sharing flows

### Operations and Integrations

- Query logged events with filtering and grouping support
- Configure webhooks for trackable events
- Use the built-in MCP tooling for agent workflows
- Run the app in multiple languages

## Good Fit For

- Feedback forms
- Survey collection
- Shared internal intake forms
- Lightweight event or log tracking
- Small teams that want to self-host their own data collection tools

## Stack

- Next.js
- TypeScript
- tRPC
- PostgreSQL
- Redis
- Tailwind CSS
- Clerk for authentication

## Self-Hosting

Trackables can be self-hosted with Docker. The repository includes working example files to get started:

- [example/docker-compose.yml](/Users/jeremy/Documents/Github/trackables/example/docker-compose.yml)
- [example/.env.example](/Users/jeremy/Documents/Github/trackables/example/.env.example)

### Requirements

- Docker and Docker Compose
- PostgreSQL
- Redis
- A Clerk application for authentication

### Basic Setup

1. Copy [example/.env.example](/Users/jeremy/Documents/Github/trackables/example/.env.example) to `.env` and fill in your values.
2. Create a Clerk app and add your publishable key, secret key, and webhook signing secret.
3. Create a Clerk webhook pointing to `https://<your-domain>/api/clerk/webhook`.
4. Subscribe that webhook to `user.created`, `user.updated`, and `user.deleted`.
5. Copy [example/docker-compose.yml](/Users/jeremy/Documents/Github/trackables/example/docker-compose.yml) into your deployment directory.
6. Start the stack with `docker compose up -d`.

After startup, open your app URL and sign in. Clerk handles authentication, while Trackables stores its app data in PostgreSQL and uses Redis for caching and queued work.

## Contributing

Contributions are welcome. If you want to improve Trackables, open an issue or submit a pull request.
