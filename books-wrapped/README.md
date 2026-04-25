# Books Wrapped MVP

## Run

```bash
cd books-wrapped
npm install
npm start
```

Open `http://localhost:8787`.

## Environment variables

- `AIRTABLE_PAT` Airtable Personal Access Token
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`
- `AIRTABLE_VIEW_NAME`
- `AIRTABLE_STATUS_FIELD`
- `AIRTABLE_TITLE_FIELD`
- `AIRTABLE_AUTHOR_FIELD`
- `AIRTABLE_READ_VALUE` (default `Read`)
- `AIRTABLE_UNREAD_VALUE` (default `Did Not Read`)
- `OPENAI_API_KEY` optional for LLM output; local fallback generator is used otherwise
- `OPENAI_MODEL` optional (default `gpt-4.1-mini`)
