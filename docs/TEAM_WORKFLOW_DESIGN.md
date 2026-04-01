# 多角色协作开发工作流设计

> 基于实际团队协作流程设计

---

## 一、角色定义

### 1.1 角色职责矩阵

| 角色 | 职责 | 输入 | 输出 |
|------|------|------|------|
| **用户** | 下达需求、确认方向 | 想法 | 需求描述 |
| **总管** | 需求分析、设计文档 | 需求描述 | 设计文档 |
| **架构师** | 架构设计、任务链规划 | 设计文档 | 架构文档 + 任务链 |
| **主程序** | 核心开发、技术验证、修复、整合 | 任务链 | 完成代码 |
| **开发员** | 并行开发、辅助验证 | 任务分配 | 完成代码 |
| **美术** | 视觉验证、UI确认 | 完成功能 | 验证结果 |

### 1.2 角色能力定义

```typescript
type Role = 'user' | 'manager' | 'architect' | 'lead_dev' | 'developer' | 'designer';

interface RoleCapabilities {
  role: Role;
  
  // 可执行的操作
  canCreate: boolean;        // 创建任务
  canAssign: boolean;        // 分配任务
  canExecute: boolean;       // 执行任务
  canVerify: boolean;        // 验证任务
  canRepair: boolean;        // 修复问题
  canIntegrate: boolean;     // 整合模块
  
  // 验证类型
  verificationTypes: VerificationType[];
}

const ROLE_CAPABILITIES: Record<Role, RoleCapabilities> = {
  user: {
    role: 'user',
    canCreate: true,
    canAssign: false,
    canExecute: false,
    canVerify: false,
    canRepair: false,
    canIntegrate: false,
    verificationTypes: []
  },
  
  manager: {
    role: 'manager',
    canCreate: true,
    canAssign: true,
    canExecute: false,
    canVerify: false,
    canRepair: false,
    canIntegrate: false,
    verificationTypes: []
  },
  
  architect: {
    role: 'architect',
    canCreate: true,
    canAssign: true,
    canExecute: false,
    canVerify: true,
    canRepair: false,
    canIntegrate: false,
    verificationTypes: ['architecture', 'design']
  },
  
  lead_dev: {
    role: 'lead_dev',
    canCreate: false,
    canAssign: true,
    canExecute: true,
    canVerify: true,
    canRepair: true,
    canIntegrate: true,
    verificationTypes: ['technical', 'build', 'test', 'integration']
  },
  
  developer: {
    role: 'developer',
    canCreate: false,
    canAssign: false,
    canExecute: true,
    canVerify: true,
    canRepair: false,
    canIntegrate: false,
    verificationTypes: ['technical', 'test']
  },
  
  designer: {
    role: 'designer',
    canCreate: false,
    canAssign: false,
    canExecute: false,
    canVerify: true,
    canRepair: false,
    canIntegrate: false,
    verificationTypes: ['visual', 'ui', 'ux']
  }
};
```

---

## 二、工作流阶段设计

### 2.1 阶段概览

```
┌──────────────────────────────────────────────────────────────────────┐
│ 阶段 1: 需求阶段 (Requirement Phase)                                   │
│ 用户 ──► 总管 ──► 设计文档                                             │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 阶段 2: 架构阶段 (Architecture Phase)                                  │
│ 架构师 ──► 架构设计 ──► 模块划分 ──► 任务链设计                         │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 阶段 3: 开发阶段 (Development Phase)                                   │
│ 对于每个模块:                                                          │
│   主程序 + 开发员 并行执行任务链                                        │
│   每个子任务完成 → 技术验证 → 视觉验证(如需要)                          │
│   问题 → 主程序修复                                                    │
│   所有子任务完成 → 模块验证                                            │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 阶段 4: 整合阶段 (Integration Phase)                                   │
│ 主程序整合 → 整体技术验证 → 整体视觉验证                                │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 阶段 5: 扩展阶段 (Extension Phase)                                     │
│ 新需求 → 架构师任务链 → 主程序执行验证                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 阶段 1: 需求阶段

```typescript
interface RequirementPhase {
  type: 'requirement';
  
  // 输入
  userInput: {
    description: string;      // 用户需求描述
    constraints?: string[];   // 约束条件
    preferences?: string[];   // 偏好
  };
  
  // 处理
  managerAnalysis: {
    clarifiedRequirements: string[];
    questions: string[];      // 需要确认的问题
    assumptions: string[];    // 假设
  };
  
  // 输出
  designDocument: {
    overview: string;         // 概述
    features: Feature[];      // 功能列表
    userStories: string[];    // 用户故事
    acceptanceCriteria: string[]; // 验收标准
    constraints: string[];    // 约束
  };
  
