# Rework Report

纯前端的返工人工成本报表，基于 **Vite + React + TypeScript**。

## 当前功能

- 页面直接编辑项目名称、标题、工资标准、日期、人数和工时
- 正常工资、加班工资、监工工资自动计算
- 汇总卡片和成本占比自动更新
- 数据自动保存在当前浏览器 `localStorage`
- A4 横向打印 / 浏览器导出 PDF
- 不需要后端或数据库

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

构建产物在 `dist/`。

## 部署到 Vercel

1. 把本目录提交到 GitHub。
2. 在 Vercel 新建 Project 并选择该仓库。
3. Framework Preset 选择 `Vite`（通常会自动识别）。
4. Build Command：`npm run build`
5. Output Directory：`dist`
6. Deploy。

当前没有后端，因此不同浏览器/电脑之间不会同步报表数据。

## 结构

- `src/components/`：页面组件
- `src/lib/calculations.ts`：所有工资和汇总计算
- `src/lib/storage.ts`：本地存储
- `src/styles/print.css`：A4 横向打印样式
- `src/data/defaultReport.ts`：默认报表数据

后续如果要加历史报表、多人使用或跨设备同步，可以再接数据库，不需要改掉现有计算层。
