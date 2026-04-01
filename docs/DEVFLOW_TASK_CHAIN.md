# DevFlow Engine - 任务链设计

> 架构师输出：每个模块的详细任务链

---

## 一、任务链概览

### 1.1 模块依赖顺序

```
Phase 1: 基础设施
├── M1: Engine Core
└── M7: Storage Layer

Phase 2: 核心系统
├── M6: Memory System
└── M2: Project Manager

Phase 3: Agent 系统
├── M3: Agent Manager
└── M4: Workflow Engine

Phase 4: 自动化
└── M5: Automation Engine

Phase 5: 接口
└── M8: CLI Interface
```

### 1.2 任务统计

| 模块 | 任务数 | 预估时间 | 并行组 |
|------|--------|----------|--------|
| M1: Engine Core | 5 | 4h | 2 |
| M7: Storage Layer | 8 | 6h | 3 |
| M6: Memory System | 7 | 5h | 3 |
| M2: Project Manager | 9 | 7h | 4 |
| M3: Agent Manager | 10 | 8h | 4 |
| M4: Workflow Engine | 8 | 6h | 3 |
| M5: Automation Engine | 9 | 8h | 4 |
| M8: CLI Interface | 6 | 4h | 2 |
| **总计** | **62** | **48h** | **25** |

---

## 二、Phase 1: 基础设施

### 2.1 M1: Engine Core

```yaml
module: M1-Engine-Core
name: 核心引擎
priority: P0
estimatedHours: 4

tasks:
  # ═════════════════════════════════════════════════════════
  # T1.1 项目初始化 (串行，第一个任务)
  # ═════════════════════════════════════════════════════════
  - id: T1.1
    title: 项目初始化
    description: |
      创建项目结构，初始化 TypeScript 配置
      
    estimatedMinutes: 30
    assignTo: lead_dev
    dependsOn: []
    canParallelize: false
    
    steps:
      - "创建目录结构 src/core, src/storage, src/memory..."
      - "初始化 package.json"
      - "配置 tsconfig.json"
      - "配置 ESLint + Prettier"
    
    outputs:
      - package.json
      - tsconfig.json
      - .eslintrc.js
    
    verification:
      build: true
      lint: true
    
    acceptanceCriteria:
      - "npm install 成功"
      - "npm run build 成功"
      - "npm run lint 无错误"

  # ═════════════════════════════════════════════════════════
  # T1.2 核心类型定义 (可并行)
  # ═════════════════════════════════════════════════════════
  - id: T1.2
    title: 核心类型定义
    description: |
      定义所有核心 TypeScript 类型
      
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T1.1]
    canParallelize: true
    
    steps:
      - "定义 EngineConfig, EngineState"
      - "定义 ProjectConfig, ProjectState, Project"
      - "定义 Role, DeskDefinition, Desk"
      - "定义 Phase, Task, TaskStatus, TaskChain"
      - "定义 Memory 类型"
    
    outputs:
      - src/core/types.ts
    
    verification:
      build: true
      typeCheck: true
    
    acceptanceCriteria:
      - "所有类型定义完整"
      - "无 TypeScript 错误"
      - "类型导出正确"

  # ═════════════════════════════════════════════════════════
  # T1.3 常量定义 (可并行)
  # ═════════════════════════════════════════════════════════
  - id: T1.3
    title: 常量定义
    description: |
      定义所有常量
      
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.1]
    canParallelize: true
    
    steps:
      - "定义 Phase 常量"
      - "定义 Role 常量"
      - "定义 TaskStatus 常量"
      - "定义 ErrorCode 常量"
    
    outputs:
      - src/core/constants.ts
    
    verification:
      build: true
    
    acceptanceCriteria:
      - "所有常量导出正确"

  # ═════════════════════════════════════════════════════════
  # T1.4 Engine 类实现
  # ═════════════════════════════════════════════════════════
  - id: T1.4
    title: Engine 类实现
    description: |
      实现 DevFlowEngine 核心类
      
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T1.2, T1.3]
    canParallelize: false
    
    steps:
      - "实现单例模式"
      - "实现 initialize() 方法"
      - "实现模块注册机制"
      - "实现基本的 getter 方法"
    
    outputs:
      - src/core/Engine.ts
    
    verification:
      build: true
      test: true
    
    acceptanceCriteria:
      - "Engine.getInstance() 正常工作"
      - "initialize() 可以调用"
      - "单元测试通过"

  # ═════════════════════════════════════════════════════════
  # T1.5 入口文件
  # ═════════════════════════════════════════════════════════
  - id: T1.5
    title: 入口文件
    description: |
      创建入口文件，导出所有公开 API
      
    estimatedMinutes: 20
    assignTo: developer
    dependsOn: [T1.4]
    canParallelize: false
    
    steps:
      - "创建 src/index.ts"
      - "导出核心类和类型"
    
    outputs:
      - src/index.ts
    
    verification:
      build: true
    
    acceptanceCriteria:
      - "导出正确"
      - "可以从外部 import"

parallelGroups:
  - tasks: [T1.2, T1.3]
    canParallelize: true
```

