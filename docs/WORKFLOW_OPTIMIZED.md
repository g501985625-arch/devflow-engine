# 多角色协作开发工作流 - 优化版

> 融合 Claude Code 架构精华 + 实际团队协作流程

---

## 一、架构融合概览

### 1.1 Claude Code 架构映射

| Claude Code 概念 | 工作流映射 | 应用场景 |
|------------------|-----------|----------|
| **Query Loop** | 开发阶段执行循环 | 任务执行、验证、反馈 |
| **Coordinator + Workers** | 主程序 + 开发员 | 并行开发、任务分配 |
| **Task Graph** | 模块任务链 | 依赖解析、并行调度 |
| **Permission System** | 验证决策 | 自动验证 vs 人工验证 |
| **Memory System (memdir)** | 项目知识库 | 架构决策、经验教训 |
| **Dream (Consolidation)** | 阶段总结 | 模块完成后的知识整合 |
| **Tool System** | 开发工具层 | 代码生成、测试、审查 |
| **System Prompt** | 上下文构建 | 任务上下文、项目背景 |

### 1.2 优化后的架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           用户界面层                                     │
│  CLI / IDE / Web Dashboard                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         工作流编排层                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Phase Orchestrator                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │Requirement│ │Architecture│ │Development│ │Integration│ │Extension│ │  │
│  │  │  Phase   │ │   Phase   │ │   Phase   │ │   Phase   │ │  Phase  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         执行引擎层                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              Query Engine (借鉴 Claude Code query.ts)              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │ Context  │ │  Task    │ │Permission│ │ Progress │             │  │
│  │  │ Builder  │ │ Executor │ │ Manager  │ │ Tracker  │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              Task Graph Manager (借鉴 TaskStore V2)                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │Dependency│ │ Parallel │ │ Critical │ │  Status  │             │  │
│  │  │ Resolver │ │ Scheduler│ │ Path Calc│ │  Tracker │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         角色协作层                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │           Agent Pool (借鉴 Claude Code Coordinator Mode)           │  │
│  │                                                                    │  │
│  │     ┌─────────────┐                                               │  │
│  │     │ Coordinator │ ◄── 主程序 (Lead Dev)                         │  │
│  │     └──────┬──────┘                                               │  │
│  │            │                                                       │  │
│  │     ┌──────┴──────┬──────────────┬──────────────┐                 │  │
│  │     ▼             ▼              ▼              ▼                 │  │
│  │  ┌───────┐   ┌───────┐     ┌───────┐     ┌───────┐               │  │
│  │  │Worker1│   │Worker2│     │Reviewer│    │Designer│              │  │
│  │  │开发员 │   │开发员 │     │审查者 │     │美术   │               │  │
│  │  └───────┘   └───────┘     └───────┘     └───────┘               │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │              Message Bus (智能体通信)                        │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         验证系统层                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │         Verification Engine (借鉴 Permission System)               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │  Auto    │ │  Cross   │ │  Visual  │ │  Manual  │             │  │
│  │  │  Verify  │ │  Review  │ │  Verify  │ │  Approve │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │  │
│  │                                                                    │  │
│  │  决策分类器 (借鉴 YOLO Classifier):                                 │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ LOW RISK: 自动通过 (构建成功、测试通过)                        │ │  │
│  │  │ MEDIUM RISK: 需要相互验证 (代码变更)                          │ │  │
│  │  │ HIGH RISK: 需要人工确认 (架构变更、视觉问题)                   │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         记忆系统层                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │         Memory System (借鉴 memdir + Dream)                        │  │
│  │                                                                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │  │
│  │  │  Project   │  │  Workflow  │  │  Learned   │                  │  │
│  │  │  Context   │  │   State    │  │  Lessons   │                  │  │
│  │  └────────────┘  └────────────┘  └────────────┘                  │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │              Consolidation Engine (Dream)                   │   │  │
│  │  │  模块完成时触发 → 提取经验 → 更新记忆 → 清理过期内容          │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 二、核心优化点

### 2.1 开发阶段执行循环 (借鉴 Query Loop)

**Claude Code 原版**：
```typescript
async function* queryLoop() {
  while (!shouldStop) {
    // 1. 构建请求
    // 2. 流式响应
    // 3. 工具执行
    // 4. 结果反馈
    // 5. 循环/终止
  }
}
```

**优化后的工作流版本**：

