# 自动化开发工作流设计方案

> 基于 Claude Code 架构分析 + 现有工作流体系优化

---

## 一、整体架构

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         用户界面层 (CLI / IDE)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ workflow    │  │ workflow    │  │ workflow    │  │ workflow    │    │
│  │ init        │  │ next        │  │ verify      │  │ status      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         工作流引擎层                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Workflow Orchestrator                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │ Task Graph │  │ Agent Pool │  │ Scheduler  │  │ Verifier   │  │   │
│  │  │ Manager    │  │ Manager    │  │            │  │            │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Query Engine (核心执行循环)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │ Context    │  │ Tool       │  │ Permission │  │ Progress   │  │   │
│  │  │ Builder    │  │ Executor   │  │ Manager    │  │ Tracker    │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         工具层 (Tool Layer)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ CodeGen  │ │ TestRun  │ │ CodeRev  │ │ DocGen   │ │ Deploy   │      │
│  │ Tool     │ │ Tool     │ │ Tool     │ │ Tool     │ │ Tool     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         记忆层 (Memory Layer)                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ Project Memory   │  │ Workflow State   │  │ Learned Lessons  │      │
│  │ (项目知识)       │  │ (工作流状态)     │  │ (经验教训)       │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心模块职责

| 模块 | 职责 | 对应 Claude Code |
|------|------|------------------|
| Workflow Orchestrator | 协调整个工作流 | Coordinator Mode |
| Task Graph Manager | 任务依赖管理 | TaskStore V2 |
| Agent Pool Manager | 智能体池管理 | AgentTool |
| Scheduler | 并行调度执行 | Query Engine |
| Verifier | 验证任务完成 | Permission + Hooks |
| Query Engine | 核心执行循环 | query.ts |
| Memory Layer | 项目知识持久化 | memdir + Dream |

---

## 二、工作流状态机

### 2.1 任务状态定义

```typescript
type TaskStatus = 
  | 'pending'      // 等待中（依赖未满足）
  | 'ready'        // 可执行（依赖已满足）
  | 'in_progress'  // 执行中
  | 'blocked'      // 被阻塞（需要人工介入）
  | 'verifying'    // 验证中
  | 'completed'    // 已完成
  | 'failed'       // 失败
  | 'skipped';     // 跳过

type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

interface Task {
  // 基本信息
  id: string;                    // T1.1, T1.2, ...
  title: string;                 // 任务标题
  description: string;           // 详细描述
  
  // 状态
  status: TaskStatus;
  priority: TaskPriority;
  
  // 依赖
  dependsOn: string[];           // 前置任务 ID
  blocks: string[];              // 后续任务 ID
  
  // 执行
  estimatedMinutes: number;      // 预估时间（分钟）
  actualMinutes?: number;        // 实际时间
  assignee?: 'human' | 'ai';     // 执行者
  
  // 验证
  verificationType: 'auto' | 'manual' | 'both';
  verificationChecklist: string[];
  
  // 元数据
  phase: string;                 // 阶段
  milestone: string;             // 里程碑
  tags: string[];                // 标签
  
  // 执行记录
  attempts: number;              // 尝试次数
  lastError?: string;            // 最后错误
  startedAt?: Date;              // 开始时间
  completedAt?: Date;            // 完成时间
}
```

### 2.2 状态转换图

```
                    ┌─────────────┐
                    │   pending   │
                    └──────┬──────┘
                           │ 依赖满足
                           ▼
                    ┌─────────────┐
          ┌────────│    ready    │────────┐
          │        └──────┬──────┘        │
          │               │ 开始执行      │ 跳过
          │               ▼               │
          │        ┌─────────────┐        │
          │        │ in_progress │        │
          │        └──────┬──────┘        │
          │               │               │
          │    ┌──────────┼──────────┐    │
          │    │          │          │    │
          │    ▼          ▼          ▼    │
          │ ┌────────┐ ┌────────┐ ┌────────┐
          │ │blocked │ │verifying│ │ failed │
          │ └───┬────┘ └────┬───┘ └────┬───┘
          │     │           │          │
          │     │ 解除阻塞   │ 验证通过  │ 重试
          │     │           ▼          │
          │     │    ┌─────────────┐   │
          │     └───►│  completed  │◄──┘
          │          └─────────────┘
          │                              │
          └──────────────────────────────┘
                    ┌─────────────┐
                    │   skipped   │
                    └─────────────┘
```

### 2.3 工作流状态

