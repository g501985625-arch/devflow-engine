# DevFlow Engine - 自动化开发工作流引擎

> 自动化执行 + 总管监督 + 固定角色

---

## 一、核心理念

### 1.1 自动化执行

```
用户下达需求
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                    DevFlow Engine                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    总管 (监督者)                      │   │
│   │                                                     │   │
│   │  • 监控工作流进度                                    │   │
│   │  • 协调各角色协作                                    │   │
│   │  • 检测问题并触发修复                                │   │
│   │  • 向用户汇报状态                                    │   │
│   │                                                     │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│                          │ 监督 & 协调                       │
│                          ▼                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│   │ 需求阶段 │ │ 架构阶段 │ │ 开发阶段 │ │ 整合阶段 │      │
│   │ (自动)   │→│ (自动)   │→│ (自动)   │→│ (自动)   │      │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│        │            │            │            │            │
│        ▼            ▼            ▼            ▼            │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│   │  总管    │ │ 架构师   │ │主程序+开发│ │  主程序  │      │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
  项目完成
```

### 1.2 总管角色定位

```
┌─────────────────────────────────────────────────────────────┐
│                         总管                                 │
│                     (流程监督者)                              │
│                                                             │
│  定位：                                                      │
│  • 不是外部用户，而是工作流内部的监督角色                      │
│  • 类似于项目经理 / 生产经理                                  │
│  • 24/7 监控工作流状态                                        │
│                                                             │
│  职责：                                                      │
│  1. 流程监控 - 持续监控各阶段进度                             │
│  2. 问题检测 - 自动识别阻塞、失败、异常                       │
│  3. 协调调度 - 分配任务、协调资源                             │
│  4. 状态汇报 - 向用户汇报进度和问题                           │
│  5. 异常处理 - 触发修复流程或请求人工介入                     │
│                                                             │
│  特权：                                                      │
│  • 可查看所有角色的状态                                       │
│  • 可干预任何阶段的执行                                       │
│  • 可向用户发起询问                                          │
│  • 可重新分配任务                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、自动化执行机制

### 2.1 自动化引擎核心

```typescript
/**
 * 自动化执行引擎
 * 核心循环：检查状态 → 执行任务 → 验证结果 → 推进流程
 */
class AutomationEngine {
  private engine: DevFlowEngine;
  private project: Project;
  private isRunning: boolean;
  private supervisor: SupervisorAgent;  // 总管 Agent
  
  /**
   * 启动自动化工作流
   * 用户只需调用这个方法，之后完全自动化
   */
  async startAutomation(projectId: string): Promise<void> {
    this.project = await this.engine.openProject(projectId);
    this.isRunning = true;
    
    // 初始化总管
    this.supervisor = new SupervisorAgent(this.project);
    
    // 启动主循环
    await this.mainLoop();
  }
  
  /**
   * 主执行循环
   * 持续运行直到项目完成
   */
  private async mainLoop(): Promise<void> {
    while (this.isRunning && !this.isProjectComplete()) {
      
      // ═════════════════════════════════════════════════════════
      // Step 1: 总管检查状态
      // ═════════════════════════════════════════════════════════
      const status = await this.supervisor.checkStatus();
      
      // 记录状态
      await this.logStatus(status);
      
      // ═════════════════════════════════════════════════════════
      // Step 2: 总管检测问题
      // ═════════════════════════════════════════════════════════
      const issues = await this.supervisor.detectIssues(status);
      
      if (issues.length > 0) {
        // 有问题，总管处理
        await this.supervisor.handleIssues(issues);
        continue;  // 重新检查状态
      }
      
      // ═════════════════════════════════════════════════════════
      // Step 3: 执行当前阶段的任务
      // ═════════════════════════════════════════════════════════
      const currentPhase = this.project.state.currentPhase;
      const result = await this.executePhase(currentPhase);
      
      // ═════════════════════════════════════════════════════════
      // Step 4: 验证阶段结果
      // ═════════════════════════════════════════════════════════
      const verification = await this.verifyPhase(currentPhase, result);
      
      if (verification.passed) {
        // ═══════════════════════════════════════════════════════
        // Step 5: 推进到下一阶段
        // ═══════════════════════════════════════════════════════
        await this.advanceToNextPhase();
        
        // 总管汇报进度
        await this.supervisor.reportProgress({
          completedPhase: currentPhase,
          nextPhase: this.project.state.currentPhase
        });
      } else {
        // 验证失败，总管处理
        await this.supervisor.handleVerificationFailure(verification);
      }
    }
    
    // 项目完成，总管汇报
    await this.supervisor.reportCompletion();
  }
  
