# 美术任务：参考优秀应用设计 DevFlow Engine UI

## 任务说明
参考以下优秀应用的 UI 设计，为 DevFlow Engine 创造一个现代、美观、专业的前端界面。

## 项目信息
- **项目名称**: DevFlow Engine
- **项目路径**: `/Users/macipad/.openclaw/workspace-chief-architect/devflow-engine`
- **技术栈**: React 19 + TailwindCSS 4
- **源代码目录**: `src/frontend/`

---

## 参考应用设计

### 1. Linear - 项目管理
**风格特点**:
- 极简主义，大量留白
- 深色主题为主，优雅的紫色/蓝色渐变
- 流畅的微交互动画
- 键盘优先的操作体验
- 侧边栏紧凑，图标清晰

**可借鉴元素**:
- 侧边栏折叠设计
- 卡片悬停效果
- 进度条动画
- 标签页切换动画

**参考链接**: https://linear.app

---

### 2. Vercel Dashboard - 部署平台
**风格特点**:
- 黑白灰为主，蓝色强调
- 极度扁平化设计
- 清晰的数据可视化
- 状态指示器简洁明了

**可借鉴元素**:
- Dashboard 布局结构
- 部署状态卡片
- 实时进度显示
- 图表设计

**参考链接**: https://vercel.com/dashboard

---

### 3. Raycast - 效率工具
**风格特点**:
- 毛玻璃效果 (Glassmorphism)
- 渐变背景
- 圆润的边角
- 流畅的弹出动画

**可借鉴元素**:
- 搜索框设计
- 命令面板样式
- 快捷键提示
- 列表项悬停

**参考链接**: https://raycast.com

---

### 4. Notion - 知识管理
**风格特点**:
- 干净的白色/深色切换
- 侧边栏树形结构
- 内容为主的布局
- 丰富的图标系统

**可借鉴元素**:
- Workspace 文件树
- 页面层级导航
- 标签系统
- 面包屑导航

**参考链接**: https://notion.so

---

### 5. GitHub Projects - 项目看板
**风格特点**:
- 看板视图 + 列表视图
- 状态标签颜色系统
- 拖拽排序体验
- 过滤器侧边栏

**可借鉴元素**:
- Kanban 看板设计
- 任务卡片样式
- 标签/状态颜色
- 过滤器 UI

**参考链接**: https://github.com/features/projects

---

### 6. Figma - 设计工具
**风格特点**:
- 工具栏密集但有序
- 图层树清晰
- 属性面板紧凑
- 专业工具软件风格

**可借鉴元素**:
- 工具栏设计
- 图层面板
- 属性检查器
- 快捷操作按钮

**参考链接**: https://figma.com

---

### 7. Discord - 社区平台
**风格特点**:
- 深色主题主导
- 左侧服务器列表
- 中间频道导航
- 右侧成员面板

**可借鉴元素**:
- 三栏布局
- 用户头像状态
- 消息列表样式
- 通知徽章

**参考链接**: https://discord.com

---

## DevFlow Engine 设计规范

### 核心功能模块

#### 1. Dashboard (仪表板)
参考: Linear Dashboard, Vercel Dashboard
- 项目概览卡片 (3-4 列网格)
- 快速操作按钮区
- 最近活动时间线
- 系统状态指示器

#### 2. Workflow (工作流)
参考: GitHub Projects, Linear Cycles
- 6 阶段进度条 (需求→架构→UI设计→开发→整合→扩展)
- 阶段卡片展开/折叠
- 当前阶段高亮
- 阶段间连接线动画

#### 3. Agents (角色管理)
参考: Discord 成员列表, Raycast 扩展列表
- 7 个 Agent 卡片 (总管、架构师、主程序、开发员、美术、规划师、主管)
- 状态指示灯 (在线/离线/忙碌)
- 角色图标 + 颜色区分
- 快速操作菜单

#### 4. Progress (进度追踪)
参考: Vercel 部署日志, Linear 时间线
- 任务列表 + 进度条
- 时间线视图
- 过滤器 (按阶段/角色/状态)
- 统计图表

#### 5. Workspace (工作区)
参考: Notion 侧边栏, Figma 图层树
- 文件树组件
- 代码预览区
- 文件操作菜单
- 搜索/过滤功能

---

### 颜色方案

