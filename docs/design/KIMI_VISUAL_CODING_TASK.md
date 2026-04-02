# Kimi Visual Coding 设计优化任务

## 任务说明
访问 https://kimi.com/websites 使用 Visual Coding 功能优化 DevFlow Engine UI。

## 项目信息
- **项目名称**: DevFlow Engine
- **技术栈**: React 19 + TailwindCSS 4
- **设计风格**: 深蓝/青色主色调，现代科技感，支持深色/浅色模式

## 当前 UI 结构

### 页面模块 (5 个)
1. **Dashboard** - 项目概览仪表板
2. **Workflow** - 6 阶段工作流（需求→架构→UI设计→开发→整合→扩展）
3. **Agents** - 7 角色管理（总管、架构师、主程序、开发员、美术、规划师、主管）
4. **Progress** - 进度追踪
5. **Workspace** - 工作区文件管理

### 核心组件
- Header - 头部导航 + 主题切换
- Sidebar - 侧边栏菜单
- Layout - 布局框架
- ProjectCard - 项目卡片
- AgentAvatar - Agent 头像
- PhaseIndicator - 阶段指示器
- ProgressBar - 进度条
- FileTree - 文件树

## 优化需求

### 1. 视觉优化
- [ ] 更现代的渐变效果
- [ ] 流畅的动画过渡
- [ ] 更好的阴影层次
- [ ] 响应式设计优化

### 2. 交互优化
- [ ] 悬停反馈效果
- [ ] 点击涟漪效果
- [ ] 加载骨架屏
- [ ] 页面切换动画

### 3. 布局优化
- [ ] 更紧凑的间距
- [ ] 更好的信息层次
- [ ] 卡片网格自适应
- [ ] 移动端适配

## 设计参考

### 颜色方案
```css
/* 主色调 */
--primary-blue: #2563eb;
--primary-cyan: #06b6d4;

/* 背景 */
--bg-light: #f3f4f6;
--bg-dark: #111827;

/* 卡片 */
--card-light: #ffffff;
--card-dark: #1f2937;
```

### Agent 颜色
| 角色 | 颜色 |
|------|------|
| 总管 (Director) | #8b5cf6 (紫色) |
| 架构师 (Architect) | #2563eb (蓝色) |
| 主程序 (LeadDev) | #059669 (绿色) |
| 开发员 (Developer) | #0891b2 (青色) |
| 美术 (Artist) | #ec4899 (粉色) |
| 规划师 (Planner) | #ea580c (橙色) |
| 主管 (Supervisor) | #dc2626 (红色) |

### 工作流阶段颜色
| 阶段 | 颜色 |
|------|------|
| REQUIREMENTS | #3b82f6 (蓝色) |
| ARCHITECTURE | #8b5cf6 (紫色) |
| UI_DESIGN | #ec4899 (粉色) |
| DEVELOPMENT | #10b981 (绿色) |
| INTEGRATION | #f59e0b (橙色) |
| EXTENSION | #06b6d4 (青色) |

## 输出要求

将优化后的代码输出到以下路径：
```
/Users/macipad/.openclaw/workspace-chief-architect/devflow-engine/src/frontend/
```

### 文件结构
```
src/frontend/
├── App.tsx                    # 主应用入口
├── styles/
│   └── globals.css           # 全局样式
├── components/
│   ├── Layout.tsx            # 布局框架
│   ├── Header.tsx            # 头部导航
│   ├── Sidebar.tsx           # 侧边栏
│   ├── ProjectCard.tsx       # 项目卡片
│   ├── AgentAvatar.tsx       # Agent 头像
│   ├── PhaseIndicator.tsx    # 阶段指示器
│   ├── ProgressBar.tsx       # 进度条
│   └── FileTree.tsx          # 文件树
└── pages/
    ├── Dashboard.tsx         # 仪表板
    ├── Workflow.tsx          # 工作流
    ├── Agents.tsx            # Agent 管理
    ├── Progress.tsx          # 进度追踪
    └── Workspace.tsx         # 工作区
```

## 使用方式

1. 访问 https://kimi.com/websites
2. 选择 "Visual Coding" 功能
3. 上传当前代码或粘贴设计需求
4. 让 Kimi 生成优化后的 UI 设计
5. 将生成的代码复制到项目对应文件

## 当前代码预览

### globals.css (核心样式)
```css
/* DevFlow Engine - Global Styles */
@import "tailwindcss";

:root {
  --primary-blue: #2563eb;
  --primary-cyan: #06b6d4;
  --bg-light: #f3f4f6;
  --bg-dark: #111827;
  --card-light: #ffffff;
  --card-dark: #1f2937;
}

.dark {
  color-scheme: dark;
}

* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
```

---

**任务创建时间**: 2026-04-02 00:00 GMT+8
**负责人**: 用户 (手动在 Kimi Visual Coding 执行)