  /**
   * 执行阶段
   */
  private async executePhase(phase: string): Promise<PhaseResult> {
    switch (phase) {
      case 'requirement':
        return this.executeRequirementPhase();
      case 'architecture':
        return this.executeArchitecturePhase();
      case 'development':
        return this.executeDevelopmentPhase();
      case 'integration':
        return this.executeIntegrationPhase();
      default:
        throw new Error(`Unknown phase: ${phase}`);
    }
  }
  
  /**
   * 执行需求阶段
   * 总管自动收集需求，生成设计文档
   */
  private async executeRequirementPhase(): Promise<PhaseResult> {
    const manager = this.engine.getDesk('manager', this.project);
    
    // 1. 总管分析需求
    const analysis = await manager.execute({
      type: 'analyze_requirement',
      input: this.project.config.initialRequirement
    });
    
    // 2. 总管与用户澄清（如果需要）
    if (analysis.needsClarification) {
      const clarifications = await manager.askUser(analysis.questions);
      analysis.update(clarifications);
    }
    
    // 3. 总管生成设计文档
    const designDoc = await manager.execute({
      type: 'create_design_document',
      input: analysis
    });
    
    // 4. 总管确认用户批准
    const approved = await manager.confirmWithUser(designDoc);
    
    if (!approved) {
      // 重新迭代
      return this.executeRequirementPhase();
    }
    
    return {
      success: true,
      artifacts: [designDoc]
    };
  }
  
  /**
   * 执行架构阶段
   * 架构师自动设计，总管监督
   */
  private async executeArchitecturePhase(): Promise<PhaseResult> {
    const architect = this.engine.getDesk('architect', this.project);
    
    // 1. 架构师设计系统架构
    const architecture = await architect.execute({
      type: 'design_architecture',
      input: this.project.config.requirements
    });
    
    // 2. 架构师划分模块
    const modules = await architect.execute({
      type: 'plan_modules',
      input: architecture
    });
    
    // 3. 架构师设计任务链
    const taskChains = await architect.execute({
      type: 'create_task_chains',
      input: modules
    });
    
    // 4. 总管审核架构设计
    const review = await this.supervisor.reviewArchitecture(architecture);
    
    if (!review.approved) {
      // 架构师修改
      await architect.execute({
        type: 'revise_architecture',
        input: review.feedback
      });
      return this.executeArchitecturePhase();
    }
    
    return {
      success: true,
      artifacts: [architecture, modules, taskChains]
    };
  }
  
  /**
   * 执行开发阶段
   * 主程序 + 开发员并行开发，总管监督
   */
  private async executeDevelopmentPhase(): Promise<PhaseResult> {
    const modules = this.project.config.modules;
    const results: ModuleResult[] = [];
    
    // 总管分配模块给开发团队
    await this.supervisor.assignModules(modules);
    
    for (const module of modules) {
      // 总管监控模块进度
      const moduleResult = await this.executeModule(module);
      results.push(moduleResult);
      
      // 总管检查模块状态
      if (!moduleResult.success) {
        await this.supervisor.handleModuleFailure(module, moduleResult);
      }
    }
    
    return {
      success: results.every(r => r.success),
      artifacts: results.flatMap(r => r.artifacts)
    };
  }
  
