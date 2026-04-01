# Claude Code 架构借鉴分析

> 从 Claude Code 源码中提取可复用的设计精华，应用到 DevFlow Engine

---

## 一、核心借鉴概览

### 1.1 架构映射

| Claude Code 组件 | DevFlow Engine 对应 | 借鉴价值 |
|------------------|---------------------|----------|
| **Query Loop** | AutomationEngine 主循环 | ⭐⭐⭐⭐⭐ 核心执行模式 |
| **Coordinator Mode** | 总管协调 + 角色分工 | ⭐⭐⭐⭐⭐ 多角色协作 |
| **Task Graph** | 任务链管理 | ⭐⭐⭐⭐⭐ 依赖调度 |
| **Permission System** | 验证决策系统 | ⭐⭐⭐⭐ 智能验证 |
| **Memory (memdir)** | 项目记忆存储 | ⭐⭐⭐⭐⭐ 持久化记忆 |
| **Dream System** | 记忆整合机制 | ⭐⭐⭐⭐ 知识沉淀 |
| **Tool System** | Agent 工具层 | ⭐⭐⭐⭐ 能力抽象 |
| **System Prompt** | 上下文构建 | ⭐⭐⭐⭐ 上下文注入 |
| **Hooks System** | 事件钩子 | ⭐⭐⭐ 扩展机制 |
| **Streaming Tool Executor** | 并行执行器 | ⭐⭐⭐⭐ 高效执行 |

---

## 二、核心设计借鉴

### 2.1 Query Loop → AutomationEngine 主循环

**Claude Code 原版**：

```typescript
// Claude Code 的核心执行循环
async function* queryLoop() {
  while (!shouldStop) {
    // 1. 构建请求 (buildRequest)
    // 2. 流式调用 API (streamResponse)
    // 3. 处理工具调用 (handleToolUse)
    // 4. 验证结果 (verifyResults)
    // 5. 更新状态 (updateState)
    // 6. 决定继续或终止 (shouldContinue)
  }
}
```

**DevFlow Engine 改进版**：

```typescript
/**
 * 自动化执行引擎
 * 借鉴 Claude Code 的 Query Loop 设计
 */
class AutomationEngine {
  private project: Project;
  private supervisor: SupervisorAgent;
  private isRunning: boolean = false;
  
  /**
   * 主执行循环
   * 
   * 借鉴点：
   * 1. AsyncGenerator 模式 - 可中断、可恢复
   * 2. while 循环 - 持续执行直到完成
   * 3. 状态驱动 - 每次迭代基于当前状态决策
   * 4. 事件 yield - 向外部报告进度
   */
  async *run(): AsyncGenerator<AutomationEvent> {
    this.isRunning = true;
    
    while (this.isRunning && !this.isComplete()) {
      
      // ═════════════════════════════════════════════════════════
      // Phase 1: 构建上下文 (借鉴 buildRequest)
      // ═════════════════════════════════════════════════════════
      const context = await this.buildContext();
      yield { type: 'context_built', context };
      
      // ═════════════════════════════════════════════════════════
      // Phase 2: 获取当前任务 (借鉴 getNextAction)
      // ═════════════════════════════════════════════════════════
      const task = await this.getNextTask(context);
      
      if (!task) {
        // 无任务可执行，检查原因
        const blockers = await this.findBlockers();
        yield { type: 'blocked', blockers };
        
        if (blockers.length === 0) {
          // 工作流完成
          break;
        }
        
        // 等待阻塞解除
        await this.waitForUnblock(blockers);
        continue;
      }
      
      yield { type: 'task_started', task };
      
      // ═════════════════════════════════════════════════════════
      // Phase 3: 执行任务 (借鉴 handleToolUse)
      // ═════════════════════════════════════════════════════════
      const result = await this.executeTask(task, context);
      
      // ═════════════════════════════════════════════════════════
      // Phase 4: 验证结果 (借鉴 verifyResults)
      // ═════════════════════════════════════════════════════════
      const verification = await this.verifyTask(task, result);
      
      if (verification.passed) {
        // ═══════════════════════════════════════════════════════
        // Phase 5: 更新状态 (借鉴 updateState)
        // ═══════════════════════════════════════════════════════
        await this.markTaskComplete(task, result);
        yield { type: 'task_completed', task, result };
        
        // 更新记忆
        await this.updateMemory(task, result);
        
      } else {
        // 验证失败，处理错误
        yield { type: 'task_failed', task, error: verification.error };
        
        // 总管决定处理方式
        const decision = await this.supervisor.handleFailure(task, verification);
        
        if (decision.action === 'retry') {
          continue;  // 重试
        }
        
        if (decision.action === 'repair') {
          await this.triggerRepair(task);
          continue;
        }
        
        if (decision.action === 'escalate') {
          // 需要人工介入
          yield { type: 'needs_intervention', task, reason: decision.reason };
          await this.waitForUserInput();
        }
      }
      
      // ═════════════════════════════════════════════════════════
      // Phase 6: 检查是否继续 (借鉴 shouldContinue)
      // ═════════════════════════════════════════════════════════
      if (await this.shouldPause()) {
        yield { type: 'paused' };
        await this.waitForResume();
      }
    }
    
    yield { type: 'completed', project: this.project };
  }
}
```