```typescript
interface WorkflowState {
  // 基本信息
  id: string;                    // 工作流 ID
  name: string;                  // 工作流名称
  project: string;               // 项目名称
  
  // 当前状态
  currentPhase: string;          // 当前阶段
  currentMilestone: string;      // 当前里程碑
  
  // 任务管理
  tasks: Map<string, Task>;      // 所有任务
  taskQueue: string[];           // 就绪队列
  activeTasks: string[];         // 执行中任务
  
  // 统计
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  blockedTasks: number;
  
  // 时间
  startedAt: Date;
  estimatedEnd?: Date;
  actualEnd?: Date;
  
  // 配置
  config: WorkflowConfig;
}

interface WorkflowConfig {
  maxParallelTasks: number;      // 最大并行数
  autoRetry: boolean;            // 自动重试
  maxRetries: number;            // 最大重试次数
  verificationRequired: boolean; // 是否需要验证
  autoProceed: boolean;          // 验证通过后自动进入下一任务
}
```

---

## 三、核心流程设计

### 3.1 主执行循环 (Query Loop)

```typescript
async function* workflowLoop(
  workflow: WorkflowState
): AsyncGenerator<WorkflowEvent> {
  
  while (!isWorkflowComplete(workflow)) {
    
    // 1. 更新任务状态
    updateTaskStatuses(workflow);
    
    // 2. 获取就绪任务
    const readyTasks = getReadyTasks(workflow);
    
    if (readyTasks.length === 0) {
      // 检查是否有阻塞任务
      const blocked = getBlockedTasks(workflow);
      if (blocked.length > 0) {
        yield { type: 'blocked', tasks: blocked };
        await waitForUnblock(blocked);
        continue;
      }
      
      // 检查是否有失败任务
      const failed = getFailedTasks(workflow);
      if (failed.length > 0) {
        yield { type: 'failed', tasks: failed };
        await handleFailures(failed);
        continue;
      }
      
      // 无任务可执行，等待
      yield { type: 'waiting' };
      await sleep(1000);
      continue;
    }
    
    // 3. 选择下一个任务
    const nextTask = selectNextTask(readyTasks, workflow.config);
    
    // 4. 执行任务
    yield { type: 'task_started', task: nextTask };
    
    try {
      const result = await executeTask(nextTask, workflow);
      
      // 5. 验证结果
      if (nextTask.verificationType !== 'none') {
        yield { type: 'verifying', task: nextTask };
        const verification = await verifyTask(nextTask, result);
        
        if (!verification.passed) {
          nextTask.status = 'failed';
          nextTask.lastError = verification.message;
          yield { type: 'task_failed', task: nextTask, reason: verification.message };
          continue;
        }
      }
      
      // 6. 标记完成
      nextTask.status = 'completed';
      nextTask.completedAt = new Date();
      workflow.completedTasks++;
      
      yield { type: 'task_completed', task: nextTask };
      
      // 7. 更新记忆
      await updateMemory(nextTask, result);
      
    } catch (error) {
      nextTask.status = 'failed';
      nextTask.lastError = error.message;
      yield { type: 'task_failed', task: nextTask, reason: error.message };
    }
  }
  
  yield { type: 'workflow_completed', workflow };
}
```

### 3.2 并行执行策略

```typescript
async function executeParallel(
  tasks: Task[],
  workflow: WorkflowState,
  maxParallel: number
): Promise<Map<string, TaskResult>> {
  
  const results = new Map<string, TaskResult>();
  const executing = new Map<string, Promise<TaskResult>>();
  
  const pendingTasks = [...tasks];
  
  while (pendingTasks.length > 0 || executing.size > 0) {
    
    // 填充执行队列
    while (executing.size < maxParallel && pendingTasks.length > 0) {
      const task = pendingTasks.shift()!;
      const promise = executeTask(task, workflow);
      executing.set(task.id, promise);
    }
    
    if (executing.size === 0) break;
    
    // 等待任意一个完成
    const settled = await Promise.race(
      [...executing.entries()].map(async ([id, promise]) => ({
        id,
        result: await promise.catch(e => ({ error: e }))
      }))
    );
    
    executing.delete(settled.id);
    results.set(settled.id, settled.result);
    
    // 更新任务状态
    const task = workflow.tasks.get(settled.id);
    if (task) {
      if ('error' in settled.result) {
        task.status = 'failed';
        task.lastError = settled.result.error.message;
      } else {
        task.status = 'completed';
        task.completedAt = new Date();
      }
    }
  }
  
  return results;
}
```