  /**
   * 执行单个模块
   * 主程序 + 开发员并行执行任务链
   */
  private async executeModule(module: Module): Promise<ModuleResult> {
    const taskChain = module.taskChain;
    const leadDev = this.engine.getDesk('lead-dev', this.project);
    const developer = this.engine.getDesk('developer', this.project);
    
    // 按并行组执行任务
    for (const group of taskChain.parallelGroups) {
      const tasks = group.tasks.map(id => 
        taskChain.tasks.find(t => t.id === id)!
      );
      
      // 分配任务
      const assignments = this.supervisor.assignTasks(tasks, {
        'lead-dev': leadDev,
        'developer': developer
      });
      
      // 并行执行
      const results = await Promise.all(
        assignments.map(({ task, desk }) => 
          this.executeTask(task, desk)
        )
      );
      
      // 总管检查结果
      for (const result of results) {
        if (!result.success) {
          // 总管决定：修复 or 重试
          const decision = await this.supervisor.decideOnFailure(result);
          
          if (decision.action === 'repair') {
            await leadDev.repair(result);
          } else if (decision.action === 'retry') {
            await this.executeTask(result.task, result.desk);
          }
        }
      }
    }
    
    // 模块验证
    const verification = await this.verifyModule(module);
    
    return {
      success: verification.passed,
      module: module.id,
      artifacts: []  // 收集生成的文件
    };
  }
  
  /**
   * 执行整合阶段
   * 主程序整合，总管监督
   */
  private async executeIntegrationPhase(): Promise<PhaseResult> {
    const leadDev = this.engine.getDesk('lead-dev', this.project);
    const designer = this.engine.getDesk('designer', this.project);
    
    // 1. 主程序整合所有模块
    const integration = await leadDev.execute({
      type: 'integrate_modules',
      input: this.project.config.modules
    });
    
    // 2. 整体技术验证
    const techVerification = await leadDev.execute({
      type: 'technical_verification',
      input: integration
    });
    
    // 总管检查技术验证结果
    if (!techVerification.passed) {
      await this.supervisor.handleVerificationFailure(techVerification);
      return this.executeIntegrationPhase();
    }
    
    // 3. 整体视觉验证（如需要）
    if (this.project.config.verification.requireVisualVerification) {
      const visualVerification = await designer.execute({
        type: 'visual_verification',
        input: integration
      });
      
      if (!visualVerification.passed) {
        await this.supervisor.handleVerificationFailure(visualVerification);
        return this.executeIntegrationPhase();
      }
    }
    
    return {
      success: true,
      artifacts: [integration]
    };
  }
}
```

### 2.2 总管监督者 Agent

```typescript
/**
 * 总管 Agent
 * 自动化工作流的监督者和协调者
 */
class SupervisorAgent {
  private project: Project;
  private desk: Desk;
  
  constructor(project: Project) {
    this.project = project;
    // 总管拥有特殊的监督权限
    this.desk = this.createSupervisorDesk();
  }
  
