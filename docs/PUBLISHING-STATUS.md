# Publication and verification / 发布与验收记录

Version: **0.6.0-alpha.3**. Updated 2026-10-23 (Asia/Shanghai).

| Channel | Status |
| --- | --- |
| [GitHub source](https://github.com/cyuanxv/openrouter-analytics-mcp) | Release preparation PR #7 merged |
| [GitHub Release](https://github.com/cyuanxv/openrouter-analytics-mcp/releases/tag/v0.6.0-alpha.3) | Alpha prerelease with installable tarball |
| [npm](https://www.npmjs.com/package/@cyuanxv/openrouter-analytics-mcp) | 0.6.0-alpha.3 published; alpha tag verified |
| [MCP Registry version](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.cyuanxv%2Fopenrouter-analytics-mcp/versions/0.6.0-alpha.3) | Active; package, version and stdio transport verified anonymously |

This is an alpha prerelease. Use the pinned version or `@alpha`; npm `latest` still points to 0.6.0-alpha.1. Registry registration is a metadata listing, not an OpenRouter endorsement or ChatGPT app review.

## Install / 安装

```bash
npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.3
```

Follow the [quickstart](QUICKSTART.md), [FAQ](FAQ.md), [client configuration](../packages/local-mcp/README.md), and [report reading guide](REPORT-READING.md). Configure your own dedicated private data directory and Management Key through secret environment settings. Back up your data directory with all instances stopped before upgrading. Existing saved reports remain unchanged; new summaries appear on newly generated report periods.

## Public-entry acceptance / 公开入口验收

- Exact npm version and tarball were fetched anonymously. Published bytes match the locally tested package, with SHA-1 and SHA-512 integrity verified.
- SHA-256: `5ff7b491cc814726386443f3d55c4e58138672315e60070d30beca7f1c0e1f09`. The GitHub Release asset digest matches too.
- Fresh npm installs used independent HOME, empty npm credentials and new caches on macOS / Node 22.22.2 and 24.16.0.
- Both passed Chinese offline JSON diagnostics, 28-tool discovery, the exact adapter version, expected missing-Key failure, and report/preset/experiment persistence after restart.
- The publicly installed package also passed a synthetic upstream test: account cost $120 versus $100, with the correct model contributing +$20, readable report text and report ID. These are simulated amounts, not a real account or inference. The mock transport handles every request; no real OpenRouter credential was supplied.
- Anonymous Registry readback confirmed active status, `io.github.cyuanxv/openrouter-analytics-mcp`, npm `@cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.3`, and stdio. Registry metadata points to the same installed npm package.

## Automated checks / 自动测试

[Release CI](https://github.com/cyuanxv/openrouter-analytics-mcp/actions/runs/39818663736) and [merged-source CI](https://github.com/cyuanxv/openrouter-analytics-mcp/actions/runs/39818838221) passed Ubuntu 24.04 / Node 22 and 24: each ran 34 local tests, 206 shared-service synthetic tests, builds, packed installation and artifact validation. Local Node 22/24 tests and packed-install checks passed too.

Publication initially needed npm browser 2FA. Registry validation initially returned npm version-not-found during propagation, then succeeded after anonymous npm metadata became available. The additional synthetic acceptance initially lacked metric aggregation metadata; the test fixture was corrected and both public-install checks passed. The published package was not changed or uploaded again.

Windows native installation, Linux desktop UI, actual account Analytics permissions, existing database integrity and disk-space checks remain outside this acceptance. No paid inference, Sites deployment, private-repository change, production task change, Key read, Key write or revocation was performed.

Previous evidence: [0.6.0-alpha.2](PUBLISHING-STATUS-0.6.0-alpha.2.md).