**关键借鉴点**：

1. **AsyncGenerator 模式**
   - 可随时暂停和恢复
   - 向外部报告进度
   - 不阻塞主线程

2. **状态驱动循环**
   - 每次迭代重新计算状态
   - 基于当前状态做决策
   - 支持中断恢复

3. **明确的阶段划分**
   - 构建上下文 → 获取任务 → 执行 → 验证 → 更新
   - 每个阶段独立，便于调试
   - 支持阶段级别的重试

---

### 2.2 Coordinator Mode → 总管 + 角色协作

**Claude Code 原版**：

```typescript
// Claude Code 的协调者模式
// 四阶段工作流
const COORDINATOR_PHASES = {
  Research: 'Workers 并行调研',
  Synthesis: 'Coordinator 汇总理解',
  Implementation: 'Workers 按规格修改',
  Verification: 'Workers 测试验证'
};

// 协调者系统提示
const COORDINATOR_PROMPT = `
你是协调者，负责管理多个 Worker Agent 的协作。

## 核心原则
1. 并行是超能力 - 独立任务绝不串行
2. 禁止懒惰委托 - 必须指定具体操作
3. 共享 scratchpad - 跨 worker 知识传递

## 协调流程
Phase 1: Research → Workers 并行调研
Phase 2: Synthesis → Coordinator 汇总
Phase 3: Implementation → Workers 并行实现
Phase 4: Verification → Workers 并行验证
`;
```

**DevFlow Engine 改进版**：

