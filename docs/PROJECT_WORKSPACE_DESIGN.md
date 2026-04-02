# DevFlow Engine 项目工作区设计

## 架构概述

DevFlow Engine 采用**双层工作区架构**：

```
~/.openclaw/
├── workspace-chief-architect/     ← DevFlow Engine 开发工作区
│   └── devflow-engine/            ← DevFlow 引擎源代码
│       ├── src/core/              ← 核心模块
│       ├── src/frontend/          ← UI 前端
│       ├── src/server/            ← 服务器
│       └── docs/                  ← 设计文档
│
└── devflow-projects/              ← DevFlow 管理的项目工作区（独立）
    ├── my-game-app-1712345678/    ← 项目 A 工作区
    │   ├── src/                   ← 项目 A 源代码
    │   │   ├── frontend/          ← 美术产出
    │   │   ├── backend/           ← 开发员产出
    │   │   └── shared/            ← 共享代码
    │   ├── docs/                  ← 项目 A 文档
    │   │   ├── design/            ← 美术文档
    │   │   └── architecture/      ← 架构文档
    │   ├── assets/                ← 项目 A 资源
    │   │   ├── images/            ← 美术素材
    │   │   └ icons/               ← 图标
    │   ├── dist/                  ← 构建产物（项目内）
    │   ├── memory/                ← Agent 记忆
    │   ├── progress/              ← 进度追踪
    │   ├── .agent-workspace/      ← 子代理临时工作区
    │   │   ├── artist/            ← 美术临时文件
    │   │   ├── developer/         ← 开发员临时文件
    │   │   └── architect/         ← 架构师临时文件
    │   └── project.json           ← 项目配置
    │
    ├── my-web-tool-1712349999/    ← 项目 B 工作区
    │   └── ... (同上结构)
    │
    └── my-mobile-app-1712355555/  ← 项目 C 工作区
        └── ... (同上结构)
```

---

## 工作区隔离规则

### 1. DevFlow Engine 工作区
- **路径**: `~/.openclaw/workspace-chief-architect/devflow-engine/`
- **用途**: DevFlow 引擎本身的开发和维护
- **内容**: 引擎源代码、UI 前端、服务器、文档

### 2. 项目工作区
- **路径**: `~/.openclaw/devflow-projects/<project-name>-<timestamp>/`
- **用途**: 用 DevFlow 开发的具体项目
- **内容**: 项目源代码、文档、资源、构建产物

### 3. 安装包输出（例外）
- **路径**: `~/Desktop/<project-name>-Packages/`
- **用途**: 最终安装包（便于查看）
- **例外**: 这是唯一允许在项目外的路径

---

## 强制约束机制

### 软件层面验证

```typescript
// WorkspaceValidator 禁止路径
const forbiddenPaths = [
  '~/.openclaw/workspace-art-director/',    // 美术个人工作区
  '~/.openclaw/workspace-developer/',       // 开发员个人工作区
  '~/.openclaw/workspace-lead-developer/',  // 主程序个人工作区
  '~/.openclaw/workspace-chief-architect/', // 架构师个人工作区（除非是 DevFlow 开发）
  '~/.openclaw/workspace-*',                // 所有个人工作区
];

// 允许路径
const allowedPaths = [
  '<project-path>/src/',        // 源代码
  '<project-path>/docs/',       // 文档
  '<project-path>/assets/',     // 资源
  '<project-path>/dist/',       // 构建产物
  '<project-path>/.agent-workspace/', // 临时文件
  '~/Desktop/<project-name>-Packages/', // 安装包
];
```

### 项目配置

```json
{
  "workspaceConstraints": {
    "enforceProjectWorkspace": true,
    "disableAgentWorkspace": true,
    "sourcePath": "src",
    "distPath": "dist",
    "packageOutputPath": "~/Desktop/<project-name>-Packages/",
    "docsPath": "docs",
    "assetsPath": "assets",
    "agentWorkspacePath": ".agent-workspace"
  }
}
```