### 3.3 任务依赖解析

```typescript
class TaskGraph {
  private tasks: Map<string, Task>;
  private adjacencyList: Map<string, Set<string>>;
  
  constructor(tasks: Task[]) {
    this.tasks = new Map(tasks.map(t => [t.id, t]));
    this.buildAdjacencyList(tasks);
  }
  
  private buildAdjacencyList(tasks: Task[]): void {
    this.adjacencyList = new Map();
    
    for (const task of tasks) {
      // 正向依赖：task -> 被它阻塞的任务
      for (const blocked of task.blocks) {
        if (!this.adjacencyList.has(task.id)) {
          this.adjacencyList.set(task.id, new Set());
        }
        this.adjacencyList.get(task.id)!.add(blocked);
      }
    }
  }
  
  // 获取就绪任务（所有依赖已完成）
  getReadyTasks(): Task[] {
    return [...this.tasks.values()].filter(task => 
      task.status === 'pending' &&
      task.dependsOn.every(depId => 
        this.tasks.get(depId)?.status === 'completed'
      )
    );
  }
  
  // 获取可并行执行的任务组
  getParallelGroups(): Task[][] {
    const groups: Task[][] = [];
    const completed = new Set<string>();
    const pending = new Set(this.tasks.keys());
    
    while (pending.size > 0) {
      const ready = [...pending].filter(id => {
        const task = this.tasks.get(id)!;
        return task.dependsOn.every(dep => completed.has(dep));
      });
      
      if (ready.length === 0) {
        // 存在循环依赖
        throw new Error('Circular dependency detected');
      }
      
      groups.push(ready.map(id => this.tasks.get(id)!));
      
      for (const id of ready) {
        pending.delete(id);
        completed.add(id);
      }
    }
    
    return groups;
  }
  
  // 获取关键路径（最长依赖链）
  getCriticalPath(): Task[] {
    const memo = new Map<string, { length: number; path: Task[] }>();
    
    const dfs = (taskId: string): { length: number; path: Task[] } => {
      if (memo.has(taskId)) return memo.get(taskId)!;
      
      const task = this.tasks.get(taskId)!;
      
      if (task.dependsOn.length === 0) {
        const result = { length: task.estimatedMinutes, path: [task] };
        memo.set(taskId, result);
        return result;
      }
      
      const depResults = task.dependsOn.map(dfs);
      const maxDep = depResults.reduce((a, b) => 
        a.length > b.length ? a : b
      );
      
      const result = {
        length: maxDep.length + task.estimatedMinutes,
        path: [...maxDep.path, task]
      };
      
      memo.set(taskId, result);
      return result;
    };
    
    // 从所有无后继的任务开始
    const terminalTasks = [...this.tasks.values()].filter(t => t.blocks.length === 0);
    const paths = terminalTasks.map(t => dfs(t.id));
    
    return paths.reduce((a, b) => a.length > b.length ? a : b).path;
  }
}
```

---

## 四、多智能体协作模式

### 4.1 智能体角色定义

```typescript
type AgentRole = 
  | 'coordinator'   // 协调者 - 分配任务、汇总结果
  | 'coder'         // 编码者 - 编写代码
  | 'reviewer'      // 审查者 - 代码审查
  | 'tester'        // 测试者 - 运行测试
  | 'documenter';   // 文档编写者

interface Agent {
  id: string;
  role: AgentRole;
  capabilities: string[];      // 能力标签
  currentTask?: string;        // 当前任务
  status: 'idle' | 'busy' | 'blocked';
  
  // 性能统计
  tasksCompleted: number;
  averageTime: number;
  successRate: number;
}

class AgentPool {
  private agents: Map<string, Agent>;
  private roleIndex: Map<AgentRole, Set<string>>;
  
  constructor() {
    this.agents = new Map();
    this.roleIndex = new Map();
  }
  
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    
    if (!this.roleIndex.has(agent.role)) {
      this.roleIndex.set(agent.role, new Set());
    }
    this.roleIndex.get(agent.role)!.add(agent.id);
  }
  
  getAvailableAgents(role: AgentRole): Agent[] {
    const ids = this.roleIndex.get(role) || new Set();
    return [...ids]
      .map(id => this.agents.get(id)!)
      .filter(a => a.status === 'idle');
  }
  
  assignTask(taskId: string, agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentTask = taskId;
      agent.status = 'busy';
    }
  }
  
  releaseAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentTask = undefined;
      agent.status = 'idle';
    }
  }
}
```