```typescript
/**
 * 总管协调系统
 * 借鉴 Claude Code 的 Coordinator Mode
 */
class SupervisorCoordinator {
  
  /**
   * 四阶段协调流程
   * 
   * 借鉴点：
   * 1. 明确的阶段划分
   * 2. 并行优先原则
   * 3. 共享工作区 (scratchpad)
   * 4. 具体指令要求
   */
  async executePhase(phase: Phase, project: Project): Promise<PhaseResult> {
    
    switch (phase.type) {
      
      // ═════════════════════════════════════════════════════════
      // Phase 1: Research (需求调研)
      // 借鉴：Workers 并行调研
      // ═════════════════════════════════════════════════════════
      case 'research': {
        const tasks = phase.researchTasks;
        
        // 分配给总管进行分析
        const manager = this.getDesk('manager');
        
        // 并行调研（如果有多个问题需要澄清）
        const results = await Promise.all(
          tasks.map(task => manager.execute({
            type: 'research',
            query: task.question
          }))
        );
        
        // 汇总到共享区域
        await this.writeToScratchpad(project, 'research_summary.md', {
          results,
          timestamp: new Date()
        });
        
        return { type: 'research_complete', results };
      }
      
      // ═════════════════════════════════════════════════════════
      // Phase 2: Synthesis (设计综合)
      // 借鉴：Coordinator 汇总理解
      // ═════════════════════════════════════════════════════════
      case 'synthesis': {
        // 读取调研结果
        const research = await this.readFromScratchpad(project, 'research_summary.md');
        
        // 架构师综合设计
        const architect = this.getDesk('architect');
        const design = await architect.execute({
          type: 'synthesize',
          input: research
        });
        
        // 写入设计文档
        await this.writeToScratchpad(project, 'design_spec.md', design);
        
        return { type: 'synthesis_complete', design };
      }
      
      // ═════════════════════════════════════════════════════════
      // Phase 3: Implementation (并行开发)
      // 借鉴：Workers 并行实现
      // ═════════════════════════════════════════════════════════
      case 'implementation': {
        // 读取设计规格
        const design = await this.readFromScratchpad(project, 'design_spec.md');
        
        // 获取模块列表
        const modules = design.modules;
        
        // 总管分配任务
        const assignments = await this.assignModules(modules);
        
        // 并行执行
        // 借鉴 Claude Code 的 StreamingToolExecutor
        const results = await this.executeParallel(assignments, {
          maxConcurrency: 3,  // 最大并行数
          timeout: 300000,    // 5分钟超时
          onProgress: (task, progress) => {
            this.reportProgress(task, progress);
          }
        });
        
        return { type: 'implementation_complete', results };
      }
      
      // ═════════════════════════════════════════════════════════
      // Phase 4: Verification (并行验证)
      // 借鉴：Workers 并行验证
      // ═════════════════════════════════════════════════════════
      case 'verification': {
        const testers = [
          this.getDesk('lead-dev'),   // 技术验证
          this.getDesk('designer')    // 视觉验证
        ];
        
        // 并行验证
        const results = await Promise.all([
          testers[0].execute({ type: 'technical_verification' }),
          testers[1].execute({ type: 'visual_verification' })
        ]);
        
        const passed = results.every(r => r.passed);
        
        return { 
          type: 'verification_complete', 
          passed,
          results 
        };
      }
    }
  }
  
  /**
   * 并行执行器
   * 借鉴 Claude Code 的 StreamingToolExecutor
   */
  private async executeParallel(
    assignments: TaskAssignment[],
    options: ParallelOptions
  ): Promise<Map<string, TaskResult>> {
    
    const results = new Map<string, TaskResult>();
    const executing = new Map<string, Promise<TaskResult>>();
    const pending = [...assignments];
    
    while (pending.length > 0 || executing.size > 0) {
      
      // 填充执行队列
      while (executing.size < options.maxConcurrency && pending.length > 0) {
        const assignment = pending.shift()!;
        const promise = this.executeAssignment(assignment, options);
        executing.set(assignment.task.id, promise);
      }
      
      if (executing.size === 0) break;
      
      // 等待任意一个完成 (借鉴 Promise.race 模式)
      const settled = await Promise.race(
        [...executing.entries()].map(async ([id, promise]) => {
          try {
            const result = await promise;
            return { id, result, success: true };
          } catch (error) {
            return { id, result: { error }, success: false };
          }
        })
      );
      
      executing.delete(settled.id);
      results.set(settled.id, settled.result);
      
      // 报告进度
      if (options.onProgress) {
        options.onProgress(settled.id, settled.result);
      }
    }
    
    return results;
  }
  
  /**
   * 禁止懒惰委托
   * 借鉴 Claude Code 的严格指令要求
   */
  validateTaskAssignment(assignment: TaskAssignment): ValidationResult {
    const errors: string[] = [];
    
    // 检查指令是否具体
    if (this.isVagueInstruction(assignment.instruction)) {
      errors.push('指令不够具体，避免使用"根据你的发现"等模糊表述');
    }
    
    // 检查是否有明确的输出要求
    if (!assignment.expectedOutput) {
      errors.push('必须指定明确的输出要求');
    }
    
    // 检查是否有验证标准
    if (!assignment.verificationCriteria) {
      errors.push('必须指定验证标准');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private isVagueInstruction(instruction: string): boolean {
    const vaguePatterns = [
      /根据你的发现/,
      /自己判断/,
      /看着办/,
      /适当处理/,
      /根据情况/
    ];
    
    return vaguePatterns.some(p => p.test(instruction));
  }
}
```

