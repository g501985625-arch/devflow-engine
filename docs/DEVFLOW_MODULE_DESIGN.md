# DevFlow Engine - 模块架构设计

> 架构师输出：模块框架 + 任务链

---

## 一、模块框架设计

### 1.1 系统模块划分

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DevFlow Engine                                   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    M1: Engine Core (核心引擎)                      │  │
│  │  职责：引擎初始化、模块协调、全局状态管理                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                    │
│          ┌─────────────────────────┼─────────────────────────┐          │
│          │                         │                         │          │
│          ▼                         ▼                         ▼          │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐   │
│  │ M2: Project   │        │ M3: Agent     │        │ M4: Workflow  │   │
│  │ Manager       │        │ Manager       │        │ Engine        │   │
│  │ (项目管理)    │        │ (Agent管理)   │        │ (工作流引擎)  │   │
│  └───────────────┘        └───────────────┘        └───────────────┘   │
│          │                         │                         │          │
│          └─────────────────────────┼─────────────────────────┘          │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    M5: Automation Engine (自动化引擎)              │  │
│  │  职责：主执行循环、任务调度、进度追踪                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                    │
│          ┌─────────────────────────┼─────────────────────────┐          │
│          │                         │                         │          │
│          ▼                         ▼                         ▼          │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐   │
│  │ M6: Memory    │        │ M7: Storage   │        │ M8: CLI       │   │
│  │ System        │        │ Layer         │        │ Interface     │   │
│  │ (记忆系统)    │        │ (存储层)      │        │ (命令行)      │   │
│  └───────────────┘        └───────────────┘        └───────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 模块依赖关系

```
M1: Engine Core
    ↓
M2: Project Manager ─────┐
M3: Agent Manager   ─────┼──→ M5: Automation Engine ──→ M8: CLI
M4: Workflow Engine ─────┘           │
                                     ↓
                          M6: Memory System
                          M7: Storage Layer

依赖顺序: M1 → M7 → M6 → M2/M3/M4 → M5 → M8
```

### 1.3 模块详情

| 模块 | 职责 | 核心类 | 依赖 |
|------|------|--------|------|
| **M1: Engine Core** | 引擎核心，全局协调 | `DevFlowEngine` | 无 |
| **M2: Project Manager** | 项目创建、打开、管理 | `ProjectManager`, `ProjectFactory` | M7 |
| **M3: Agent Manager** | 工位管理、Agent 调度 | `AgentManager`, `AgentFactory`, `Desk` | M7 |
| **M4: Workflow Engine** | 工作流执行、任务图 | `WorkflowEngine`, `TaskGraph` | M7 |
| **M5: Automation Engine** | 自动化主循环 | `AutomationEngine`, `SupervisorAgent` | M2, M3, M4, M6 |
| **M6: Memory System** | 记忆存储、检索、整合 | `MemoryStore`, `MemoryIndexer` | M7 |
| **M7: Storage Layer** | 文件操作、配置管理 | `FileSystem`, `ConfigManager`, `FileIndexer` | 无 |
| **M8: CLI Interface** | 命令行接口 | `CLI`, `Commands` | M1, M5 |

---

## 二、目录结构设计

