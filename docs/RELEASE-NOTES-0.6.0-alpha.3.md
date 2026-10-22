# 0.6.0-alpha.3 — readable cost reports / 易读费用报告

Alpha prerelease, 2026-10-23.

Reports now start with spending, the change from the previous period, and the models contributing most to that change. Known results, missing evidence and suggested next steps are clearly separated. A high-spend model is not assumed to be the cause of an increase.

- Compare model costs only when both complete breakdowns reconcile to their account controls. Truncated, empty, unavailable or mismatched evidence remains unknown.
- Explain lower spending, zero baselines and partial anomaly coverage without invented percentages or all-period assurances.
- MCP report text includes the readable summary, report ID and stored delivery state, alongside structured evidence.
- Existing reports are not rewritten or recalculated. Delivery claims, receipts and notification policy remain unchanged.
- Includes the new-user quickstart and FAQ links. Chinese diagnostics and all 28 tools remain available.

Install in an empty directory:

```bash
npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.3
```

Use your own dedicated data directory and Management Key through secret client settings; do not paste secrets into chat or Git. Stop all instances and back up your data directory before upgrading. The existing database remains compatible; new summaries appear on newly generated periods, not old saved reports.

中文：报告先说明“花了多少、比上期多花或少花多少、模型变化来自哪里”，再说明哪些数据已确认、哪些暂时不能判断。已有报告和通知规则保持原样，不补算旧报告。

This package is the local stdio edition, without a web dashboard or built-in scheduler. It performs no paid model inference, Key writes or production routing changes. Existing private repository and Sites production service are outside this release.

Verification and publication evidence are recorded in [PUBLISHING-STATUS.md](PUBLISHING-STATUS.md).
