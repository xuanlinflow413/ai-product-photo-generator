# Changelog

## Account and billing development skeleton

### Added
- Cloudflare Pages Worker routes for development login/logout/session restoration, protected account data, plans, checkout contract, signed payment webhooks, and idempotent export accounting.
- D1 migration for users, orders, webhook events, and export jobs.
- `/login/` and `/account/` static pages connected to the runtime Worker rather than mocked browser state.
- Worker integration tests covering authorization, session restoration/logout, provider-unavailable checkout, webhook signature/idempotency, and failure-safe export credits.

### Architecture and safety
- Preserved the Next.js static export and existing browser ZIP workflow.
- Payment success never trusts frontend query parameters; only the signed webhook grants credits.
- No OAuth, real payment, production D1, deployment, DNS, token, cookie, or secret was copied from KindReply or contacted.

## Marketplace Image Pack MVP

### Added
- `/marketplace-image-fixer/` for local batch image preparation.
- Amazon, Etsy, and eBay platform selections with deterministic square canvas and JPG output rules.
- Real browser-generated ZIP downloads with per-platform folders and `manifest.json`.
- Explicit scope messaging for capabilities not implemented yet: background removal, generative scenes, and visual compliance judgments.

### Technical notes
- Added `jszip` for client-side archive generation; no image data is sent to a third party.
- Run with `npm run dev`, then visit `/marketplace-image-fixer/`.

## v0.3 — 2025-05-02

### 新增
- **SEO 基础**
  - `app/sitemap.ts` — 动态生成 sitemap.xml
  - `app/robots.ts` — 生成 robots.txt（允许所有爬虫，指向 sitemap）
  - OG 品牌图片 (`public/og-image.png`) — 1200×630，英文文案，无虚假评分
  - JSON-LD 结构化数据 (`SoftwareApplication`) — 无虚假 aggregateRating/review
- **Waitlist 邮箱收集**
  - `components/sections/waitlist.tsx` — 页面底部独立 Waitlist 区块
  - 支持 Tally.so 集成（通过 `NEXT_PUBLIC_TALLY_WAITLIST_URL`）
  - 未配置 Tally URL 时显示 "Waitlist form coming soon"
  - Pricing 卡片 "Join Waitlist" 按钮滚动到底部 Waitlist 区
- **GA4 统计预留**
  - `lib/analytics.ts` — 事件追踪工具函数（条件加载，无 GA ID 时不报错）
  - `components/ga4-script.tsx` — GA4 脚本加载组件
  - CTA 点击追踪：Hero Try Demo / See How It Works、Demo Generate、Pricing Join Waitlist
- **next.config.ts** — 添加 `trailingSlash: true` 优化静态导出

### 优化
- **Meta 标签完善** — canonical URL、OG、Twitter Card 使用正式域名
- **布局调整** — page.tsx 引入 Waitlist 组件

### 技术决策
- 不接真实 AI API、remove.bg、登录、支付、数据库、Dashboard
- Waitlist 使用 Tally.so 轻量方案，不自建后端
- GA4 预留代码，待提供 `NEXT_PUBLIC_GA_ID` 后启用

---

## v0.2 — 2025-05-02

### 新增
- **How It Works 流程区块** (`components/sections/how-it-works.tsx`)
  - 三步流程展示：上传产品图 → 选择场景模板 → 预览 AI 生成结果
  - 每个步骤包含图标、标题和详细说明
- **导航栏新增 How It Works 链接** — 桌面端和移动端菜单均支持跳转
- **Footer 新增 How It Works 链接**

### 优化
- **Hero 文案重写** — 更聚焦用户痛点和价值主张
  - 副标题改为 "AI product photo generator — demo available"
  - H1 改为 "Professional Product Photos Without a Studio"
  - CTA 改为 "Try Free Demo" + "See How It Works"
  - 底部提示改为 "No signup required. Preview only — AI generation coming soon."
- **Demo 区块增加状态横幅** — 明确说明当前为 UI 演示，AI 生成将在 v1.0 上线
- **Pricing 区块增加说明** — Pro 和 Business 为计划功能，引导加入 waitlist
- **场景模板描述补充** — 每个场景增加 "Demo preview only" 提示
- **生成结果区域补充** — 增加 "Demo only — not for commercial use" 提示
- **FAQ 回答补充** — 平台支持问题中增加 demo 状态说明

### 修复
- 无

---

## v0.1 — 2025-05-02

### 新增
- 初始项目搭建
- Hero 区块（标题、副标题、CTA）
- Demo 区块（图片上传、场景选择、生成预览）
- Pricing 区块（Free / Pro / Business 三档定价）
- FAQ 手风琴区块（10 个常见问题）
- Footer 导航
- 响应式 Navbar（桌面 + 移动端菜单）
- 静态导出配置（`output: 'export'`）

### 技术栈
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui
- next-intl 国际化（配置完成，UI 待接入）
