import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  Grid,
  Icon,
  LocalStorage,
  Toast,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { createHash } from "node:crypto";
import { fetchEmoji, type Emoji } from "./slack";

type Notes = Record<
  string,
  {
    favorite?: boolean;
    keywords?: string[];
    collections?: string[];
    lastUsed?: number;
  }
>;
type Catalog = { emojis: Emoji[]; synced: number };
const split = (value: string) => [
  ...new Set(
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
  ),
];

function EditEmoji({
  emoji,
  notes,
  save,
}: {
  emoji: Emoji;
  notes: Notes;
  save: (notes: Notes) => Promise<void>;
}) {
  const { pop } = useNavigation();
  return (
    <Form
      navigationTitle={`Organize :${emoji.name}:`}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Emoji"
            onSubmit={async (values: {
              keywords: string;
              collections: string;
            }) => {
              await save({
                ...notes,
                [emoji.name]: {
                  ...notes[emoji.name],
                  keywords: split(values.keywords),
                  collections: split(values.collections),
                },
              });
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Add your own search terms and collections. Separate entries with commas. These stay on this Mac." />
      <Form.TextField
        id="keywords"
        title="Search Keywords"
        defaultValue={notes[emoji.name]?.keywords?.join(", ")}
        placeholder="awkward, oops, monday"
      />
      <Form.TextField
        id="collections"
        title="Collections"
        defaultValue={notes[emoji.name]?.collections?.join(", ")}
        placeholder="Celebration, Reactions, Cursed"
      />
    </Form>
  );
}
export default function Command() {
  const { token } = getPreferenceValues<{ token: string }>();
  const scope = createHash("sha256")
    .update(token.trim())
    .digest("hex")
    .slice(0, 24);
  const [catalog, setCatalog] = useState<Catalog>({ emojis: [], synced: 0 });
  const [notes, setNotes] = useState<Notes>({});
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState("all");
  const syncing = useRef(false);
  const save = async (next: Notes) => {
    await LocalStorage.setItem(`notes-${scope}`, JSON.stringify(next));
    setNotes(next);
  };
  async function sync() {
    if (syncing.current) return;
    syncing.current = true;
    setBusy(true);
    try {
      const next = { emojis: await fetchEmoji(token), synced: Date.now() };
      await LocalStorage.setItem(`catalog-${scope}`, JSON.stringify(next));
      setCatalog(next);
      await showToast({
        style: Toast.Style.Success,
        title: `Synced ${next.emojis.length} emojis`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not sync Slack emojis",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      syncing.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    void (async () => {
      try {
        const cached = await LocalStorage.getItem<string>(`catalog-${scope}`);
        const saved = await LocalStorage.getItem<string>(`notes-${scope}`);
        if (saved) setNotes(JSON.parse(saved));
        if (cached) {
          const previous = JSON.parse(cached) as Catalog;
          setCatalog(previous);
          if (Date.now() - previous.synced < 86400000) {
            setBusy(false);
            return;
          }
        }
        await sync();
      } catch {
        setBusy(false);
        await showToast({
          style: Toast.Style.Failure,
          title: "Could not load saved emojis",
          message: "Use Sync Emojis to retry.",
        });
      }
    })();
  }, [scope]);
  const collections = [
    ...new Set(Object.values(notes).flatMap((n) => n.collections || [])),
  ].sort();
  const visible = catalog.emojis.filter(
    (e) =>
      filter === "all" ||
      (filter === "favorites"
        ? notes[e.name]?.favorite
        : notes[e.name]?.collections?.includes(filter.slice(11))),
  );
  const favorites = visible.filter((e) => notes[e.name]?.favorite);
  const recent = visible
    .filter((e) => !notes[e.name]?.favorite && notes[e.name]?.lastUsed)
    .sort(
      (a, b) => (notes[b.name]?.lastUsed || 0) - (notes[a.name]?.lastUsed || 0),
    )
    .slice(0, 24);
  const featured = new Set([...favorites, ...recent].map((e) => e.name));
  const common = (
    <>
      <Action
        title="Sync Emojis"
        icon={Icon.ArrowClockwise}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
        onAction={sync}
      />
      <Action
        title="Open Extension Preferences"
        icon={Icon.Gear}
        onAction={openExtensionPreferences}
      />
    </>
  );
  const item = (emoji: Emoji) => (
    <Grid.Item
      key={emoji.name}
      title={emoji.name}
      content={{ source: emoji.url }}
      keywords={[
        ...(notes[emoji.name]?.keywords || []),
        ...(notes[emoji.name]?.collections || []),
      ]}
      actions={
        <ActionPanel>
          <Action
            title="Paste Emoji Code"
            icon={Icon.Clipboard}
            onAction={async () => {
              try {
                await Clipboard.paste(`:${emoji.name}:`);
                await save({
                  ...notes,
                  [emoji.name]: { ...notes[emoji.name], lastUsed: Date.now() },
                });
              } catch {
                await showToast({
                  style: Toast.Style.Failure,
                  title: "Could not paste emoji",
                });
              }
            }}
          />
          <Action.CopyToClipboard
            title="Copy Emoji Code"
            content={`:${emoji.name}:`}
          />
          <Action
            title={
              notes[emoji.name]?.favorite ? "Remove Favorite" : "Add Favorite"
            }
            icon={Icon.Star}
            shortcut={{ modifiers: ["cmd"], key: "f" }}
            onAction={() =>
              save({
                ...notes,
                [emoji.name]: {
                  ...notes[emoji.name],
                  favorite: !notes[emoji.name]?.favorite,
                },
              })
            }
          />
          <Action.Push
            title="Edit Keywords and Collections"
            icon={Icon.Pencil}
            shortcut={{ modifiers: ["cmd"], key: "e" }}
            target={<EditEmoji emoji={emoji} notes={notes} save={save} />}
          />
          <Action.OpenInBrowser
            title="Open Original Image or GIF"
            url={emoji.url}
          />
          {common}
        </ActionPanel>
      }
    />
  );
  return (
    <Grid
      columns={7}
      inset={Grid.Inset.Medium}
      isLoading={busy}
      searchBarPlaceholder="Search emoji names, your keywords, or collections…"
      searchBarAccessory={
        <Grid.Dropdown tooltip="Collection" value={filter} onChange={setFilter}>
          <Grid.Dropdown.Item title="All Emojis" value="all" />
          <Grid.Dropdown.Item title="Favorites" value="favorites" />
          {collections.map((c) => (
            <Grid.Dropdown.Item key={c} title={c} value={`collection:${c}`} />
          ))}
        </Grid.Dropdown>
      }
    >
      <Grid.EmptyView
        title={busy ? "Loading Slack emojis…" : "No emojis found"}
        description={
          catalog.emojis.length
            ? "Try another search or collection."
            : "Sync your workspace emojis. Your token needs emoji:read access."
        }
        actions={<ActionPanel>{common}</ActionPanel>}
      />
      <Grid.Section title="Favorites">{favorites.map(item)}</Grid.Section>
      <Grid.Section title="Recently Used">{recent.map(item)}</Grid.Section>
      <Grid.Section
        title="Browse"
        subtitle={
          catalog.synced
            ? `Synced ${new Date(catalog.synced).toLocaleDateString()}`
            : undefined
        }
      >
        {visible.filter((e) => !featured.has(e.name)).map(item)}
      </Grid.Section>
    </Grid>
  );
}