---

### 2.3 Task Graph → 任务链管理

**Claude Code 原版**：

```typescript
// Claude Code 的任务图
interface TaskStore {
  tasks: Map<string, Task>;
  
  // 关键方法
  getReadyTasks(): Task[];
  executeParallel(agents: Agent[]): Promise<void>;
}

interface Task {
  id: string;
  status: TaskStatus;
  blocks: string[];      // 阻塞的任务
  blockedBy: string[];   // 被哪些任务阻塞
}
```

**DevFlow Engine 改进版**：

```typescript
/**
 * 任务图管理器
 * 借鉴 Claude Code 的 TaskStore V2 设计
 */
class TaskGraph {
  private tasks: Map<string, Task>;
  private adjacencyList: Map<string, Set<string>>;
  
  /**
   * 获取就绪任务
   * 
   * 借鉴点：
   * 1. 依赖检查逻辑
   * 2. 状态过滤
   * 3. O(n) 复杂度
   */
  getReadyTasks(): Task[] {
    return [...this.tasks.values()].filter(task => 
      task.status === 'pending' &&
      task.dependsOn.every(depId => 
        this.tasks.get(depId)?.status === 'completed'
      )
    );
  }
  
  /**
   * 并行组计算
   * 
   * 借鉴点：
   * 1. 拓扑排序
   * 2. 层级分组
   * 3. 循环依赖检测
   */
  getParallelGroups(): TaskGroup[] {
    const groups: TaskGroup[] = [];
    const completed = new Set<string>();
    const pending = new Set(this.tasks.keys());
    
    while (pending.size > 0) {
      // 找出当前层所有就绪任务
      const ready = [...pending].filter(id => {
        const task = this.tasks.get(id)!;
        return task.dependsOn.every(dep => completed.has(dep));
      });
      
      if (ready.length === 0 && pending.size > 0) {
        throw new Error('Circular dependency detected');
      }
      
      // 按技能分组
      const bySkill = this.groupBySkill(ready);
      
      for (const [skill, taskIds] of bySkill) {
        groups.push({
          tasks: taskIds.map(id => this.tasks.get(id)!),
          requiredSkill: skill,
          canParallelize: taskIds.length > 1
        });
      }
      
      // 标记完成（模拟）
      for (const id of ready) {
        pending.delete(id);
        completed.add(id);
      }
    }
    
    return groups;
  }
  
  /**
   * 关键路径计算
   * 
   * 借鉴点：
   * 1. 最长路径算法
   * 2. 动态规划优化
   * 3. 时间估算
   */
  getCriticalPath(): CriticalPathResult {
    const memo = new Map<string, { duration: number; path: Task[] }>();
    
    const calculate = (taskId: string): { duration: number; path: Task[] } => {
      if (memo.has(taskId)) return memo.get(taskId)!;
      
      const task = this.tasks.get(taskId)!;
      
      if (task.dependsOn.length === 0) {
        const result = { 
          duration: task.estimatedMinutes, 
          path: [task] 
        };
        memo.set(taskId, result);
        return result;
      }
      
      // 找最长依赖路径
      const depPaths = task.dependsOn.map(calculate);
      const longest = depPaths.reduce((a, b) => 
        a.duration > b.duration ? a : b
      );
      
      const result = {
        duration: longest.duration + task.estimatedMinutes,
        path: [...longest.path, task]
      };
      
      memo.set(taskId, result);
      return result;
    };
    
    // 从所有终点任务计算
    const terminals = [...this.tasks.values()].filter(t => 
      !this.isDependency(t.id)
    );
    
    const allPaths = terminals.map(t => calculate(t.id));
    const critical = allPaths.reduce((a, b) => 
      a.duration > b.duration ? a : b
    );
    
    return {
      criticalPath: critical.path,
      totalDuration: critical.duration,
      parallelSavings: this.calculateSavings()
    };
  }
}
```