```
devflow-engine/
├── package.json
├── tsconfig.json
├── README.md
│
├── src/
│   ├── index.ts                      # 入口
│   │
│   ├── core/                         # M1: Engine Core
│   │   ├── Engine.ts                 # 主引擎类
│   │   ├── types.ts                  # 核心类型定义
│   │   └── constants.ts              # 常量定义
│   │
│   ├── storage/                      # M7: Storage Layer
│   │   ├── FileSystem.ts             # 文件系统操作
│   │   ├── ConfigManager.ts          # 配置管理
│   │   ├── FileIndexer.ts            # 文件索引
│   │   └── types.ts                  # 存储类型
│   │
│   ├── memory/                       # M6: Memory System
│   │   ├── MemoryStore.ts            # 记忆存储
│   │   ├── MemoryIndexer.ts          # 记忆索引
│   │   ├── Consolidator.ts           # 记忆整合
│   │   └── types.ts                  # 记忆类型
│   │
│   ├── project/                      # M2: Project Manager
│   │   ├── ProjectManager.ts         # 项目管理器
│   │   ├── ProjectFactory.ts         # 项目工厂
│   │   ├── Project.ts                # 项目类
│   │   └── types.ts                  # 项目类型
│   │
│   ├── agent/                        # M3: Agent Manager
│   │   ├── AgentManager.ts           # Agent 管理器
│   │   ├── AgentFactory.ts           # Agent 工厂（固定工位）
│   │   ├── Desk.ts                   # 工位类
│   │   ├── AgentRuntime.ts           # Agent 运行时
│   │   ├── tools/                    # 工具目录
│   │   │   ├── Tool.ts               # 工具基类
│   │   │   ├── FileTools.ts          # 文件工具
│   │   │   ├── BashTool.ts           # Bash 工具
│   │   │   └── index.ts
│   │   └── types.ts                  # Agent 类型
│   │
│   ├── workflow/                     # M4: Workflow Engine
│   │   ├── WorkflowEngine.ts         # 工作流引擎
│   │   ├── TaskGraph.ts              # 任务图
│   │   ├── PhaseExecutor.ts          # 阶段执行器
│   │   ├── Verifier.ts               # 验证器
│   │   └── types.ts                  # 工作流类型
│   │
│   ├── automation/                   # M5: Automation Engine
│   │   ├── AutomationEngine.ts       # 自动化引擎（主循环）
│   │   ├── SupervisorAgent.ts        # 总管 Agent
│   │   ├── TaskExecutor.ts           # 任务执行器
│   │   ├── IssueHandler.ts           # 问题处理器
│   │   └── types.ts                  # 自动化类型
│   │
│   ├── cli/                          # M8: CLI Interface
│   │   ├── index.ts                  # CLI 入口
│   │   └── commands/                 # 命令目录
│   │       ├── project.ts            # 项目命令
│   │       ├── desk.ts               # 工位命令
│   │       ├── workflow.ts           # 工作流命令
│   │       └── automation.ts         # 自动化命令
│   │
│   └── templates/                    # 项目模板
│       └── default/                  # 默认模板
│           └── ...
│
└── tests/                            # 测试
    ├── core.test.ts
    ├── project.test.ts
    ├── agent.test.ts
    └── ...
```

---

## 三、核心类型定义

