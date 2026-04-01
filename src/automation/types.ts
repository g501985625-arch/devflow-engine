/**
 * Automation Engine - 类型定义
 */

import type { Task } from '../workflow/types.js';
import type { IssueSeverity, IssueType } from '../core/constants.js';

/**
 * 自动化事件
 */
export type AutomationEvent =
  | { type: 'started'; projectId: string }
  | { type: 'phase_started'; phase: string }
  | { type: 'task_started'; task: Task }
  | { type: 'task_completed'; task: Task; result: TaskResult }
  | { type: 'task_failed'; task: Task; error: string }
  | { type: 'phase_completed'; phase: string }
  | { type: 'blocked'; blockers: Issue[] }
  | { type: 'needs_intervention'; task: Task; reason: string }
  | { type: 'paused' }
  | { type: 'completed'; projectId: string };

/**
 * 任务结果
 */
export interface TaskResult {
  /** 成功 */
  success: boolean;
  /** 输出 */
  output?: unknown;
  /** 错误 */
  error?: string;
  /** 耗时 (毫秒) */
  durationMs: number;
  /** 修改文件 */
  modifiedFiles: string[];
}

/**
 * 自动化选项
 */
export interface AutomationOptions {
  /** 自动修复 */
  autoRepair: boolean;
  /** 自动重试 */
  autoRetry: boolean;
  /** 最大重试次数 */
  maxRetries: number;
  /** 报告间隔 (秒) */
  reportInterval: number;
  /** 问题通知 */
  notifyOnIssue: boolean;
}

/**
 * 问题
 */
export interface Issue {
  /** 问题 ID */
  id: string;
  /** 问题类型 */
  type: IssueType;
  /** 严重程度 */
  severity: IssueSeverity;
  /** 关联任务 */
  taskId?: string;
  /** 描述 */
  description: string;
  /** 建议操作 */
  suggestedAction: string;
  /** 状态 */
  status: IssueStatus;
}

/**
 * 问题状态
 */
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

/**
 * 自动化状态
 */
export interface AutomationStatus {
  /** 项目 ID */
  projectId: string;
  /** 运行状态 */
  running: boolean;
  /** 当前任务 */
  currentTask: string | null;
  /** 已完成任务数 */
  completedCount: number;
  /** 失败任务数 */
  failedCount: number;
  /** 问题列表 */
  issues: Issue[];
  /** 开始时间 */
  startedAt: Date | null;
  /** 预计完成时间 */
  estimatedCompletion: Date | null;
}