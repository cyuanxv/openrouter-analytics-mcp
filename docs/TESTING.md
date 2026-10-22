# Tests / 自动测试与本地检查

[Linux CI](https://github.com/cyuanxv/openrouter-analytics-mcp/actions/workflows/ci.yml) 在 Ubuntu 24.04 上分别使用 Node.js 22、24 的当前可用版本。对 main 推送、Pull Request 和手动触发运行。两组独立检查；任一失败均不能作为通过。

## 自动检查范围

1. 本地包按锁文件安装依赖（忽略安装脚本），构建并执行全部本地测试。
2. 把当前源码打包为 tarball，在新目录安装，核对七文件白名单和元数据；运行安装后的真实 stdio 入口。
3. 发现 28 工具，查询本地状态，写入模拟报告、实验和预设，重启后读取；缺 Key 的账户查询必须失败。
4. Sites 子项目按锁文件安装依赖，构建、运行模拟测试并校验部署产物。CI 仅生成产物，不部署。

CI 不读取 GitHub Secrets、真实 OpenRouter Key 或生产数据库，不执行付费调用、真实通知或发布命令。工作流只有 contents:read 权限，checkout 不保留 Git 凭据；打包安装检查的子进程使用独立 HOME 与空 npm 用户配置，不继承账户 Key。

## 本地执行

从完整源码根目录运行（需要网络下载公开依赖）：

```bash
cd packages/local-mcp
npm ci --ignore-scripts
npm run build
npm test
node scripts/check-installed.mjs
cd ../../services/routerlens
npm ci --ignore-scripts
npm run build
npm test
npm run validate
```

打包检查安装的是当前分支生成的 tarball，不是 npm 上的旧发行版。脚本退出时删除自己创建的临时目录。

## 证据边界

通过的 workflow run 才是对应 Linux/Node 组合的证据；工作流文件本身不代表已运行成功。它验证 Linux 命令行、模拟业务与持久化，不证明 Linux 桌面客户端 UI、其他用户 Key 或 Sites 部署权限。macOS 与真实账户历史验收见 [发布记录](PUBLISHING-STATUS.md) 及其链接。Windows 原生安装仍未验证。

This workflow tests source builds, synthetic business tests, a freshly packed local install and real stdio persistence on Linux with Node.js 22/24. It does not deploy, publish packages, use production credentials or run paid inference. Windows native installation and desktop-client UI remain separate acceptance tasks.