  // 状态
  status: 'collecting' | 'analyzing' | 'documenting' | 'completed';
}

// 执行流程
async function executeRequirementPhase(
  userInput: string
): Promise<DesignDocument> {
  
  // 1. 用户提交需求
  const requirement = await collectUserInput(userInput);
  
  // 2. 总管分析需求
  const analysis = await managerAnalyze(requirement);
  
  // 3. 总管与用户讨论，澄清需求
  while (analysis.questions.length > 0) {
    const answers = await discussWithUser(analysis.questions);
    analysis.clarifiedRequirements.push(...answers);
    analysis.questions = await generateFollowUpQuestions(answers);
  }
  
  // 4. 总管输出设计文档
  const designDoc = await createDesignDocument(analysis);
  
  // 5. 用户确认
  const approved = await userApprove(designDoc);
  
  if (!approved) {
    // 返回修改
    return executeRequirementPhase(userInput);
  }
  
  return designDoc;
}
```

### 2.3 阶段 2: 架构阶段

```typescript
interface ArchitecturePhase {
  type: 'architecture';
  
  // 输入
  designDocument: DesignDocument;
  
  // 输出
  architectureDocument: {
    systemArchitecture: string;    // 系统架构
    techStack: TechStack;          // 技术栈
    moduleStructure: Module[];     // 模块结构
    interfaces: Interface[];       // 接口定义
    dataFlow: string;              // 数据流
    deploymentStrategy: string;    // 部署策略
  };
  
  // 任务链
  moduleTaskChains: Map<string, TaskChain>;
  
  // 状态
  status: 'designing' | 'reviewing' | 'completed';
}

interface Module {
  id: string;
  name: string;
  description: string;
  dependencies: string[];        // 依赖的其他模块
  
  // 任务链
  taskChain: TaskChain;
  
  // 验证要求
  requiresVisualVerification: boolean;
  technicalVerificationCriteria: string[];
  visualVerificationCriteria?: string[];
}

interface TaskChain {
  moduleId: string;
  tasks: Task[];
  
  // 并行组
  parallelGroups: TaskGroup[];
}

interface TaskGroup {
  tasks: string[];               // 可并行的任务 ID
  assignTo: ('lead_dev' | 'developer')[];
}

// 执行流程
async function executeArchitecturePhase(
  designDoc: DesignDocument
): Promise<{ architecture: ArchitectureDocument; taskChains: Map<string, TaskChain> }> {
  
  // 1. 架构师分析设计文档
  const analysis = await architectAnalyze(designDoc);
  
  // 2. 设计系统架构
  const architecture = await designArchitecture(analysis);
  
  // 3. 划分模块
  const modules = await planModules(architecture);
  
  // 4. 为每个模块设计任务链
  const taskChains = new Map<string, TaskChain>();
  
  for (const module of modules) {
    const chain = await designTaskChain(module);
    taskChains.set(module.id, chain);
  }
  
  // 5. 识别并行机会
  for (const [moduleId, chain] of taskChains) {
    chain.parallelGroups = identifyParallelGroups(chain);
  }
  
  // 6. 架构评审
  const reviewResult = await reviewArchitecture({
    architecture,
    taskChains
  });
  
  if (!reviewResult.approved) {
    // 修改架构
    return executeArchitecturePhase(designDoc);
  }
  
  return { architecture, taskChains };
}

// 识别可并行执行的任务组
function identifyParallelGroups(chain: TaskChain): TaskGroup[] {
  const groups: TaskGroup[] = [];
  const completed = new Set<string>();
  
  // 构建依赖图
  const graph = buildDependencyGraph(chain.tasks);
  
  // 拓扑排序，找出每层可并行的任务
  while (completed.size < chain.tasks.length) {
    const ready = chain.tasks.filter(t => 
      !completed.has(t.id) &&
      t.dependsOn.every(d => completed.has(d))
    );
    
    if (ready.length === 0) {
      throw new Error('Circular dependency in task chain');
    }
    
    // 按技能分组
    const bySkill = groupBySkill(ready);
    
    for (const [skill, tasks] of bySkill) {
      groups.push({
        tasks: tasks.map(t => t.id),
        assignTo: skill === 'core' ? ['lead_dev'] : ['developer', 'lead_dev']
      });
    }
    
    ready.forEach(t => completed.add(t.id));
  }
  
  return groups;
}
```

### 2.4 阶段 3: 开发阶段

```typescript
interface DevelopmentPhase {
  type: 'development';
  
  // 当前状态
  currentModule: string;
  currentTask: string;
  