```typescript
/**
 * 开发阶段执行循环
 * 核心循环：执行任务 → 验证 → 反馈 → 下一任务
 */
async function* developmentLoop(
  workflow: WorkflowState
): AsyncGenerator<DevelopmentEvent> {
  
  const taskGraph = new TaskGraph(workflow.modules);
  const agentPool = workflow.team;
  
  while (!taskGraph.isComplete()) {
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 1: 更新状态 (借鉴 bootstrap/state.ts)
    // ═══════════════════════════════════════════════════════════════
    updateTaskStatuses(taskGraph);
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 2: 获取就绪任务 (借鉴 Task Graph 调度)
    // ═══════════════════════════════════════════════════════════════
    const readyTasks = taskGraph.getReadyTasks();
    
    if (readyTasks.length === 0) {
      // 检查阻塞原因
      const blockedTasks = taskGraph.getBlockedTasks();
      const failedTasks = taskGraph.getFailedTasks();
      
      if (blockedTasks.length > 0) {
        yield { type: 'blocked', tasks: blockedTasks };
        await waitForUnblock(blockedTasks, workflow);
        continue;
      }
      
      if (failedTasks.length > 0) {
        yield { type: 'repair_needed', tasks: failedTasks };
        await executeRepairFlow(failedTasks, workflow);
        continue;
      }
      
      // 无任务可执行，等待
      yield { type: 'idle' };
      await sleep(1000);
      continue;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 3: 分配任务 (借鉴 Agent Pool + Coordinator)
    // ═══════════════════════════════════════════════════════════════
    const assignments = assignTasks(readyTasks, agentPool);
    
    yield { type: 'tasks_assigned', assignments };
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 4: 并行执行 (借鉴 Parallel Execution)
    // ═══════════════════════════════════════════════════════════════
    const results = await executeParallel(assignments, workflow);
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 5: 验证结果 (借鉴 Permission System)
    // ═══════════════════════════════════════════════════════════════
    for (const result of results) {
      const verification = await verifyTask(result, workflow);
      
      if (verification.passed) {
        result.task.status = 'completed';
        yield { type: 'task_completed', task: result.task, verification };
      } else {
        result.task.status = 'failed';
        result.task.issues = verification.issues;
        yield { type: 'task_failed', task: result.task, issues: verification.issues };
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 6: 更新记忆 (借鉴 Memory System)
    // ═══════════════════════════════════════════════════════════════
    await updateMemory(results, workflow);
  }
  
  yield { type: 'development_completed' };
}
```

### 2.2 任务图管理 (借鉴 TaskStore V2)

**Claude Code 原版**：
```typescript
interface TaskStore {
  tasks: Map<string, Task>;
  getReadyTasks(): Task[];
  executeParallel(agents: Agent[]): Promise<void>;
}
```

**优化后的版本**：