  /**
   * 创建总管工位
   * 总管是特殊的工位，拥有监督权限
   */
  private createSupervisorDesk(): Desk {
    return {
      id: 'manager',
      name: '总管',
      role: 'manager',
      
      systemPrompt: `# 角色：工作流总管（监督者）

你是开发工作流的监督者和协调者。你的职责是确保整个工作流顺利执行。

## 核心职责

### 1. 流程监控
- 持续监控各阶段的执行状态
- 追踪任务完成进度
- 记录关键事件和决策

### 2. 问题检测
- 识别阻塞的任务
- 检测失败的验证
- 发现异常的执行模式

### 3. 协调调度
- 分配任务给合适的角色
- 协调并行执行的资源
- 解决角色间的冲突

### 4. 状态汇报
- 定期向用户汇报进度
- 标记重要的里程碑
- 提示需要人工介入的问题

### 5. 异常处理
- 触发修复流程
- 决定是否需要重新规划
- 在必要时请求用户决策

## 工作原则

1. **主动监控** - 不等待问题报告，主动检测异常
2. **快速响应** - 发现问题立即处理
3. **透明汇报** - 让用户随时了解状态
4. **最小干预** - 优先自动解决，只在必要时请求人工

## 汇报格式

### 进度汇报
\`\`\`
📊 项目进度汇报
━━━━━━━━━━━━━━━━━━━━━━━━
项目：{项目名称}
当前阶段：{阶段}
完成度：{百分比}

✅ 已完成：
- {完成的任务}

🔄 进行中：
- {当前任务}

⚠️ 问题：
- {问题描述}

⏭️ 下一步：
- {计划}
\`\`\`

### 问题汇报
\`\`\`
⚠️ 问题报告
━━━━━━━━━━━━━━━━━━━━━━━━
类型：{问题类型}
严重程度：{严重程度}
位置：{阶段/模块/任务}

描述：
{详细描述}

处理方案：
{方案}

需要人工确认：{是/否}
\`\`\`
`,
      
      tools: [
        'check_status',      // 检查状态
        'detect_issues',     // 检测问题
        'assign_task',       // 分配任务
        'report_progress',   // 汇报进度
        'ask_user',          // 询问用户
        'trigger_repair',    // 触发修复
        'pause_workflow',    // 暂停工作流
        'resume_workflow'    // 恢复工作流
      ],
      
      // 特殊权限
      privileges: {
        canViewAllRoles: true,      // 可查看所有角色状态
        canInterveneAnyPhase: true,  // 可干预任何阶段
        canAskUser: true,            // 可向用户询问
        canReassignTasks: true       // 可重新分配任务
      }
    };
  }
  
  /**
   * 检查工作流状态
   */
  async checkStatus(): Promise<WorkflowStatus> {
    const status: WorkflowStatus = {
      timestamp: new Date(),
      phase: this.project.state.currentPhase,
      module: this.project.state.currentModule,
      task: this.project.state.currentTask,
      progress: this.calculateProgress(),
      
      // 各角色状态
      roles: await this.checkAllRoles(),
      
      // 问题列表
      issues: await this.getPendingIssues(),
      
      // 健康指标
      health: await this.calculateHealth()
    };
    
    // 记录状态快照
    await this.recordStatus(status);
    
    return status;
  }
  
  /**
   * 检测问题
   */
  async detectIssues(status: WorkflowStatus): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // 1. 检测阻塞任务
    const blockedTasks = this.findBlockedTasks(status);
    for (const task of blockedTasks) {
      issues.push({
        type: 'blocked_task',
        severity: 'medium',
        taskId: task.id,
        description: `任务 ${task.id} 被阻塞`,
        suggestedAction: '检查依赖或重新分配'
      });
    }
    
    // 2. 检测失败任务
    const failedTasks = this.findFailedTasks(status);
    for (const task of failedTasks) {
      issues.push({
        type: 'failed_task',
        severity: 'high',
        taskId: task.id,
        description: `任务 ${task.id} 执行失败: ${task.error}`,
        suggestedAction: '触发修复流程'
      });
    }
    
    // 3. 检测超时任务
    const timeoutTasks = this.findTimeoutTasks(status);
    for (const task of timeoutTasks) {
      issues.push({
        type: 'timeout_task',
        severity: 'medium',
        taskId: task.id,
        description: `任务 ${task.id} 执行超时`,
        suggestedAction: '重新分配或拆分任务'
      });
    }
    
    // 4. 检测资源冲突
    const conflicts = this.findResourceConflicts(status);
    for (const conflict of conflicts) {
      issues.push({
        type: 'resource_conflict',
        severity: 'low',
        description: conflict.description,
        suggestedAction: '调整任务顺序'
      });
    }
    
    // 5. 检测健康指标异常
    if (status.health.score < 0.7) {
      issues.push({
        type: 'health_warning',
        severity: 'high',
        description: `项目健康度低于阈值: ${status.health.score}`,
        suggestedAction: '检查问题并修复'
      });
    }
    