  // 执行状态
  moduleStatus: Map<string, ModuleStatus>;
  taskStatus: Map<string, TaskStatus>;
  
  // 问题追踪
  issues: Issue[];
  repairs: Repair[];
}

interface ModuleStatus {
  moduleId: string;
  status: 'pending' | 'in_progress' | 'verifying' | 'completed' | 'blocked';
  
  // 进度
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  
  // 时间
  startedAt?: Date;
  completedAt?: Date;
}

interface TaskStatus {
  taskId: string;
  status: 'pending' | 'ready' | 'in_progress' | 'verifying' | 'completed' | 'failed' | 'blocked';
  
  // 执行者
  assignee: Role;
  
  // 验证
  technicalVerification?: VerificationResult;
  visualVerification?: VerificationResult;
  
  // 问题
  issues: Issue[];
  
  // 时间
  startedAt?: Date;
  completedAt?: Date;
  actualMinutes?: number;
}

// 主执行循环
async function* executeDevelopmentPhase(
  modules: Module[],
  taskChains: Map<string, TaskChain>,
  team: Team
): AsyncGenerator<DevelopmentEvent> {
  
  // 按依赖顺序排序模块
  const sortedModules = topologicalSort(modules);
  
  for (const module of sortedModules) {
    yield { type: 'module_started', module };
    
    const chain = taskChains.get(module.id)!;
    
    // 执行模块任务链
    const result = await executeModule(module, chain, team);
    
    if (!result.success) {
      yield { type: 'module_blocked', module, reason: result.reason };
      // 等待修复
      await waitForRepair(result.issues);
      // 重试模块
      continue;
    }
    
    // 模块验证
    yield { type: 'module_verifying', module };
    
    const verification = await verifyModule(module, result.artifacts);
    
    if (!verification.passed) {
      yield { type: 'module_failed', module, issues: verification.issues };
      // 主程序修复
      await leadDevRepair(verification.issues, team.leadDev);
      continue;
    }
    
    yield { type: 'module_completed', module };
  }
  
  yield { type: 'development_completed' };
}

// 执行单个模块
async function executeModule(
  module: Module,
  chain: TaskChain,
  team: Team
): Promise<ModuleResult> {
  
  const taskStatus = new Map<string, TaskStatus>();
  
  // 初始化任务状态
  for (const task of chain.tasks) {
    taskStatus.set(task.id, {
      taskId: task.id,
      status: 'pending',
      assignee: 'lead_dev',
      issues: []
    });
  }
  
  // 按并行组执行
  for (const group of chain.parallelGroups) {
    
    // 更新就绪状态
    updateReadyTasks(taskStatus, chain);
    
    // 分配任务
    const assignments = assignTasks(group, team);
    
    // 并行执行
    const results = await Promise.all(
      assignments.map(({ task, assignee }) => 
        executeTaskWithVerification(task, assignee, module)
      )
    );
    
    // 处理结果
    for (const result of results) {
      if (result.success) {
        taskStatus.get(result.taskId)!.status = 'completed';
      } else {
        taskStatus.get(result.taskId)!.status = 'failed';
        taskStatus.get(result.taskId)!.issues = result.issues;
      }
    }
  }
  
  // 检查是否所有任务完成
  const allCompleted = [...taskStatus.values()].every(s => s.status === 'completed');
  
  return {
    success: allCompleted,
    taskStatus,
    artifacts: collectArtifacts(chain)
  };
}

// 执行任务并验证
async function executeTaskWithVerification(
  task: Task,
  assignee: Role,
  module: Module
): Promise<TaskResult> {
  
  try {
    // 执行任务
    const executionResult = await executeTask(task, assignee);
    
    // 技术验证（主程序或开发员相互验证）
    const techVerification = await technicalVerify(task, executionResult, assignee);
    
    if (!techVerification.passed) {
      return {
        success: false,
        taskId: task.id,
        issues: techVerification.issues
      };
    }
    
    // 视觉验证（如需要）
    if (module.requiresVisualVerification && task.requiresVisualVerification) {
      const visualVerification = await visualVerify(task, executionResult);
      
      if (!visualVerification.passed) {
        return {
          success: false,
          taskId: task.id,
          issues: visualVerification.issues
        };
      }
    }
    
    return {
      success: true,
      taskId: task.id,
      artifacts: executionResult.artifacts
    };
    
  } catch (error) {
    return {
      success: false,
      taskId: task.id,
      issues: [{ type: 'execution_error', message: error.message }]
    };
  }
}

