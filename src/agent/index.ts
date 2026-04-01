/**
 * Agent Manager - 入口
 */

export { AgentManager } from './AgentManager.js';
export { Desk } from './Desk.js';

export type {
  Role,
  Desk as DeskType,
  DeskDefinition,
  AgentSession,
  AgentConfig,
  AgentContext,
  Message,
  ToolCall,
  ToolResult,
  SessionStatus,
} from './types.js';