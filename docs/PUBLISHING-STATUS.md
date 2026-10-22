# Publication status / 当前发布状态

Updated: 2026-10-22.

| Channel | Status |
| --- | --- |
| GitHub source | Public: cyuanxv/openrouter-analytics-mcp, clean independent history |
| GitHub Release | v0.6.0-alpha.1 prerelease, installable tarball available |
| npm | Not published yet. Upload requests timed out; no success receipt. |
| MCP Registry | Not registered yet; requires the public npm package first. |

## Install now / 现在安装

Use the GitHub Release tarball from an empty directory:

```bash
npm install --ignore-scripts https://github.com/cyuanxv/openrouter-analytics-mcp/releases/download/v0.6.0-alpha.1/cyuanxv-openrouter-analytics-mcp-0.6.0-alpha.1.tgz
```

Then follow [MCP client configuration](../packages/local-mcp/README.md). The package itself includes a README prepared for the npm channel; until npm publication succeeds, use the GitHub command above.

The GitHub tarball was downloaded without authentication and matched the local release artifact. Installation and real stdio startup passed on macOS with Node.js 22.22.2 and 24.16.0: 28 tools, report/preset/experiment persistence across restart, and expected account-query failure without a key. No real account credentials or paid inference were used in this public-entry check.

Publishing to GitHub does not publish to npm or MCP Registry. Windows/Linux native installation is not yet verified. Sites deployment is separate; no shared public billing endpoint is provided.
