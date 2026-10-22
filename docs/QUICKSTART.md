# 新用户快速上手：从安装到第一份费用报告

适用于本地 MCP 版 **0.6.0-alpha.2**。按顺序完成：安装 → 配置自己的 Key → 自检 → 查询账户 → 保存并查看第一份报告。

本地版在自己的电脑上运行，通过 Cursor 等支持本地 MCP stdio 的客户端使用，不附带网页。README 中的界面截图属于 Sites 网页版。想使用网页或 ChatGPT 云端连接，请看 [Sites 安装说明](INSTALL.md)，不用照搬本篇配置。

## 1. 准备与安装

你需要自己的 OpenRouter 账户、Management Key、支持本地 MCP 的客户端，以及 Node.js 22.22+（22 系列）或 24+。Node 23 不支持；已测试 Node 22.22.2、24.16.0。

打开终端，确认版本：

```bash
node --version
npm --version
```

新建一个专门安装本工具的空文件夹，在该文件夹内运行：

```bash
npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.2
```

这里固定版本，避免装到旧版。当前 `@alpha` 指向新版，省略版本可能装到不带自检的旧版。安装后的文件位于此目录的 `node_modules/@cyuanxv/openrouter-analytics-mcp/`，无需下载源码或手动构建。

## 2. 配置自己的 Key 和数据目录

在 OpenRouter 账户的 Management Keys 设置中选用自己的管理密钥。普通模型调用 Key 不足以完成本教程的权限检查。不要把 Key 发给维护者、粘贴进对话、截图或提交到 Git。

在客户端新增本地 MCP 服务。不同客户端的入口不同，通常在 MCP 设置中；以下是常见配置结构，最终以客户端支持的格式为准：

```json
{
  "mcpServers": {
    "openrouter-analytics-mcp-local": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/install/node_modules/@cyuanxv/openrouter-analytics-mcp/dist/stdio.js"],
      "env": {
        "OPENROUTER_WORKBENCH_DATA_DIR": "/absolute/path/to/private-openrouter-data",
        "OPENROUTER_MANAGEMENT_KEY": "REPLACE_IN_CLIENT_SECRET_SETTINGS"
      }
    }
  }
}
```

替换时注意：

- `command` 是受支持的 Node 程序的绝对路径；`args` 是刚安装的 `dist/stdio.js` 的绝对路径。Windows 路径在 JSON 中使用 `/` 或转义的 `\\`。
- `OPENROUTER_WORKBENCH_DATA_DIR` 是专用、私有的数据文件夹的绝对路径。不要用家目录本身、源码目录或安装目录，不要填 `~` 或 `$HOME` 字面量。启动会在这里保存 `workbench.sqlite`，后续一直使用同一目录。
- 优先通过客户端支持的秘密环境设置提供 `OPENROUTER_MANAGEMENT_KEY`，示例占位符本身不能连接账户。若客户端只能把 Key 存到本机 JSON，该文件就是含密钥文件：限制访问权限，不进 Git，也不分享。
- 正常服务的 `args` 不加 `doctor`，否则只运行一次检查就退出。

保存后重启或重新连接该 MCP 服务。首次正常启动会创建数据目录；如果父目录不存在或无法访问，应先选择可用位置。成功标志：客户端显示服务已连接，并列出工具。

## 3. 运行中文自检

自检是终端命令，不是对话工具。在刚才的安装目录运行：

```bash
node ./node_modules/@cyuanxv/openrouter-analytics-mcp/dist/stdio.js doctor
```

**终端与客户端的配置相互独立。** 客户端已经配置 Key，终端仍可能提示“未配置”，这不代表客户端的 Key 丢失。需要向运行自检的进程安全提供相同的两个环境变量。

如果你使用 macOS 或 Linux 的 Bash / Zsh，可在自己的终端执行下面的隐藏输入示例；Key 输入不回显，也不进入命令历史。先把数据路径换成客户端使用的实际路径：

```bash
export OPENROUTER_WORKBENCH_DATA_DIR="/absolute/path/to/private-openrouter-data"
printf '请输入自己的 Management Key（输入不显示）：'
read -r -s OPENROUTER_MANAGEMENT_KEY
printf '\n'
export OPENROUTER_MANAGEMENT_KEY
node ./node_modules/@cyuanxv/openrouter-analytics-mcp/dist/stdio.js doctor
unset OPENROUTER_MANAGEMENT_KEY
```