```typescript
// ========================================
// M1: Engine Core Types
// ========================================

/**
 * 引擎配置
 */
interface EngineConfig {
  storagePath: string;           // 根存储路径
  templatesPath?: string;        // 模板路径
  llm: LLMConfig;                // LLM 配置
}

/**
 * LLM 配置
 */
interface LLMConfig {
  provider: 'anthropic' | 'openai' | 'local';
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

/**
 * 引擎状态
 */
interface EngineState {
  initialized: boolean;
  currentProject: string | null;
  activeSessions: string[];
}

// ========================================
// M2: Project Types
// ========================================

/**
 * 项目配置
 */
interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  status: ProjectStatus;
  
  // 工作流配置
  workflow: WorkflowConfig;
  
  // 团队配置
  team: TeamConfig;
  
  // 验证配置
  verification: VerificationConfig;
}

/**
 * 项目状态
 */
interface ProjectState {
  phase: Phase;
  module: string | null;
  task: string | null;
  progress: ProgressStats;
}

/**
 * 项目
 */
interface Project {
  id: string;
  name: string;
  path: string;
  config: ProjectConfig;
  state: ProjectState;
  memory: ProjectMemory;
  index: FileIndex;
}

/**
 * 项目创建选项
 */
interface ProjectCreateOptions {
  name: string;
  description?: string;
  template?: string;
  requirement?: string;        // 初始需求
}

// ========================================
// M3: Agent Types
// ========================================

/**
 * 角色
 */
type Role = 'manager' | 'architect' | 'lead_dev' | 'developer' | 'designer';

/**
 * 工位定义（固定）
 */
interface DeskDefinition {
  id: string;
  name: string;
  role: Role;
  description: string;
  systemPrompt: string;
  tools: string[];
  responsibilities: {
    phases: Phase[];
    taskTypes: string[];
    canVerify: string[];
    canRepair: boolean;
  };
}

/**
 * 工位实例
 */
interface Desk {
  id: string;
  name: string;
  role: Role;
  systemPrompt: string;
  tools: string[];
  memory: RoleMemory;
  context: AgentContext;
  project: Project;
}

/**
 * Agent 会话
 */
interface AgentSession {
  id: string;
  deskId: string;
  projectId: string;
  startedAt: Date;
  status: 'active' | 'completed' | 'failed';
  messages: Message[];
}

// ========================================
// M4: Workflow Types
// ========================================

/**
 * 阶段
 */
type Phase = 'requirement' | 'architecture' | 'development' | 'integration' | 'extension';

/**
 * 任务
 */
interface Task {
  id: string;
  title: string;
  description: string;
  module: string;
  phase: Phase;
  
  // 依赖
  dependsOn: string[];
  
  // 执行
  estimatedMinutes: number;
  assignTo: Role;
  canParallelize: boolean;
  
  // 验证
  verificationRules: VerificationRules;
  acceptanceCriteria: string[];
  expectedOutputs: string[];
  
  // 状态
  status: TaskStatus;
}

/**
 * 任务状态
 */
type TaskStatus = 
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'blocked';

/**
 * 任务链
 */
interface TaskChain {
  id: string;
  moduleId: string;
  tasks: Task[];
  parallelGroups: TaskGroup[];
}

/**
 * 任务组（可并行）
 */
interface TaskGroup {
  tasks: string[];
  requiredRole: Role;
  canParallelize: boolean;
}

// ========================================
// M5: Automation Types
// ========================================

/**
 * 自动化事件
 */
type AutomationEvent = 
  | { type: 'started'; projectId: string }
  | { type: 'phase_started'; phase: Phase }
  | { type: 'task_started'; task: Task }
  | { type: 'task_completed'; task: Task; result: TaskResult }
  | { type: 'task_failed'; task: Task; error: string }
  | { type: 'phase_completed'; phase: Phase }
  | { type: 'blocked'; blockers: Issue[] }
  | { type: 'needs_intervention'; task: Task; reason: string }
  | { type: 'paused' }
  | { type: 'completed'; project: Project };

/**
 * 自动化选项
 */
interface AutomationOptions {
  autoRepair: boolean;
  autoRetry: boolean;
  maxRetries: number;
  reportInterval: number;
  notifyOnIssue: boolean;
}

/**
 * 问题
 */
interface Issue {
  id: string;
  type: IssueType;
  severity: 'low' | 'medium' | 'high';
  taskId?: string;
  description: string;
  suggestedAction: string;
  status: 'open' | 'in_progress' | 'resolved';
}

/**
 * 问题类型
 */
type IssueType = 
  | 'blocked_task'
  | 'failed_task'
  | 'timeout_task'
  | 'verification_failed'
  | 'resource_conflict';

// ========================================
// M6: Memory Types
// ========================================

/**
 * 项目记忆
 */
interface ProjectMemory {
  [role: string]: RoleMemory;
}

/**
 * 角色记忆
 */
interface RoleMemory {
  working: WorkingMemory;
  longTerm: LongTermMemory;
  sessions: SessionRecord[];
}

/**
 * 工作记忆
 */
interface WorkingMemory {
  currentTask: string | null;
  recentActions: Action[];
  context: Record<string, unknown>;
  updatedAt: string;
}

/**
 * 长期记忆
 */
interface LongTermMemory {
  [category: string]: MemoryEntry[];
}

/**
 * 记忆条目
 */
interface MemoryEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ========================================
// M7: Storage Types
// ========================================

/**
 * 文件信息
 */
interface FileInfo {
  path: string;
  relativePath: string;
  extension: string;
  directory: string;
  size: number;
  modifiedAt: Date;
  projectName: string;
}

/**
 * 文件索引
 */
interface FileIndex {
  files: Map<string, FileInfo>;
  byExtension: Map<string, string[]>;
  byDirectory: Map<string, string[]>;
  lastUpdated: Date;
}

/**
 * 搜索查询
 */
interface FileSearchQuery {
  path?: string;
  extension?: string;
  keyword?: string;
  content?: string;
}
```