// 技术验证
async function technicalVerify(
  task: Task,
  result: ExecutionResult,
  verifier: Role
): Promise<VerificationResult> {
  
  const checks: CheckResult[] = [];
  
  // 构建验证
  if (task.verificationRules.build) {
    const buildCheck = await runBuildCheck(result);
    checks.push(buildCheck);
  }
  
  // 测试验证
  if (task.verificationRules.test) {
    const testCheck = await runTestCheck(result);
    checks.push(testCheck);
  }
  
  // 类型检查
  if (task.verificationRules.typeCheck) {
    const typeCheck = await runTypeCheck(result);
    checks.push(typeCheck);
  }
  
  // 代码审查
  if (task.verificationRules.codeReview) {
    const reviewCheck = await runCodeReview(result, verifier);
    checks.push(reviewCheck);
  }
  
  const passed = checks.every(c => c.passed);
  
  return {
    type: 'technical',
    passed,
    checks,
    issues: checks.filter(c => !c.passed).map(c => ({
      type: c.type,
      message: c.message
    }))
  };
}

// 视觉验证
async function visualVerify(
  task: Task,
  result: ExecutionResult
): Promise<VerificationResult> {
  
  // 生成截图/预览
  const screenshots = await captureScreenshots(result);
  
  // 美术审核
  const review = await designerReview({
    task,
    screenshots,
    criteria: task.visualVerificationCriteria || []
  });
  
  return {
    type: 'visual',
    passed: review.approved,
    issues: review.feedback
  };
}

// 修复流程
async function executeRepairFlow(
  issue: Issue,
  team: Team
): Promise<RepairResult> {
  
  // 判断问题严重程度
  const severity = assessSeverity(issue);
  
  if (severity === 'minor') {
    // 小问题：主程序直接修复
    const fix = await team.leadDev.quickFix(issue);
    return { success: fix.success, repair: fix };
  }
  
  if (severity === 'major') {
    // 大问题：主程序修复，可能需要架构师介入
    const fix = await team.leadDev.majorFix(issue);
    
    if (!fix.success) {
      // 需要架构师重新设计
      const redesign = await team.architect.redesign(issue);
      return { success: false, needsRedesign: true, redesign };
    }
    
    return { success: true, repair: fix };
  }
  
  if (severity === 'critical') {
    // 严重问题：需要架构师重新设计任务链
    const newTaskChain = await team.architect.redesignTaskChain(issue);
    return { success: false, needsNewTaskChain: true, newTaskChain };
  }
  
  return { success: false };
}
```

### 2.5 阶段 4: 整合阶段

```typescript
interface IntegrationPhase {
  type: 'integration';
  
  // 完成的模块
  completedModules: string[];
  
  // 整合状态
  status: 'pending' | 'integrating' | 'verifying' | 'completed';
  
  // 整合问题
  integrationIssues: Issue[];
}

async function executeIntegrationPhase(
  modules: Module[],
  team: Team
): Promise<IntegrationResult> {
  
  // 1. 主程序整合所有模块
  const integration = await team.leadDev.integrate(modules);
  
  // 2. 整合测试
  const integrationTests = await runIntegrationTests(integration);
  
  // 3. 整体技术验证
  const techVerification = await overallTechnicalVerification(integration);
  
  // 4. 整体视觉验证
  const visualVerification = await overallVisualVerification(integration);
  
  // 5. 处理问题
  const issues = [
    ...integrationTests.issues,
    ...techVerification.issues,
    ...visualVerification.issues
  ];
  
  if (issues.length > 0) {
    // 主程序修复
    await team.leadDev.fixIntegrationIssues(issues);
    // 重新验证
    return executeIntegrationPhase(modules, team);
  }
  
  return {
    success: true,
    artifacts: integration.artifacts
  };
}
```

### 2.6 阶段 5: 扩展阶段

```typescript
interface ExtensionPhase {
  type: 'extension';
  
  // 新需求
  newRequirement: string;
  
  // 架构师设计的任务链
  newTaskChain: TaskChain;
}

async function executeExtensionPhase(
  requirement: string,
  team: Team
): Promise<ExtensionResult> {
  
  // 1. 架构师分析新需求
  const analysis = await team.architect.analyzeExtension(requirement);
  
  // 2. 架构师设计任务链
  const taskChain = await team.architect.designExtensionTaskChain(analysis);
  
  // 3. 主程序执行任务链
  const result = await team.leadDev.executeTaskChain(taskChain);
  
  // 4. 验证
  const verification = await verifyExtension(result);
  
  if (!verification.passed) {
    await team.leadDev.fixExtensionIssues(verification.issues);
    // 重试
    return executeExtensionPhase(requirement, team);
  }
  
  return { success: true };
}
```

---

## 三、状态机设计

### 3.1 工作流状态

```typescript
interface WorkflowState {
  // 基本信息
  id: string;
  project: string;
  
