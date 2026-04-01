/**
 * DevFlow Engine - 入口文件
 * 
 * 导出所有公开 API
 */

// Core
export { DevFlowEngine } from './core/Engine.js';
export type {
  EngineConfig,
  EngineState,
  LLMConfig,
  ProgressStats,
  TimeRange,
} from './core/types.js';
export {
  PHASES,
  ROLES,
  TASK_STATUS,
  ERROR_CODES,
  ISSUE_TYPES,
  ISSUE_SEVERITY,
  DEFAULTS,
} from './core/constants.js';
export type {
  Phase,
  Role,
  TaskStatus,
  ErrorCode,
  IssueType,
  IssueSeverity,
} from './core/constants.js';

// Project
export { ProjectManager } from './project/ProjectManager.js';
export { Project } from './project/Project.js';
export type {
  ProjectConfig,
  ProjectState,
  ProjectStatus,
  ProjectCreateOptions,
} from './project/types.js';

// Agent
export { AgentManager } from './agent/AgentManager.js';
export { Desk } from './agent/Desk.js';
export type {
  Role as AgentRole,
  DeskDefinition,
  AgentSession,
  Desk as DeskType,
  AgentContext,
} from './agent/types.js';

// Workflow
export { WorkflowEngine } from './workflow/WorkflowEngine.js';
export { TaskGraph } from './workflow/TaskGraph.js';
export { TaskLoader } from './workflow/TaskLoader.js';
export type {
  Phase as WorkflowPhase,
  Task,
  TaskStatus as WorkflowTaskStatus,
  TaskChain,
  TaskGroup,
  VerificationRules,
} from './workflow/types.js';

// Automation
export { AutomationEngine } from './automation/AutomationEngine.js';
export { SupervisorAgent } from './automation/SupervisorAgent.js';
export { Verifier } from './automation/Verifier.js';
export type {
  AutomationEvent,
  AutomationOptions,
  AutomationStatus,
  Issue,
} from './automation/types.js';

// Memory
export { MemoryStore } from './memory/MemoryStore.js';
export { DreamIntegrator } from './memory/DreamIntegrator.js';
export type {
  ProjectMemory,
  RoleMemory,
  MemoryEntry,
} from './memory/types.js';

// Storage
export { FileSystem } from './storage/FileSystem.js';
export { ConfigManager } from './storage/ConfigManager.js';
export { FileIndexer } from './storage/FileIndexer.js';
export { PathUtils } from './storage/PathUtils.js';
export { Watcher } from './storage/Watcher.js';
export { StorageLayer } from './storage/StorageLayer.js';
export type {
  FileInfo,
  FileIndex,
} from './storage/types.js';