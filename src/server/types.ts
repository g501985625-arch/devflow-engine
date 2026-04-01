/**
 * DevFlow Engine - Server 类型定义
 */

import type { ProjectConfig, ProjectState } from '../project/types.js';

/**
 * Server 配置
 */
export interface ServerConfig {
  port: number;
  host: string;
  cors?: CorsConfig;
  websocket?: WebSocketConfig;
}

export interface CorsConfig {
  origin: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
}

export interface WebSocketConfig {
  path: string;
  heartbeat?: number;
}

/**
 * API 响应包装
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * 项目摘要
 */
export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  progress: { total: number; completed: number; failed: number; pending: number };
  currentPhase: string;
  createdAt: string;
}

/**
 * 项目列表响应
 */
export interface ProjectsListResponse {
  projects: ProjectSummary[];
  total: number;
}

/**
 * 项目详情响应
 */
export interface ProjectDetailResponse {
  config: ProjectConfig;
  state: ProjectState;
  path: string;
}

/**
 * 创建项目请求
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  template?: string;
  requirement?: string;
}

/**
 * WebSocket 事件
 */
export interface WsEvent {
  type: string;
  timestamp: string;
  data?: unknown;
}

/**
 * WebSocket 消息
 */
export interface WsMessage {
  type: 'ping' | 'subscribe' | 'get_status';
  projectId?: string;
}