  // 当前阶段
  phase: 'requirement' | 'architecture' | 'development' | 'integration' | 'extension';
  phaseStatus: PhaseStatus;
  
  // 模块状态
  modules: Map<string, ModuleStatus>;
  currentModule: string | null;
  
  // 任务状态
  tasks: Map<string, TaskStatus>;
  currentTask: string | null;
  
  // 团队
  team: Team;
  
  // 问题追踪
  issues: Issue[];
  activeRepairs: Repair[];
  
  // 时间
  startedAt: Date;
  estimatedEnd?: Date;
}

interface PhaseStatus {
  requirement: 'pending' | 'in_progress' | 'completed';
  architecture: 'pending' | 'in_progress' | 'completed';
  development: 'pending' | 'in_progress' | 'completed';
  integration: 'pending' | 'in_progress' | 'completed';
  extension: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
}
```

### 3.2 状态转换

```
                                    ┌─────────────────┐
                                    │    initial      │
                                    └────────┬────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ requirement                                                          │
│ pending ──► in_progress ──► completed                                │
└─────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ architecture                                                         │
│ pending ──► in_progress ──► completed                                │
└─────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ development                                                          │
│ pending ──► in_progress ◄──► verifying ◄──► repairing               │
│                          │              │                           │
│                          └──────────────┴──► completed              │
└─────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ integration                                                          │
│ pending ──► in_progress ◄──► verifying ◄──► repairing               │
│                          │              │                           │
│                          └──────────────┴──► completed              │
└─────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ extension (可选)                                                     │
│ not_applicable ──► pending ──► in_progress ──► completed             │
└─────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │    finished     │
                                    └─────────────────┘
```

---

## 四、验证系统设计

### 4.1 验证类型

```typescript
type VerificationType = 
  // 技术验证
  | 'build'           // 构建通过
  | 'test'            // 测试通过
  | 'type_check'      // 类型检查通过
  | 'lint'            // 代码风格通过
  | 'code_review'     // 代码审查通过
  
  // 视觉验证
  | 'ui_rendering'    // UI 渲染正确
  | 'ux_flow'         // 用户流程正确
  | 'visual_design'   // 视觉设计符合要求
  
  // 整体验证
  | 'integration'     // 集成测试通过
  | 'e2e'             // 端到端测试通过
  | 'performance';    // 性能达标

interface VerificationRule {
  type: VerificationType;
  required: boolean;
  
  // 自动验证
  command?: string;
  expectedOutput?: RegExp;
  
  // 人工验证
  checklist?: string[];
  requireApproval?: boolean;
  approvers: Role[];
}

interface VerificationResult {
  type: VerificationType;
  passed: boolean;
  message: string;
  
  // 详情
  checks?: CheckResult[];
  issues?: Issue[];
  
  // 审批
  approver?: string;
  approvedAt?: Date;
}
```

### 4.2 验证流程

```typescript
// 子任务验证
async function verifyTask(
  task: Task,
  result: ExecutionResult,
  module: Module,
  team: Team
): Promise<TaskVerificationResult> {
  
  // 1. 技术验证（执行者相互验证）
  const techVerifier = task.assignee === 'lead_dev' 
    ? team.developers[0]  // 开发员验证主程序的工作
    : team.leadDev;       // 主程序验证开发员的工作
  
  const techResult = await technicalVerification(task, result, techVerifier);
  
  if (!techResult.passed) {
    return {
      passed: false,
      technicalVerification: techResult,
      issues: techResult.issues
    };
  }
  
  // 2. 视觉验证（如需要）
  if (module.requiresVisualVerification && task.requiresVisualVerification) {
    const visualResult = await visualVerification(task, result, team.designer);
    
    if (!visualResult.passed) {
      return {
        passed: false,
        technicalVerification: techResult,
        visualVerification: visualResult,
        issues: visualResult.issues
      };
    }
    
    return {
      passed: true,
      technicalVerification: techResult,
      visualVerification: visualResult
    };
  }
  
  return {
    passed: true,
    technicalVerification: techResult
  };
}

// 模块验证
async function verifyModule(
  module: Module,
  artifacts: Artifact[]
): Promise<ModuleVerificationResult> {
  
  // 1. 模块完整性检查
  const completeness = await checkModuleCompleteness(module, artifacts);
  
  // 2. 模块集成测试
  const integration = await runModuleIntegrationTests(module);
  
  // 3. 模块技术验证（主程序）
  const techVerification = await moduleTechnicalVerification(module);
  
  // 4. 模块视觉验证（如需要）
  let visualVerification;
  if (module.requiresVisualVerification) {
    visualVerification = await moduleVisualVerification(module);
  }
  
  const allPassed = completeness.passed && 
                    integration.passed && 
                    techVerification.passed &&
                    (!module.requiresVisualVerification || visualVerification?.passed);
  
  return {
    passed: allPassed,
    completeness,
    integration,
    technicalVerification: techVerification,
    visualVerification,
    issues: collectIssues([completeness, integration, techVerification, visualVerification])
  };
}

