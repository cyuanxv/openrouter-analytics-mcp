# MCP Registry 本地版实现与登记说明

本地包 0.6.0-alpha.1 已公开发行，Registry 名称为 `io.github.cyuanxv/openrouter-analytics-mcp`。公开元数据读回为 active；当前入口与验收记录见 [发布记录](../PUBLISHING-STATUS.md)。

本地版复用 Sites 0.5.0 的 28 个工具，提供 stdio 启动和 SQLite 持久存储。用户运行自己的安装包、Key 与数据目录，作者不提供共享公共账单服务。本机进程不代替 Sites 网页、云端身份或云端调度。

## 实现

| 部分 | 位置与行为 |
| --- | --- |
| stdio | packages/local-mcp/src/stdio.ts；stdout 仅 MCP，关闭时释放数据库 |
| 工具 | src/index.ts 注入账户客户端，注册全部 28 工具 |
| 身份状态 | local-stdio，不继承 Sites 身份或冒称已验证 Key 连通性 |
| 数据库 | src/database.ts；复用迁移，校验和、事务和并发写入检查 |
| 安装包 | bin、mcpName、engines、锁文件与七文件白名单；安装不依赖源码树 |

## 元数据与发布

- 根目录 [server.json](../../server.json) 是登记元数据；[server.draft.json](server.draft.json) 是保留的模板副本，当前字段一致。
- [package.metadata.draft.json](package.metadata.draft.json) 保留已发行包元数据参考；实际包以 packages/local-mcp/package.json 和公开 npm 版本为准。
- 采用 npm 安装包 + stdio 路线，不包含私人远程 HTTP 入口。
- 发布者 GitHub 命名空间为 io.github.cyuanxv/*，npm 包为 @cyuanxv/openrouter-analytics-mcp。登记前必须先存在可公开获取的对应 npm 版本。
- 结构校验、登记 active 与实际安装分别核验；登记不代表 OpenRouter 官方背书、ChatGPT 审核通过或全部用户账户均已验收。

## 验证边界

本地测试、安装包与持久化验收见 [本地验收](../LOCAL-VALIDATION.md)；公开入口验收见 [发布记录](../PUBLISHING-STATUS.md)；Linux Node 22/24 自动检查见 [测试说明](../TESTING.md)。既有真实账户只读验收不代表其他账户、所有历史日期或 ChatGPT 云端均已验证。

## 官方资料

- [Registry 定位](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/about.mdx)
- [npm 包类型与 mcpName](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/package-types.mdx)
- [发布流程](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/quickstart.mdx)
- [Schema](https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json)

后续发行前应重新检查 Registry 规则与 Schema，不能只依赖历史通过记录。
