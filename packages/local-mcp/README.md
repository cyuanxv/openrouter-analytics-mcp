# OpenRouter 工作台 — Local MCP

完整的个人费用分析、报告、成本实验和模型预设工具，通过 MCP stdio 在本机运行，使用 SQLite 保存记录。包含与 Sites 版相同的 28 个工具。由 cyuanxv 维护：[X / Twitter @cyuanxv](https://x.com/cyuanxv)。第三方项目，非 OpenRouter 官方产品。

0.6.0-alpha.3 alpha 测试版。本地版不附带网页、后台任务或自动 Telegram 发送；保留报告生成、通知认领和真实回执记录能力，不执行付费推理、充值、Key 修改或生产路由切换。

## 安装（中文）

需要 Node.js 22.22+（22 系列）或 24+。已测试 22.22.2、24.16.0；部分 Node 版本会向 stderr 输出 SQLite 实验性功能提示。

在新的空目录中，从 npm 安装固定版本（也提供 GitHub Release tarball）：

```bash
npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.3
```

在支持本地 MCP stdio 的客户端中新增如下配置。Node 和安装文件都使用自己电脑的绝对路径。通过客户端安全环境设置填写 Key，不把真实密钥粘贴进聊天、Git 或终端命令。

```json
{
  "mcpServers": {
    "openrouter-analytics-mcp-local": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/install/node_modules/@cyuanxv/openrouter-analytics-mcp/dist/stdio.js"],
      "env": {
        "OPENROUTER_WORKBENCH_DATA_DIR": "/absolute/path/to/dedicated-private-data",
        "OPENROUTER_MANAGEMENT_KEY": "REPLACE_IN_CLIENT_SECRET_SETTINGS"
      }
    }
  }
}
```

数据目录必须是绝对路径、专用于本工具；不要指定根目录、家目录本身或源码目录。启动时会设目录权限为 0700、数据库文件为 0600（Windows 需使用者确保 ACL 私有）。数据库文件名 `workbench.sqlite`。符号链接目录、符号链接或硬链接数据库会被拒绝。缺少目录配置、权限不足或迁移失败时启动失败，不显示配置值。

先调用 `routerlens_status`：mode=local-stdio，adapter_version=0.6.0-alpha.3，version 保留共享核心版本 0.5.0。authentication_verified=false 表示没有 Sites 云端身份认证；connectivity_verified=false 表示未测试上游连接。实际账户工具成功才证明自己的 Key 可用。Key 缺失时仍能管理本地记录和访问公开模型目录，账单查询会报错。保留 routerlens_status 等工具 ID 以兼容现有调用。

## 安装与配置自检

从本地 npm 安装目录运行：

```bash
./node_modules/.bin/openrouter-analytics-mcp doctor
./node_modules/.bin/openrouter-analytics-mcp doctor --offline
./node_modules/.bin/openrouter-analytics-mcp doctor --json
./node_modules/.bin/openrouter-analytics-mcp doctor --help
```

从完整源码构建时，可在 `packages/local-mcp` 中运行 `node dist/stdio.js doctor`。同一包不带参数时仍启动原 MCP 服务。

- 检查 Node 版本、Key 配置及 Management 权限、基础账户读取、数据目录权限，用中文说明问题和解决办法。
- 默认只向固定 OpenRouter HTTPS 地址发送 `GET /api/v1/key`、`GET /api/v1/credits`，最多两个请求，每个最多等待 5 秒；普通 Key 或未确认权限时不继续查询余额。
- `--offline` 不联网，只检查本机配置；不能证明 Key 有效或账户可连接。
- 从当前进程的 `OPENROUTER_MANAGEMENT_KEY` 与 `OPENROUTER_WORKBENCH_DATA_DIR` 读取配置。终端不会自动获得 MCP 客户端里的秘密配置；不要把 Key 作为命令参数、写进 Git 或粘贴到聊天。
- 不打印 Key、账户标识或余额；不调用模型，不修改 Key，不创建目录、不试写文件、不打开数据库、不修改权限。检查目录权限不等于验证磁盘空间、数据库完整性或迁移成功。
- 缺少目录会报错；尚未创建但父目录可访问会提示“待确认”，正常启动创建后应再次检查。Windows 的私有 ACL 未自动验证。
- 退出码 `0`：基础检查通过；`1`：发现配置或权限错误；`2`：网络超时、离线、限流、待创建目录等导致未完整验证。`--json` 输出同样的中文诊断和稳定错误代码，便于提交脱敏问题报告。

详见仓库中的 [中文故障排查](https://github.com/cyuanxv/openrouter-analytics-mcp/blob/main/docs/DOCTOR.md)。

## 数据与运行边界

- 数据在自己的 SQLite 中持久保存；账户查询会访问 OpenRouter，返回结果还受 MCP 客户端的数据政策约束。
- 本机同一用户或具备足够文件权限的程序可能访问数据库。记录可能包含费用、请求标识、人工备注和回执，不能提交到公开仓库。
- 停止全部实例后备份整个数据目录；升级前备份。卸载包不会删除数据库。进程收到 SIGINT/SIGTERM 或客户端关闭时会关闭数据库。
- 电脑关闭或进程退出后不能继续运行定时任务。本地版不自动发送 Telegram；模拟回执不可当作真实发送记录。
- ChatGPT 云端不能直接启动本机 stdio 进程。需要云端运行时继续使用 Sites 版。此包不提供公共 HTTP 入口，不使用浏览器传入的 Sites 身份头。

## 从完整源码构建

在完整源码包的 packages/local-mcp 中执行：

```bash
npm ci --ignore-scripts
npm run build
npm test
npm pack --ignore-scripts
```

构建复用 ../../services/routerlens，不能只复制此子目录进行源码构建。生成的 `.tgz` 自带运行产物和迁移文件，用户安装后不需要完整源码树，也无需运行 build。

## English

A local stdio MCP server with all 28 tools from the personal Sites edition: OpenRouter cost analytics, call metadata, anomaly investigation, saved reports, experiments and versioned routing presets. Requires Node.js 22.22+ (22.x) or 24+, your own OpenRouter account and, for account queries, your own Management Key.

Install the pinned alpha into an empty directory using `npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.3`. Configure a local MCP client to run the installed dist/stdio.js with an absolute Node.js path. Set OPENROUTER_WORKBENCH_DATA_DIR to a dedicated absolute private directory; provide OPENROUTER_MANAGEMENT_KEY through client secret settings. You can also install a downloaded release tarball with npm.

SQLite records survive process restarts and package removal. Back up the data directory while all instances are stopped. There is no dashboard, HTTP listener, Sites identity, built-in scheduler or automatic Telegram delivery. This is not a ChatGPT cloud connector. No paid inference, key writes or production routing changes are performed. Returned data is also subject to your MCP client's policies.

Public alpha on npm and GitHub, registered as io.github.cyuanxv/openrouter-analytics-mcp in the official MCP Registry. See the repository publication and verification record. Apache-2.0; independent of OpenRouter.

### Installation diagnostics

Run `./node_modules/.bin/openrouter-analytics-mcp doctor` after installing the package. From the complete source, build first and run `node dist/stdio.js doctor` in `packages/local-mcp`. `--offline` makes no network requests; `--json` emits structured Chinese diagnostics. Available starting with 0.6.0-alpha.2.

The check validates supported Node versions, Management Key identity, basic account credit-read access, and directory access. It only calls the fixed HTTPS `/api/v1/key` and `/api/v1/credits` GET endpoints, with bounded responses and timeouts, and never follows redirects. It prints no key, balance, account identity or raw upstream errors. It does not create folders, write files, open databases, change permissions, mutate keys or invoke models. It does not prove analytics access, database integrity, migration success, free disk space or Windows ACL privacy. Exit codes: 0 = basic checks passed, 1 = configuration/authentication error, 2 = incomplete verification. Terminal and MCP-client environments are separate.

## Release links / 发布链接

安装包、源码与登记标识：

- Repository : https://github.com/cyuanxv/openrouter-analytics-mcp
- npm : https://www.npmjs.com/package/@cyuanxv/openrouter-analytics-mcp
- MCP Registry name : `io.github.cyuanxv/openrouter-analytics-mcp`
- CLI: `openrouter-analytics-mcp`