Windows 请通过自己的终端或密码管理器安全注入环境变量；上面的隐藏输入示例不是 PowerShell 命令。不要将真实 Key 写进命令参数或持久脚本。

成功标志：Node 版本、Management Key 权限、基础账户连接和数据目录检查通过。自检只读账户，不调用模型、不修改 Key、不打印余额或密钥。目录尚未创建时会提示“待确认”；先正常启动服务，再检查。Windows 的目录私有 ACL 需自己在文件夹安全设置中确认。

其他检查方式（同样需要当前终端配置）：

```bash
node ./node_modules/@cyuanxv/openrouter-analytics-mcp/dist/stdio.js doctor --offline
node ./node_modules/@cyuanxv/openrouter-analytics-mcp/dist/stdio.js doctor --json
```

`--offline` 不联网，不能证明 Key 有效。退出码 0 表示基础检查通过，1 表示发现错误，2 表示未完整验证；不要把 2 当成功。更多说明见 [自检排错](DOCTOR.md)。

## 4. 在客户端查询账户

打开已连接此服务的客户端对话，先说：

> 请调用 routerlens_status，确认本地服务已启动，并告诉我适配器版本。不要执行其他操作。

预期 `mode=local-stdio`、`adapter_version=0.6.0-alpha.2`。工具 ID 保留了旧名称；`version=0.5.0` 是共享核心版本，不代表安装包没升级。本地版 `authentication_verified=false` 是没有 Sites 云端身份的正常表现。状态查询不连接账户，`connectivity_verified=false` 也不能单凭此判断连接失败。

再说：

> 请调用 get_account_summary，参数 timezone="Asia/Shanghai"、include_spend_windows=false，只查看我的账户余额，不生成报告、不发送通知。

这一步成功返回账户余额，才说明客户端中的 Key 能读取账户。若想继续看近期费用：

> 请调用 get_account_summary，参数 timezone="Asia/Shanghai"、include_spend_windows=true，查看今天、昨天、最近 7 天和 30 天的费用。缺失数据请明确说明，不要当成零。

余额可读不保证分析接口也可读。如果余额成功、费用查询失败，保留实际错误类别，按 [常见问题](FAQ.md) 排查。客户端可能保存对话与工具结果，分享截图前请隐藏余额、账户标识和私人备注。

## 5. 生成并查看第一份费用报告

在同一客户端中说：

> 请调用 generate_cost_report，参数 kind="weekly"、timezone="Asia/Shanghai"，不填 end_date。生成并保存最近 7 个完整日的费用报告，展示报告日期、费用变化、主要模型、异常状态及数据是否完整。不要发送通知，不调用任何通知认领或回执工具。

这会查询 OpenRouter，并在你的本地数据库保存报告；不会执行付费模型调用。它会比较此前 7 天，异常判断还依赖相应历史数据，刚使用的新账户可能数据不足。

默认统计截至今天零点的最近 7 个完整日，**不包含今天，也不一定等于上一自然周**。例如北京时间 2026-10-22 生成时，范围是 10-15 00:00 至 10-22 00:00，结束日不包含在内。报告时区目前支持 `Asia/Shanghai` 和 `UTC`，请前后一致。

成功标志：返回报告 ID 和日期范围，报告在本地可再次读到。金额“未知”、数据不完整或异常无法判断时，代表证据不足，不代表零费用、没有异常或工具已经确认安全。

查看已保存的报告：

> 请调用 list_cost_reports，参数 limit=5，列出我最近保存的费用报告，不重新生成。

再选一个返回的真实 ID：

> 请调用 get_cost_report，report_id 使用刚才返回的真实报告 ID，展示内容与完整性说明，不重新查询或发送。

`report_id` 应从实际结果复制，不要把“真实报告 ID”作为参数传入。列表和读取只访问已有记录。同一种类、时区和结束日重复生成会返回已存报告，不刷新旧数据；需要阅读旧报告时直接读取即可。

报告中的 `should_notify` 仅表示通知策略判断，**不表示已发送**。本地版没有内置定时任务，也不会自动发 Telegram。报告、预设和实验在电脑上的数据库中；重启客户端后继续使用同一数据目录即可读回。

## 遇到问题

先看 [常见问题](FAQ.md)，再看 [详细自检说明](DOCTOR.md)。反馈时提供版本、系统、Node 版本、脱敏错误代码和发生在哪一步；不要提供 Key、含 Key 的配置文件或完整数据库。