```typescript
/**
 * 任务图管理器
 * 支持：依赖解析、并行调度、关键路径计算
 */
class TaskGraph {
  private tasks: Map<string, Task>;
  private adjacencyList: Map<string, Set<string>>;
  private reverseAdjacency: Map<string, Set<string>>;
  
  constructor(modules: Module[]) {
    this.tasks = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacency = new Map();
    this.buildFromModules(modules);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 核心方法：获取就绪任务
  // 条件：状态为 pending 且所有依赖已完成
  // ═══════════════════════════════════════════════════════════════
  getReadyTasks(): Task[] {
    return [...this.tasks.values()].filter(task => 
      task.status === 'pending' &&
      task.dependsOn.every(depId => 
        this.tasks.get(depId)?.status === 'completed'
      )
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 并行组计算
  // 返回：每层可并行执行的任务组
  // ═══════════════════════════════════════════════════════════════
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
        throw new Error('Circular dependency detected in task graph');
      }
      
      // 按技能要求分组
      const grouped = this.groupBySkill(ready.map(id => this.tasks.get(id)!));
      
      for (const [skill, tasks] of grouped) {
        groups.push({
          tasks: tasks.map(t => t.id),
          requiredRole: skill,
          canParallelize: tasks.length > 1
        });
      }
      
      // 标记为已完成（模拟）
      for (const id of ready) {
        pending.delete(id);
        completed.add(id);
      }
    }
    
    return groups;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 关键路径计算
  // 用于：估算项目最短完成时间
  // ═══════════════════════════════════════════════════════════════
  getCriticalPath(): CriticalPathResult {
    const memo = new Map<string, { duration: number; path: Task[] }>();
    
    const calculatePath = (taskId: string): { duration: number; path: Task[] } => {
      if (memo.has(taskId)) return memo.get(taskId)!;
      
      const task = this.tasks.get(taskId)!;
      
      // 无依赖的任务
      if (task.dependsOn.length === 0) {
        const result = { 
          duration: task.estimatedMinutes, 
          path: [task] 
        };
        memo.set(taskId, result);
        return result;
      }
      
      // 有依赖的任务：找最长依赖路径
      const depPaths = task.dependsOn.map(calculatePath);
      const longestDep = depPaths.reduce((a, b) => 
        a.duration > b.duration ? a : b
      );
      
      const result = {
        duration: longestDep.duration + task.estimatedMinutes,
        path: [...longestDep.path, task]
      };
      
      memo.set(taskId, result);
      return result;
    };
    
    // 从所有终点任务开始计算
    const terminalTasks = [...this.tasks.values()].filter(t => 
      !this.adjacencyList.has(t.id) || 
      this.adjacencyList.get(t.id)!.size === 0
    );
    
    const allPaths = terminalTasks.map(t => calculatePath(t.id));
    const criticalPath = allPaths.reduce((a, b) => 
      a.duration > b.duration ? a : b
    );
    
    // 计算可并行节省的时间
    const totalEstimated = [...this.tasks.values()]
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);
    
    const parallelGroups = this.getParallelGroups();
    const parallelTime = parallelGroups.reduce((sum, group) => {
      const maxTaskTime = Math.max(
        ...group.tasks.map(id => this.tasks.get(id)!.estimatedMinutes)
      );
      return sum + maxTaskTime;
    }, 0);
    
    return {
      criticalPath: criticalPath.path,
      criticalPathDuration: criticalPath.duration,
      totalEstimatedTime: totalEstimated,
      parallelEstimatedTime: parallelTime,
      timeSaved: totalEstimated - parallelTime,
      parallelEfficiency: (totalEstimated - parallelTime) / totalEstimated
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 辅助方法
  // ═══════════════════════════════════════════════════════════════
  private groupBySkill(tasks: Task[]): Map<Role, Task[]> {
    const grouped = new Map<Role, Task[]>();
    
    for (const task of tasks) {
      const role = task.assignTo || 'developer';
      if (!grouped.has(role)) {
        grouped.set(role, []);
      }
      grouped.get(role)!.push(task);
    }
    
    return grouped;
  }
  
  isComplete(): boolean {
    return [...this.tasks.values()].every(t => 
      t.status === 'completed' || t.status === 'skipped'
    );
  }
  
  getBlockedTasks(): Task[] {
    return [...this.tasks.values()].filter(t => t.status === 'blocked');
  }
  
  getFailedTasks(): Task[] {
    return [...this.tasks.values()].filter(t => t.status === 'failed');
  }
  
  getProgress(): ProgressStats {
    const tasks = [...this.tasks.values()];
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      percentage: tasks.filter(t => t.status === 'completed').length / tasks.length * 100
    };
  }
}
```

### 2.3 验证决策系统 (借鉴 Permission System)

**Claude Code 原版**：
```typescript
// 三级权限分类
type PermissionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// ML 自动审批分类器
async function classifyPermission(toolName: string, input: unknown): Promise<PermissionDecision>
```

**优化后的验证决策系统**：

