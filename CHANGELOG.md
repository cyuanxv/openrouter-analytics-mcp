# Changelog

## Unreleased — local candidate only

- Added `openrouter-analytics-mcp doctor` with Chinese installation and configuration diagnostics, offline/JSON modes and distinct incomplete results.
- Checks supported Node versions, Management Key identity, read-only account connectivity and safe data-directory access. Does not mutate keys, permissions or databases, and does not call models.
- Existing 28 MCP tools and Sites behavior are unchanged. This candidate has not been published.

## 0.6.0-alpha.1 - 2026-10-22

### Features
- First public alpha of the local OpenRouter analytics MCP server, with 28 tools and private SQLite persistence.
- Cost reports, anomaly investigation, model experiments and versioned routing presets.
- Self-hosted Sites edition source and bilingual installation guides.

### Verification and limits
- Tested on macOS with Node.js 22.22.2 and 24.16.0, including installed stdio and restart persistence checks.
- No paid inference or automatic production routing changes. The local edition has no web dashboard or built-in scheduler.
- Windows and Linux native installation are not yet verified.
