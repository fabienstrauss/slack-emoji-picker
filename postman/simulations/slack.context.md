# Slack emoji picker simulation

## Purpose
Exercise the real Slack HTTP client against contract-shaped synthetic fixtures, without credentials or workspace data.

## Execution
From the project root, run `postman simulation run postman/simulations/slack.sim.yaml --port 4907 --output ndjson`, then in another terminal run `SLACK_TEST_BASE=http://127.0.0.1:4907/slack/api npm test`.

## Assumptions
The mock is based on https://docs.slack.dev/reference/methods/emoji.list. Named fixture tokens select test responses; they are not real Slack tokens. Owner mock discovery was unavailable because network/DNS access was blocked. (reasoned 2026-10-28)

## Observations
2026-10-28: no member served traffic; startup failed before listening. The alias resolution unit test passed separately; HTTP tests were explicitly skipped without a running simulation.

## What didn't work
2026-10-28: simulation startup failed with `listen EPERM: operation not permitted 127.0.0.1` in the restricted environment. Retry locally outside that environment. No HTTP integration or live Slack claim has been established.
