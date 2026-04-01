/**
 * DevFlow Engine - 核心类型定义
 */

// ========================================
// Engine Types
// ========================================

/**
 * 引擎配置
 */
export interface EngineConfig {
  /** 项目路径 */
  projectPath: string;
  /** 根存储路径 */
  storagePath: string;
  /** 模板路径 (可选) */
  templatesPath?: string;
  /** LLM 配置 */
  llm: LLMConfig;
}

/**
 * LLM 配置
 */
export interface LLMConfig {
  /** LLM 提供商 */
  provider: 'anthropic' | 'openai' | 'local';
  /** API Key (可选，可能从环境变量读取) */
  apiKey?: string;
  /** API Base URL (可选) */
  baseUrl?: string;
  /** 模型名称 */
  model: string;
}

/**
 * 引擎状态
 */
export interface EngineState {
  /** 是否已初始化 */
  initialized: boolean;
  /** 当前项目 ID */
  currentProject: string | null;
  /** 活跃会话列表 */
  activeSessions: string[];
}

// ========================================
// Common Types
// ========================================

/**
 * 通用结果类型
 */
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

/**
 * 进度统计
 */
export interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  percentage: number;
}

/**
 * 时间范围
 */
export interface TimeRange {
  start: Date;
  end?: Date;
}