# FDE 自学与自测 · 独立托管版

基于 lusouldepth-ai/FDE_Learning，原始提交 abd668708cf9c876069908b1d30b8fa3010cd6c5；题库版本 2026.10.13.3。

这是纯静态站点，运行所需 HTML、CSS、JavaScript 和题库均位于 dist/。无 OpenAI API、OpenAI 域名、外部字体或外部脚本依赖。来源链接只在用户主动点击时打开。

## 部署文件

- `FDE-static-upload.zip`：解压后首页位于根目录，适合直接上传静态托管。
- 本源码包：含 dist/、测试、GitHub Pages 自动发布工作流和 Vercel 配置。

### GitHub Pages

将本源码包（包括 .github/ 隐藏目录）推送到自己的仓库 main 分支。在仓库 Settings → Pages → Source 选择 GitHub Actions，运行 Publish FDE static site 工作流。
资源使用相对路径，可运行于 `https://用户名.github.io/仓库名/`，也可绑定自定义域名。不要将源码推送到未授权的原作者仓库。

### Vercel

导入自己的仓库，Framework Preset 选择 Other，构建命令留空，输出目录 dist。本包的 vercel.json 已声明这些设置。生产部署的访问保护应关闭，才能免登录使用。然后绑定自己的域名，按平台实际给出的 DNS 记录配置解析。

### Cloudflare Pages

可在控制台创建 Direct Upload 项目，上传 FDE-static-upload.zip 或解压后的文件夹。若采用 Git integration，构建命令留空，输出目录 dist。绑定自定义域名时使用平台给出的实际 DNS 记录。

### 国内静态托管

dist/ 也可用于腾讯云等静态托管。中国大陆节点需按所选平台的要求完成域名备案；境外节点需实测中国电信、联通、移动等线路，不能仅凭域名判断可达性。请选择自己账号下的托管资源，费用与域名购买另行确认。

## 进度迁移

浏览器数据库按网站地址隔离。换域名后旧地址的进度不会自动出现。
1. 在旧网站“数据备份”导出学习备份。
2. 打开新网站，进入“数据备份”导入并合并。
3. 确认学习统计、收藏、错题和模拟历史后继续使用。

每个访问者的记录仍仅保存在其自己的浏览器中。清除网站数据、无痕窗口关闭或更换浏览器可能丢失记录，请定期导出备份。

## 验证

`npm test` 运行核心逻辑测试。
`python3 -m http.server 8796 --bind 127.0.0.1` 启动预览。
安装 Playwright/Chromium 后，以 `FDE_TEST_URL=http://127.0.0.1:8796/dist/ node tests/online.browser.mjs` 验证仓库子路径、学习进度、考试和备份流程。

## 原作者与许可

原项目：https://github.com/lusouldepth-ai/FDE_Learning
题库内容保持不变，保留原项目来源与非官方声明。见 UPSTREAM-LICENSING.md、UPSTREAM-README.md；本适配不对原作品另行授予许可。