### 4.2 四阶段协作流程

```typescript
async function executePhase(
  phase: Phase,
  workflow: WorkflowState
): Promise<PhaseResult> {
  
  const coordinator = workflow.agentPool.getAvailableAgents('coordinator')[0];
  const workers = getWorkersForPhase(phase, workflow.agentPool);
  
  switch (phase.type) {
    
    case 'research': {
      // Phase 1: 并行调研
      const tasks = phase.tasks;
      const results = await executeParallel(tasks, workers);
      
      // 汇总结果到 scratchpad
      const synthesis = await coordinator.execute({
        type: 'synthesize',
        inputs: results,
        output: `${workflow.scratchpad}/research_summary.md`
      });
      
      return { type: 'research_complete', synthesis };
    }
    
    case 'design': {
      // Phase 2: 设计方案（协调者主导）
      const design = await coordinator.execute({
        type: 'design',
        input: `${workflow.scratchpad}/research_summary.md`,
        output: `${workflow.scratchpad}/design_spec.md`
      });
      
      // 评审设计
      const reviewers = workflow.agentPool.getAvailableAgents('reviewer');
      const reviews = await Promise.all(
        reviewers.map(r => r.execute({
          type: 'review',
          input: design.output
        }))
      );
      
      // 根据评审意见修改
      if (reviews.some(r => !r.approved)) {
        await coordinator.execute({
          type: 'revise',
          input: design.output,
          feedback: reviews
        });
      }
      
      return { type: 'design_complete', design };
    }
    
    case 'implementation': {
      // Phase 3: 并行实现
      const tasks = phase.tasks;
      
      // 按模块分配给不同的编码者
      const assignments = assignTasksToWorkers(tasks, workers);
      
      const results = await Promise.all(
        assignments.map(({ task, worker }) => 
          worker.execute({
            type: 'implement',
            spec: `${workflow.scratchpad}/design_spec.md`,
            module: task.module
          })
        )
      );
      
      return { type: 'implementation_complete', results };
    }
    
    case 'verification': {
      // Phase 4: 并行验证
      const testers = workflow.agentPool.getAvailableAgents('tester');
      
      const testResults = await Promise.all(
        testers.map(t => t.execute({
          type: 'test',
          scope: phase.testScope
        }))
      );
      
      const codeReviewResults = await Promise.all(
        workflow.agentPool.getAvailableAgents('reviewer').map(r =>
          r.execute({
            type: 'code_review',
            changes: phase.changes
          })
        )
      );
      
      const passed = testResults.every(r => r.passed) && 
                     codeReviewResults.every(r => r.approved);
      
      return { type: 'verification_complete', passed, testResults, codeReviewResults };
    }
  }
}
```

### 4.3 智能体通信协议

```typescript
type MessageType = 
  | 'task_assignment'    // 任务分配
  | 'task_completion'    // 任务完成
  | 'task_blocked'       // 任务阻塞
  | 'sync_request'       // 同步请求
  | 'sync_response'      // 同步响应
  | 'help_request';      // 帮助请求

interface Message {
  id: string;
  from: string;              // 发送者 ID
  to: string | 'broadcast';  // 接收者 ID 或广播
  type: MessageType;
  payload: unknown;
  timestamp: Date;
}

class MessageBus {
  private mailboxes: Map<string, Message[]>;
  private subscribers: Map<string, Set<(msg: Message) => void>>;
  
  send(message: Message): void {
    if (message.to === 'broadcast') {
      // 广播给所有订阅者
      for (const [_, handlers] of this.subscribers) {
        for (const handler of handlers) {
          handler(message);
        }
      }
    } else {
      // 定向发送
      if (!this.mailboxes.has(message.to)) {
        this.mailboxes.set(message.to, []);
      }
      this.mailboxes.get(message.to)!.push(message);
    }
  }
  
  receive(agentId: string): Message[] {
    const messages = this.mailboxes.get(agentId) || [];
    this.mailboxes.set(agentId, []);
    return messages;
  }
  
  subscribe(agentId: string, handler: (msg: Message) => void): () => void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }
    this.subscribers.get(agentId)!.add(handler);
    
    return () => {
      this.subscribers.get(agentId)!.delete(handler);
    };
  }
}
```

---

## 五、记忆系统设计

### 5.1 记忆类型定义

