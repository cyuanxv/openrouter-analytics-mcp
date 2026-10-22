# 0.6.0-alpha.2 — 安装与配置自检

新增 `openrouter-analytics-mcp doctor`：中文检查 Node 版本、Management Key 权限、基础账户连接及数据目录，并给出处理建议。支持 `--offline` 和 `--json`，区分检查通过、错误和未完整验证。

只访问固定 OpenRouter HTTPS 只读接口；不输出 Key、账户标识或余额，不调用模型，不修改 Key、数据库或目录权限。默认 MCP 入口保留原有 28 个工具。

本地 Node 22 / 24 和前一功能提交的 Linux CI 已通过；候选版真实账户只读验收也通过。本次版本的 Linux 双版本 CI 和公开 npm 安装验收已通过，Registry 回读为 active；详见发布记录。

安装：`npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.2`。然后在安装目录运行 `./node_modules/.bin/openrouter-analytics-mcp doctor`。Key 应通过秘密环境设置提供，不得放进命令参数。

Alpha prerelease. Adds Chinese diagnostics for supported Node versions, Management Key identity, basic account connectivity and data-directory access. Offline and JSON modes distinguish incomplete checks from success. Existing 28 MCP tools remain available. No paid inference, credential mutations, deployment or production routing changes.