---

## 角色产出路径映射

| 角色 | 源代码 | 文档 | 资源 |
|------|--------|------|------|
| **美术** | `<project>/src/frontend/` | `<project>/docs/design/` | `<project>/assets/images/` |
| **开发员** | `<project>/src/backend/` | `<project>/docs/api/` | - |
| **架构师** | `<project>/src/shared/` | `<project>/docs/architecture/` | - |
| **主程序** | `<project>/src/` | `<project>/docs/` | - |
| **规划师** | - | `<project>/progress/` | - |
| **主管** | - | `<project>/progress/` | - |

---

## 项目创建流程

```typescript
// 1. 创建项目工作区
const project = await projectManager.create({
  name: 'My Game App',
  description: 'A casual mobile game',
});

// 2. 自动创建目录结构
// ~/.openclaw/devflow-projects/my-game-app-1712345678/
// ├── src/frontend/
// ├── src/backend/
// ├── src/shared/
// ├── docs/design/
// ├── docs/architecture/
// ├── assets/images/
// ├── assets/icons/
// ├── dist/
// ├── memory/
// ├── progress/
// ├── .agent-workspace/
// │   ├── artist/
// │   ├── developer/
// │   ├── architect/
// │   └── ...
// └── project.json

// 3. 子代理启动时继承项目路径
sessions_spawn({
  cwd: project.path,  // 子代理工作目录 = 项目路径
  task: '...',
});
```

---

## 子代理工作区继承

```
┌─────────────────────────────────────────────────────────────┐
│                  DevFlow Engine                             │
│  工作区: ~/.openclaw/workspace-chief-architect/             │
│                                                             │
│  启动子代理时：                                             │
│  sessions_spawn({ cwd: project.path })                      │
│                                                             │
│                    ↓                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  子代理 (美术/开发员/架构师)                         │   │
│  │                                                     │   │
│  │  cwd = ~/.openclaw/devflow-projects/my-game-app/   │   │
│  │                                                     │   │
│  │  所有写入 → <project>/src/                          │   │
│  │                                                     │   │
│  │  禁止写入：                                         │   │
│  │  ❌ ~/.openclaw/workspace-art-director/             │   │
│  │  ❌ ~/.openclaw/workspace-developer/                │   │
│  │  ❌ ~/.openclaw/workspace-* (个人工作区)            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 验证检查

### 启动时检查
```bash
# 检查项目工作区
ls ~/.openclaw/devflow-projects/

# 检查项目目录结构
tree ~/.openclaw/devflow-projects/<project-name>/
```

### 定期审计
```typescript
// 扫描个人工作区是否有项目代码
for (const ws of ['workspace-art-director', 'workspace-developer']) {
  const files = findProjectFiles(ws);
  if (files.length > 0) {
    console.warn(`发现违规代码: ${ws}`);
    // 可选：自动移动到正确位置
  }
}
```

---

## 与现有架构对比

| 方面 | 旧架构 | 新架构 |
|------|--------|--------|
| DevFlow 源代码 | `workspace-chief-architect/devflow-engine/` | ✅ 相同 |
| 项目代码 | 混在 DevFlow 工作区 | ✅ 独立 `devflow-projects/` |
| 子代理产出 | 可能写入个人工作区 | ✅ 强制写入项目路径 |
| 安装包 | 项目内 | ✅ 桌面（便于查看） |

---

## 总结

✅ **双层工作区架构**
- DevFlow Engine 有自己的开发工作区
- 用 DevFlow 开发的每个项目有独立工作区

✅ **强制隔离机制**
- WorkspaceValidator 禁止写入个人工作区
- 子代理继承项目路径
- 所有产出集中在项目工作区

✅ **安装包例外**
- 最终产物输出到桌面
- 便于查看和分发

---

**创建时间**: 2026-04-02 00:24 GMT+8