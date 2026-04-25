import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8787;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const DEFAULTS = {
  baseId: process.env.AIRTABLE_BASE_ID || "",
  tableName: process.env.AIRTABLE_TABLE_NAME || "Books",
  viewName: process.env.AIRTABLE_VIEW_NAME || "Grid view",
  statusField: process.env.AIRTABLE_STATUS_FIELD || "Status",
  titleField: process.env.AIRTABLE_TITLE_FIELD || "Title",
  authorField: process.env.AIRTABLE_AUTHOR_FIELD || "Author",
  readValue: process.env.AIRTABLE_READ_VALUE || "Read",
  unreadValue: process.env.AIRTABLE_UNREAD_VALUE || "Did Not Read",
  publicViewUrl: process.env.AIRTABLE_PUBLIC_VIEW_URL || ""
};

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/setup", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "setup.html"));
});

app.get("/wrapped", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "wrapped.html"));
});

app.get("/api/config", (_, res) => {
  res.json({ defaults: DEFAULTS });
});

function normalizeBook(record, cfg) {
  const fields = record.fields || {};
  return {
    id: record.id,
    title: String(fields[cfg.titleField] || "Untitled"),
    author: String(fields[cfg.authorField] || "Unknown Author"),
    status: String(fields[cfg.statusField] || "Unknown")
  };
}

async function fetchBooksFromAirtable(cfg) {
  const token = process.env.AIRTABLE_PAT;
  if (!token || !cfg.baseId || !cfg.tableName) {
    return { books: [], source: "no-token-or-config" };
  }

  const collected = [];
  let offset = "";

  do {
    const url = new URL(`https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableName)}`);
    url.searchParams.set("pageSize", "100");
    if (cfg.viewName) url.searchParams.set("view", cfg.viewName);
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Airtable request failed (${response.status}): ${details}`);
    }

    const payload = await response.json();
    const records = payload.records || [];
    records.forEach((r) => collected.push(normalizeBook(r, cfg)));
    offset = payload.offset || "";
  } while (offset);

  return { books: collected, source: "airtable-api" };
}

app.get("/api/books", async (req, res) => {
  const cfg = {
    ...DEFAULTS,
    baseId: req.query.baseId || DEFAULTS.baseId,
    tableName: req.query.tableName || DEFAULTS.tableName,
    viewName: req.query.viewName || DEFAULTS.viewName,
    statusField: req.query.statusField || DEFAULTS.statusField,
    titleField: req.query.titleField || DEFAULTS.titleField,
    authorField: req.query.authorField || DEFAULTS.authorField,
    readValue: req.query.readValue || DEFAULTS.readValue,
    unreadValue: req.query.unreadValue || DEFAULTS.unreadValue
  };

  try {
    const { books, source } = await fetchBooksFromAirtable(cfg);
    const readBooks = books.filter((b) => b.status === cfg.readValue);
    const unreadBooks = books.filter((b) => b.status === cfg.unreadValue);

    res.json({
      source,
      configUsed: cfg,
      totals: {
        all: books.length,
        read: readBooks.length,
        unread: unreadBooks.length
      },
      books,
      readBooks,
      unreadBooks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function pickRandom(arr, fallback = "") {
  if (!arr.length) return fallback;
  return arr[Math.floor(Math.random() * arr.length)];
}

function localWrappedGenerator({ readBooks = [], unreadBooks = [], tone = "playful", personalityNotes = "" }) {
  const readTitles = readBooks.slice(0, 7).map((b) => `${b.title} by ${b.author}`);
  const unreadTitles = unreadBooks.slice(0, 7).map((b) => `${b.title} by ${b.author}`);

  const contradictionTemplates = [
    ["calm + centered", "chaotic curiosity"],
    ["minimalist wisdom", "epic plot twists"],
    ["slow living", "intellectual speedrun"],
    ["practical growth", "a full-blown reinvention arc"],
    ["deep focus", "genre-hopping adventure"]
  ];

  const cards = Array.from({ length: 10 }).map((_, idx) => {
    if (idx === 0) {
      return {
        title: "Your Reader Energy",
        body: `You completed ${readBooks.length} books, while ${unreadBooks.length} books are waiting as possible selves. Tone: ${tone}.`,
        tag: "identity"
      };
    }

    if (idx === 9) {
      return {
        title: "The Plot Twist",
        body: unreadBooks.length
          ? `These unread books are not failures. They're your fantasy selves lined up backstage, waiting for their season.`
          : "Your fantasy shelf is currently empty. You are either focused... or suspiciously efficient.",
        tag: "possible-selves"
      };
    }

    const pair = contradictionTemplates[idx % contradictionTemplates.length];
    return {
      title: `Contradiction Card #${idx}`,
      body: `You say you want ${pair[0]}, but your bookshelf suggests ${pair[1]}. Read pile sample: ${pickRandom(readTitles, "mysterious classics")}. Aspirational pile sample: ${pickRandom(unreadTitles, "future bestseller energy")}.`,
      tag: "contradiction"
    };
  });

  return {
    headline: "Books Wrapped: Main Character Edition",
    archetype: unreadBooks.length > readBooks.length ? "Aspirational Shape-Shifter" : "Intentional Finisher",
    summary: `Your bookshelf balances reality and ambition. You read ${readBooks.length} books, and your ${unreadBooks.length} unread picks represent fantasy selves and future identities—not guilt. ${personalityNotes ? `Personality note detected: ${personalityNotes}.` : ""}`,
    cards
  };
}

async function llmWrappedGenerator(payload) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const prompt = `You are writing a funny but compassionate Books Wrapped report.
Output strict JSON with keys: headline, archetype, summary, cards.
cards must be an array of exactly 10 objects, each with title, body, tag.
At least 6 cards must be contradiction cards that use this pattern: "You say you want X, but your bookshelf suggests Y."
Never shame unread books. Frame them as possible selves, fantasy selves, aspirational identities.

User context:\n${JSON.stringify(payload, null, 2)}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: { format: { type: "json_object" } }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI generation failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const outputText = data.output_text || data.output?.[0]?.content?.[0]?.text || "";
  return safeJsonParse(outputText);
}

app.post("/api/generate-wrapped", async (req, res) => {
  const { readBooks = [], unreadBooks = [], age = "", tone = "playful", personalityNotes = "" } = req.body || {};

  const payload = {
    age,
    tone,
    personalityNotes,
    readBooks: readBooks.slice(0, 30),
    unreadBooks: unreadBooks.slice(0, 30),
    counts: { read: readBooks.length, unread: unreadBooks.length }
  };

  try {
    const llm = await llmWrappedGenerator(payload);
    const wrapped = llm && Array.isArray(llm.cards) && llm.cards.length === 10
      ? llm
      : localWrappedGenerator(payload);
    res.json({ wrapped, source: llm ? "openai" : "local-fallback" });
  } catch (error) {
    const wrapped = localWrappedGenerator(payload);
    res.json({ wrapped, source: "local-fallback", warning: error.message });
  }
});

app.listen(port, () => {
  console.log(`Books Wrapped running on http://localhost:${port}`);
});