```typescript
type MemoryType = 
  | 'project_context'     // 项目上下文（架构、技术栈）
  | 'coding_standards'    // 编码规范
  | 'common_patterns'     // 常用模式
  | 'learned_lessons'     // 教训总结
  | 'api_references'      // API 参考
  | 'decision_log';       // 决策日志

interface MemoryEntry {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  tags: string[];
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
  relevanceScore?: number;
  
  // 来源
  source: 'manual' | 'extracted' | 'learned';
  relatedTasks: string[];
}

interface MemoryFile {
  // YAML frontmatter
  id: string;
  type: MemoryType;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Markdown content
  content: string;
}
```

### 5.2 记忆目录结构

```
~/.openclaw/workspace-chief-architect/
├── memory/
│   ├── MEMORY.md              # 入口索引（自动生成）
│   │
│   ├── project/               # 项目上下文
│   │   ├── architecture.md
│   │   ├── tech_stack.md
│   │   └── dependencies.md
│   │
│   ├── standards/             # 编码规范
│   │   ├── typescript.md
│   │   ├── rust.md
│   │   └── react.md
│   │
│   ├── patterns/              # 常用模式
│   │   ├── error_handling.md
│   │   ├── state_management.md
│   │   └── testing.md
│   │
│   ├── lessons/               # 教训总结
│   │   ├── 2026-03-27-build-failure.md
│   │   └── 2026-03-28-deps-conflict.md
│   │
│   └── decisions/             # 决策日志
│       ├── 2026-03-20-tauri-choice.md
│       └── 2026-03-25-state-lib.md
```

### 5.3 记忆整合机制 (类似 Dream)

```typescript
interface DreamConfig {
  // 触发条件
  minSessionCount: number;     // 最小会话数
  minTimeSinceLastDream: number; // 距上次整合的最小时间
  
  // 整合参数
  maxEntriesPerType: number;   // 每类最大条目数
  maxTotalSize: number;        // 总大小上限
  
  // 清理规则
  staleThreshold: number;      // 过期阈值（天）
}

async function consolidateMemory(
  workflow: WorkflowState,
  config: DreamConfig
): Promise<void> {
  
  // 1. 检查触发条件
  if (!shouldConsolidate(workflow, config)) {
    return;
  }
  
  // 2. 收集新信息
  const recentActivity = await gatherRecentActivity(workflow);
  
  // 3. 提取关键洞察
  const insights = await extractInsights(recentActivity);
  
  // 4. 更新记忆文件
  for (const insight of insights) {
    await updateMemoryFile(insight);
  }
  
  // 5. 清理过期内容
  await pruneStaleEntries(config.staleThreshold);
  
  // 6. 重新生成索引
  await regenerateMemoryIndex();
}

async function extractInsights(
  activity: ActivityLog
): Promise<MemoryEntry[]> {
  
  const insights: MemoryEntry[] = [];
  
  // 从失败中学习
  for (const failure of activity.failures) {
    insights.push({
      type: 'learned_lessons',
      title: `Lesson: ${failure.task}`,
      content: `
## 问题
${failure.error}

## 原因
${failure.rootCause}

## 解决方案
${failure.solution}

## 预防措施
${failure.prevention}
      `,
      tags: ['failure', failure.category],
      source: 'learned',
      relatedTasks: [failure.taskId]
    });
  }
  
  // 从成功模式中提取
  for (const pattern of activity.successPatterns) {
    insights.push({
      type: 'common_patterns',
      title: pattern.name,
      content: pattern.description,
      tags: pattern.tags,
      source: 'extracted',
      relatedTasks: pattern.taskIds
    });
  }
  
  return insights;
}
```

### 5.4 记忆检索机制