```typescript
/**
 * 验证风险等级
 * 借鉴 Claude Code 权限系统的三级分类
 */
type VerificationRisk = 'low' | 'medium' | 'high';

interface VerificationDecision {
  risk: VerificationRisk;
  autoVerify: boolean;          // 是否可自动验证
  requireCrossReview: boolean;  // 是否需要交叉验证
  requireManualApproval: boolean; // 是否需要人工确认
  approvers: Role[];            // 审批者
}

/**
 * 验证决策分类器
 * 借鉴 Claude Code 的 YOLO Classifier 思路
 */
class VerificationClassifier {
  
  // ═══════════════════════════════════════════════════════════════
  // 风险评估规则
  // ═══════════════════════════════════════════════════════════════
  private riskRules: Map<string, VerificationRisk> = new Map([
    // 低风险：自动验证
    ['build_success', 'low'],
    ['test_passed', 'low'],
    ['lint_passed', 'low'],
    ['type_check_passed', 'low'],
    
    // 中风险：需要交叉验证
    ['code_change', 'medium'],
    ['new_feature', 'medium'],
    ['refactor', 'medium'],
    
    // 高风险：需要人工确认
    ['architecture_change', 'high'],
    ['visual_issue', 'high'],
    ['breaking_change', 'high'],
    ['security_concern', 'high'],
  ]);
  
  // ═══════════════════════════════════════════════════════════════
  // 分类决策
  // ═══════════════════════════════════════════════════════════════
  classify(context: VerificationContext): VerificationDecision {
    const risk = this.assessRisk(context);
    
    switch (risk) {
      case 'low':
        return {
          risk: 'low',
          autoVerify: true,
          requireCrossReview: false,
          requireManualApproval: false,
          approvers: []
        };
        
      case 'medium':
        return {
          risk: 'medium',
          autoVerify: false,
          requireCrossReview: true,  // 主程序 ↔ 开发员 相互验证
          requireManualApproval: false,
          approvers: context.executor === 'lead_dev' 
            ? ['developer'] 
            : ['lead_dev']
        };
        
      case 'high':
        return {
          risk: 'high',
          autoVerify: false,
          requireCrossReview: true,
          requireManualApproval: true,
          approvers: this.getHighRiskApprovers(context)
        };
    }
  }
  
  private assessRisk(context: VerificationContext): VerificationRisk {
    // 检查变更类型
    if (context.changeTypes.some(t => this.riskRules.get(t) === 'high')) {
      return 'high';
    }
    
    if (context.changeTypes.some(t => this.riskRules.get(t) === 'medium')) {
      return 'medium';
    }
    
    // 检查影响范围
    if (context.affectedFiles > 10) return 'high';
    if (context.affectedFiles > 5) return 'medium';
    
    // 检查是否涉及关键文件
    const criticalPatterns = [
      /architecture/i,
      /config/i,
      /security/i,
      /auth/i,
    ];
    
    if (context.files.some(f => 
      criticalPatterns.some(p => p.test(f))
    )) {
      return 'high';
    }
    
    return 'low';
  }
  
  private getHighRiskApprovers(context: VerificationContext): Role[] {
    const approvers: Role[] = ['lead_dev'];
    
    if (context.requiresVisualVerification) {
      approvers.push('designer');
    }
    
    if (context.changeTypes.includes('architecture_change')) {
      approvers.push('architect');
    }
    
    return approvers;
  }
}

/**
 * 验证执行器
 */
class VerificationExecutor {
  private classifier = new VerificationClassifier();
  
  async verify(
    task: Task,
    result: TaskResult,
    workflow: WorkflowState
  ): Promise<VerificationResult> {
    
    // 1. 分类决策
    const decision = this.classifier.classify({
      changeTypes: task.changeTypes,
      affectedFiles: result.changedFiles.length,
      files: result.changedFiles,
      executor: task.assignedTo,
      requiresVisualVerification: task.requiresVisualVerification
    });
    
    // 2. 执行验证
    const checks: VerificationCheck[] = [];
    
    // 自动验证（低风险）
    if (decision.autoVerify || task.verificationRules.build) {
      checks.push(await this.runBuildCheck(result));
    }
    
    if (decision.autoVerify || task.verificationRules.test) {
      checks.push(await this.runTestCheck(result));
    }
    
    if (decision.autoVerify || task.verificationRules.typeCheck) {
      checks.push(await this.runTypeCheck(result));
    }
    
    if (decision.autoVerify || task.verificationRules.lint) {
      checks.push(await this.runLintCheck(result));
    }
    
    // 交叉验证（中风险）
    if (decision.requireCrossReview) {
      const reviewer = decision.approvers[0];
      checks.push(await this.runCodeReview(result, reviewer, workflow.team));
    }
    
    // 视觉验证
    if (task.requiresVisualVerification) {
      checks.push(await this.runVisualVerification(result, workflow.team.designer));
    }
    
    // 人工审批（高风险）
    if (decision.requireManualApproval) {
      for (const approver of decision.approvers) {
        checks.push(await this.requestManualApproval(task, result, approver));
      }
    }
    
    // 3. 汇总结果
    const passed = checks.every(c => c.passed);
    const issues = checks.filter(c => !c.passed).flatMap(c => c.issues);
    
    return {
      passed,
      checks,
      issues,
      decision
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 自动验证方法
  // ═══════════════════════════════════════════════════════════════
  private async runBuildCheck(result: TaskResult): Promise<VerificationCheck> {
    try {
      const { exitCode, stdout, stderr } = await exec('npm run build', {
        timeout: 60000
      });
      
      return {
        type: 'build',
        passed: exitCode === 0,
        message: exitCode === 0 ? 'Build succeeded' : 'Build failed',
        details: { stdout, stderr }
      };
    } catch (error) {
      return {
        type: 'build',
        passed: false,
        message: `Build error: ${error.message}`,
        issues: [{ type: 'build_error', message: error.message }]
      };
    }
  }
  
  private async runTestCheck(result: TaskResult): Promise<VerificationCheck> {
    try {
      const { exitCode, stdout } = await exec('npm test', {
        timeout: 120000
      });
      
      const passed = exitCode === 0;
      const match = stdout.match(/(\d+) passed/);
      const passedCount = match ? parseInt(match[1]) : 0;
      
      return {
        type: 'test',
        passed,
        message: passed 
          ? `All tests passed (${passedCount})` 
          : 'Some tests failed',
        details: { passedCount }
      };
    } catch (error) {
      return {
        type: 'test',
        passed: false,
        message: `Test error: ${error.message}`,
        issues: [{ type: 'test_failure', message: error.message }]
      };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 交叉验证方法
  // ═══════════════════════════════════════════════════════════════
  private async runCodeReview(
    result: TaskResult,
    reviewerRole: Role,
    team: Team
  ): Promise<VerificationCheck> {
    
    const reviewer = team.getMember(reviewerRole);
    
    // 生成审查请求
    const reviewRequest = {
      task: result.task,
      changedFiles: result.changedFiles,
      diff: result.diff,
      reviewer
    };
    
    // 执行审查（可以是 AI 或人工）
    const reviewResult = await reviewer.review(reviewRequest);
    
    return {
      type: 'code_review',
      passed: reviewResult.approved,
      message: reviewResult.approved 
        ? 'Code review passed' 
        : 'Code review failed',
      issues: reviewResult.issues,
      details: {
        reviewer: reviewer.name,
        comments: reviewResult.comments
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 视觉验证方法
  // ═══════════════════════════════════════════════════════════════
  private async runVisualVerification(
    result: TaskResult,
    designer: TeamMember
  ): Promise<VerificationCheck> {
    
    // 捕获截图
    const screenshots = await this.captureScreenshots(result);
    
    // 美术审核
    const reviewResult = await designer.visualReview({
      task: result.task,
      screenshots,
      criteria: result.task.visualVerificationCriteria
    });
    
    return {
      type: 'visual',
      passed: reviewResult.approved,
      message: reviewResult.approved 
        ? 'Visual verification passed' 
        : 'Visual verification failed',
      issues: reviewResult.issues,
      details: {
        screenshots,
        feedback: reviewResult.feedback
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 人工审批方法
  // ═══════════════════════════════════════════════════════════════
  private async requestManualApproval(
    task: Task,
    result: TaskResult,
    approverRole: Role
  ): Promise<VerificationCheck> {
    
    // 发送审批请求
    const approvalRequest = {
      task,
      result,
      approver: approverRole,
      reason: 'High-risk change requires manual approval'
    };
    
    // 等待审批
    const approval = await this.waitForApproval(approvalRequest);
    
    return {
      type: 'manual_approval',
      passed: approval.approved,
      message: approval.approved 
        ? `Approved by ${approverRole}` 
        : `Rejected by ${approverRole}`,
      issues: approval.approved ? [] : [{ 
        type: 'manual_rejection', 
        message: approval.reason 
      }],
      details: {
        approver: approval.approver,
        reason: approval.reason
      }
    };
  }
}
```

