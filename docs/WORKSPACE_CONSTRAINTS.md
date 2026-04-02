# 工作区强制规范

## 核心原则

**所有子代理在开发项目时，必须将所有源代码、资料、构建产物统一放入项目工作区内。禁止写入代理个人工作区。**

## 规范目的

| 目的 | 说明 |
|------|------|
| 集中管理 | 项目资料集中存放，便于管理 |
| 版本控制 | 便于 Git 统一追踪 |
| 团队协作 | 多代理协作时资料共享 |
| 避免散落 | 防止代码散落在各代理个人工作区 |

## 项目工作区结构

每个 DevFlow 项目创建时会自动生成以下标准目录结构：

```
~/.openclaw/devflow-projects/<project-id>/
├── src/                          # 源代码（强制存放）
│   ├── frontend/                 # 前端代码（美术产出）
│   ├── backend/                  # 后端代码
│   └── shared/                   # 共享代码
├── docs/                         # 项目文档（强制存放）
│   ├── design/                   # 设计文档（美术产出）
│   └── architecture/             # 架构文档
├── assets/                       # 资源文件（强制存放）
│   ├── images/                   # 图片资源（美术产出）
│   └── icons/                    # 图标资源（美术产出）
├── dist/                         # 构建中间产物（强制存放）
│   ├── web/                      # Web 构建产物
│   ├── desktop/                  # 桌面应用构建中间产物
│   └── mobile/                   # 移动应用构建中间产物
├── memory/                       # Agent 记忆数据
├── progress/                     # 开发进度
├── tests/                        # 测试代码
├── .agent-workspace/             # 子代理临时工作区
│   ├── manager/                  # 总管临时工作区
│   ├── architect/                # 架构师临时工作区
│   ├── lead_dev/                 # 主程序临时工作区
│   ├── developer/                # 开发员临时工作区
│   ├── designer/                 # 美术临时工作区
│   ├── planner/                  # 规划师临时工作区
│   └── supervisor/               # 主管临时工作区
├── project.json                  # 项目配置
└── README.md                     # 项目说明
```

## 安装包输出目录（桌面）

**安装包统一输出到桌面，便于查看和使用：**

```
~/Desktop/<project-name>-Packages/
├── mac-x64/
│   ├── <project-name>-0.1.0-mac-x64.dmg
│   └── <project-name>-0.1.0-mac-x64.app
├── mac-arm64/
│   ├── <project-name>-0.1.0-mac-arm64.dmg
│   └── <project-name>-0.1.0-mac-arm64.app
├── windows-x64/
│   ├── <project-name>-0.1.0-win-x64.exe
│   └── <project-name>-0.1.0-win-x64.msi
├── linux-x64/
│   ├── <project-name>-0.1.0-linux-x64.deb
│   ├── <project-name>-0.1.0-linux-x64.rpm
│   └── <project-name>-0.1.0-linux-x64.AppImage
└── README.md                     # 安装说明
```

## 目录用途说明

### 源代码目录 (src/)

| 子目录 | 用途 | 主要产出者 |
|--------|------|-----------|
| `src/frontend/` | 前端 React/Vue/Tailwind 代码 | 美术 |
| `src/backend/` | 后端 API/Server 代码 | 开发员 |
| `src/shared/` | 前后端共享类型/工具 | 开发员 |

### 文档目录 (docs/)

| 子目录 | 用途 | 主要产出者 |
|--------|------|-----------|
| `docs/design/` | UI 设计规范、配色方案、Figma 导出 | 美术 |
| `docs/architecture/` | 系统架构文档 | 架构师 |

### 资源目录 (assets/)

| 子目录 | 用途 | 主要产出者 |
|--------|------|-----------|
| `assets/images/` | 图片、背景、Banner | 美术 |
| `assets/icons/` | 图标、Logo | 美术 |

### 构建产物目录 (dist/)

