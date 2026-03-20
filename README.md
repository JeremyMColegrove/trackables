# Trackable

![Dashboard](<./images/README/dashboard.webp>)

Trackable is a lightweight, self-hostable log and survey application.

It is built for simple data collection without unnecessary complexity. You can use it to share forms, collect structured responses, and track usage events through API keys.

Trackable is free, open source, and intended to stay small, understandable, and easy to run yourself.

Try out a hosted version [here](https://trackables.org).

## Features

- Create simple trackable items for logs, feedback, and surveys
- Share public or restricted forms
- Collect structured responses
- Track usage events through API keys
- Review submissions and usage history in one place
- Self-host with Docker
- Lightweight and simple by design

## Example Use Cases

- Internal feedback forms
- Lightweight survey collection
- Simple event or usage logging
- Shared intake forms
- Personal or team-hosted tracking tools

### Getting Started

The recommended way to run the application is through docker. We provide an example docker-compose and .env for you.

See the example [docker-compose.yml](./docker-compose.yml) and [.env.example](./.env.example) file to get started.

## Screenshots

![Public survey form](<./images/README/public-survey.webp>)
![Log ingestion](<./images/README/log-overview.webp>)
![Log details](<./images/README/log-details.webp>)

Log querying uses the Liqe syntax, and enables other filtering options such as grouping and time selection.

## Contributing

Contributions are welcome.

If you want to improve Trackable, open an issue, start a discussion, or submit a pull request. Small fixes, documentation updates, and feature contributions are all welcome.