### 2.2 M7: Storage Layer

```yaml
module: M7-Storage-Layer
name: 存储层
priority: P0
estimatedHours: 6

tasks:
  # ═════════════════════════════════════════════════════════
  # T7.1 存储类型定义
  # ═════════════════════════════════════════════════════════
  - id: T7.1
    title: 存储类型定义
    description: 定义存储层相关类型
    
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.2]
    canParallelize: false
    
    outputs:
      - src/storage/types.ts
    
    acceptanceCriteria:
      - "FileInfo, FileIndex, FileSearchQuery 定义完整"

  # ═════════════════════════════════════════════════════════
  # T7.2 FileSystem 类 (核心)
  # ═════════════════════════════════════════════════════════
  - id: T7.2
    title: FileSystem 类实现
    description: 实现文件系统操作类
    
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T7.1]
    canParallelize: false
    
    steps:
      - "实现 readFile, writeFile, deleteFile"
      - "实现 createDir, listDir, ensureDir"
      - "实现 exists, copy, move"
      - "处理错误情况"
    
    outputs:
      - src/storage/FileSystem.ts
    
    verification:
      build: true
      test: true
    
    acceptanceCriteria:
      - "所有文件操作正常"
      - "错误处理完善"
      - "单元测试覆盖 80%+"

  # ═════════════════════════════════════════════════════════
  # T7.3 ConfigManager 类
  # ═════════════════════════════════════════════════════════
  - id: T7.3
    title: ConfigManager 类实现
    description: 实现配置管理类
    
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T7.2]
    canParallelize: true
    
    steps:
      - "实现 loadConfig (YAML/JSON)"
      - "实现 saveConfig"
      - "实现配置合并逻辑"
    
    outputs:
      - src/storage/ConfigManager.ts
    
    acceptanceCriteria:
      - "YAML 解析正确"
      - "JSON 解析正确"
      - "配置合并正确"

  # ═════════════════════════════════════════════════════════
  # T7.4 FileIndexer 类 (核心)
  # ═════════════════════════════════════════════════════════
  - id: T7.4
    title: FileIndexer 类实现
    description: 实现文件索引器
    
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T7.2]
    canParallelize: true
    
    steps:
      - "实现 scanProject - 扫描项目文件"
      - "实现 buildIndex - 构建索引"
      - "实现 search - 搜索文件"
      - "实现增量更新"
    
    outputs:
      - src/storage/FileIndexer.ts
    
    acceptanceCriteria:
      - "扫描速度快 (<1s/1000 files)"
      - "搜索准确"
      - "支持按扩展名/目录/关键词搜索"

  # ═════════════════════════════════════════════════════════
  # T7.5 PathUtils 工具类
  # ═════════════════════════════════════════════════════════
  - id: T7.5
    title: PathUtils 工具类
    description: 实现路径处理工具
    
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T7.1]
    canParallelize: true
    
    outputs:
      - src/storage/PathUtils.ts
    
    acceptanceCriteria:
      - "路径规范化"
      - "路径解析"
      - "相对路径计算"

  # ═════════════════════════════════════════════════════════
  # T7.6 Watcher 类
  # ═════════════════════════════════════════════════════════
  - id: T7.6
    title: Watcher 类实现
    description: 实现文件监控
    
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T7.4]
    canParallelize: false
    
    steps:
      - "使用 chokidar 实现文件监控"
      - "实现事件处理"
      - "实现增量索引更新"
    
    outputs:
      - src/storage/Watcher.ts
    
    acceptanceCriteria:
      - "文件变化检测准确"
      - "增量更新正确"

  # ═════════════════════════════════════════════════════════
  # T7.7 StorageLayer 组合类
  # ═════════════════════════════════════════════════════════
  - id: T7.7
    title: StorageLayer 组合类
    description: 组合所有存储组件
    
    estimatedMinutes: 45
    assignTo: lead_dev
    dependsOn: [T7.2, T7.3, T7.4, T7.5, T7.6]
    canParallelize: false
    
    outputs:
      - src/storage/StorageLayer.ts
    
    acceptanceCriteria:
      - "统一接口"
      - "组件协调正确"

  # ═════════════════════════════════════════════════════════
  # T7.8 单元测试
  # ═════════════════════════════════════════════════════════
  - id: T7.8
    title: Storage Layer 单元测试
    description: 编写完整的单元测试
    
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T7.7]
    canParallelize: false
    
    outputs:
      - tests/storage.test.ts
    
    acceptanceCriteria:
      - "测试覆盖率 > 80%"
      - "所有测试通过"

parallelGroups:
  - tasks: [T7.3, T7.4, T7.5]
    canParallelize: true
```

