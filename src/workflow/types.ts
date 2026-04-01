/**
 * Workflow Engine - 类型定义
 */

import type { Phase, TaskStatus } from '../core/constants.js';
import type { ProgressStats } from '../core/types.js';

// 导出 Phase 和 TaskStatus 供外部使用
export { Phase, TaskStatus };
import type { Role } from '../agent/types.js';

/**
 * 任务
 */
export interface Task {
  /** 任务 ID */
  id: string;
  /** 任务标题 */
  title: string;
  /** 任务描述 */
  description: string;
  /** 所属模块 */
  module: string;
  /** 所属阶段 */
  phase: Phase;
  
  /** 依赖任务 */
  dependsOn: string[];
  
  /** 预估时间 (分钟) */
  estimatedMinutes: number;
  /** 分配角色 */
  assignTo: Role;
  /** 可并行 */
  canParallelize: boolean;
  
  /** 验证规则 */
  verificationRules: VerificationRules;
  /** 验收标准 */
  acceptanceCriteria: string[];
  /** 预期输出 */
  expectedOutputs: string[];
  
  /** 任务状态 */
  status: TaskStatus;
}

/**
 * 验证规则
 */
export interface VerificationRules {
  /** 构建验证 */
  build: boolean;
  /** 测试验证 */
  test: boolean;
  /** Lint 验证 */
  lint: boolean;
  /** 类型检查 */
  typeCheck: boolean;
  /** 交叉验证 */
  crossReview: boolean;
  /** 人工确认 */
  manualApproval: boolean;
}

/**
 * 任务链
 */
export interface TaskChain {
  /** 任务链 ID */
  id: string;
  /** 模块 ID */
  moduleId: string;
  /** 任务列表 */
  tasks: Task[];
  /** 并行组 */
  parallelGroups: TaskGroup[];
}

/**
 * 任务组 (可并行)
 */
export interface TaskGroup {
  /** 任务 ID 列表 */
  tasks: string[];
  /** 需要角色 */
  requiredRole: Role;
  /** 可并行 */
  canParallelize: boolean;
}

/**
 * 工作流状态
 */
export interface WorkflowStatus {
  /** 项目 ID */
  projectId: string;
  /** 当前阶段 */
  currentPhase: Phase;
  /** 当前任务 */
  currentTask: string | null;
  /** 进度 */
  progress: ProgressStats;
  /** 状态 */
  status: WorkflowState;
  /** 阻塞问题 */
  blockers: string[];
}

/**
 * 工作流状态枚举
 */
export type WorkflowState = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'blocked';