    return issues;
  }
  
  /**
   * 处理问题
   */
  async handleIssues(issues: Issue[]): Promise<void> {
    // 按严重程度排序
    const sorted = issues.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    for (const issue of sorted) {
      await this.handleIssue(issue);
    }
  }
  
  /**
   * 处理单个问题
   */
  private async handleIssue(issue: Issue): Promise<void> {
    switch (issue.type) {
      case 'failed_task':
        // 触发修复
        await this.triggerRepair(issue.taskId!);
        break;
        
      case 'blocked_task':
        // 检查阻塞原因，可能需要重新分配
        await this.resolveBlock(issue.taskId!);
        break;
        
      case 'timeout_task':
        // 重新分配任务
        await this.reassignTask(issue.taskId!);
        break;
        
      case 'resource_conflict':
        // 调整任务调度
        await this.adjustSchedule(issue);
        break;
        
      case 'health_warning':
        // 向用户汇报
        await this.reportToUser({
          type: 'warning',
          message: issue.description
        });
        break;
    }
  }
  
  /**
   * 触发修复流程
   */
  async triggerRepair(taskId: string): Promise<void> {
    // 获取主程序工位
    const leadDev = await this.getDesk('lead-dev');
    
    // 执行修复
    const result = await leadDev.execute({
      type: 'repair_task',
      taskId
    });
    
    // 记录修复
    await this.recordRepair(taskId, result);
  }
  
  /**
   * 分配模块给开发团队
   */
  async assignModules(modules: Module[]): Promise<void> {
    // 分析模块依赖
    const sorted = this.sortByDependencies(modules);
    
    // 为每个模块分配执行者
    for (const module of sorted) {
      // 根据模块类型决定分配给谁
      const assignee = this.selectAssignee(module);
      
      await this.recordAssignment({
        moduleId: module.id,
        assignee,
        assignedAt: new Date()
      });
    }
  }
  
  /**
   * 分配任务
   */
  assignTasks(
    tasks: Task[], 
    availableDesks: Record<string, Desk>
  ): TaskAssignment[] {
    const assignments: TaskAssignment[] = [];
    
    for (const task of tasks) {
      // 根据任务类型选择合适的工位
      const desk = this.selectDeskForTask(task, availableDesks);
      
      assignments.push({
        task,
        desk
      });
    }
    
    return assignments;
  }
  
  /**
   * 决定失败任务的处理方式
   */
  async decideOnFailure(result: TaskResult): Promise<FailureDecision> {
    // 分析失败原因
    const analysis = await this.analyzeFailure(result);
    
    // 根据失败类型决定
    if (analysis.type === 'transient_error') {
      // 临时错误，重试
      return { action: 'retry' };
    }
    
    if (analysis.type === 'code_error') {
      // 代码错误，修复
      return { action: 'repair' };
    }
    
    if (analysis.type === 'design_flaw') {
      // 设计缺陷，需要架构师介入
      return { action: 'escalate', escalateTo: 'architect' };
    }
    
    if (analysis.type === 'resource_shortage') {
      // 资源不足，需要人工
      return { action: 'ask_user', question: analysis.question };
    }
    
    // 默认：修复
    return { action: 'repair' };
  }
  
  /**
   * 汇报进度给用户
   */
  async reportProgress(info: ProgressInfo): Promise<void> {
    const message = this.formatProgressReport(info);
    
    // 存储汇报记录
    await this.storeReport(message);
    
    // 发送给用户（通过通知系统）
    await this.notifyUser(message);
  }
  
  /**
   * 格式化进度报告
   */
  private formatProgressReport(info: ProgressInfo): string {
    const lines: string[] = [
      '📊 项目进度汇报',
      '━━━━━━━━━━━━━━━━━━━━━━━━',
      `项目：${this.project.name}`,
      `当前阶段：${info.nextPhase || info.completedPhase}`,
      `完成度：${this.calculateProgress()}%`,
      '',
      `✅ 已完成阶段：${info.completedPhase}`,
      '',
      '⏭️ 下一步：',
      `- 进入 ${info.nextPhase} 阶段`,
      '',
      `⏰ 时间：${new Date().toLocaleString()}`
    ];
    
    return lines.join('\n');
  }
  
  /**
   * 汇报完成
   */
  async reportCompletion(): Promise<void> {
    const message = `
🎉 项目完成汇报
━━━━━━━━━━━━━━━━━━━━━━━━
项目：${this.project.name}
状态：已完成

📊 统计：
- 总任务数：${this.project.state.progress.total}
- 完成任务：${this.project.state.progress.completed}
- 修复次数：${this.project.state.progress.repairs}
- 总耗时：${this.calculateDuration()}

📁 输出位置：
${this.project.path}/output/

感谢使用 DevFlow Engine！
    `;
    
    await this.notifyUser(message);
  }
}
```

---

## 三、自动化流程示例

### 3.1 完整自动化流程

```
用户: devflow start my-project --requirement "开发一个下载管理器"