---

## 三、Phase 2: 核心系统

### 3.1 M6: Memory System

```yaml
module: M6-Memory-System
name: 记忆系统
priority: P0
estimatedHours: 5

tasks:
  - id: T6.1
    title: Memory 类型定义
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.2, T7.1]
    outputs: [src/memory/types.ts]

  - id: T6.2
    title: MemoryStore 类实现
    description: 实现记忆存储
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T6.1]
    steps:
      - "实现 load - 加载记忆"
      - "实现 save - 保存记忆"
      - "实现 addEntry - 添加条目"
      - "实现 search - 搜索记忆"
    outputs: [src/memory/MemoryStore.ts]

  - id: T6.3
    title: MemoryIndexer 类实现
    description: 实现记忆索引和检索
    estimatedMinutes: 75
    assignTo: developer
    dependsOn: [T6.2]
    steps:
      - "实现相关性计算 (借鉴 Claude Code)"
      - "实现新鲜度衰减"
      - "实现权重计算"
    outputs: [src/memory/MemoryIndexer.ts]

  - id: T6.4
    title: Consolidator 类实现
    description: 实现记忆整合 (Dream)
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T6.2]
    steps:
      - "实现四阶段流程: Orient, Gather, Consolidate, Prune"
      - "实现触发条件检查"
      - "实现容量限制和清理"
    outputs: [src/memory/Consolidator.ts]

  - id: T6.5
    title: WorkingMemory 管理
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T6.2]
    outputs: [src/memory/WorkingMemory.ts]

  - id: T6.6
    title: MemorySystem 组合类
    estimatedMinutes: 30
    assignTo: lead_dev
    dependsOn: [T6.2, T6.3, T6.4, T6.5]
    outputs: [src/memory/MemorySystem.ts]

  - id: T6.7
    title: Memory System 单元测试
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T6.6]
    outputs: [tests/memory.test.ts]

parallelGroups:
  - tasks: [T6.3, T6.4, T6.5]
    canParallelize: true
```

### 3.2 M2: Project Manager

