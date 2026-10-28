<div align="center">
  <img src="assets/icon.png" width="88" alt="Smiling emoji" />
  <h1>Slack Emoji Picker</h1>
  <p>Your workspace's best reactions. Finally findable.</p>
  <p><strong>Raycast · macOS · Custom Slack emojis</strong></p>
</div>

---

**Browse visually. Search your own words. Hit Enter.**

⭐ Favorites up front · 🗂️ Personal collections · 🔎 Custom keywords · 🕒 Recent picks

Find that oddly named emoji by tagging it `awkward`, `ship it`, or `monday`. Pick it from the grid and paste `:emoji_name:` straight into Slack.

## Get started

You'll need [Raycast](https://raycast.com), [Node.js 22.14+](https://nodejs.org), and [pnpm](https://pnpm.io/installation). This is a source install; collaborators need access to this private repository.

```sh
git clone https://github.com/fabienstrauss/slack-emoji-picker.git
cd slack-emoji-picker
pnpm install --frozen-lockfile
pnpm run dev
```

Open **Search Slack Emojis** in Raycast. Assign it a shortcut in **Raycast Settings → Extensions**—try <kbd>⌃</kbd> <kbd>⌥</kbd> <kbd>Space</kbd>.

## Connect Slack · once per workspace

1. Open [Slack Apps](https://api.slack.com/apps) → **Create New App → From a manifest**. Choose your workspace.
2. Select **JSON** and paste [slack-app-manifest.json](slack-app-manifest.json). Review and create the app.
3. Open **OAuth & Permissions**. At the top, under **OAuth Tokens**, click **Install to Workspace** and approve.
4. Copy the **Bot User OAuth Token** (`xoxb-…`) into **Raycast Settings → Extensions → Slack Emoji Picker → Slack Token**.

> The manifest requests only `emoji:read`. No channel history or message-writing permission. Your workspace may require admin approval. Keep the token in Raycast's password preference, not in this repository.

## Make it yours

| Shortcut | Action |
| :--- | :--- |
| <kbd>↵</kbd> | Paste the emoji code into your focused input |
| <kbd>⌘ F</kbd> | Add or remove a favorite |
| <kbd>⌘ E</kbd> | Edit keywords and collections (comma-separated) |
| <kbd>⌘ P</kbd> | Choose a collection |
| <kbd>⌘ R</kbd> | Sync workspace emojis |
| <kbd>⌘ K</kbd> | Copy the code, open the original GIF, and more |

<details>
<summary><strong>A few useful details</strong></summary>

Favorites, collections, keywords, and recent picks live locally on your Mac. The catalog refreshes on launch when more than 24 hours old. Images load from Slack; a complete offline image library isn't included.

This pastes emoji codes into messages. It doesn't add reactions to existing messages or send messages. Codes work in workspaces containing that emoji. Changing your token starts a separate local library.

For animated originals, use **Open Original Image or GIF**. Grid animation depends on Raycast's image rendering.

Use pnpm consistently; mixing `npm install` into a pnpm dependency tree can break installation. See [development notes](docs/DEVELOPMENT.md) for checks and API fixtures.

</details>

---

[MIT](LICENSE) · Built for people who remember the face, not the filename.
