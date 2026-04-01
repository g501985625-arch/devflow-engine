# DevFlow Engine 工作区

> 自动化开发工作流引擎项目

---

## 目录结构

```
devflow-engine/
│
├── README.md                    # 项目说明
│
├── docs/                        # 设计文档
│   ├── OVERVIEW.md              # 项目概述 (本文件)
│   ├── DEVFLOW_MODULE_DESIGN.md # 模块架构设计
│   ├── DEVFLOW_TASK_CHAIN.md    # 任务链设计
│   ├── CLAUDE_CODE_BORROW.md    # Claude Code 借鉴分析
│   ├── AUTOMATED_WORKFLOW_DESIGN.md  # 自动化工作流设计
│   ├── TEAM_WORKFLOW_DESIGN.md  # 团队协作设计
│   └── WORKFLOW_OPTIMIZED.md    # 优化版设计
│
├── src/                         # 源代码
│   ├── core/                    # M1: Engine Core
│   │   ├── Engine.ts
│   │   ├── types.ts
│   │   └── constants.ts
│   │
│   ├── storage/                 # M7: Storage Layer
│   │   ├── FileSystem.ts
│   │   ├── ConfigManager.ts
│   │   ├── FileIndexer.ts
│   │   └── types.ts
│   │
│   ├── memory/                  # M6: Memory System
│   │   ├── MemoryStore.ts
│   │   ├── MemoryIndexer.ts
│   │   ├── Consolidator.ts
│   │   └── types.ts
│   │
│   ├── project/                 # M2: Project Manager
│   │   ├── ProjectManager.ts
│   │   ├── ProjectFactory.ts
│   │   ├── Project.ts
│   │   └── types.ts
│   │
│   ├── agent/                   # M3: Agent Manager
│   │   ├── AgentManager.ts
│   │   ├── AgentFactory.ts
│   │   ├── Desk.ts
│   │   ├── AgentRuntime.ts
│   │   ├── tools/
│   │   │   ├── Tool.ts
│   │   │   ├── FileTools.ts
│   │   │   └── BashTool.ts
│   │   └── types.ts
│   │
│   ├── workflow/                # M4: Workflow Engine
│   │   ├── WorkflowEngine.ts
│   │   ├── TaskGraph.ts
│   │   ├── PhaseExecutor.ts
│   │   ├── Verifier.ts
│   │   └── types.ts
│   │
│   ├── automation/              # M5: Automation Engine
│   │   ├── AutomationEngine.ts
│   │   ├── SupervisorAgent.ts
│   │   ├── TaskExecutor.ts
│   │   ├── IssueHandler.ts
│   │   └── types.ts
│   │
│   ├── cli/                     # M8: CLI Interface
│   │   ├── index.ts
│   │   └── commands/
│   │       ├── project.ts
│   │       ├── automation.ts
│   │       └── desk.ts
│   │
│   └── index.ts                 # 入口
│
├── tests/                       # 测试
│   ├── core.test.ts
│   ├── storage.test.ts
│   ├── memory.test.ts
│   ├── project.test.ts
│   ├── agent.test.ts
│   ├── workflow.test.ts
│   └── automation.test.ts
│
├── templates/                   # 项目模板
│   └── default/
│       └── project.yaml
│
├── memory/                      # 工作区记忆 (Agent 记忆)
│   ├── architect/
│   ├── lead-dev/
│   ├── developer/
│   └── designer/
│
├── progress/                    # 进度追踪
│   ├── STATUS.md                # 当前状态
│   └── HISTORY.md               # 执行历史
│
└── package.json                 # 项目配置
```

---

## 项目概述

### 目标

创建一个**自动化开发工作流引擎**，类似 Unity/Godot 的设计思路：

- 项目模板生成
- 固定的角色和工作流
- 模块化架构
- 自动化执行

### 核心特性

1. **固定工位系统**: 总管、架构师、主程序、开发员、美术
2. **自动化执行**: Query Loop 模式的主循环
3. **任务图管理**: 依赖解析 + 并行执行
4. **记忆系统**: 持久化记忆 + 智能检索
5. **验证体系**: 三级风险分类 + 智能验证

---

## 执行状态

### 当前阶段

**Phase 0: 工作区搭建** ✅ 完成

### 下一步

**Phase 1: 基础设施**
- T1.1 项目初始化 (主程序)
- T1.2 核心类型定义 (开发员)
- T1.3 常量定义 (开发员)

---

## 角色分工

| 角色 | 职责 | 当前任务 |
|------|------|----------|
| 用户 | 需求输入、最终确认 | 等待 |
| 总管 | 监督自动化、问题处理 | 等待 |
| 架构师 | 模块设计、任务链规划 | ✅ 完成 |
| 主程序 | 核心实现、集成测试 | T1.1 待开始 |
| 开发员 | 类型/工具实现、单元测试 | T1.2/T1.3 待开始 |
| 美术 | 视觉验证 | 等待 |

---

## 文档索引

| 文档 | 说明 | 状态 |
|------|------|------|
| [DEVFLOW_MODULE_DESIGN.md](docs/DEVFLOW_MODULE_DESIGN.md) | 模块架构设计 | ✅ |
| [DEVFLOW_TASK_CHAIN.md](docs/DEVFLOW_TASK_CHAIN.md) | 任务链设计 | ✅ |
| [CLAUDE_CODE_BORROW.md](docs/CLAUDE_CODE_BORROW.md) | Claude Code 借鉴分析 | ✅ |

---

## 快速命令

```bash
# 查看项目状态
cat devflow-engine/progress/STATUS.md

# 查看任务链
cat devflow-engine/docs/DEVFLOW_TASK_CHAIN.md

# 开始执行 (主程序)
# T1.1: 项目初始化
cd devflow-engine
npm init -y
# 配置 TypeScript...
```

---

**创建时间**: 2026-04-01
**架构师**: 已完成设计
**状态**: 等待主程序开始执行