```typescript
async function retrieveRelevantMemory(
  query: string,
  memoryDir: string,
  topK: number = 5
): Promise<MemoryEntry[]> {
  
  // 1. 扫描记忆文件
  const files = await scanMemoryFiles(memoryDir);
  
  // 2. 计算相关性分数
  const scored = files.map(file => ({
    file,
    score: calculateRelevance(query, file)
  }));
  
  // 3. 排序取 top K
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, topK).map(s => s.file);
}

function calculateRelevance(query: string, entry: MemoryEntry): number {
  let score = 0;
  
  const queryTerms = query.toLowerCase().split(/\s+/);
  const content = entry.content.toLowerCase();
  const title = entry.title.toLowerCase();
  
  // 标题匹配加分
  for (const term of queryTerms) {
    if (title.includes(term)) score += 10;
  }
  
  // 内容匹配
  for (const term of queryTerms) {
    const count = (content.match(new RegExp(term, 'g')) || []).length;
    score += count * 2;
  }
  
  // 标签匹配
  for (const tag of entry.tags) {
    if (queryTerms.includes(tag.toLowerCase())) {
      score += 5;
    }
  }
  
  // 类型权重
  const typeWeights: Record<MemoryType, number> = {
    'project_context': 1.5,
    'coding_standards': 1.2,
    'common_patterns': 1.3,
    'learned_lessons': 1.5,  // 教训优先级高
    'api_references': 1.0,
    'decision_log': 1.1
  };
  
  score *= typeWeights[entry.type] || 1.0;
  
  // 新鲜度衰减
  const ageInDays = (Date.now() - entry.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  score *= Math.exp(-ageInDays / 30); // 30天半衰期
  
  return score;
}
```

---

## 六、验证系统设计

### 6.1 验证类型

```typescript
type VerificationType = 
  | 'build'          // 构建验证
  | 'test'           // 测试验证
  | 'lint'           // 代码风格
  | 'type_check'     // 类型检查
  | 'code_review'    // 代码审查
  | 'visual'         // 视觉验证
  | 'manual';        // 人工验证

interface VerificationRule {
  type: VerificationType;
  command?: string;          // 执行命令
  expectedOutput?: RegExp;   // 期望输出
  timeout?: number;          // 超时时间
  
  // 人工验证
  checklist?: string[];      // 检查项
  requireApproval?: boolean; // 需要批准
}

interface VerificationResult {
  passed: boolean;
  type: VerificationType;
  message: string;
  details?: unknown;
  
  // 人工验证
  approver?: string;
  approvedAt?: Date;
}
```

### 6.2 验证流程

```typescript
async function verifyTask(
  task: Task,
  result: TaskResult
): Promise<VerificationResult> {
  
  const verifications: VerificationResult[] = [];
  
  for (const rule of task.verificationRules || []) {
    const verification = await executeVerification(rule, task, result);
    verifications.push(verification);
    
    if (!verification.passed && rule.critical) {
      // 关键验证失败，立即返回
      return verification;
    }
  }
  
  // 综合判断
  const allPassed = verifications.every(v => v.passed);
  
  return {
    passed: allPassed,
    type: 'combined',
    message: allPassed 
      ? 'All verifications passed' 
      : 'Some verifications failed',
    details: verifications
  };
}

async function executeVerification(
  rule: VerificationRule,
  task: Task,
  result: TaskResult
): Promise<VerificationResult> {
  
  switch (rule.type) {
    
    case 'build':
      return verifyBuild(task, rule);
      
    case 'test':
      return verifyTests(task, rule);
      
    case 'lint':
      return verifyLint(task, rule);
      
    case 'type_check':
      return verifyTypes(task, rule);
      
    case 'code_review':
      return verifyCodeReview(task, rule);
      
    case 'visual':
      return verifyVisual(task, rule);
      
    case 'manual':
      return verifyManual(task, rule);
  }
}

async function verifyBuild(
  task: Task,
  rule: VerificationRule
): Promise<VerificationResult> {
  
  const command = rule.command || 'npm run build';
  
  try {
    const { stdout, stderr, exitCode } = await exec(command, {
      timeout: rule.timeout || 60000
    });
    
    if (exitCode !== 0) {
      return {
        passed: false,
        type: 'build',
        message: `Build failed with exit code ${exitCode}`,
        details: { stdout, stderr }
      };
    }
    
    return {
      passed: true,
      type: 'build',
      message: 'Build succeeded'
    };
    
  } catch (error) {
    return {
      passed: false,
      type: 'build',
      message: `Build error: ${error.message}`
    };
  }
}

async function verifyManual(
  task: Task,
  rule: VerificationRule
): Promise<VerificationResult> {
  
  // 显示检查项
  console.log(`\n📋 Manual Verification for: ${task.title}\n`);
  
  for (const item of rule.checklist || []) {
    const answer = await promptBoolean(`✓ ${item}?`);
    if (!answer) {
      return {
        passed: false,
        type: 'manual',
        message: `Checklist item failed: ${item}`
      };
    }
  }
  
  if (rule.requireApproval) {
    const approved = await promptBoolean('\n👍 Approve this task?');
    if (!approved) {
      return {
        passed: false,
        type: 'manual',
        message: 'Manual approval denied'
      };
    }
  }
  
  return {
    passed: true,
    type: 'manual',
    message: 'Manual verification passed'
  };
}
```