---

### 2.4 Permission System → 验证决策

**Claude Code 原版**：

```typescript
// 三级权限分类
type PermissionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// ML 自动审批分类器
async function classifyPermission(
  toolName: string, 
  input: unknown
): Promise<PermissionDecision> {
  // 低风险：自动批准
  if (isReadOnly(toolName) && !affectsCriticalFiles(input)) {
    return { behavior: 'allow' };
  }
  
  // 中风险：询问一次
  if (isStandardOperation(toolName, input)) {
    return { behavior: 'ask', remember: 'session' };
  }
  
  // 高风险：每次询问
  return { behavior: 'ask', remember: 'never' };
}
```

**DevFlow Engine 改进版**：

```typescript
/**
 * 验证决策分类器
 * 借鉴 Claude Code 的 Permission System
 */
class VerificationClassifier {
  
  /**
   * 三级风险分类
   * 
   * 借鉴点：
   * 1. 风险分级
   * 2. 自动决策
   * 3. 审批策略
   */
  classify(context: VerificationContext): VerificationDecision {
    const risk = this.assessRisk(context);
    
    switch (risk) {
      case 'LOW':
        // 低风险：自动通过
        // 类似 Claude Code 的 auto-approve
        return {
          autoVerify: true,
          requireCrossReview: false,
          requireManualApproval: false,
          message: '自动验证通过'
        };
        
      case 'MEDIUM':
        // 中风险：交叉验证
        // 类似 Claude Code 的 ask-once
        return {
          autoVerify: false,
          requireCrossReview: true,
          requireManualApproval: false,
          reviewers: this.selectReviewers(context),
          message: '需要交叉验证'
        };
        
      case 'HIGH':
        // 高风险：人工确认
        // 类似 Claude Code 的 ask-always
        return {
          autoVerify: false,
          requireCrossReview: true,
          requireManualApproval: true,
          approvers: this.selectApprovers(context),
          message: '需要人工确认'
        };
    }
  }
  
  /**
   * 风险评估
   * 
   * 借鉴点：
   * 1. 多因素评估
   * 2. 规则匹配
   * 3. 权重计算
   */
  private assessRisk(context: VerificationContext): RiskLevel {
    let score = 0;
    
    // 因素 1: 变更范围
    if (context.affectedFiles > 10) score += 30;
    else if (context.affectedFiles > 5) score += 15;
    else if (context.affectedFiles > 1) score += 5;
    
    // 因素 2: 变更类型
    if (context.changeTypes.includes('architecture_change')) score += 40;
    if (context.changeTypes.includes('breaking_change')) score += 30;
    if (context.changeTypes.includes('security_related')) score += 25;
    if (context.changeTypes.includes('new_feature')) score += 10;
    
    // 因素 3: 文件重要性
    const criticalPatterns = [/config/i, /security/i, /auth/i, /main/i];
    for (const file of context.files) {
      if (criticalPatterns.some(p => p.test(file))) {
        score += 20;
        break;
      }
    }
    
    // 因素 4: 测试覆盖
    if (!context.hasTests) score += 15;
    
    // 映射到风险级别
    if (score >= 50) return 'HIGH';
    if (score >= 20) return 'MEDIUM';
    return 'LOW';
  }
}
```

---

### 2.5 Memory System → 项目记忆

**Claude Code 原版**：

```typescript
// memdir 目录结构
~/.claude/projects/<project>/memory/
  MEMORY.md              # 入口索引
  <topic>.md             # 主题文件

// Dream 整合流程
async function dream() {
  // 1. Orient - 读取现有记忆
  // 2. Gather - 收集新信息
  // 3. Consolidate - 整合更新
  // 4. Prune - 清理过期内容
}
```

