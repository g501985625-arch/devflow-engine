/**
 * Agent Manager - 类型定义
 */

import type { Phase } from '../core/constants.js';
import type { RoleMemory } from '../memory/types.js';

/**
 * 角色
 */
export type Role = 'manager' | 'architect' | 'lead_dev' | 'developer' | 'designer';

/**
 * Agent 配置
 */
export interface AgentConfig {
  role: Role;
  name: string;
  description: string;
  capabilities: string[];
}

/**
 * 工位定义 (固定)
 */
export interface DeskDefinition {
  /** 工位 ID */
  id?: string;
  /** 工位名称 */
  name: string;
  /** 角色 */
  role: string;
  /** 描述 */
  description?: string;
  /** 系统提示 */
  systemPrompt?: string;
  /** 可用工具 */
  tools: string[];
  /** 职责定义 */
  responsibilities?: DeskResponsibilities;
  /** 能力 */
  capabilities?: string[];
}

/**
 * 工位职责
 */
export interface DeskResponsibilities {
  /** 参与阶段 */
  phases: Phase[];
  /** 可执行任务类型 */
  taskTypes: string[];
  /** 可验证类型 */
  canVerify: string[];
  /** 可修复 */
  canRepair: boolean;
}

/**
 * 工位实例
 */
export interface Desk {
  /** 工位 ID */
  id: string;
  /** 工位名称 */
  name: string;
  /** 角色 */
  role: string;
  /** 系统提示 */
  systemPrompt?: string;
  /** 可用工具 */
  tools: string[];
  /** 记忆 */
  memory?: unknown;
  /** 上下文 */
  context?: AgentContext;
}

/**
 * Agent 上下文
 */
export interface AgentContext {
  /** 项目信息 */
  project?: {
    id: string;
    name: string;
    path: string;
  };
  /** 当前任务 */
  currentTask?: {
    id: string;
    title: string;
    description: string;
  };
  /** 环境信息 */
  environment?: {
    cwd: string;
    nodeVersion: string;
    platform: string;
  };
  /** 角色记忆 */
  roleMemory?: RoleMemory;
}

/**
 * Agent 会话
 */
export interface AgentSession {
  /** 会话 ID */
  id: string;
  /** 角色 */
  role: string;
  /** 任务 ID */
  taskId: string;
  /** 工位配置 */
  desk: DeskDefinition;
  /** 状态 */
  status: string;
  /** 消息列表 */
  messages: Message[];
  /** 工具调用 */
  toolCalls: ToolCall[];
  /** 上下文 */
  context: AgentContext;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime?: string;
  /** 结果 */
  result?: unknown;
}

/**
 * 会话状态
 */
export type SessionStatus = 'pending' | 'active' | 'completed' | 'failed' | 'paused';

/**
 * 消息
 */
export interface Message {
  /** 消息 ID */
  id: string;
  /** 角色 */
  role: 'user' | 'assistant' | 'system';
  /** 内容 */
  content: string;
  /** 时间戳 */
  timestamp: string;
  /** 工具调用 */
  toolCalls?: ToolCall[];
}

/**
 * 工具调用
 */
export interface ToolCall {
  /** 工具名称 */
  name: string;
  /** 输入参数 (兼容 input 和 arguments) */
  input?: Record<string, unknown>;
  arguments?: Record<string, unknown>;
  /** 结果 */
  result?: ToolResult;
}

/**
 * 工具结果
 */
export interface ToolResult {
  /** 成功 */
  success: boolean;
  /** 输出 */
  output?: unknown;
  /** 错误 */
  error?: string;
}