```yaml
module: M2-Project-Manager
name: 项目管理器
priority: P0
estimatedHours: 7

tasks:
  - id: T2.1
    title: Project 类型定义
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.2, T6.1]
    outputs: [src/project/types.ts]

  - id: T2.2
    title: Project 类实现
    description: 项目对象类
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T2.1]
    steps:
      - "定义 Project 属性"
      - "实现状态管理方法"
      - "实现进度计算"
    outputs: [src/project/Project.ts]

  - id: T2.3
    title: ProjectFactory 类实现 (核心)
    description: 项目工厂，负责创建项目结构
    estimatedMinutes: 120
    assignTo: lead_dev
    dependsOn: [T2.2, T7.2]
    steps:
      - "实现 create - 创建项目结构"
      - "实现 createDirectoryStructure"
      - "实现 createMemoryStructure"
      - "实现 createWorkflowStructure"
      - "实现 applyTemplate"
    outputs: [src/project/ProjectFactory.ts]

  - id: T2.4
    title: ProjectManager 类实现
    description: 项目管理器主类
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T2.3]
    steps:
      - "实现 create - 创建新项目"
      - "实现 open - 打开项目"
      - "实现 close - 关闭项目"
      - "实现 list - 列出项目"
      - "实现 delete - 删除项目"
    outputs: [src/project/ProjectManager.ts]

  - id: T2.5
    title: ProjectState 管理
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T2.2]
    outputs: [src/project/ProjectState.ts]

  - id: T2.6
    title: 项目模板系统
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T2.3]
    steps:
      - "创建默认模板"
      - "实现模板应用逻辑"
    outputs: [src/templates/default/]

  - id: T2.7
    title: Project 验证器
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T2.4]
    steps:
      - "验证项目完整性"
      - "验证配置正确性"
    outputs: [src/project/ProjectValidator.ts]

  - id: T2.8
    title: Project Manager 单元测试
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T2.4, T2.5, T2.6, T2.7]
    outputs: [tests/project.test.ts]

  - id: T2.9
    title: 集成测试
    estimatedMinutes: 45
    assignTo: lead_dev
    dependsOn: [T2.8]
    steps:
      - "测试完整创建流程"
      - "测试打开/关闭流程"
    outputs: [tests/project.integration.test.ts]

parallelGroups:
  - tasks: [T2.5, T2.6, T2.7]
    canParallelize: true
```

---

## 四、Phase 3: Agent 系统

### 4.1 M3: Agent Manager

```yaml
module: M3-Agent-Manager
name: Agent 管理器
priority: P0
estimatedHours: 8

tasks:
  - id: T3.1
    title: Agent 类型定义
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.2]
    outputs: [src/agent/types.ts]

  - id: T3.2
    title: AgentFactory 类实现 (固定工位)
    description: 定义固定的工位配置
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T3.1]
    steps:
      - "定义 Manager 工位"
      - "定义 Architect 工位"
      - "定义 LeadDev 工位"
      - "定义 Developer 工位"
      - "定义 Designer 工位"
    outputs: [src/agent/AgentFactory.ts]

  - id: T3.3
    title: Desk 类实现
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T3.2]
    steps:
      - "实现工位实例化"
      - "实现记忆加载"
      - "实现上下文构建"
    outputs: [src/agent/Desk.ts]

  - id: T3.4
    title: Tool 基类
    estimatedMinutes: 60
    assignTo: lead_dev
    dependsOn: [T3.1]
    steps:
      - "定义 Tool 接口"
      - "实现输入验证 (Zod)"
      - "实现权限检查"
    outputs: [src/agent/tools/Tool.ts]

  - id: T3.5
    title: FileTools 实现
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T3.4]
    steps:
      - "实现 FileReadTool"
      - "实现 FileWriteTool"
      - "实现 FileEditTool"
    outputs: [src/agent/tools/FileTools.ts]

  - id: T3.6
    title: BashTool 实现
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T3.4]
    steps:
      - "实现命令执行"
      - "实现超时处理"
      - "实现错误处理"
    outputs: [src/agent/tools/BashTool.ts]

  - id: T3.7
    title: ToolRegistry 实现
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T3.4, T3.5, T3.6]
    outputs: [src/agent/tools/index.ts]

  - id: T3.8
    title: AgentManager 类实现
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T3.2, T3.3, T3.7]
    steps:
      - "实现 getDesk"
      - "实现 startSession"
      - "实现 executeTask"
    outputs: [src/agent/AgentManager.ts]

  - id: T3.9
    title: AgentRuntime 类实现
    description: Agent 执行运行时
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T3.8]
    steps:
      - "实现 LLM 调用"
      - "实现工具执行"
      - "实现结果处理"
    outputs: [src/agent/AgentRuntime.ts]

  - id: T3.10
    title: Agent Manager 单元测试
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T3.8, T3.9]
    outputs: [tests/agent.test.ts]

parallelGroups:
  - tasks: [T3.3, T3.4]
    canParallelize: true
  - tasks: [T3.5, T3.6]
    canParallelize: true
```

### 4.2 M4: Workflow Engine

