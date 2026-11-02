# 悠纯财务经营分析 BI｜面试静态作品

这是已经通过视觉验收的纯静态版本，统一情景为“抖音推广低温酸奶”。本仓库只保留 Cloudflare Pages 需要的网页文件，不包含 Python、SQLite、Mock 生成器或本地服务代码。

## 文件说明

- `index.html`：作品入口和九页导览
- `styles.css`：悠纯风格视觉样式
- `data.js`：Mock 指标数据
- `metric-logic.js`：指标公式、代入值、解读和数据来源
- `app.js`：页面渲染、图表、公式弹窗、导出和打印
- `assets/youchun-logo.png`：悠纯 Logo

## 本地预览

在项目根目录执行：

```bash
npx serve .
```

或任意静态文件服务器托管本目录。

## 公网演示

```text
https://youchun-finance-bi-interview.pages.dev/
```

## Cloudflare Pages

- Framework preset：`None`
- Build command：留空
- Build output directory：`/`
- 入口文件：仓库根目录的 `index.html`

部署后访问 Cloudflare 提供的 `*.pages.dev` 公网地址即可。
