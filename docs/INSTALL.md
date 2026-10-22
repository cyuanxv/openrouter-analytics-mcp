> 本页说明 Sites 云端版。使用本地可安装包请看 [本地 MCP 安装说明](../packages/local-mcp/README.md)，两种方式的运行环境不同。

# 安装与验证（0.5.0）

## 先选择使用方式

当前已确定发布方式为**单人、自行部署的源码**，作者不提供公众托管服务。本地 MCP 安装包已公开，但本页介绍的是单人 Sites 部署：没有可供公众连接的共享分析服务。任何版本读取账单都需要使用者自己的 Key，无需给作者提供 Key。

- 只阅读或验证源码：执行下面四条命令，无需云账户或密钥。
- 使用自己的数据：需要自己创建受信任的 Sites 部署、D1 数据库和 OpenRouter Management Key。
- 运行共享多用户 Sites 服务：需要另行设计每人独立授权和数据隔离；当前版本不支持，不能解除 owner 限制来代替。

## 从零获取源码与本地验证

准备 Node.js 22.22+（22 系列）或 24+ 与 npm，从公开仓库克隆，或解压 GitHub Release 源码到 `openrouter-analytics-mcp`。获取源码和安装依赖需要网络；测试使用模拟数据，不读取真实账户，也不需要配置任何密钥。

```bash
git clone https://github.com/cyuanxv/openrouter-analytics-mcp.git
cd openrouter-analytics-mcp
```

下面的命令在源码根目录执行：

```bash
cd services/routerlens
npm ci --ignore-scripts
npm run build
npm test
npm run validate
```

生成 `dist/server/index.js`、`dist/.openai/hosting.json` 和数据库迁移文件。构建成功不代表已部署。

## 部署前先检查平台能力

本地安装和测试通过后，先确认你自己的账户具备 Sites 项目创建、受信任身份转发、D1 绑定、Secret 设置和发布权限。缺少这些能力时，此源码不能按当前方式直接上线；安装成功不代表平台权限已经具备。不要改成信任浏览器传来的身份头。

## 自己部署到 Sites

这不是通用 Vercel/任意 Worker 一键部署包。源码依赖 Sites 身份转发与 D1 绑定，部署者需拥有对应平台能力。

1. 在自己的 Sites 账户创建独立项目，保持仅本人访问，不使用作者的项目或服务地址。
2. 修改 `worker/index.ts` 中 `OWNER_EMAIL` 与 `SITE_ORIGIN` 为自己的已验证账户及最终 HTTPS 站点源；修改 `.openai/hosting.json` 的 `project_id` 为新项目 ID。同时将 `tests/worker.test.mjs` 的 `ownerHeaders` 邮箱和 `base` 地址改为相同值，否则配置后的权限测试会因仍使用示例账户而失败。不要修改 owner 检查逻辑。
3. 只有受信任网关能注入 `oai-authenticated-user-id` / `oai-authenticated-user-email`。必须阻断绕过网关的直接访问，并覆盖客户端同名头；普通反向代理只透传头是不安全的。做不到请停止部署。
4. 为新项目绑定 D1 为 `DB`。按顺序应用 `drizzle/0000_personal_ops.sql`、`drizzle/0001_routing_presets.sql`；仓库构建会把迁移文件打包到 `dist/.openai/drizzle`，Sites 发布时自动应用；无需手动向数据库执行 SQL。勿向已有生产库盲目重放。
5. 在平台的服务端 Secret 设置填写自己的 `OPENROUTER_MANAGEMENT_KEY`。不要在聊天、Git、前端、插件 JSON 或演示视频中填写它。此 Key 有管理权限，本服务只暴露限定查询。
6. 重新运行构建、测试和 validate，再通过平台支持的发布流程上传生成的产物。若部署后新增或修改 Secret，需要重新部署已保存版本才能应用。具体 Sites 权限和上传入口以你的账户为准；本仓没有替你自动创建项目的 CLI。
7. 保留 manifest 中 `capabilities: ["mcp"]`；Sites 发布后会为新站创建私有插件。在 ChatGPT/Codex 中使用该站生成的插件，必要时安装或连接，工具未出现时开启新会话。先调用 `routerlens_status`，确认 `authentication_verified=true`；再实际调用账户工具确认密钥可用。不要从公网手填身份头来“验证登录”。

## 上线验收

- 未登录/非本人调用账户工具必须拒绝；协议发现允许公开定义，不允许公开账单。
- 本人登录后先看配置状态，再读账户摘要。配置状态不能代替真实连通验证。
- 查询一个已结束日期，对照 OpenRouter 账户结果，并核对完整性标记。
- 用单独测试数据库验证报告与预设保存；不要拿真实生产数据做演示。
- 若配置 Telegram，目标由部署者选择；先确认 `should_notify` 和认领结果，不能重复补发。

## 插件配置

根目录 `plugin.json`、`.codex-plugin/plugin.json`、`mcp.json`、`.mcp.json` 是同步的准备模板。`routerlens.example.invalid` 故意不可连接；为自己的安装副本填写已部署并验证的 endpoint，且配合该平台实际支持的认证。不要直接使用作者的私人 endpoint。

OpenRouter 官方 MCP 是另一个外部服务，其工具和授权范围不属于本分析桥的只读保证。安装前应分别确认该服务的工具权限。

## 更新

先备份自己的数据库与部署版本，再拉取新代码、重跑验证，检查迁移后发布。不要提交环境文件、数据库导出、报告正文或发送回执到公开仓库。

## 本仓验证到哪一步

见 [全新安装验证记录](SELFHOST-VALIDATION.md)。验证覆盖独立源码副本、空依赖缓存安装、构建、模拟数据库/鉴权测试及产物校验；另已完成独立 Sites 项目、新数据库和真实账户查询验收，详细范围与限制见记录。ChatGPT 上架材料不属于安装所需条件。
