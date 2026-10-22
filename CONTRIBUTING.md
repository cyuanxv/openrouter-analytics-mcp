# Contributing

当前代码位于 `services/routerlens`。Node.js 22 LTS：

```bash
cd services/routerlens
npm ci --ignore-scripts
npm run build
npm test
npm run validate
```

测试不需要真实 Key。请使用当前服务目录完成检查。

提交说明包含问题、变更、测试结果和安全影响。保留不完整数据标记；不执行付费推理、不扩大账户权限、不把模型导出误称为业务切换。

不要提交秘密、个人账单、数据库、构建产物、node_modules、扫描器二进制或演示账号信息。执行 `git diff --check`，并按 SECURITY.md 扫描当前文件与历史。新增品牌素材应注明原始来源和授权边界。
