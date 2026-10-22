> 本文保留发布前准备流程；实际发布状态以仓库版本和公开入口为准。

# 发布前收口清单

当前只准备本地材料，不创建仓库，不发布 npm/Registry，不改 Sites。

## 统一标识

| 用途 | 发布候选值 |
| --- | --- |
| 产品名称 | OpenRouter 工作台 / OpenRouter Workbench |
| 新 GitHub 仓库 | cyuanxv/openrouter-analytics-mcp |
| npm 包 | @cyuanxv/openrouter-analytics-mcp |
| Registry 服务 | io.github.cyuanxv/openrouter-analytics-mcp |
| CLI | openrouter-analytics-mcp |
| 本地包版本 | 0.6.0-alpha.1 |
| Sites 核心版本 | 0.5.0 |

GitHub 仓库尚未创建、npm 包尚未发布；这些 URL 仅作为拟发布元数据。当前准备账户为 cyuanxv；npm 命令行身份、邮箱验证及发布用 2FA 已核对，Registry GitHub 登录与命名空间权限已确认。登录凭据有有效期，正式发布前应再次确认有效性。

## 发布链接（当前未生效）

- 仓库：https://github.com/cyuanxv/openrouter-analytics-mcp
- 安装说明：https://github.com/cyuanxv/openrouter-analytics-mcp/tree/main/packages/local-mcp
- npm：https://www.npmjs.com/package/@cyuanxv/openrouter-analytics-mcp
- 问题反馈：https://github.com/cyuanxv/openrouter-analytics-mcp/issues
- 源码包已包括本地可用的全部对应文档；当前安装使用随附 .tgz。

## 已完成

仓库名已确认使用 `openrouter-analytics-mcp`，产品名保留 OpenRouter 工作台 / OpenRouter Workbench。

名称、版本、mcpName、repository、homepage、bugs、Registry repository/subfolder 一致。简介、Topics、封面、双语 README、安装说明、许可证、品牌归属、版本说明、真实账户脱敏验收已有材料。

新仓库应从干净快照创建首个提交，不复制旧私有 Git 历史。现有私有仓库继续保持原状。

## 桌面客户端验收

Cursor 桌面已登录，独立 tarball 安装后 Connected、28 tools enabled 均由客户端状态和专属日志确认。配置未含真实 Key，已清理并恢复原全局配置状态。详见 [桌面验收记录](DESKTOP-VALIDATION.md)。

Cursor 对话内 routerlens_status、list_cost_reports、list_model_presets 三项只读调用已通过，展开工具卡片确认状态与空列表原始结果。此次未配置 Key、未查上游。非空记录持久化与真实账户验收仍分别记录。

## 待正式发布授权后

1. 按已确认名称创建新仓和全新历史；设置 About、Topics、Social preview。
2. 再次核对 npm 登录、包名与版本可用性，解除 private 防护，重新打包检查后按公开 alpha 发行；当前 private=true 保留。
3. 在公开 npm 包可获取后，确认 Registry 登录有效（必要时重新登录），将登记草稿保存为最终 server.json，复核并登记。
4. 从公共入口重新安装验收，核对显示名称、文档链接和发现信息。

以上发布步骤均未执行；不将本地候选材料表述为已公开可安装。