Engine:
├── [自动] 创建项目空间
├── [自动] 初始化记忆结构
├── [自动] 启动自动化引擎
│
├── 总管: "开始执行需求阶段..."
│   │
│   ├── 总管: 分析需求 "下载管理器"
│   ├── 总管: 生成问题列表
│   ├── 总管: 询问用户澄清 (如需要)
│   ├── 总管: 生成设计文档
│   ├── 总管: 确认用户批准
│   │
│   └── 总管: "需求阶段完成 ✓"
│
├── 总管: "开始执行架构阶段..."
│   │
│   ├── 架构师: 设计系统架构
│   ├── 架构师: 划分模块
│   ├── 架构师: 设计任务链
│   ├── 总管: 审核架构
│   │
│   └── 总管: "架构阶段完成 ✓"
│
├── 总管: "开始执行开发阶段..."
│   │
│   ├── 总管: 分配模块给开发团队
│   │
│   ├── 模块 A:
│   │   ├── 主程序: 执行任务 A.1
│   │   ├── 开发员: 执行任务 A.2 (并行)
│   │   ├── 主程序: 验证任务 A.1 ✓
│   │   ├── 开发员: 验证任务 A.2 ✓
│   │   └── 模块 A 完成 ✓
│   │
│   ├── 模块 B:
│   │   ├── 主程序: 执行任务 B.1
│   │   ├── 主程序: 验证失败!
│   │   ├── 总管: 检测到问题
│   │   ├── 总管: 触发修复
│   │   ├── 主程序: 修复完成
│   │   ├── 主程序: 重新验证 ✓
│   │   └── 模块 B 完成 ✓
│   │
│   └── 总管: "开发阶段完成 ✓"
│
├── 总管: "开始执行整合阶段..."
│   │
│   ├── 主程序: 整合所有模块
│   ├── 主程序: 技术验证
│   ├── 美术: 视觉验证 (如需要)
│   │
│   └── 总管: "整合阶段完成 ✓"
│
├── 总管: "项目完成 🎉"
│   │
│   └── 总管: 发送完成报告给用户
│
└── [自动] 保存最终状态
```

### 3.2 问题自动处理流程

```
总管检测到问题
     │
     ├── 任务失败
     │   │
     │   ├── 分析失败原因
     │   │   │
     │   │   ├── 临时错误 → 自动重试
     │   │   ├── 代码错误 → 触发修复 (主程序)
     │   │   ├── 设计缺陷 → 升级给架构师
     │   │   └── 无法判断 → 询问用户
     │   │
     │   └── 记录问题 → 继续执行
     │
     ├── 任务阻塞
     │   │
     │   ├── 检查依赖状态
     │   │   │
     │   │   ├── 依赖失败 → 先修复依赖
     │   │   ├── 依赖进行中 → 等待
     │   │   └── 资源冲突 → 调整调度
     │   │
     │   └── 继续执行
     │
     ├── 验证失败
     │   │
     │   ├── 技术验证失败
     │   │   │
     │   │   ├── 构建失败 → 主程序修复
     │   │   ├── 测试失败 → 主程序修复
     │   │   └── 类型错误 → 主程序修复
     │   │
     │   └── 视觉验证失败
     │       │
     │       └── 美术反馈问题 → 开发员修改
     │
     └── 健康度低
         │
         ├── 生成诊断报告
         └── 汇报给用户
