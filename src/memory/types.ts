/**
 * Memory System - 类型定义
 */

/**
 * 项目记忆
 */
export interface ProjectMemory {
  [role: string]: RoleMemory;
}

/**
 * 角色记忆
 */
export interface RoleMemory {
  /** 工作记忆 */
  working: WorkingMemory;
  /** 长期记忆 */
  longTerm: LongTermMemory;
  /** 会话记录 */
  sessions: SessionRecord[];
}

/**
 * 工作记忆
 */
export interface WorkingMemory {
  /** 当前任务 ID */
  currentTask: string | null;
  /** 最近操作 */
  recentActions: Action[];
  /** 上下文数据 */
  context: Record<string, unknown>;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 长期记忆
 */
export interface LongTermMemory {
  [category: string]: MemoryEntry[];
}

/**
 * 记忆条目
 */
export interface MemoryEntry {
  /** ID */
  id: string;
  /** 类型 */
  type: string;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 标签 */
  tags: string[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 操作记录
 */
export interface Action {
  /** 操作类型 */
  type: string;
  /** 描述 */
  description: string;
  /** 时间戳 */
  timestamp: string;
  /** 结果 */
  result?: string;
}

/**
 * 会话记录
 */
export interface SessionRecord {
  /** 会话 ID */
  id: string;
  /** 开始时间 */
  startedAt: string;
  /** 结束时间 */
  endedAt?: string;
  /** 任务数量 */
  taskCount: number;
  /** 完成数量 */
  completedCount: number;
}