// 整体验证
async function verifyIntegration(
  project: Project,
  team: Team
): Promise<IntegrationVerificationResult> {
  
  // 1. 构建验证
  const build = await runBuild(project);
  
  // 2. 完整测试套件
  const tests = await runFullTestSuite(project);
  
  // 3. 集成测试
  const integration = await runIntegrationTests(project);
  
  // 4. 端到端测试
  const e2e = await runE2ETests(project);
  
  // 5. 性能测试
  const performance = await runPerformanceTests(project);
  
  // 6. 整体技术验证（主程序）
  const techVerification = await overallTechnicalVerification(project, team.leadDev);
  
  // 7. 整体视觉验证（美术）
  const visualVerification = await overallVisualVerification(project, team.designer);
  
  const allPassed = build.passed &&
                    tests.passed &&
                    integration.passed &&
                    e2e.passed &&
                    performance.passed &&
                    techVerification.passed &&
                    visualVerification.passed;
  
  return {
    passed: allPassed,
    build,
    tests,
    integration,
    e2e,
    performance,
    technicalVerification: techVerification,
    visualVerification,
    issues: collectIssues([build, tests, integration, e2e, performance, techVerification, visualVerification])
  };
}
```

---

## 五、修复系统设计

### 5.1 问题分级

```typescript
type IssueSeverity = 'minor' | 'major' | 'critical';

interface Issue {
  id: string;
  type: string;
  severity: IssueSeverity;
  description: string;
  
  // 来源
  source: {
    phase: string;
    module?: string;
    task?: string;
    verification: VerificationType;
  };
  
  // 状态
  status: 'open' | 'in_progress' | 'resolved' | 'blocked';
  
  // 修复
  assignedTo?: Role;
  repair?: Repair;
}

function assessSeverity(issue: Issue): IssueSeverity {
  // 构建失败
  if (issue.type === 'build_error') return 'major';
  
  // 测试失败
  if (issue.type === 'test_failure') {
    // 核心功能测试失败
    if (issue.source.module === 'core') return 'major';
    return 'minor';
  }
  
  // 类型错误
  if (issue.type === 'type_error') return 'minor';
  
  // 视觉问题
  if (issue.type === 'visual_issue') return 'minor';
  
  // 设计问题
  if (issue.type === 'design_flaw') return 'critical';
  
  // 架构问题
  if (issue.type === 'architecture_issue') return 'critical';
  
  return 'minor';
}
```

### 5.2 修复流程

```typescript
async function executeRepair(
  issue: Issue,
  team: Team
): Promise<RepairResult> {
  
  const severity = assessSeverity(issue);
  
  switch (severity) {
    
    case 'minor': {
      // 主程序直接修复
      const repair = await team.leadDev.minorRepair(issue);
      
      // 验证修复
      const verification = await verifyRepair(repair);
      
      if (verification.passed) {
        issue.status = 'resolved';
        return { success: true, repair };
      }
      
      // 修复失败，升级
      issue.severity = 'major';
      return executeRepair(issue, team);
    }
    
    case 'major': {
      // 主程序修复，可能需要架构师指导
      const repair = await team.leadDev.majorRepair(issue);
      
      if (!repair.success) {
        // 需要架构师介入
        const architectGuidance = await team.architect.provideGuidance(issue);
        repair.guidance = architectGuidance;
      }
      
      const verification = await verifyRepair(repair);
      
      if (verification.passed) {
        issue.status = 'resolved';
        return { success: true, repair };
      }
      
      // 修复失败，升级
      issue.severity = 'critical';
      return executeRepair(issue, team);
    }
    
    case 'critical': {
      // 需要架构师重新设计
      const redesign = await team.architect.redesignForIssue(issue);
      
      // 主程序执行新设计
      const implementation = await team.leadDev.implementRedesign(redesign);
      
      const verification = await verifyRepair(implementation);
      
      if (verification.passed) {
        issue.status = 'resolved';
        return { success: true, repair: implementation };
      }
      
      // 仍然失败，需要人工介入
      issue.status = 'blocked';
      return { success: false, issue };
    }
  }
}
```

---

## 六、任务链设计规范

### 6.1 任务定义

```typescript
interface Task {
  // 基本信息
  id: string;                    // T1.1, T1.2, ...
  title: string;
  description: string;
  
