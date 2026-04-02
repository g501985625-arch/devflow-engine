# DevFlow Engine - UI 设计需求

## 1. 当前 UI 问题分析

| 问题 | 说明 |
|------|------|
| 布局单调 | 只有简单的网格布局，缺乏层次感 |
| 颜色平淡 | 仅使用 gray-900 背景，缺乏视觉吸引力 |
| 缺少动效 | 无 hover/transition 动画，交互感弱 |
| 图标简陋 | 使用基础 SVG，无品牌视觉 |
| 信息密度低 | 大量空白，数据展示不够紧凑 |

## 2. 推荐设计参考

### 优秀 Dashboard 案例

| 平台 | 风格 | 特点 |
|------|------|------|
| **Linear** | 极简科技感 | 深色渐变 + 紫色点缀 + 微动效 |
| **Vercel Dashboard** | 简洁现代 | 黑白对比 + 状态指示清晰 |
| **GitHub Projects** | 卡片式 | Kanban 风格 + 拖拽交互 |
| **Datadog** | 数据密集 | 图表可视化 + 实时更新 |
| **Stripe Dashboard** | 商务感 | 渐变卡片 + 动态数据 |

### 设计灵感网站

- **Dribbble**: https://dribbble.com/tags/dark-dashboard (527+ 案例)
- **Behance**: https://www.behance.net/search/projects/Dark%20Theme%20Dashboard
- **Figma Templates**: https://www.figma.com/templates/dashboard-designs/
- **Mobbin**: https://mobbin.com/browse/dashboard (真实 App 截图)

## 3. 设计改进建议

### 3.1 品牌色系

```css
/* 推荐色系 - 科技感 */
--primary: #6366F1 (Indigo)     /* 主色 - 按钮/强调 */
--accent: #10B981 (Emerald)     /* 成功状态 */
--warning: #F59E0B (Amber)      /* 进行中 */
--danger: #EF4444 (Red)         /* 错误 */
--bg-dark: #0F172A (Slate-900)  /* 深色背景 */
--bg-card: #1E293B (Slate-800)  /* 卡片背景 */
--text-primary: #F8FAFC         /* 主文字 */
--text-muted: #94A3B8           /* 辅助文字 */
```

### 3.2 组件升级

| 组件 | 当前 | 建议 |
|------|------|------|
| 统计卡片 | 简单数字 | 渐变背景 + 图表 + 动效 |
| 项目列表 | 表格式 | 卡片式 + 进度条 + 状态标签 |
| 事件日志 | 简单列表 | 时间线样式 + 类型图标 |
| Header | 纯文字 | Logo + 导航 + 用户头像 |

### 3.3 新增组件

| 组件 | 用途 |
|------|------|
| **侧边导航栏** | 项目切换/功能导航 |
| **工作流可视化** | ReactFlow 展示任务图 |
| **实时图表** | 任务完成率/Agent状态 |
| **快捷操作栏** | 启动/暂停/添加项目 |

### 3.4 动效建议

- 卡片 hover: scale + shadow 变化
- 数据更新: 数字跳动动画
- 状态切换: 颜色渐变过渡
- WebSocket 断开: 连接动画

## 4. 设计稿交付格式

美术需提供：

| 内容 | 格式 |
|------|------|
| 整体布局 | Figma/Sketch 文件 |
| 配色方案 | CSS 变量列表 |
| 组件规范 | 尺寸/间距/圆角 |
| 图标素材 | SVG 或 PNG |
| 字体建议 | 字体名称/大小/行高 |

## 5. 技术实现约束

- 前端框架: React 19 + TailwindCSS 4
- 图表库: 可选 Recharts / Chart.js
- 动效: CSS transitions / Framer Motion
- 图标: Lucide Icons / Heroicons
- 字体: Inter (已使用)

## 6. 实现流程

```
美术设计 → Figma 设计稿 → 开发评审 → 组件拆分 → CSS 实现 → React 组件 → 集成测试
```

预计工时:
- 设计稿: 2-3 天
- 开发实现: 3-4 天
- 调整优化: 1-2 天

---

## 附录: Linear Dashboard 参考

Linear 是目前最好的开发者工具 Dashboard 参考:
- 网址: https://linear.app
- 特点:
  - 极简深色设计
  - 紫色渐变点缀
  - 卡片 hover 效果
  - 状态标签清晰
  - 动效流畅

建议美术重点参考 Linear 的:
1. 整体布局结构
2. 统计卡片样式
3. 项目列表交互
4. 颜色搭配方案

---

**下一步**: 请美术根据此需求文档，参考 Linear/Vercel/Dribbble 案例，产出 Figma 设计稿。