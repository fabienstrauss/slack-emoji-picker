import test from "node:test";
import assert from "node:assert/strict";
import { fetchEmoji, resolveEmoji } from "../src/slack.ts";

test("resolve chained aliases, discard missing targets, cycles and unsafe URLs", () => {
  assert.deepEqual(
    resolveEmoji({
      a: "https://example.com/a.gif",
      b: "alias:a",
      c: "alias:b",
      d: "alias:missing",
      e: "alias:f",
      f: "alias:e",
      unsafe: "file:///secret",
    }),
    [
      { name: "a", url: "https://example.com/a.gif" },
      { name: "b", url: "https://example.com/a.gif" },
      { name: "c", url: "https://example.com/a.gif" },
    ],
  );
});
const base = process.env.SLACK_TEST_BASE;
test(
  "real HTTP client against local Slack simulation",
  { skip: !base },
  async (t) => {
    await t.test("fetch and resolve emoji list", async () => {
      const result = await fetchEmoji("fixture-token", base);
      assert.deepEqual(
        result.map((e) => e.name),
        ["celebrate", "more", "party"],
      );
      assert.ok(result.every((e) => e.url === "https://example.com/party.gif"));
    });
    for (const [token, pattern] of [
      ["invalid", /Invalid Slack token/],
      ["missing-scope", /emoji:read/],
      ["rate-limit", /30 seconds/],
      ["server-error", /HTTP 502/],
    ] as const) {
      await t.test(token, async () => {
        await assert.rejects(fetchEmoji(token, base), pattern);
      });
    }
    await t.test("bounded timeout", async () => {
      await assert.rejects(fetchEmoji("slow", base, 50), {
        name: "TimeoutError",
      });
    });
  },
);