  // 归属
  module: string;
  phase: string;
  
  // 依赖
  dependsOn: string[];
  
  // 执行
  estimatedMinutes: number;
  assignTo: 'lead_dev' | 'developer' | 'either';
  canParallelize: boolean;
  
  // 验证
  verificationRules: {
    build: boolean;
    test: boolean;
    typeCheck: boolean;
    lint: boolean;
    codeReview: boolean;
    requiresVisualVerification: boolean;
  };
  
  // 验收标准
  acceptanceCriteria: string[];
  
  // 输出
  expectedOutputs: string[];
}
```

### 6.2 任务链示例

```yaml
# 模块: 侧边栏 (Sidebar)
module:
  id: M2
  name: Sidebar Module
  requiresVisualVerification: true
  
taskChain:
  - id: T2.1
    title: 开发侧边栏组件 (Sidebar)
    estimatedMinutes: 90
    assignTo: lead_dev
    dependsOn: [T1.5]
    canParallelize: false
    verificationRules:
      build: true
      test: false
      typeCheck: true
      lint: true
      codeReview: false
      requiresVisualVerification: true
    acceptanceCriteria:
      - 侧边栏正常显示
      - 菜单项可点击切换
      - 折叠/展开动画流畅
      - 当前页面菜单高亮
    expectedOutputs:
      - src/components/Layout/Sidebar.tsx
  
  - id: T2.2
    title: 开发顶部栏组件 (Header)
    estimatedMinutes: 60
    assignTo: developer
    dependsOn: [T1.5]
    canParallelize: true  # 可与 T2.1 并行
    verificationRules:
      build: true
      test: false
      typeCheck: true
      lint: true
      codeReview: true
      requiresVisualVerification: true
    acceptanceCriteria:
      - 顶部栏正确显示
      - 页面标题随路由切换
      - 折叠按钮正常工作
    expectedOutputs:
      - src/components/Layout/Header.tsx
  
  - id: T2.3
    title: 开发内容区组件 (Content)
    estimatedMinutes: 30
    assignTo: developer
    dependsOn: [T1.5]
    canParallelize: true
    verificationRules:
      build: true
      test: false
      typeCheck: true
      lint: true
      codeReview: false
      requiresVisualVerification: false
    acceptanceCriteria:
      - 内容区正常显示
      - 路由切换正常
    expectedOutputs:
      - src/components/Layout/Content.tsx
  
  - id: T2.4
    title: 组合主布局
    estimatedMinutes: 60
    assignTo: lead_dev
    dependsOn: [T2.1, T2.2, T2.3]
    canParallelize: false
    verificationRules:
      build: true
      test: true
      typeCheck: true
      lint: true
      codeReview: true
      requiresVisualVerification: true
    acceptanceCriteria:
      - 布局正确显示
      - 响应式适配
      - 无布局溢出
    expectedOutputs:
      - src/components/Layout/index.tsx

parallelGroups:
  - tasks: [T2.1, T2.2, T2.3]  # 可并行执行
    assignTo:
      - lead_dev    # T2.1
      - developer   # T2.2
      - developer   # T2.3
```

---

## 七、命令行接口

### 7.1 命令设计

```bash
# ===== 项目管理 =====
workflow init <project>                    # 初始化项目
workflow status                             # 查看项目状态
workflow summary                            # 项目摘要

# ===== 阶段控制 =====
workflow phase                              # 查看当前阶段
workflow phase next                         # 进入下一阶段
workflow phase requirement                  # 进入需求阶段
workflow phase architecture                 # 进入架构阶段
workflow phase development                  # 进入开发阶段
workflow phase integration                  # 进入整合阶段

# ===== 模块管理 =====
workflow module list                        # 列出所有模块
workflow module show <id>                   # 查看模块详情
workflow module start <id>                  # 开始模块
workflow module verify <id>                 # 验证模块

# ===== 任务管理 =====
workflow task list                          # 列出任务
workflow task show <id>                     # 查看任务详情
workflow task start <id>                    # 开始任务
workflow task complete <id>                 # 完成任务
workflow task fail <id> <reason>            # 标记失败
workflow task next                          # 获取下一个任务

# ===== 验证 =====
workflow verify task <id>                   # 验证任务
workflow verify module <id>                 # 验证模块
workflow verify all                         # 验证所有

# ===== 修复 =====
workflow issue list                         # 列出问题
workflow issue show <id>                    # 查看问题详情
workflow issue repair <id>                  # 修复问题

# ===== 团队 =====
workflow team                               # 查看团队
workflow team assign <task> <member>        # 分配任务