### 2.4 记忆系统 (借鉴 memdir + Dream)

**Claude Code 原版**：
```typescript
// 记忆目录结构
~/.claude/projects/<project>/memory/
  MEMORY.md
  <topic>.md

// Dream 整合流程
Orient → Gather → Consolidate → Prune
```

**优化后的记忆系统**：

```typescript
/**
 * 记忆类型定义
 */
type MemoryType = 
  | 'project_context'     // 项目上下文
  | 'architecture'        // 架构决策
  | 'coding_standards'    // 编码规范
  | 'common_patterns'     // 常用模式
  | 'learned_lessons'     // 教训总结
  | 'decision_log';       // 决策日志

interface MemoryEntry {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  
  // 元数据
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // 来源
  source: 'manual' | 'extracted' | 'consolidated';
  relatedModules: string[];
  relatedTasks: string[];
}

/**
 * 记忆管理器
 */
class MemoryManager {
  private memoryDir: string;
  private entries: Map<string, MemoryEntry>;
  
  constructor(projectRoot: string) {
    this.memoryDir = path.join(projectRoot, '.workflow', 'memory');
    this.entries = new Map();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 加载记忆
  // ═══════════════════════════════════════════════════════════════
  async load(): Promise<void> {
    const files = await this.scanMemoryFiles();
    
    for (const file of files) {
      const entry = await this.parseMemoryFile(file);
      this.entries.set(entry.id, entry);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 检索相关记忆
  // 借鉴 Claude Code 的相关性评分
  // ═══════════════════════════════════════════════════════════════
  async retrieveRelevant(
    query: string,
    context: { module?: string; task?: string },
    topK: number = 5
  ): Promise<MemoryEntry[]> {
    
    const scored = [...this.entries.values()].map(entry => ({
      entry,
      score: this.calculateRelevance(entry, query, context)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, topK).map(s => s.entry);
  }
  
  private calculateRelevance(
    entry: MemoryEntry,
    query: string,
    context: { module?: string; task?: string }
  ): number {
    let score = 0;
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    const content = entry.content.toLowerCase();
    const title = entry.title.toLowerCase();
    
    // 标题匹配
    for (const term of queryTerms) {
      if (title.includes(term)) score += 10;
    }
    
    // 内容匹配
    for (const term of queryTerms) {
      const count = (content.match(new RegExp(term, 'g')) || []).length;
      score += count * 2;
    }
    
    // 上下文匹配
    if (context.module && entry.relatedModules.includes(context.module)) {
      score += 15;
    }
    
    if (context.task && entry.relatedTasks.includes(context.task)) {
      score += 20;
    }
    
    // 类型权重
    const typeWeights: Record<MemoryType, number> = {
      'project_context': 1.5,
      'architecture': 1.4,
      'coding_standards': 1.2,
      'common_patterns': 1.3,
      'learned_lessons': 1.6,  // 教训权重最高
      'decision_log': 1.1
    };
    
    score *= typeWeights[entry.type] || 1.0;
    
    // 新鲜度衰减
    const ageInDays = (Date.now() - entry.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-ageInDays / 30); // 30天半衰期
    
    return score;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 记忆整合 (Dream)
  // 模块完成时触发
  // ═══════════════════════════════════════════════════════════════
  async consolidate(
    module: Module,
    workflow: WorkflowState
  ): Promise<void> {
    
    // 检查触发条件
    if (!this.shouldConsolidate(workflow)) {
      return;
    }
    
    // Phase 1: Orient - 读取现有记忆
    const existingMemory = await this.load();
    
    // Phase 2: Gather - 收集模块执行过程中的信息
    const moduleData = await this.gatherModuleData(module, workflow);
    
    // Phase 3: Consolidate - 提取关键洞察
    const insights = await this.extractInsights(moduleData);
    
    // Phase 4: Update - 更新记忆文件
    for (const insight of insights) {
      await this.updateMemoryFile(insight);
    }
    
    // Phase 5: Prune - 清理过期内容
    await this.pruneStaleEntries();
    
    // Phase 6: Index - 重新生成索引
    await this.regenerateIndex();
  }
  
  private shouldConsolidate(workflow: WorkflowState): boolean {
    const lastConsolidation = workflow.lastConsolidationAt;
    const completedModules = workflow.completedModulesCount;
    
    // 条件1: 距上次整合 >= 24小时
    const timeSinceLast = lastConsolidation 
      ? Date.now() - lastConsolidation.getTime() 
      : Infinity;
    
    // 条件2: 完成了 >= 1 个模块
    return timeSinceLast >= 24 * 60 * 60 * 1000 || completedModules >= 1;
  }
  
  private async extractInsights(moduleData: ModuleData): Promise<MemoryEntry[]> {
    const insights: MemoryEntry[] = [];
    
    // 从失败中学习
    for (const failure of moduleData.failures) {
      insights.push({
        id: generateId(),
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
        tags: ['failure', failure.category, moduleData.module.name],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'consolidated',
        relatedModules: [moduleData.module.id],
        relatedTasks: [failure.taskId]
      });
    }
    
    // 从成功模式中提取
    for (const pattern of moduleData.successPatterns) {
      insights.push({
        id: generateId(),
        type: 'common_patterns',
        title: pattern.name,
        content: `