```

---

## 四、核心改进点

### 4.1 与之前设计的区别

| 之前 | 现在 |
|------|------|
| 手动触发任务 | 自动执行整个工作流 |
| 总管是外部角色 | 总管是内部监督者 |
| 问题需要人工处理 | 问题自动检测和处理 |
| 状态需要手动查询 | 总管主动汇报 |

### 4.2 自动化程度

```
┌─────────────────────────────────────────────────────────────┐
│                    自动化程度                                 │
│                                                             │
│  用户输入需求 ───────────────────────────────────► 项目完成   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    全自动                             │   │
│  │                                                     │   │
│  │  • 需求分析 (自动)                                   │   │
│  │  • 架构设计 (自动)                                   │   │
│  │  • 任务执行 (自动)                                   │   │
│  │  • 验证测试 (自动)                                   │   │
│  │  • 问题修复 (自动)                                   │   │
│  │  • 进度汇报 (自动)                                   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  只在以下情况需要人工：                                      │
│  • 需求澄清                                                │
│  • 设计确认                                                │
│  • 重大决策                                                │
│  • 无法自动解决的问题                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、API 更新

### 5.1 自动化 API

```typescript
interface DevFlowAPI {
  /**
   * 启动自动化工作流
   * 一键启动，全程自动化
   */
  startAutomation(
    projectId: string, 
    options?: AutomationOptions
  ): Promise<AutomationHandle>;
  
  /**
   * 获取自动化状态
   */
  getAutomationStatus(projectId: string): Promise<AutomationStatus>;
  
  /**
   * 暂停自动化
   */
  pauseAutomation(projectId: string): Promise<void>;
  
  /**
   * 恢复自动化
   */
  resumeAutomation(projectId: string): Promise<void>;
  
  /**
   * 回复总管的问题
   */
  respondToSupervisor(
    projectId: string, 
    questionId: string, 
    answer: string
  ): Promise<void>;
}

interface AutomationOptions {
  autoRepair?: boolean;        // 自动修复 (默认 true)
  autoRetry?: boolean;         // 自动重试 (默认 true)
  reportInterval?: number;     // 汇报间隔 (分钟)
  notifyOnIssue?: boolean;     // 问题时通知 (默认 true)
}

interface AutomationHandle {
  projectId: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentPhase: string;
  progress: number;
  
  // 取消/暂停
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
}
```

### 5.2 CLI 命令更新

```bash
# 启动自动化工作流
devflow start <project-id>

# 查看状态
devflow status <project-id>

# 暂停/恢复
devflow pause <project-id>
devflow resume <project-id>

# 回复总管问题
devflow answer <project-id> <question-id> <answer>
```

---

## 六、实施顺序

```
Phase 1: 核心引擎 (Week 1-2)
├── Engine Core
├── Storage Layer
└── 基础类型定义

Phase 2: 项目管理 (Week 3-4)
├── Project Manager
├── Project Factory
└── 项目模板系统

Phase 3: 自动化引擎 (Week 5-6)  ← 新增
├── Automation Engine
├── Main Loop
├── Phase Executor
└── Status Tracker

Phase 4: 总管系统 (Week 7-8)    ← 新增
├── Supervisor Agent
├── Issue Detector
├── Problem Handler
└── Progress Reporter

Phase 5: Agent 系统 (Week 9-10)
├── Agent Manager
├── Agent Factory
└── Agent Runtime

Phase 6: 工作流 + 记忆 (Week 11-14)
├── Workflow Engine
├── Task Graph
├── Memory Store
└── Memory Consolidation
```