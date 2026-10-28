# Development

Use Node.js 22.14+ and pnpm, with the committed lockfile.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run build:check
```

`build:check` compiles a distribution build into the ignored `dist/` folder without installing it into Raycast. Use `pnpm run dev` for development inside Raycast.

## HTTP integration checks

With the Postman CLI installed, start the local simulation:

```sh
postman simulation run postman/simulations/slack.sim.yaml --port 4907 --output ndjson
```

Then, in another terminal:

```sh
SLACK_TEST_BASE=http://127.0.0.1:4907/slack/api pnpm test
```

Fixtures follow Slack's documented `emoji.list` response shape and use synthetic names and tokens. The real HTTP client is exercised for success, aliases, authentication and scope failures, rate limits, HTTP errors, and timeouts. Without `SLACK_TEST_BASE`, the HTTP suite is explicitly skipped.

## Storage

Raycast LocalStorage holds the catalog and personal metadata under a hash of the token. Changing tokens starts a separate library; prior data is retained. Sync failures preserve the cached catalog. Image loading uses Slack URLs through Raycast, without downloading a complete offline library.

## Validation status

2026-10-28: TypeScript, distribution build, and alias-resolution test passed. The user confirmed the installed picker works. HTTP simulation checks remain unverified: this environment cannot open the required local port. The Slack manifest follows Slack's schema but has not been installed into a fresh workspace here.