**DevFlow Engine 改进版**：

```typescript
/**
 * 记忆系统
 * 借鉴 Claude Code 的 memdir + Dream 设计
 */
class MemorySystem {
  
  /**
   * 记忆目录结构
   * 
   * 借鉴点：
   * 1. 按角色分离
   * 2. 工作记忆 + 长期记忆
   * 3. Markdown + YAML frontmatter
   */
  getMemoryStructure(): MemoryStructure {
    return {
      project: '{project}/.project/memory/',
      
      roles: {
        manager: {
          working: 'manager/working.json',
          longTerm: 'manager/long-term/',
          categories: ['decisions', 'preferences', 'summaries']
        },
        
        architect: {
          working: 'architect/working.json',
          longTerm: 'architect/long-term/',
          categories: ['decisions', 'tech-stack', 'templates', 'lessons']
        },
        
        'lead-dev': {
          working: 'lead-dev/working.json',
          longTerm: 'lead-dev/long-term/',
          categories: ['development', 'repairs', 'integration', 'patterns']
        },
        
        developer: {
          working: 'developer/working.json',
          longTerm: 'developer/long-term/',
          categories: ['development', 'issues']
        },
        
        designer: {
          working: 'designer/working.json',
          longTerm: 'designer/long-term/',
          categories: ['reviews', 'guidelines', 'issues']
        }
      }
    };
  }
  
  /**
   * 记忆整合 (Dream)
   * 
   * 借鉴点：
   * 1. 四阶段流程
   * 2. 触发门控
   * 3. 容量限制
   */
  async consolidate(project: Project, role: string): Promise<void> {
    
    // ═════════════════════════════════════════════════════════
    // 触发条件检查 (借鉴 Dream 的门控机制)
    // ═════════════════════════════════════════════════════════
    if (!this.shouldConsolidate(project, role)) {
      return;
    }
    
    const memoryPath = this.getMemoryPath(project, role);
    
    // ═════════════════════════════════════════════════════════
    // Phase 1: Orient - 读取现有记忆
    // ═════════════════════════════════════════════════════════
    const existingMemory = await this.loadLongTermMemory(memoryPath);
    
    // ═════════════════════════════════════════════════════════
    // Phase 2: Gather - 收集新信息
    // ═════════════════════════════════════════════════════════
    const recentActivity = await this.gatherRecentActivity(project, role);
    
    // ═════════════════════════════════════════════════════════
    // Phase 3: Consolidate - 提取关键洞察
    // ═════════════════════════════════════════════════════════
    const insights = await this.extractInsights(recentActivity);
    
    for (const insight of insights) {
      await this.addLongTermMemory(memoryPath, insight);
    }
    
    // ═════════════════════════════════════════════════════════
    // Phase 4: Prune - 清理过期内容
    // ═════════════════════════════════════════════════════════
    await this.pruneOldEntries(memoryPath, {
      maxAge: 30,        // 30天
      maxEntries: 50,    // 每类最多50条
      maxSize: 100000    // 100KB
    });
    
    // 更新索引
    await this.updateIndex(memoryPath);
  }
  
  /**
   * 记忆检索
   * 
   * 借鉴点：
   * 1. 相关性评分
   * 2. 多因素权重
   * 3. 新鲜度衰减
   */
  async retrieveRelevant(
    project: Project,
    role: string,
    query: string,
    topK: number = 5
  ): Promise<MemoryEntry[]> {
    
    const memoryPath = this.getMemoryPath(project, role);
    const entries = await this.loadAllEntries(memoryPath);
    
    // 计算相关性分数
    const scored = entries.map(entry => ({
      entry,
      score: this.calculateRelevance(entry, query)
    }));
    
    // 排序取 top K
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, topK).map(s => s.entry);
  }
  
  /**
   * 相关性计算
   * 
   * 借鉴 Claude Code 的记忆评分算法
   */
  private calculateRelevance(entry: MemoryEntry, query: string): number {
    let score = 0;
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    const content = entry.content.toLowerCase();
    const title = entry.title.toLowerCase();
    
    // 标题匹配 (高权重)
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
    const typeWeights = {
      'lesson': 1.6,        // 教训优先级最高
      'pattern': 1.3,
      'decision': 1.2,
      'template': 1.1,
      'reference': 1.0
    };
    score *= typeWeights[entry.type] || 1.0;
    
    // 新鲜度衰减 (30天半衰期)
    const ageInDays = (Date.now() - entry.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-ageInDays / 30);
    
    return score;
  }
}
```