```yaml
module: M4-Workflow-Engine
name: 工作流引擎
priority: P0
estimatedHours: 6

tasks:
  - id: T4.1
    title: Workflow 类型定义
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.2]
    outputs: [src/workflow/types.ts]

  - id: T4.2
    title: TaskGraph 类实现 (核心)
    description: 任务图管理，借鉴 Claude Code
    estimatedMinutes: 120
    assignTo: lead_dev
    dependsOn: [T4.1]
    steps:
      - "实现依赖解析"
      - "实现 getReadyTasks"
      - "实现 getParallelGroups"
      - "实现 getCriticalPath"
      - "实现循环依赖检测"
    outputs: [src/workflow/TaskGraph.ts]

  - id: T4.3
    title: PhaseExecutor 类实现
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T4.2]
    steps:
      - "实现阶段执行逻辑"
      - "实现阶段验证"
      - "实现阶段转换"
    outputs: [src/workflow/PhaseExecutor.ts]

  - id: T4.4
    title: Verifier 类实现
    estimatedMinutes: 90
    assignTo: developer
    dependsOn: [T4.1]
    steps:
      - "实现三级风险分类"
      - "实现自动验证"
      - "实现交叉验证"
      - "实现人工确认"
    outputs: [src/workflow/Verifier.ts]

  - id: T4.5
    title: TaskExecutor 类实现
    estimatedMinutes: 75
    assignTo: developer
    dependsOn: [T4.2, T3.8]
    steps:
      - "实现任务执行"
      - "实现并行执行"
      - "实现进度报告"
    outputs: [src/workflow/TaskExecutor.ts]

  - id: T4.6
    title: WorkflowEngine 类实现
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T4.2, T4.3, T4.4, T4.5]
    steps:
      - "实现 start/pause/resume"
      - "实现状态管理"
      - "实现事件通知"
    outputs: [src/workflow/WorkflowEngine.ts]

  - id: T4.7
    title: TaskChain 解析器
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T4.2]
    steps:
      - "解析 YAML 任务链"
      - "构建 TaskGraph"
    outputs: [src/workflow/TaskChainParser.ts]

  - id: T4.8
    title: Workflow Engine 单元测试
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T4.6]
    outputs: [tests/workflow.test.ts]

parallelGroups:
  - tasks: [T4.4, T4.5]
    canParallelize: true
```

---

## 五、Phase 4: 自动化引擎

### 5.1 M5: Automation Engine

```yaml
module: M5-Automation-Engine
name: 自动化引擎
priority: P0
estimatedHours: 8

tasks:
  - id: T5.1
    title: Automation 类型定义
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.2, T4.1]
    outputs: [src/automation/types.ts]

  - id: T5.2
    title: AutomationEngine 主循环实现 (核心)
    description: 主执行循环，借鉴 Claude Code Query Loop
    estimatedMinutes: 150
    assignTo: lead_dev
    dependsOn: [T5.1, T2.4, T3.8, T4.6]
    steps:
      - "实现 AsyncGenerator 主循环"
      - "实现 buildContext"
      - "实现 getNextTask"
      - "实现 executeTask"
      - "实现 verifyTask"
      - "实现 updateState"
      - "实现 pause/resume"
    outputs: [src/automation/AutomationEngine.ts]

  - id: T5.3
    title: SupervisorAgent 类实现 (核心)
    description: 总管监督者
    estimatedMinutes: 120
    assignTo: lead_dev
    dependsOn: [T5.1, T3.2]
    steps:
      - "实现 checkStatus"
      - "实现 detectIssues"
      - "实现 handleIssues"
      - "实现 reportProgress"
      - "实现 assignTasks"
      - "实现 decideOnFailure"
    outputs: [src/automation/SupervisorAgent.ts]

  - id: T5.4
    title: IssueHandler 类实现
    estimatedMinutes: 75
    assignTo: developer
    dependsOn: [T5.3]
    steps:
      - "实现问题分类"
      - "实现修复触发"
      - "实现升级逻辑"
    outputs: [src/automation/IssueHandler.ts]

  - id: T5.5
    title: PhaseExecutor 集成
    description: 阶段执行集成
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T5.2, T4.3]
    steps:
      - "集成需求阶段执行"
      - "集成架构阶段执行"
      - "集成开发阶段执行"
      - "集成整合阶段执行"
    outputs: [src/automation/PhaseExecutor.ts]

  - id: T5.6
    title: Reporter 类实现
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T5.3]
    steps:
      - "实现进度报告格式化"
      - "实现问题报告格式化"
      - "实现完成报告"
    outputs: [src/automation/Reporter.ts]

  - id: T5.7
    title: LLM 集成
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T5.2]
    steps:
      - "集成 Anthropic SDK"
      - "实现流式响应"
      - "实现重试逻辑"
    outputs: [src/automation/LLMClient.ts]

  - id: T5.8
    title: 事件系统
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T5.2]
    steps:
      - "实现事件发射"
      - "实现事件监听"
    outputs: [src/automation/EventEmitter.ts]

  - id: T5.9
    title: Automation Engine 集成测试
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T5.2, T5.3, T5.4, T5.5, T5.6, T5.7, T5.8]
    steps:
      - "测试完整工作流执行"
      - "测试问题处理"
      - "测试暂停恢复"
    outputs: [tests/automation.integration.test.ts]

parallelGroups:
  - tasks: [T5.4, T5.6, T5.8]
    canParallelize: true
```