---

## 四、接口设计

```typescript
// ========================================
// 核心引擎接口
// ========================================

interface IDevFlowEngine {
  // 初始化
  initialize(config: EngineConfig): Promise<void>;
  
  // 项目管理
  createProject(options: ProjectCreateOptions): Promise<Project>;
  openProject(path: string): Promise<Project>;
  closeProject(projectId: string): Promise<void>;
  listProjects(): Promise<Project[]>;
  
  // 工位管理
  getDesk(deskId: string, project: Project): Desk;
  startSession(deskId: string, projectId: string): Promise<AgentSession>;
  endSession(sessionId: string): Promise<void>;
  
  // 自动化
  startAutomation(projectId: string, options?: AutomationOptions): Promise<void>;
  pauseAutomation(projectId: string): Promise<void>;
  resumeAutomation(projectId: string): Promise<void>;
  getAutomationStatus(projectId: string): Promise<AutomationStatus>;
}

// ========================================
// 项目管理接口
// ========================================

interface IProjectManager {
  create(options: ProjectCreateOptions): Promise<Project>;
  open(path: string): Promise<Project>;
  close(projectId: string): Promise<void>;
  delete(projectId: string): Promise<void>;
  list(): Promise<Project[]>;
  getCurrent(): Project | null;
}

// ========================================
// Agent 管理接口
// ========================================

interface IAgentManager {
  getDesk(deskId: string, project: Project): Desk;
  getAvailableDesks(): DeskDefinition[];
  getDesksForPhase(phase: Phase): DeskDefinition[];
  startSession(deskId: string, project: Project): Promise<AgentSession>;
  endSession(sessionId: string): Promise<void>;
  executeTask(sessionId: string, task: Task): Promise<TaskResult>;
}

// ========================================
// 工作流接口
// ========================================

interface IWorkflowEngine {
  start(projectId: string): Promise<void>;
  pause(projectId: string): Promise<void>;
  resume(projectId: string): Promise<void>;
  getStatus(projectId: string): Promise<WorkflowStatus>;
  
  // 任务管理
  getTaskChain(projectId: string): Promise<TaskChain>;
  getNextTask(projectId: string): Promise<Task | null>;
  getReadyTasks(projectId: string): Promise<Task[]>;
}

// ========================================
// 自动化接口
// ========================================

interface IAutomationEngine {
  start(projectId: string, options?: AutomationOptions): AsyncGenerator<AutomationEvent>;
  pause(projectId: string): Promise<void>;
  resume(projectId: string): Promise<void>;
  getStatus(projectId: string): Promise<AutomationStatus>;
  
  // 总管
  checkStatus(projectId: string): Promise<WorkflowStatus>;
  detectIssues(projectId: string): Promise<Issue[]>;
  handleIssues(projectId: string, issues: Issue[]): Promise<void>;
}

// ========================================
// 记忆接口
// ========================================

interface IMemoryStore {
  load(projectId: string, role: string): Promise<RoleMemory>;
  save(projectId: string, role: string, memory: RoleMemory): Promise<void>;
  search(projectId: string, query: string): Promise<MemoryEntry[]>;
  consolidate(projectId: string, role: string): Promise<void>;
}

// ========================================
// 存储接口
// ========================================

interface IStorageLayer {
  // 文件操作
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  
  // 目录操作
  createDir(path: string): Promise<void>;
  listDir(path: string): Promise<string[]>;
  
  // 配置
  loadConfig(path: string): Promise<Record<string, unknown>>;
  saveConfig(path: string, config: Record<string, unknown>): Promise<void>;
  
  // 索引
  scanProject(projectPath: string): Promise<FileIndex>;
  searchFiles(query: FileSearchQuery): Promise<FileInfo[]>;
}
```