---

## 七、命令行接口设计

### 7.1 命令概览

```bash
# 工作流管理
workflow init <project>              # 初始化新工作流
workflow status                      # 查看当前状态
workflow next                        # 执行下一个任务
workflow run                         # 运行整个工作流
workflow pause                       # 暂停工作流
workflow resume                      # 恢复工作流

# 任务管理
workflow task list                   # 列出所有任务
workflow task show <id>              # 查看任务详情
workflow task start <id>             # 开始任务
workflow task complete <id>          # 完成任务
workflow task fail <id> [reason]     # 标记失败
workflow task skip <id>              # 跳过任务

# 验证
workflow verify <id>                 # 验证任务
workflow verify --all                # 验证所有完成的任务

# 记忆
workflow memory show                 # 查看记忆
workflow memory search <query>       # 搜索记忆
workflow memory add <type> <title>   # 添加记忆
workflow memory consolidate          # 整合记忆

# 分析
workflow analyze                     # 分析工作流
workflow critical-path               # 显示关键路径
workflow estimate                    # 估算剩余时间
workflow report                      # 生成报告
```

### 7.2 状态输出示例

```
╔══════════════════════════════════════════════════════════════════╗
║  Turbo-UI Workflow Status                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  Project: turbo-ui                                               ║
║  Phase: 阶段二 - 基础布局开发                                      ║
║  Milestone: M1 (Week 1)                                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Progress: ████████░░░░░░░░░░░░ 40% (12/30 tasks)                ║
║                                                                  ║
║  ✅ Completed: 12                                                ║
║  🔄 In Progress: 2                                               ║
║  ⏳ Pending: 14                                                  ║
║  ❌ Failed: 0                                                    ║
║  🚫 Blocked: 0                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  Current Tasks:                                                  ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ 🔄 T2.1 开发侧边栏组件 (Sidebar)                    1.5h    │ ║
║  │    Status: in_progress | Assignee: ai                       │ ║
║  │    Started: 10:30 | ETA: 12:00                               │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ⏳ T2.2 开发顶部栏组件 (Header)                     1h      │ ║
║  │    Status: ready | Depends: T2.1 (in_progress)              │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
╠══════════════════════════════════════════════════════════════════╣
║  Next Milestone: M2 - 核心页面开发 (Week 2)                       ║
║  ETA: 2026-04-07                                                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 八、文件结构

### 8.1 工作流配置文件

```yaml
# workflow.yaml
name: turbo-ui
project: Turbo-UI
version: 1.0.0

config:
  maxParallelTasks: 3
  autoRetry: true
  maxRetries: 2
  verificationRequired: true
  autoProceed: false

phases:
  - id: phase-1
    name: 项目初始化
    milestone: M1
    tasks:
      - id: T1.1
        title: 创建 Tauri + React 项目
        estimatedMinutes: 60
        dependsOn: []
        verificationType: auto
        verificationRules:
          - type: build
            command: npm run tauri dev
            timeout: 30000
        
      - id: T1.2
        title: 安装核心依赖
        estimatedMinutes: 30
        dependsOn: [T1.1]
        verificationType: auto
        verificationRules:
          - type: build
            command: npm run build

  - id: phase-2
    name: 基础布局开发
    milestone: M1
    tasks:
      - id: T2.1
        title: 开发侧边栏组件
        estimatedMinutes: 90
        dependsOn: [T1.5]
        verificationType: both
        verificationRules:
          - type: build
          - type: lint
          - type: visual
            checklist:
              - 侧边栏正常显示
              - 菜单项可点击切换
              - 折叠/展开动画流畅

agents:
  - id: coordinator
    role: coordinator
    capabilities: [planning, synthesis, review]
    
  - id: coder-1
    role: coder
    capabilities: [typescript, react, tauri]
    
  - id: coder-2
    role: coder
    capabilities: [typescript, react, rust]
    
  - id: tester
    role: tester
    capabilities: [vitest, playwright]

memory:
  dir: ./memory
  types:
    - project_context
    - coding_standards
    - common_patterns
    - learned_lessons
  consolidation:
    minSessionCount: 5
    minTimeSinceLastDream: 86400000  # 24小时
    maxEntriesPerType: 50