## 模式描述
${pattern.description}

## 应用场景
${pattern.scenarios}

## 实现要点
${pattern.keyPoints}
        `,
        tags: ['pattern', pattern.category, moduleData.module.name],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'consolidated',
        relatedModules: [moduleData.module.id],
        relatedTasks: pattern.taskIds
      });
    }
    
    // 从架构决策中记录
    for (const decision of moduleData.decisions) {
      insights.push({
        id: generateId(),
        type: 'decision_log',
        title: decision.title,
        content: `
## 决策
${decision.decision}

## 背景
${decision.context}

## 理由
${decision.reasoning}

## 影响
${decision.impact}
        `,
        tags: ['decision', decision.category, moduleData.module.name],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'consolidated',
        relatedModules: [moduleData.module.id],
        relatedTasks: []
      });
    }
    
    return insights;
  }
}

/**
 * 记忆目录结构
 * 
 * .workflow/memory/
 * ├── MEMORY.md              # 入口索引
 * ├── project/
 * │   ├── architecture.md
 * │   ├── tech_stack.md
 * │   └── dependencies.md
 * ├── standards/
 * │   ├── typescript.md
 * │   └── rust.md
 * ├── patterns/
 * │   ├── error_handling.md
 * │   └── state_management.md
 * ├── lessons/
 * │   ├── 2026-04-01-build-failure.md
 * │   └── 2026-04-01-deps-conflict.md
 * └── decisions/
 *     ├── 2026-04-01-tauri-choice.md
 *     └── 2026-04-01-state-lib.md
 */
```