---

## 五、数据流设计

### 5.1 项目创建流程

```
用户: devflow project create my-app --requirement "..."
                    │
                    ▼
            ┌───────────────┐
            │ DevFlowEngine │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │ProjectManager │
            │   .create()   │
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ 生成ID  │ │创建目录 │ │初始化  │
   │         │ │结构     │ │配置     │
   └─────────┘ └─────────┘ └─────────┘
                    │
                    ▼
            ┌───────────────┐
            │ProjectFactory │
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ 创建    │ │创建记忆 │ │创建工作 │
   │ .project│ │结构     │ │流结构   │
   └─────────┘ └─────────┘ └─────────┘
                    │
                    ▼
            ┌───────────────┐
            │StorageLayer   │
            │ .scanProject()│
            └───────────────┘
                    │
                    ▼
              Project 对象
```

### 5.2 自动化执行流程

```
用户: devflow start my-app
            │
            ▼
    ┌───────────────┐
    │ DevFlowEngine │
    │ .startAuto()  │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │AutomationEngine│
    │   .run()      │◄─────────────────┐
    └───────┬───────┘                  │
            │                          │
            ▼                          │
    ┌───────────────┐                  │
    │ Supervisor    │                  │
    │ .checkStatus()│                  │
    └───────┬───────┘                  │
            │                          │
            ▼                          │
    ┌───────────────┐                  │
    │ 有问题?       │──Yes──► 处理问题 │
    └───────┬───────┘                  │
            │ No                       │
            ▼                          │
    ┌───────────────┐                  │
    │WorkflowEngine │                  │
    │.getNextTask() │                  │
    └───────┬───────┘                  │
            │                          │
            ▼                          │
    ┌───────────────┐                  │
    │AgentManager   │                  │
    │.executeTask() │                  │
    └───────┬───────┘                  │
            │                          │
            ▼                          │
    ┌───────────────┐                  │
    │ Verifier      │                  │
    │ .verify()     │                  │
    └───────┬───────┘                  │
            │                          │
            ▼                          │
    ┌───────────────┐                  │
    │ 通过?         │──No──► 触发修复  │
    └───────┬───────┘                  │
            │ Yes                      │
            ▼                          │
    ┌───────────────┐                  │
    │MemoryStore    │                  │
    │ .update()     │                  │
    └───────┬───────┘                  │
            │                          │
            ▼                          │
    ┌───────────────┐                  │
    │ 完成?         │──No──────────────┘
    └───────┬───────┘
            │ Yes
            ▼
        项目完成
```

---

## 六、配置文件设计

### 6.1 引擎配置 (engine.yaml)

```yaml
# DevFlow Engine 配置
version: "1.0.0"

storage:
  rootPath: ~/.devflow
  templatesPath: ~/.devflow/templates

llm:
  provider: anthropic
  model: claude-sonnet-4-20250514
  # apiKey 从环境变量读取: ANTHROPIC_API_KEY

automation:
  maxConcurrency: 3
  autoRepair: true
  autoRetry: true
  maxRetries: 3
  reportInterval: 60  # 秒

logging:
  level: info
  path: ~/.devflow/logs
```

### 6.2 工位配置 (固定在代码中)

```typescript
// 工位配置是固定的，不需要外部配置文件
const DESK_DEFINITIONS: Record<string, DeskDefinition> = {
  manager: {
    id: 'manager',
    name: '总管',
    role: 'manager',
    description: '工作流监督者和协调者',
    systemPrompt: `...`,
    tools: ['file_read', 'file_write', 'ask_user', 'report_status'],
    responsibilities: {
      phases: ['requirement', 'architecture', 'development', 'integration'],
      taskTypes: ['coordination', 'monitoring', 'reporting'],
      canVerify: [],
      canRepair: false
    }
  },
  
  architect: {
    id: 'architect',
    name: '架构师',
    role: 'architect',
    description: '架构设计、任务链规划',
    systemPrompt: `...`,
    tools: ['file_read', 'file_write', 'search_code', 'analyze_code'],
    responsibilities: {
      phases: ['architecture', 'extension'],
      taskTypes: ['architecture_design', 'task_chain_creation'],
      canVerify: ['architecture', 'design'],
      canRepair: false
    }
  },
  
  // ... 其他工位
};
```