---

## 六、Phase 5: CLI 接口

### 6.1 M8: CLI Interface

```yaml
module: M8-CLI-Interface
name: 命令行接口
priority: P1
estimatedHours: 4

tasks:
  - id: T8.1
    title: CLI 框架搭建
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T1.4]
    steps:
      - "使用 commander 或 oclif"
      - "配置命令结构"
    outputs: [src/cli/index.ts]

  - id: T8.2
    title: project 命令实现
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T8.1, T2.4]
    steps:
      - "实现 project create"
      - "实现 project open"
      - "实现 project list"
      - "实现 project delete"
    outputs: [src/cli/commands/project.ts]

  - id: T8.3
    title: automation 命令实现
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T8.1, T5.2]
    steps:
      - "实现 start"
      - "实现 status"
      - "实现 pause/resume"
      - "实现 answer (回复总管)"
    outputs: [src/cli/commands/automation.ts]

  - id: T8.4
    title: desk 命令实现
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T8.1, T3.8]
    steps:
      - "实现 desk list"
      - "实现 desk enter"
    outputs: [src/cli/commands/desk.ts]

  - id: T8.5
    title: 输出格式化
    estimatedMinutes: 45
    assignTo: developer
    dependsOn: [T8.2]
    steps:
      - "实现表格输出"
      - "实现进度条"
      - "实现颜色输出"
    outputs: [src/cli/formatters.ts]

  - id: T8.6
    title: CLI 文档和帮助
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T8.2, T8.3, T8.4]
    steps:
      - "编写命令帮助文本"
      - "编写 README"
    outputs: [README.md]

parallelGroups:
  - tasks: [T8.2, T8.3, T8.4]
    canParallelize: true
```

---

## 七、执行计划

### 7.1 整体时间线

```
Week 1-2: Phase 1 (基础设施)
├── M1: Engine Core (4h)
└── M7: Storage Layer (6h)
总计: 10h

Week 3: Phase 2 (核心系统)
├── M6: Memory System (5h)
└── M2: Project Manager (7h)
总计: 12h

Week 4-5: Phase 3 (Agent 系统)
├── M3: Agent Manager (8h)
└── M4: Workflow Engine (6h)
总计: 14h

Week 6-7: Phase 4 (自动化)
└── M5: Automation Engine (8h)

Week 8: Phase 5 (CLI)
└── M8: CLI Interface (4h)

总计: 48h (约 6 个工作日)
```

### 7.2 并行执行策略

```
Phase 1:
├── T1.2 (类型) ──────┐
├── T1.3 (常量) ──────┼──► 并行
└── T1.4 等待 ────────┘

Phase 2:
├── T7.3 (Config) ────┐
├── T7.4 (Indexer) ───┼──► 并行
├── T7.5 (PathUtils) ─┘
└── T7.7 等待

Phase 3:
├── T6.3 (Indexer) ───┐
├── T6.4 (Consolidator)┼──► 并行
├── T6.5 (Working) ───┘
└── T6.6 等待

Phase 4:
├── T3.5 (FileTools) ─┐
├── T3.6 (BashTool) ──┼──► 并行
└── T3.8 等待 ────────┘
```

---

**架构师签名**: 已完成任务链设计
**日期**: 2026-04-01
**状态**: 可交付给主程序和开发员执行