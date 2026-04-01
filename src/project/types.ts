/**
 * Project Manager - 类型定义
 */

import type { Phase } from '../core/constants.js';
import type { ProgressStats } from '../core/types.js';

/**
 * 项目配置
 */
export interface ProjectConfig {
  /** 项目 ID */
  id: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description?: string;
  /** 创建时间 */
  createdAt: string;
  /** 项目状态 */
  status: ProjectStatus;
  
  /** 工作流配置 */
  workflow: WorkflowConfig;
  /** 团队配置 */
  team: TeamConfig;
  /** 验证配置 */
  verification: VerificationConfig;
}

/**
 * 项目状态枚举
 */
export type ProjectStatus = 
  | 'initialized'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'failed';

/**
 * 项目状态
 */
export interface ProjectState {
  /** 当前阶段 */
  phase: Phase;
  /** 当前模块 */
  module: string | null;
  /** 当前任务 */
  task: string | null;
  /** 进度统计 */
  progress: ProgressStats;
}

/**
 * 项目创建选项
 */
export interface ProjectCreateOptions {
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description?: string;
  /** 使用模板 */
  template?: string;
  /** 初始需求 */
  requirement?: string;
}

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  /** 当前阶段 */
  currentPhase: Phase;
  /** 阶段列表 */
  phases: PhaseConfig[];
}

/**
 * 阶段配置
 */
export interface PhaseConfig {
  /** 阶段 ID */
  id: Phase;
  /** 阶段名称 */
  name: string;
  /** 阶段状态 */
  status: PhaseStatus;
}

/**
 * 阶段状态
 */
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * 团队配置
 */
export interface TeamConfig {
  /** 角色列表 */
  roles: string[];
}

/**
 * 验证配置
 */
export interface VerificationConfig {
  /** 自动构建验证 */
  autoBuild: boolean;
  /** 自动测试验证 */
  autoTest: boolean;
  /** 需要代码审查 */
  requireCodeReview: boolean;
  /** 需要视觉验证 */
  requireVisualVerification: boolean;
}