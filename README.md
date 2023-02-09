# feishu-github-probot

> A Bot based on [Probot](https://github.com/probot/probot) to send GitHub notifications to Feishu

## Setup

Copy the `.env.example` file to `.env` and fill in the values.

Before start, you should make sure a mysql database is running. You can launch it using the `docker-compose.yml` file in the root directory.

```sh
# Install dependencies
npm install

# Run the bot
npm build # First compile the TypeScript code
npm start   
```

## Docker

```sh
# 1. Build container
docker build -t feishu-github-probot .

# 2. Start container
docker run --env-file .env feishu-github-probot
```

## Contributing

If you have suggestions for how feishu-github-probot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 Dest1n1s