### 2.5 上下文构建 (借鉴 System Prompt Architecture)

**Claude Code 原版**：
```typescript
// 模块化系统提示
const systemPrompt = [
  ...staticBlocks.map(b => ({ ...b, cache: true })),
  { type: 'separator', text: 'DYNAMIC_BOUNDARY' },
  ...dynamicBlocks
];
```

**优化后的任务上下文构建**：

```typescript
/**
 * 任务上下文构建器
 * 借鉴 Claude Code 的模块化系统提示架构
 */
class TaskContextBuilder {
  
  /**
   * 构建任务执行上下文
   * 分离静态（可缓存）和动态部分
   */
  async buildContext(
    task: Task,
    workflow: WorkflowState
  ): Promise<TaskContext> {
    
    // ═══════════════════════════════════════════════════════════════
    // 静态部分（可缓存，项目级）
    // ═══════════════════════════════════════════════════════════════
    const staticContext = await this.buildStaticContext(workflow.project);
    
    // ═══════════════════════════════════════════════════════════════
    // 动态部分（任务相关）
    // ═══════════════════════════════════════════════════════════════
    const dynamicContext = await this.buildDynamicContext(task, workflow);
    
    // ═══════════════════════════════════════════════════════════════
    // 记忆注入（相关历史）
    // ═══════════════════════════════════════════════════════════════
    const relevantMemory = await workflow.memoryManager.retrieveRelevant(
      task.description,
      { module: task.module, task: task.id },
      5
    );
    
    return {
      // 静态
      projectContext: staticContext.projectContext,
      architecture: staticContext.architecture,
      codingStandards: staticContext.codingStandards,
      
      // 动态
      currentTask: dynamicContext.taskInfo,
      moduleContext: dynamicContext.moduleContext,
      recentChanges: dynamicContext.recentChanges,
      
      // 记忆
      relevantMemory,
      
      // 工具
      availableTools: this.getAvailableTools(task),
      
      // 约束
      constraints: {
        estimatedMinutes: task.estimatedMinutes,
        verificationRequired: task.verificationRules,
        outputRequirements: task.expectedOutputs
      }
    };
  }
  
  private async buildStaticContext(project: Project): Promise<StaticContext> {
    // 这些内容可以缓存，不需要每次重新构建
    return {
      projectContext: await this.loadProjectContext(project),
      architecture: await this.loadArchitecture(project),
      codingStandards: await this.loadCodingStandards(project)
    };
  }
  
  private async buildDynamicContext(
    task: Task,
    workflow: WorkflowState
  ): Promise<DynamicContext> {
    return {
      taskInfo: {
        id: task.id,
        title: task.title,
        description: task.description,
        acceptanceCriteria: task.acceptanceCriteria
      },
      
      moduleContext: {
        moduleId: task.module,
        moduleName: workflow.modules.get(task.module)?.name,
        moduleProgress: workflow.getModuleProgress(task.module)
      },
      
      recentChanges: workflow.getRecentChanges(task.module, 10)
    };
  }
  
  private getAvailableTools(task: Task): Tool[] {
    const tools: Tool[] = [
      new FileReadTool(),
      new FileWriteTool(),
      new FileEditTool(),
      new BashTool(),
      new GlobTool(),
      new GrepTool()
    ];
    
    // 根据任务类型添加特定工具
    if (task.type === 'test') {
      tools.push(new TestRunnerTool());
    }
    
    if (task.type === 'documentation') {
      tools.push(new DocGeneratorTool());
    }
    
    return tools;
  }
}

/**
 * 任务上下文结构
 */
interface TaskContext {
  // 静态部分（可缓存）
  projectContext: string;
  architecture: string;
  codingStandards: string;
  
  // 动态部分
  currentTask: TaskInfo;
  moduleContext: ModuleContext;
  recentChanges: Change[];
  
  // 记忆
  relevantMemory: MemoryEntry[];
  
  // 工具
  availableTools: Tool[];
  
  // 约束
  constraints: TaskConstraints;
}
```

