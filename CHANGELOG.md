# Changelog

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