# ===== 报告 =====
workflow report                             # 生成报告
workflow report progress                    # 进度报告
workflow report issues                      # 问题报告
```

### 7.2 状态输出

```
╔════════════════════════════════════════════════════════════════════════╗
║  Turbo-UI 项目状态                                                      ║
╠════════════════════════════════════════════════════════════════════════╣
║  阶段: 开发阶段 (Development)                                           ║
║  当前模块: M2 - 侧边栏模块                                              ║
║  当前任务: T2.1 - 开发侧边栏组件                                        ║
╠════════════════════════════════════════════════════════════════════════╣
║  模块进度:                                                              ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │ M1 项目初始化     ████████████████████ 100%  ✅ 完成            │   ║
║  │ M2 侧边栏模块     ████████░░░░░░░░░░░░  40%  🔄 进行中          │   ║
║  │ M3 核心页面       ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ 等待中          │   ║
║  │ M4 状态管理       ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ 等待中          │   ║
║  │ M5 后端集成       ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ 等待中          │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
╠════════════════════════════════════════════════════════════════════════╣
║  当前任务详情:                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │ T2.1 开发侧边栏组件 (Sidebar)                                    │   ║
║  │                                                                 │   ║
║  │ 状态: 🔄 进行中          分配: 主程序                            │   ║
║  │ 开始: 10:30              预计: 12:00 (剩 30min)                 │   ║
║  │                                                                 │   ║
║  │ 验收标准:                                                       │   ║
║  │   [ ] 侧边栏正常显示                                            │   ║
║  │   [ ] 菜单项可点击切换                                          │   ║
║  │   [ ] 折叠/展开动画流畅                                          │   ║
║  │   [ ] 当前页面菜单高亮                                          │   ║
║  │                                                                 │   ║
║  │ 验证要求:                                                       │   ║
║  │   • 构建 ✅        • 类型检查 ⏳                                 │   ║
║  │   • 测试 ⏳        • 视觉验证 ⏳                                 │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
╠════════════════════════════════════════════════════════════════════════╣
║  并行任务 (可执行):                                                     ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │ T2.2 开发顶部栏组件 (Header)      60min    可分配: 开发员        │   ║
║  │ T2.3 开发内容区组件 (Content)     30min    可分配: 开发员        │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
╠════════════════════════════════════════════════════════════════════════╣
║  问题追踪: 0 个问题                                                     ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## 八、文件结构

```
project/
├── .workflow/
│   ├── config.yaml              # 工作流配置
│   ├── state.json               # 当前状态
│   ├── history/                 # 历史记录
│   │   ├── 2026-04-01.json
│   │   └── ...
│   └── reports/                 # 报告
│       ├── progress-2026-04-01.md
│       └── ...
│
├── planning/
│   ├── design-document.md       # 设计文档（总管输出）
│   ├── architecture.md          # 架构文档（架构师输出）
│   ├── task-chains/             # 任务链定义
│   │   ├── M1-initialization.yaml
│   │   ├── M2-sidebar.yaml
│   │   └── ...
│   └── TEAM_WORKFLOW_DESIGN.md  # 本文档
│
├── memory/                      # 项目记忆
│   ├── MEMORY.md
│   ├── project/
│   ├── standards/
│   ├── patterns/
│   └── lessons/
│
└── src/                         # 源代码
    └── ...
```

---

## 九、实施计划

### Phase 1: 核心框架 (Week 1)

- 定义核心类型
- 实现状态机
- 实现 CLI 基础命令

### Phase 2: 阶段实现 (Week 2)

- 实现需求阶段
- 实现架构阶段
- 实现开发阶段核心流程

### Phase 3: 验证系统 (Week 3)

- 实现技术验证
- 实现视觉验证
- 实现修复流程

### Phase 4: 整合与扩展 (Week 4)

- 实现整合阶段
- 实现扩展阶段
- 完善报告系统

### Phase 5: 测试与优化 (Week 5)

- 集成测试
- 性能优化
- 文档完善

---

## 附录：与现有体系对比

| 维度 | 现有体系 | 新设计 | 改进 |
|------|---------|--------|------|
| 角色分工 | 隐式定义 | 显式定义 + 权限 | 明确职责 |
| 阶段划分 | 模糊 | 5个清晰阶段 | 流程清晰 |
| 验证机制 | 人工双验证 | 自动 + 人工 | 效率提升 |
| 问题处理 | 手动 | 分级自动处理 | 响应更快 |
| 状态追踪 | Markdown 文档 | JSON 状态机 | 实时准确 |
| 并行执行 | 手动协调 | 自动识别调度 | 效率提升 |