---

## 三、完整执行流程

### 3.1 端到端流程

```typescript
/**
 * 完整工作流执行
 */
async function executeWorkflow(
  requirement: string,
  team: Team
): Promise<WorkflowResult> {
  
  const workflow = await initializeWorkflow(requirement, team);
  
  try {
    // ═══════════════════════════════════════════════════════════════
    // Phase 1: Requirement
    // ═══════════════════════════════════════════════════════════════
    workflow.phase = 'requirement';
    
    const designDoc = await executeRequirementPhase(requirement, team);
    workflow.designDocument = designDoc;
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 2: Architecture
    // ═══════════════════════════════════════════════════════════════
    workflow.phase = 'architecture';
    
    const { architecture, taskChains } = await executeArchitecturePhase(designDoc, team);
    workflow.architecture = architecture;
    workflow.taskChains = taskChains;
    
    // 初始化任务图
    const taskGraph = new TaskGraph([...workflow.modules.values()]);
    workflow.taskGraph = taskGraph;
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 3: Development
    // ═══════════════════════════════════════════════════════════════
    workflow.phase = 'development';
    
    for await (const event of developmentLoop(workflow)) {
      await handleDevelopmentEvent(event, workflow);
      
      // 模块完成时触发记忆整合
      if (event.type === 'module_completed') {
        await workflow.memoryManager.consolidate(event.module, workflow);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 4: Integration
    // ═══════════════════════════════════════════════════════════════
    workflow.phase = 'integration';
    
    await executeIntegrationPhase(workflow, team);
    
    // 最终记忆整合
    await workflow.memoryManager.finalConsolidation(workflow);
    
    // ═══════════════════════════════════════════════════════════════
    // Phase 5: Extension (可选)
    // ═══════════════════════════════════════════════════════════════
    workflow.phase = 'extension';
    // 等待后续需求
    
    return {
      success: true,
      workflow
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      workflow
    };
  }
}
```

---

## 四、优化总结

### 4.1 Claude Code 架构映射表

| Claude Code 组件 | 工作流对应 | 优化效果 |
|------------------|-----------|----------|
| Query Loop | 开发阶段执行循环 | 统一的任务执行流程 |
| Coordinator + Workers | 主程序 + 开发员 | 清晰的角色分工 |
| Task Graph | 任务链依赖管理 | 自动并行调度 |
| Permission System | 验证决策系统 | 智能验证分类 |
| Memory (memdir) | 项目知识库 | 经验沉淀复用 |
| Dream | 模块完成整合 | 知识自动提取 |
| System Prompt | 任务上下文构建 | 高效上下文注入 |
| Tool System | 开发工具层 | 可扩展工具集 |

### 4.2 核心优化点

1. **执行效率**
   - 自动识别可并行任务
   - 关键路径计算，优化资源分配
   - 静态上下文缓存，减少重复计算

2. **验证智能化**
   - 三级风险分类，自动决策验证级别
   - 低风险自动通过，中风险交叉验证，高风险人工确认
   - 验证结果可追溯

3. **知识沉淀**
   - 模块完成时自动提取经验教训
   - 相关记忆智能检索
   - 知识新鲜度管理

4. **流程可追溯**
   - 每个阶段有明确的输入输出
   - 问题分级处理，修复流程清晰
   - 完整的执行历史记录

---

## 五、实施建议

### 5.1 分阶段实施

| Phase | 内容 | 优先级 | 时间 |
|-------|------|--------|------|
| 1 | 核心类型定义 + 任务图 | P0 | Week 1 |
| 2 | 执行循环 + 验证系统 | P0 | Week 2 |
| 3 | 记忆系统 + 整合 | P1 | Week 3 |
| 4 | CLI + 报告系统 | P1 | Week 4 |
| 5 | 测试 + 文档 | P2 | Week 5 |

### 5.2 与现有体系集成

```
现有文档:
├── planning/p4/ARCHITECTURE.md      → 架构阶段输入
├── planning/p4/DETAILED_TASK_CHAIN.md → 任务链定义
├── memory/2026-03-27.md              → 记忆系统初始数据

新增文件:
├── .workflow/
│   ├── config.yaml                   # 工作流配置
│   ├── state.json                    # 运行状态
│   └── memory/                       # 记忆系统
└── planning/WORKFLOW_OPTIMIZED.md    # 本文档
```