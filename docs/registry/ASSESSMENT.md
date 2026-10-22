# MCP Registry 本地版现状与发布差距

本地包 0.6.0-alpha.1 已实现，复用 Sites 0.5.0 的 28 个工具，新增 stdio 启动与 SQLite 持久存储。仍仅本地交付，未发布 npm、Registry 或 GitHub。

## 当前验收

Node.js 22.22.2、24.16.0 各 14 项本地测试通过；独立 tarball 全新安装后，实际 stdio 子进程可发现 28 工具，报告、实验和预设在重启后可读。原 Sites 服务 192 项回归通过，源码和配置未改变。详见[本地验收记录](../LOCAL-VALIDATION.md)。

本地版使用自己的 Key 和数据目录，不需要作者公共服务。它运行在用户电脑上，不能直接替代 ChatGPT Sites 的云端连接、网页或定时任务。

## 已完成的适配

| 部分 | 实现位置与行为 |
| --- | --- |
| 运行入口 | packages/local-mcp/src/stdio.ts；stdout 仅 MCP，关闭时释放数据库 |
| 核心复用 | src/index.ts 显式注入账户客户端，注册全部工具 |
| 身份状态 | local-stdio，authentication_verified=false，不继承 Sites 身份声明 |
| 数据库 | src/database.ts，SQLite 适配 prepare/bind/first/all/run/batch，复用两份迁移；校验和、事务及并发写入检查 |
| 发行包 | bin、mcpName、Node engines、依赖锁文件与发行白名单；安装无需源码树 |
| 文档 | 区分本地版与 Sites 版，说明密钥、数据、客户端和运行边界 |

## Registry 草稿与剩余条件

- [server.draft.json](server.draft.json) 描述 npm/stdin-stdout 安装方式，不含私人远程入口，已通过官方 JSON Schema 校验。
- [package.metadata.draft.json](package.metadata.draft.json) 与实际包元数据一致，private=true 防止误发布。
- 拟用名称 io.github.cyuanxv/openrouter-analytics-mcp、npm 包 @cyuanxv/openrouter-analytics-mcp；均未验证命名空间、scope 归属和版本可用性。确认后才能公开发行和登记。
- 仍需授权公开包及干净仓库、验证发布身份、复核当时的 Registry 规则。结构校验通过不代表 Registry 接受或服务获官方背书。
- 已通过本机所有者真实账户的本地包只读验收（余额、元数据、一个已结束日期用量），详见 [记录](../LOCAL-ACCOUNT-VALIDATION.md)；不代表其他账户、全部工具或 ChatGPT 云端已验证。

采用包发布路线：用户自行运行，作者不用开公共服务。若以后改为远程服务路线，需独立讨论用户授权及数据隔离，不能直接使用私人生产站点。

## 官方资料

- [Registry 定位与公开安装要求](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/about.mdx)
- [npm 包类型与 mcpName](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/package-types.mdx)
- [官方发布约束](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/official-registry-requirements.md)
- [校验 Schema](https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json)

Registry 仍在 preview，发布时应重新检查要求。