---

### 2.6 Tool System → Agent 工具层

**Claude Code 原版**：

```typescript
// 工具定义
interface Tool<Input, Output> {
  name: string;
  inputSchema: ZodType<Input>;
  
  // 权限
  isEnabled(): boolean;
  isConcurrencySafe(): boolean;
  isReadOnly(): boolean;
  
  // 执行
  call(input: Input): Promise<ToolResult<Output>>;
  
  // UI
  renderToolUseMessage(input: Input): ReactNode;
  renderToolResultMessage(output: Output): ReactNode;
}
```

**DevFlow Engine 改进版**：

```typescript
/**
 * 工具系统
 * 借鉴 Claude Code 的 Tool 架构
 */

/**
 * 工具基类
 */
abstract class Tool<Input, Output> {
  abstract name: string;
  abstract description: string;
  
  // 输入验证
  abstract inputSchema: ZodSchema<Input>;
  
  /**
   * 能力标记
   * 借鉴 Claude Code 的能力声明
   */
  isConcurrencySafe(): boolean { return false; }
  isReadOnly(): boolean { return false; }
  isDestructive(): boolean { return false; }
  
  /**
   * 权限检查
   * 借鉴 Claude Code 的 permission check
   */
  async checkPermission(input: Input, context: ToolContext): Promise<PermissionResult> {
    // 默认实现
    if (this.isReadOnly()) {
      return { allowed: true };
    }
    
    if (this.isDestructive()) {
      return { 
        allowed: false, 
        reason: 'Destructive operation requires explicit approval' 
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * 执行方法
   */
  abstract execute(input: Input, context: ToolContext): Promise<ToolResult<Output>>;
  
  /**
   * 验证输入
   */
  async validate(input: unknown): Promise<Input> {
    return this.inputSchema.parseAsync(input);
  }
}

/**
 * 文件读取工具
 * 借鉴 Claude Code 的 FileReadTool
 */
class FileReadTool extends Tool<FileReadInput, FileReadOutput> {
  name = 'file_read';
  description = 'Read file contents';
  
  inputSchema = z.object({
    path: z.string(),
    startLine: z.number().optional(),
    endLine: z.number().optional()
  });
  
  isReadOnly() { return true; }
  isConcurrencySafe() { return true; }
  
  async execute(input: FileReadInput, context: ToolContext): Promise<ToolResult<FileReadOutput>> {
    const { path, startLine, endLine } = input;
    
    // 解析路径
    const resolvedPath = this.resolvePath(path, context.project);
    
    // 检查权限
    if (!await this.canAccess(resolvedPath, context)) {
      return {
        success: false,
        error: `No permission to read: ${path}`
      };
    }
    
    try {
      let content = await fs.readFile(resolvedPath, 'utf-8');
      
      // 处理行范围
      if (startLine !== undefined || endLine !== undefined) {
        const lines = content.split('\n');
        const start = startLine ?? 0;
        const end = endLine ?? lines.length;
        content = lines.slice(start, end).join('\n');
      }
      
      return {
        success: true,
        output: {
          path: resolvedPath,
          content,
          lines: content.split('\n').length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error.message}`
      };
    }
  }
}

/**
 * 工具注册表
 * 借鉴 Claude Code 的工具管理
 */
class ToolRegistry {
  private tools: Map<string, Tool<any, any>> = new Map();
  private byRole: Map<string, Set<string>> = new Map();
  
