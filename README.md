# feishu-github-probot

> A GitHub App built with [Probot](https://github.com/probot/probot) that A Bot based on Probot to send GitHub notifications to Feishu

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t feishu-github-probot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> feishu-github-probot
```

## Contributing

If you have suggestions for how feishu-github-probot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 Dest1n1s
