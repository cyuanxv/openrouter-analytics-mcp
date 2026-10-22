# 发行检查清单

首个公开版本 0.6.0-alpha.1 已发布到 GitHub、npm 和官方 MCP Registry，公开入口安装验收已通过。当前状态见 [发布记录](PUBLISHING-STATUS.md)，自动测试见 [TESTING.md](TESTING.md)。本文件保留原路径，供后续发行复用。

## 当前标识与入口

| 用途 | 值 |
| --- | --- |
| 产品 | OpenRouter 工作台 / OpenRouter Workbench |
| GitHub | https://github.com/cyuanxv/openrouter-analytics-mcp |
| npm | https://www.npmjs.com/package/@cyuanxv/openrouter-analytics-mcp |
| Registry | io.github.cyuanxv/openrouter-analytics-mcp |
| CLI | openrouter-analytics-mcp |
| 已发行本地版 | 0.6.0-alpha.1 |
| Sites 业务核心 | 0.5.0 |

当前本地 npm 包可公开发行，使用 publishConfig.access=public、tag=alpha；没有 private=true 防护。Sites 子项目保留 private=true，避免把云端服务误发到 npm。

## 后续发行前

1. 核对版本、mcpName、包名、server.json 与锁文件；双语 README、安装说明和版本记录应一致。
2. 运行 Linux Node 22/24 CI：本地与 Sites 构建/测试、Sites 产物校验、tarball 实际安装与 stdio 重启读回。检查源码、发行文件及敏感信息。
3. 修改版本号后重新打包并检查发行白名单，避免依赖、数据库、秘密文件进入包。打包构建需要完整源码树。
4. 确认本次发行授权、npm 2FA 与 Registry 登录有效性。先发布 npm，再登记对应版本的 Registry 元数据；已存在的版本先读回核对，不能盲目重复上传。
5. 从公开 npm 入口全新安装并校验发行包；读回 GitHub Release 和 Registry 状态，再更新发布记录。

本清单和 CI 不自动发布、部署或发送通知。发行操作单独授权；不改旧私有仓库、正式 Sites、OpenRouter Key 或云端任务。

## 已有证据的边界

[Cursor 桌面记录](DESKTOP-VALIDATION.md) 覆盖连接、28 工具发现与三项只读对话调用；[真实账户记录](LOCAL-ACCOUNT-VALIDATION.md) 覆盖授权账户的限定只读查询。CI 使用模拟数据，不代替桌面 UI、真实账户或 Sites 部署验收。Windows 原生安装尚未验证。
