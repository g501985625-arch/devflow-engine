/**
 * DevFlow Engine - 常量定义
 */

// ========================================
// Phase 常量
// ========================================

export const PHASES = {
  REQUIREMENT: 'requirement',
  ARCHITECTURE: 'architecture',
  DEVELOPMENT: 'development',
  INTEGRATION: 'integration',
  EXTENSION: 'extension',
} as const;

export type Phase = typeof PHASES[keyof typeof PHASES];

export const PHASE_ORDER: Phase[] = [
  PHASES.REQUIREMENT,
  PHASES.ARCHITECTURE,
  PHASES.DEVELOPMENT,
  PHASES.INTEGRATION,
  PHASES.EXTENSION,
];

// ========================================
// Role 常量
// ========================================

export const ROLES = {
  MANAGER: 'manager',
  ARCHITECT: 'architect',
  LEAD_DEV: 'lead_dev',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_NAMES: Record<Role, string> = {
  [ROLES.MANAGER]: '总管',
  [ROLES.ARCHITECT]: '架构师',
  [ROLES.LEAD_DEV]: '主程序',
  [ROLES.DEVELOPER]: '开发员',
  [ROLES.DESIGNER]: '美术',
};

// ========================================
// Task Status 常量
// ========================================

export const TASK_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
  IN_PROGRESS: 'in_progress',
  VERIFYING: 'verifying',
  COMPLETED: 'completed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// ========================================
// Issue Type 常量
// ========================================

export const ISSUE_TYPES = {
  BLOCKED_TASK: 'blocked_task',
  FAILED_TASK: 'failed_task',
  TIMEOUT_TASK: 'timeout_task',
  VERIFICATION_FAILED: 'verification_failed',
  RESOURCE_CONFLICT: 'resource_conflict',
} as const;

export type IssueType = typeof ISSUE_TYPES[keyof typeof ISSUE_TYPES];

// ========================================
// Issue Severity 常量
// ========================================

export const ISSUE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type IssueSeverity = typeof ISSUE_SEVERITY[keyof typeof ISSUE_SEVERITY];

// ========================================
// Error Code 常量
// ========================================

export const ERROR_CODES = {
  // Project errors
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_ALREADY_EXISTS: 'PROJECT_ALREADY_EXISTS',
  PROJECT_CORRUPTED: 'PROJECT_CORRUPTED',
  
  // Agent errors
  DESK_NOT_FOUND: 'DESK_NOT_FOUND',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Workflow errors
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  TASK_BLOCKED: 'TASK_BLOCKED',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  
  // Automation errors
  AUTOMATION_PAUSED: 'AUTOMATION_PAUSED',
  AUTOMATION_FAILED: 'AUTOMATION_FAILED',
  NEEDS_INTERVENTION: 'NEEDS_INTERVENTION',
  
  // Storage errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  
  // LLM errors
  LLM_API_ERROR: 'LLM_API_ERROR',
  LLM_RATE_LIMIT: 'LLM_RATE_LIMIT',
  LLM_TIMEOUT: 'LLM_TIMEOUT',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ========================================
// Default Values
// ========================================

export const DEFAULTS = {
  STORAGE_PATH: '~/.devflow',
  MAX_CONCURRENCY: 3,
  MAX_RETRIES: 3,
  TASK_TIMEOUT_MS: 300000, // 5 minutes
  MEMORY_MAX_ENTRIES: 50,
  MEMORY_MAX_AGE_DAYS: 30,
  roles: ['manager', 'architect', 'lead_dev', 'developer', 'designer'] as Role[],
};