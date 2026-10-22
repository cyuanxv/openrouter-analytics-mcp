> 历史验收记录：下文“未发布”和其他状态仅描述该次检查当时。当前 GitHub、npm 与 Registry 已发布，最新状态见 [发布记录](PUBLISHING-STATUS.md)，持续测试见 [自动测试](TESTING.md)。

# Cursor 桌面对话验收

2026-10-22 结果：安装、stdio 连接、28 工具发现，以及以下三个对话内只读工具调用通过。

## 环境和范围

使用最终本地 tarball 独立安装，Node.js 22.22.2，Cursor 桌面本地对话。专用 MCP 配置使用独立空数据目录，未配置 OpenRouter Key，也未连接 Sites。按用户要求不验收 Claude。

## 实际调用证据

Cursor 对话显示三个 Ran 工具卡片；逐一展开卡片确认工具原始返回，而非只依据模型总结：

| 工具 | 原始结果 |
| --- | --- |
| routerlens_status | OpenRouter 工作台 is running, but account analytics needs OPENROUTER_MANAGEMENT_KEY. |
| list_cost_reports | {"reports":[]} |
| list_model_presets | {"presets":[],"production_change_performed":false,"paid_inference_performed":false,"scope":"routerlens_saved_configuration"} |

空列表符合本次独立空数据库的预期。本次确认了桌面对话到本地 MCP 的真实调用与空记录读取；非空记录和重启持久化已有独立 SDK 验收，不能混同为本次桌面验收范围。账户查询仍需用户自行配置 Key，本次未运行账户查询、付费推理或写入工具。

Cursor 模型选择曾显示付费升级提示，但实际对话成功完成上述调用；未升级账户或开启付费设置。不将提示当作验收阻塞。

## 清理和证据边界

已移除专用临时 MCP 配置，恢复验收前没有全局 mcp.json 的状态；未更改其他客户端配置。既有私有仓库、Sites 服务、定时任务和 OpenRouter Key 未改动，也未发布 npm、GitHub 或 Registry。

包含客户端账户信息的界面截图与可访问性原始记录仅保留在本机任务验收目录，不放入公开候选源码。先前的连接日志证明 stdio 连接，本次工具返回由 Cursor 展开卡片独立确认。
