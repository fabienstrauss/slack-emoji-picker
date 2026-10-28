export type Emoji = { name: string; url: string };
export function resolveEmoji(raw: Record<string, string>): Emoji[] {
  return Object.keys(raw)
    .sort()
    .flatMap((name) => {
      let value = raw[name];
      const seen = new Set([name]);
      while (value?.startsWith("alias:")) {
        const target = value.slice(6);
        if (seen.has(target)) return [];
        seen.add(target);
        value = raw[target];
      }
      try {
        if (new URL(value).protocol !== "https:") return [];
      } catch {
        return [];
      }
      return [{ name, url: value }];
    });
}
export async function fetchEmoji(
  token: string,
  base = "https://slack.com/api",
  timeout = 15000,
): Promise<Emoji[]> {
  const response = await fetch(`${base}/emoji.list`, {
    headers: { Authorization: `Bearer ${token.trim()}` },
    signal: AbortSignal.timeout(timeout),
  });
  if (response.status === 429)
    throw new Error(
      `Slack rate limit. Retry in ${response.headers.get("retry-after") || "60"} seconds.`,
    );
  if (!response.ok)
    throw new Error(
      `Slack returned HTTP ${response.status}. Try syncing again later.`,
    );
  const body = (await response.json()) as {
    ok?: boolean;
    error?: string;
    emoji?: Record<string, string>;
  };
  if (!body.ok) {
    const messages: Record<string, string> = {
      invalid_auth: "Invalid Slack token. Update it in extension preferences.",
      token_revoked:
        "Slack token was revoked. Update it in extension preferences.",
      missing_scope:
        "Your Slack token needs the emoji:read permission. Reinstall the Slack app after adding it.",
    };
    throw new Error(
      messages[body.error || ""] ||
        "Slack could not list emojis. Check your token and workspace access.",
    );
  }
  if (
    !body.emoji ||
    typeof body.emoji !== "object" ||
    Array.isArray(body.emoji) ||
    Object.values(body.emoji).some((v) => typeof v !== "string")
  )
    throw new Error("Slack returned an invalid emoji catalog.");
  return resolveEmoji(body.emoji);
}
