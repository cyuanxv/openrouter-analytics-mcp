# 本地 MCP 可安装版（0.6.0-alpha.1）

本地版已公开到 npm，并已登记官方 MCP Registry。安装：`npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.1`。当前状态见 [发布记录](PUBLISHING-STATUS.md)。

[安装与客户端配置](../packages/local-mcp/README.md) · [Registry 评估](registry/ASSESSMENT.md)

本地版复用 0.5.0 核心全部 28 工具，新增 stdio 入口和 SQLite 适配。报告、实验、预设、版本冲突与通知回执工具均保留。没有 Sites 网页、云端身份和云端定时运行，运行依赖自己的电脑与客户端。

源码位置：packages/local-mcp。现有 services/routerlens 的 Worker 源码和配置保持不变；根目录插件清单仍是 Sites 版模板。本地版按独立安装说明配置，不用私人站点替代。

测试使用模拟数据，不代表真实账户或 ChatGPT 云端验收。