  /**
   * 注册工具
   */
  register(tool: Tool<any, any>, roles: string[] = []): void {
    this.tools.set(tool.name, tool);
    
    for (const role of roles) {
      if (!this.byRole.has(role)) {
        this.byRole.set(role, new Set());
      }
      this.byRole.get(role)!.add(tool.name);
    }
  }
  
  /**
   * 获取角色可用的工具
   */
  getToolsForRole(role: string): Tool<any, any>[] {
    const toolNames = this.byRole.get(role) || new Set();
    return [...toolNames].map(name => this.tools.get(name)!);
  }
  
  /**
   * 执行工具
   */
  async executeTool(
    toolName: string,
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult<any>> {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      return { success: false, error: `Unknown tool: ${toolName}` };
    }
    
    // 验证输入
    const validated = await tool.validate(input);
    
    // 检查权限
    const permission = await tool.checkPermission(validated, context);
    if (!permission.allowed) {
      return { success: false, error: permission.reason };
    }
    
    // 执行
    return tool.execute(validated, context);
  }
}

/**
 * 工具配置
 * 为每个角色定义固定的工具集
 */
const TOOL_CONFIG: Record<string, string[]> = {
  manager: [
    'file_read',
    'file_write',
    'ask_user',
    'search_memory',
    'report_status'
  ],
  
  architect: [
    'file_read',
    'file_write',
    'search_code',
    'analyze_code',
    'create_diagram'
  ],
  
  'lead-dev': [
    'file_read',
    'file_write',
    'file_edit',
    'execute_bash',
    'run_test',
    'git_operation',
    'debug'
  ],
  
  developer: [
    'file_read',
    'file_write',
    'file_edit',
    'execute_bash',
    'run_test'
  ],
  
  designer: [
    'file_read',
    'capture_screenshot',
    'compare_images',
    'ask_user'
  ]
};
```

---

## 三、关键设计模式总结

### 3.1 可以直接复用的设计

| 设计模式 | 来源 | 应用场景 |
|----------|------|----------|
| **AsyncGenerator 循环** | Query Loop | 自动化主循环 |
| **四阶段协调** | Coordinator Mode | 多角色协作 |
| **任务依赖图** | Task Graph | 任务链管理 |
| **三级风险分类** | Permission System | 验证决策 |
| **memdir 结构** | Memory System | 项目记忆存储 |
| **Dream 整合** | Memory System | 记忆整合 |
| **Zod Schema** | Tool System | 输入验证 |
| **Streaming Executor** | Tool System | 并行执行 |

### 3.2 需要调整的设计

| 原设计 | 调整原因 | DevFlow 调整 |
|--------|----------|--------------|
| 单一 Agent | 需要多角色 | 固定工位系统 |
| 动态工具注册 | 角色固定 | 静态工具配置 |
| 云端记忆 | 本地优先 | 本地文件系统 |
| 用户触发 | 自动执行 | 总管监督 |

---

## 四、实施建议

### 4.1 优先级排序

```
高优先级 (直接复用):
├── Query Loop 模式        → AutomationEngine
├── Task Graph             → TaskGraph
├── Permission System      → VerificationClassifier
└── Memory System          → MemorySystem

中优先级 (需要适配):
├── Coordinator Mode       → SupervisorCoordinator
├── Tool System            → ToolRegistry
└── Streaming Executor     → ParallelExecutor

低优先级 (可选):
├── Hooks System           → 事件扩展
└── Plugin System          → 能力扩展
```

### 4.2 代码复用建议

```
从 Claude Code 可以直接复用:
├── 类型定义 (TypeScript interfaces)
├── Zod Schemas
├── 工具实现逻辑
└── 验证算法

需要重新实现:
├── 存储层 (改为本地文件)
├── UI 层 (先不做)
└── API 层 (改为 CLI)
```

---

要我开始实现 Phase 1 的核心引擎吗？我会直接借鉴这些设计模式。