```

### 8.2 任务状态文件

```json
// .workflow/state.json
{
  "workflowId": "wf-2026-04-01",
  "startedAt": "2026-04-01T08:00:00Z",
  "currentPhase": "phase-2",
  "currentMilestone": "M1",
  
  "tasks": {
    "T1.1": {
      "status": "completed",
      "startedAt": "2026-04-01T08:00:00Z",
      "completedAt": "2026-04-01T08:55:00Z",
      "actualMinutes": 55,
      "assignee": "ai"
    },
    "T1.2": {
      "status": "completed",
      "startedAt": "2026-04-01T09:00:00Z",
      "completedAt": "2026-04-01T09:25:00Z",
      "actualMinutes": 25,
      "assignee": "ai"
    },
    "T2.1": {
      "status": "in_progress",
      "startedAt": "2026-04-01T10:30:00Z",
      "assignee": "ai",
      "attempts": 1
    }
  },
  
  "statistics": {
    "totalTasks": 30,
    "completedTasks": 12,
    "failedTasks": 0,
    "blockedTasks": 0,
    "totalEstimatedMinutes": 2400,
    "totalActualMinutes": 680
  }
}
```

---

## 九、实施计划

### Phase 1: 核心框架 (Week 1)

| 任务 | 描述 | 优先级 |
|------|------|--------|
| W1.1 | 定义核心类型 (Task, WorkflowState, etc.) | P0 |
| W1.2 | 实现 TaskGraph 依赖解析 | P0 |
| W1.3 | 实现 workflowLoop 执行循环 | P0 |
| W1.4 | 实现 CLI 基础命令 (init, status, next) | P0 |
| W1.5 | 实现 YAML 配置解析 | P1 |

### Phase 2: 验证系统 (Week 2)

| 任务 | 描述 | 优先级 |
|------|------|--------|
| W2.1 | 实现 build/test/lint 验证器 | P0 |
| W2.2 | 实现 code_review 验证器 | P1 |
| W2.3 | 实现 manual 验证流程 | P1 |
| W2.4 | 实现验证结果报告 | P2 |

### Phase 3: 记忆系统 (Week 3)

| 任务 | 描述 | 优先级 |
|------|------|--------|
| W3.1 | 设计记忆目录结构 | P0 |
| W3.2 | 实现记忆读写 API | P0 |
| W3.3 | 实现相关性检索 | P1 |
| W3.4 | 实现 consolidation 机制 | P2 |

### Phase 4: 多智能体 (Week 4)

| 任务 | 描述 | 优先级 |
|------|------|--------|
| W4.1 | 定义 Agent 类型 | P0 |
| W4.2 | 实现 AgentPool 管理 | P0 |
| W4.3 | 实现并行执行策略 | P1 |
| W4.4 | 实现消息总线 | P2 |

### Phase 5: 集成测试 (Week 5)

| 任务 | 描述 | 优先级 |
|------|------|--------|
| W5.1 | 与 Turbo-UI 项目集成测试 | P0 |
| W5.2 | 性能测试和优化 | P1 |
| W5.3 | 文档编写 | P1 |
| W5.4 | 发布 v1.0 | P0 |

---

## 十、与现有体系集成

### 10.1 迁移现有任务链

```bash
# 将现有 Markdown 任务链转换为 YAML
workflow import planning/p4/DETAILED_TASK_CHAIN.md --format yaml

# 输出: workflow.yaml
```

### 10.2 复用现有文档

```
~/.openclaw/workspace-chief-architect/
├── planning/
│   ├── p4/
│   │   ├── ARCHITECTURE.md      # 保留，作为参考
│   │   └── DETAILED_TASK_CHAIN.md # 可迁移到 workflow.yaml
│   │
│   └── AUTOMATED_WORKFLOW_DESIGN.md  # 本文档
│
├── memory/                       # 记忆系统
│   ├── MEMORY.md
│   └── ...
│
└── .workflow/                    # 工作流状态
    ├── state.json
    └── history/
```

### 10.3 渐进式采用

1. **Phase 1**: 手动执行，工具追踪状态
2. **Phase 2**: 半自动执行，AI 辅助
3. **Phase 3**: 全自动执行，人工验证关键节点

---

## 附录：参考资源

- Claude Code 架构分析: `spec/00_overview.md` - `spec/11_special_systems.md`
- 现有任务链: `planning/p4/DETAILED_TASK_CHAIN.md`
- 现有架构: `planning/p4/ARCHITECTURE.md`
- 记忆系统: `memory/2026-03-27.md`