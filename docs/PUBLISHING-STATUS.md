# Publication and verification / 发布与验收记录

Updated: 2026-10-22 (Asia/Shanghai). Version: 0.6.0-alpha.1.

| Channel | Status |
| --- | --- |
| [GitHub](https://github.com/cyuanxv/openrouter-analytics-mcp) | Public clean independent repository |
| [GitHub Release](https://github.com/cyuanxv/openrouter-analytics-mcp/releases/tag/v0.6.0-alpha.1) | Alpha prerelease with installable tarball |
| [npm](https://www.npmjs.com/package/@cyuanxv/openrouter-analytics-mcp) | Published with the alpha tag |
| [MCP Registry metadata](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.cyuanxv%2Fopenrouter-analytics-mcp/versions/latest) | Active: io.github.cyuanxv/openrouter-analytics-mcp |

Registry registration is a metadata listing, not an OpenRouter endorsement or a ChatGPT app review.

## Install / 安装

Use an empty directory:

```bash
npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.1
```

Then follow [MCP client configuration](../packages/local-mcp/README.md). You need a supported Node.js runtime and a dedicated absolute private data directory. Account queries require your own OpenRouter Management Key, supplied through client secret settings. Do not paste secrets into chat or Git.

The GitHub Release tarball remains an alternative installation channel.

## Public-entry verification / 公开入口验收

- The exact npm version metadata and tarball were downloaded without authentication. The published tarball matches the verified local release byte for byte, including integrity and checksum.
- A fresh directory, empty npm cache and no npm user credentials were used for an actual npm install of the pinned public version.
- Real stdio startup passed on macOS with Node.js 22.22.2 and 24.16.0: 28 tools, status queries, and report/preset/experiment records surviving process restart.
- Account queries without a key failed as expected. No real account credentials or paid inference were used in this installation check. Execution tests ran with external network blocked.
- Registry readback returned HTTP 200, status active, the expected npm package, version and stdio transport.
- GitHub Release anonymous download and installation were also verified separately.

Linux source and packed-install checks are covered by the [Node 22/24 CI workflow](TESTING.md); use the linked workflow run for actual pass/fail evidence. Windows native installation is not yet verified. The local edition has no dashboard, HTTP endpoint, built-in scheduler or automatic Telegram sending. Sites deployment is separate; no shared public billing endpoint is provided.

The existing private repository and production Sites service were not changed by this release. Earlier network/2FA waiting states are historical, not the current publication status.