| 子目录 | 用途 | 主要产出者 |
|--------|------|-----------|
| `dist/web/` | Vite/Webpack 构建产物 | 开发员 |
| `dist/desktop/` | Electron/Tauri 构建中间产物 | 开发员 |
| `dist/mobile/` | iOS/Android 构建中间产物 | 开发员 |

### 安装包输出目录（桌面）

**安装包统一输出到桌面，便于查看和使用。**

| 输出路径 | 用途 | 说明 |
|----------|------|------|
| `~/Desktop/<project-name>-Packages/` | 安装包输出 | DMG/EXE/APK/IPA 等 |
| `~/Desktop/<project-name>-Packages/mac-x64/` | Mac x64 安装包 | .dmg, .app |
| `~/Desktop/<project-name>-Packages/mac-arm64/` | Mac arm64 安装包 | .dmg, .app |
| `~/Desktop/<project-name>-Packages/windows-x64/` | Windows x64 安装包 | .exe, .msi |
| `~/Desktop/<project-name>-Packages/linux-x64/` | Linux x64 安装包 | .deb, .rpm, .AppImage |

### 子代理临时工作区 (.agent-workspace/)

| 子目录 | 用途 | 说明 |
|--------|------|------|
| `.agent-workspace/<role>/` | 各角色临时文件 | 仅用于临时文件，最终产物必须移至对应目录 |

---

## 各角色产物存放规范

### 美术 (Designer)

| 产物类型 | 存放路径 | 说明 |
|----------|----------|------|
| React 组件代码 | `src/frontend/components/` | UI 组件 |
| TailwindCSS 配置 | `src/frontend/styles/` | 样式配置 |
| 页面代码 | `src/frontend/pages/` | 页面模板 |
| 设计规范文档 | `docs/design/spec.md` | 配色、字体、间距规范 |
| Figma 导出图片 | `assets/images/` | 设计稿导出 |
| 图标资源 | `assets/icons/` | Icon 文件 |

**禁止存放路径：**
- ❌ `~/.openclaw/workspace-art-director/`（美术个人工作区）
- ❌ `~/Desktop/`（桌面）
- ❌ 其他任意非项目目录

### 开发员 (Developer)

| 产物类型 | 存放路径 | 说明 |
|----------|----------|------|
| API 代码 | `src/backend/api/` | 接口实现 |
| Server 代码 | `src/backend/server/` | 服务端逻辑 |
| 共享类型 | `src/shared/types/` | TypeScript 类型定义 |
| 测试代码 | `tests/` | 单元测试、集成测试 |
| 构建中间产物 | `dist/` | npm run build 产物（项目内） |
| **安装包** | `~/Desktop/<project-name>-Packages/` | DMG/EXE/APK 等（桌面） |

**禁止存放路径：**
- ❌ `~/.openclaw/workspace-developer/`（开发员个人工作区）
- ❌ `~/.openclaw/workspace-lead-developer/`（主程序个人工作区）

**例外：安装包必须输出到桌面**

### 架构师 (Architect)

| 产物类型 | 存放路径 | 说明 |
|----------|----------|------|
| 架构文档 | `docs/architecture/` | 系统架构设计 |
| 技术选型文档 | `docs/architecture/tech-stack.md` | 技术选型说明 |
| 模块划分文档 | `docs/architecture/modules.md` | 模块划分说明 |

**禁止存放路径：**
- ❌ `~/.openclaw/workspace-chief-architect/`（架构师个人工作区）

### 规划师 (Planner)

| 产物类型 | 存放路径 | 说明 |
|----------|----------|------|
| 任务链配置 | `progress/task-chain.json` | 任务规划 |
| 进度报告 | `progress/reports/` | 进度文档 |

### 主管 (Supervisor)

| 产物类型 | 存放路径 | 说明 |
|----------|----------|------|
| 验证报告 | `progress/verification/` | 验证结果 |
| 测试报告 | `progress/testing/` | 测试结果 |

