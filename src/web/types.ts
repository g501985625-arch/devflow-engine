// API Types - matching server types

export interface Project {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  currentPhase?: string;
  currentTask?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'blocked' | 'error';
  currentTask?: string;
  lastActivity?: string;
}

export interface WorkflowState {
  id: string;
  projectId: string;
  status: 'running' | 'paused' | 'completed' | 'error';
  currentPhase: string;
  completedTasks: string[];
  pendingTasks: string[];
  progress: number;
}

// WebSocket Event Types
export type AutomationEventType =
  | 'started'
  | 'phase_started'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'phase_completed'
  | 'blocked'
  | 'needs_intervention'
  | 'paused'
  | 'completed';

export interface AutomationEvent {
  type: AutomationEventType;
  timestamp: string;
  projectId: string;
  phase?: string;
  task?: string;
  message?: string;
  data?: Record<string, unknown>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EngineStatus {
  status: 'running' | 'paused' | 'stopped' | 'error';
  uptime: number;
  projectsActive: number;
  agentsActive: number;
  lastActivity?: string;
}

export interface Config {
  projectsDir: string;
  maxConcurrentProjects: number;
  autoStart: boolean;
  logLevel: string;
}