```css
/* 主色调 - 科技蓝/青 */
--primary: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
--primary-hover: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%);

/* 背景 */
--bg-light: #f8fafc;
--bg-dark: #0f172a;
--bg-card-light: #ffffff;
--bg-card-dark: #1e293b;

/* 文字 */
--text-primary: #0f172a (light) / #f1f5f9 (dark);
--text-secondary: #64748b;

/* Agent 角色颜色 */
--director: #8b5cf6;     /* 总管 - 紫色 */
--architect: #2563eb;    /* 架构师 - 蓝色 */
--leaddev: #059669;      /* 主程序 - 绿色 */
--developer: #0891b2;    /* 开发员 - 青色 */
--artist: #ec4899;       /* 美术 - 粉色 */
--planner: #ea580c;      /* 规划师 - 橙色 */
--supervisor: #dc2626;   /* 主管 - 红色 */

/* 工作流阶段颜色 */
--requirements: #3b82f6;   /* 需求 - 蓝色 */
--architecture: #8b5cf6;   /* 架构 - 紫色 */
--ui-design: #ec4899;      /* UI设计 - 粉色 */
--development: #10b981;    /* 开发 - 绿色 */
--integration: #f59e0b;    /* 整合 - 橙色 */
--extension: #06b6d4;      /* 扩展 - 青色 */
```

---

### 设计要点

#### 视觉风格
- ✅ 现代扁平化 + 微妙渐变
- ✅ 圆角 8-12px
- ✅ 阴影层次: sm / md / lg
- ✅ 毛玻璃效果 (可选)

#### 动画效果
- ✅ 过渡时间: 150-300ms
- ✅ 缓动函数: ease-in-out
- ✅ 悬停缩放: scale(1.02)
- ✅ 点击涟漪效果

#### 响应式
- ✅ 移动端: 侧边栏折叠为抽屉
- ✅ 平板: 2 列网格
- ✅ 桌面: 3-4 列网格

#### 深色/浅色模式
- ✅ CSS 变量驱动
- ✅ 平滑过渡动画
- ✅ 保持对比度 ≥ 4.5:1

---

## 输出文件结构

```
src/frontend/
├── App.tsx                    # 主应用入口 (路由 + 主题)
├── styles/
│   └── globals.css           # 全局样式 (CSS 变量 + 动画)
├── components/
│   ├── Layout.tsx            # 布局框架 (Header + Sidebar + Content)
│   ├── Header.tsx            # 头部 (Logo + 搜索 + 主题切换)
│   ├── Sidebar.tsx           # 侧边栏导航
│   ├── ProjectCard.tsx       # 项目卡片
│   ├── AgentAvatar.tsx       # Agent 头像 + 状态
│   ├── PhaseIndicator.tsx    # 工作流阶段指示器
│   ├── ProgressBar.tsx       # 进度条 (带动画)
│   ├── FileTree.tsx          # 文件树组件
│   ├── StatusBadge.tsx       # 状态徽章
│   └── AnimatedTransition.tsx # 页面切换动画
└── pages/
    ├── Dashboard.tsx         # 仪表板页面
    ├── Workflow.tsx          # 工作流页面
    ├── Agents.tsx             # Agent 管理页面
    ├── Progress.tsx           # 进度追踪页面
    └── Workspace.tsx          # 工作区页面
```

---

## 工作区约束（强制遵守）

**所有源代码必须写入以下目录：**
```
/Users/macipad/.openclaw/workspace-chief-architect/devflow-engine/src/frontend/
```

**禁止写入以下路径：**
- ❌ `~/.openclaw/workspace-art-director/` (禁止)
- ❌ 任何项目外的路径

**设计文档写入：**
```
/Users/macipad/.openclaw/workspace-chief-architect/devflow-engine/docs/design/
```

---

## 执行步骤

1. **研究参考应用** - 理解各应用的 UI 设计亮点
2. **设计组件库** - 创建可复用的基础组件
3. **构建页面** - 组合组件构建 5 个主要页面
4. **添加动画** - 实现流畅的过渡和交互效果
5. **响应式适配** - 确保移动端体验
6. **深色模式** - 完善主题切换

---

**创建时间**: 2026-04-02 00:12 GMT+8
**任务类型**: UI 设计 + 前端开发
**参考应用**: Linear, Vercel, Raycast, Notion, GitHub, Figma, Discord