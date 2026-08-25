# Rework Report

返工人工成本报表，基于 **Vite + React + TypeScript**，部署在 Vercel。报表数据仍只保存在当前浏览器 `localStorage`，服务端仅负责访问密码验证，不接收或保存报表内容。

## 当前功能

- 页面直接编辑项目名称、标题、工资标准、日期、人数和工时
- 正常工资、加班工资、监工工资自动计算
- 汇总卡片和成本占比自动更新
- 数据自动保存在当前浏览器 `localStorage`
- A4 横向打印 / 浏览器导出 PDF
- Vercel 服务端共享密码验证
- 登录成功后使用 `HttpOnly` Cookie 保持 7 天登录状态
- 工具栏支持退出登录

## 访问保护

生产环境需要配置两个 **Vercel Environment Variables**：

```text
REWORK_REPORT_PASSWORD=<两位使用者共用的强密码>
REWORK_SESSION_SECRET=<高强度随机签名密钥>
```

`REWORK_REPORT_PASSWORD` 不要以 `VITE_` 开头，否则会被 Vite 暴露到浏览器。

### 生成 `REWORK_SESSION_SECRET`

PowerShell：

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

或 OpenSSL：

```bash
openssl rand -base64 48
```

在 Vercel 中进入：

**Project → Settings → Environment Variables**

把两个变量至少添加到 **Production**。如果也希望 Preview Deployment 受同一密码保护，可以同时添加到 **Preview**。

环境变量修改只会应用到新的 Deployment，因此配置完成后需要 **Redeploy** 一次。

> 如果尚未配置环境变量，应用会默认拒绝访问，不会退化成公开模式。

## 本地运行

只调试 React 页面：

```bash
npm install
npm run dev
```

如需连同 Vercel Functions 与 Routing Middleware 一起测试登录：

```bash
npx vercel dev
```

本地测试前可创建 `.env.local`（已被 Git 忽略）：

```text
REWORK_REPORT_PASSWORD=your-password
REWORK_SESSION_SECRET=your-random-secret
```

生产构建：

```bash
npm run build
```

构建产物在 `dist/`。

## 部署到 Vercel

仓库连接 Vercel 后，推送 `main` 即可自动部署。Framework Preset 使用 `Vite`，构建命令 `npm run build`，输出目录 `dist`。

## 访问保护实现

- `public/login.html`：独立登录页，不包含密码或签名密钥
- `api/login.ts`：服务端校验密码并签发 7 天会话 Cookie
- `api/logout.ts`：清除会话 Cookie
- `middleware.ts`：在 Vercel CDN 缓存之前检查会话，未登录则跳转登录页
- `server/auth.ts`：HMAC 会话签名与验证

会话 Cookie 使用 `HttpOnly + SameSite=Lax`，生产 HTTPS 下同时使用 `Secure`。浏览器端 JavaScript 无法读取该 Cookie。

## 结构

- `src/components/`：页面组件
- `src/lib/calculations.ts`：所有工资和汇总计算
- `src/lib/storage.ts`：本地存储
- `src/styles/print.css`：A4 横向打印样式
- `src/data/defaultReport.ts`：默认报表数据
- `api/`：登录 / 退出 Vercel Functions
- `server/`：服务端鉴权工具
- `middleware.ts`：Vercel Routing Middleware

后续如果要增加历史报表、独立用户、审计日志或跨设备同步，再接数据库即可，不需要推翻现有计算层。