### 6.3 项目配置模板

```yaml
# 项目配置模板 (创建项目时生成)
id: ${generated}
name: ${user_input}
description: ${user_input}
createdAt: ${timestamp}
status: initialized

workflow:
  currentPhase: requirement
  phases:
    - id: requirement
      name: 需求阶段
      status: pending
    - id: architecture
      name: 架构阶段
      status: pending
    - id: development
      name: 开发阶段
      status: pending
    - id: integration
      name: 整合阶段
      status: pending

team:
  roles:
    - manager
    - architect
    - lead_dev
    - developer
    - designer

verification:
  autoBuild: true
  autoTest: true
  requireCodeReview: true
  requireVisualVerification: false
```

---

## 七、错误处理设计

```typescript
/**
 * 错误类型
 */
enum ErrorCode {
  // 项目错误
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_ALREADY_EXISTS = 'PROJECT_ALREADY_EXISTS',
  PROJECT_CORRUPTED = 'PROJECT_CORRUPTED',
  
  // Agent 错误
  DESK_NOT_FOUND = 'DESK_NOT_FOUND',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // 工作流错误
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  TASK_BLOCKED = 'TASK_BLOCKED',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  
  // 自动化错误
  AUTOMATION_PAUSED = 'AUTOMATION_PAUSED',
  AUTOMATION_FAILED = 'AUTOMATION_FAILED',
  NEEDS_INTERVENTION = 'NEEDS_INTERVENTION',
  
  // 存储错误
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  
  // LLM 错误
  LLM_API_ERROR = 'LLM_API_ERROR',
  LLM_RATE_LIMIT = 'LLM_RATE_LIMIT',
  LLM_TIMEOUT = 'LLM_TIMEOUT'
}

/**
 * 自定义错误类
 */
class DevFlowError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DevFlowError';
  }
}

/**
 * 错误处理器
 */
class ErrorHandler {
  handle(error: DevFlowError, context: ErrorContext): ErrorResult {
    switch (error.code) {
      case ErrorCode.TASK_BLOCKED:
        return this.handleBlockedTask(error, context);
      
      case ErrorCode.LLM_RATE_LIMIT:
        return this.handleRateLimit(error, context);
      
      case ErrorCode.NEEDS_INTERVENTION:
        return this.handleIntervention(error, context);
      
      default:
        return this.handleGeneric(error, context);
    }
  }
  
  private handleBlockedTask(error: DevFlowError, context: ErrorContext): ErrorResult {
    // 返回重试策略
    return {
      action: 'retry',
      delay: 5000,
      maxAttempts: 3
    };
  }
  
  private handleRateLimit(error: DevFlowError, context: ErrorContext): ErrorResult {
    // 指数退避
    return {
      action: 'retry',
      delay: Math.pow(2, context.attempts) * 1000,
      maxAttempts: 5
    };
  }
  
  private handleIntervention(error: DevFlowError, context: ErrorContext): ErrorResult {
    // 需要人工介入
    return {
      action: 'intervene',
      message: error.message,
      options: ['continue', 'abort', 'modify']
    };
  }
}
```

---

## 八、性能考虑

### 8.1 内存优化

- 文件索引使用 Map，O(1) 查找
- 记忆分页加载，不一次性全部加载
- 任务图缓存计算结果

### 8.2 并发优化

- 任务并行执行，最大并发数可配置
- 文件索引增量更新
- 非阻塞的事件报告

### 8.3 存储优化

- 配置使用 YAML，人类可读
- 状态使用 JSON，快速解析
- 大文件不加载到内存，使用流式读取

---

**架构师签名**: 已完成模块框架设计
**日期**: 2026-04-01