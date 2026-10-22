# OpenRouter 工作台 0.6.0-alpha.1

状态：首个公开 alpha 发行。

## 本版新增

- 独立本地 MCP 安装包，完整保留 28 个费用、报告、实验和模型方案工具。
- SQLite 持久保存报告、实验、预设版本及通知回执；支持迁移校验、事务、冲突检查和重启读回。
- 本地 stdio 启动、专用数据目录及私有文件权限；不继承 Sites 云端身份声明。
- 双语安装说明、模拟数据界面图、分享封面和 Registry 元数据草稿。

## 已验证

Node.js 22.22.2、24.16.0 的本地测试、独立 tarball 安装与真实 stdio 协议调用通过；原 Sites 核心 192 项回归通过。使用本机所有者的真实 Management Key，通过安装包只读查询余额、元数据和已结束日期用量。所有记录脱敏，无付费推理。

## 运行边界

本地版没有网页或后台定时任务；电脑关闭后不会继续运行。ChatGPT 云端不能直接启动本机 stdio 进程；云端用途继续使用 Sites 版。未承诺跨平台、全部 Node 版本或全部桌面客户端均已验证。

当前桌面客户端安装验收状态见 RELEASE-CANDIDATE.md；SDK 子进程验收不等于桌面 UI 验收。

Sites 功能核心仍为 0.5.0；本地适配包为 0.6.0-alpha.1。建议未来首次公开时作为 alpha 发布，保留实际支持环境与限制说明。


## 发布标识统一

仓库为 `cyuanxv/openrouter-analytics-mcp`，npm 包为 `@cyuanxv/openrouter-analytics-mcp`，CLI 为 `openrouter-analytics-mcp`，Registry 名称为 `io.github.cyuanxv/openrouter-analytics-mcp`。以上为本次发行标识。产品名继续使用 OpenRouter 工作台 / OpenRouter Workbench；兼容性的工具 ID、数据环境变量和 SQLite 文件名保持不变。