### 总管 (Manager)

| 产物类型 | 存放路径 | 说明 |
|----------|----------|------|
| 操作日志 | `progress/logs/` | 操作记录 |
| 问题处理记录 | `progress/issues/` | 问题解决记录 |

---

## 配置强制约束

每个项目的 `project.json` 包含工作区约束配置：

```json
{
  "workspaceConstraints": {
    "enforceProjectWorkspace": true,    // 强制使用项目工作区
    "disableAgentWorkspace": true,      // 禁止写入代理个人工作区
    "sourcePath": "src",                // 源代码路径
    "distPath": "dist",                 // 构建中间产物路径（项目内）
    "packageOutputPath": "~/Desktop/<project-name>-Packages/", // 安装包输出路径（桌面）
    "docsPath": "docs",                 // 文档路径
    "assetsPath": "assets",             // 资源文件路径
    "agentWorkspacePath": ".agent-workspace" // 子代理临时工作路径
  }
}
```

---

## 违规检测与处理

### 检测机制

| 检测项 | 方式 | 处理 |
|--------|------|------|
| 代码写入个人工作区 | 路径检查 | 拒绝写入，警告代理 |
| 产物不在项目目录 | 位置检查 | 强制移动到正确位置 |
| Git 未追踪项目目录 | Git 状态检查 | 提示添加到版本控制 |

### 处理流程

```
检测违规
    │
    ├─ 轻微违规（临时文件）
    │     └─ 警告 + 提示移动
    │
    └─ 严重违规（源代码/构建产物）
          └─ 拒绝写入 + 强制纠正
```

---

## 子代理执行规范

### 启动子代理时必须传递项目路径

```typescript
// 启动子代理示例
await spawnSubAgent({
  role: 'designer',
  task: 'UI设计',
  // 强制传递项目工作区路径
  workspace: '/Users/macipad/.openclaw/devflow-projects/project-xxx',
  // 禁止使用个人工作区
  disablePersonalWorkspace: true,
});
```

### 子代理代码中的路径约束

```typescript
// 子代理必须使用项目路径
const projectPath = config.workspaceConstraints.sourcePath; // src/
const outputPath = path.join(projectPath, 'frontend', 'components');

// 禁止使用个人工作区路径
// ❌ const outputPath = '~/.openclaw/workspace-art-director/';
```

---

## 版本控制规范

### 必须纳入 Git 追踪的目录

| 目录 | 说明 |
|------|------|
| `src/` | 所有源代码 |
| `docs/` | 所有文档 |
| `assets/` | 资源文件 |
| `tests/` | 测试代码 |
| `project.json` | 项目配置 |

### 可选 Git 追踪的目录

| 目录 | 说明 |
|------|------|
| `dist/` | 构建产物（通常不追踪，但可发布时追踪） |
| `memory/` | Agent 记忆（可选） |
| `.agent-workspace/` | 临时文件（不追踪） |

---

## 检查清单

### 美术提交前检查

```
□ React 组件代码在 src/frontend/components/
□ TailwindCSS 配置在 src/frontend/styles/
□ 设计规范文档在 docs/design/
□ 图片资源在 assets/images/
□ 图标资源在 assets/icons/
□ 未写入 ~/.openclaw/workspace-art-director/
```

### 开发员提交前检查

```
□ API 代码在 src/backend/api/
□ Server 代码在 src/backend/server/
□ 测试代码在 tests/
□ 构建中间产物在 dist/
□ 安装包在 ~/Desktop/<project-name>-Packages/
□ 未写入 ~/.openclaw/workspace-developer/
```

### 架构师提交前检查

```
□ 架构文档在 docs/architecture/
□ 未写入 ~/.openclaw/workspace-chief-architect/
```

---

**文档版本**: 1.0  
**更新日期**: 2026-04-01  
**维护者**: 架构师  
**强制级别**: 必须遵守