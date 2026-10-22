> 历史验收记录：下文“未发布”和其他状态仅描述该次检查当时。当前 GitHub、npm 与 Registry 已发布，最新状态见 [发布记录](PUBLISHING-STATUS.md)，持续测试见 [自动测试](TESTING.md)。

# 本地版安装与真实账户只读验收

结果：通过。使用已交付的 0.6.0-alpha.1 tarball，在全新独立安装目录启动真实 MCP stdio 子进程（Node.js 22.22.2），不是直接调用源码代替安装验收。

## 真实账户范围

经用户授权使用 1Password 中本人的 OpenRouter Management Key；通过 1Password CLI 仅在受控进程内存/子进程环境中使用，没有复制到环境文件、源码、安装包、日志或验收记录。没有修改或撤销原 Key。

- 发现 28 个工具；mode=local-stdio，本地状态未冒称 Sites 身份验证。
- 读取账户余额成功，关闭额外费用窗口查询；记录不含余额数值。
- 读取 Analytics 元数据成功。
- 读取 UTC 2026-10-20 00:00 至 2026-10-21 00:00（结束不含）的已结束日期用量成功，结果非空、未截断、totals_complete=true；不保存费用、数量或具体调用明细。
- 独立临时 SQLite 数据库初始为空，验收后已删除。没有读取或修改 Sites 数据库。

仅调用 routerlens_status、list_model_presets、list_cost_reports、get_account_summary、get_analytics_meta、query_usage。上游限定为账户查询与 Analytics 查询；Analytics 的 POST 查询是读取语义，没有付费推理、充值、密钥管理、路由切换、报告生成或通知发送。

## 证据边界

这证明当前账户、该密钥、当前本地安装包和上述日期范围可以读取。未重新逐项调用所有 28 个工具的真实账户路径；持久化写入和全部业务分支由此前模拟测试覆盖。totals_complete 是本次查询返回结果完整性标记，不代表上游未来不会修订账单，也不证明所有异常日期均有完整小时覆盖。

没有发布 npm、GitHub、Registry、ChatGPT，现有私有仓库和 Sites 服务未改动。本次完成时间：2026-10-22 北京时间 01:49。
