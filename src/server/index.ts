/**
 * DevFlow Engine - Server 入口
 *
 * Fastify HTTP + WebSocket 服务
 */

import Fastify from 'fastify';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import websocketPlugin from '@fastify/websocket';
import corsPlugin from '@fastify/cors';
import type { ServerConfig, ApiResponse } from './types.js';
import { DevFlowEngine } from '../core/Engine.js';
import { setupWebSocket, broadcastEvent } from './websocket.js';
import { registerProjectsRoutes } from './routes/projects.js';
import { registerWorkflowRoutes } from './routes/workflow.js';
import { registerAgentsRoutes } from './routes/agents.js';
import { registerControlRoutes } from './routes/control.js';

/**
 * 创建 Server 实例
 */
export async function createServer(config: ServerConfig): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: 'info',
    },
  });

  // 注册 WebSocket 插件
  await fastify.register(websocketPlugin);

  // 注册 CORS 插件
  await fastify.register(corsPlugin, {
    origin: config.cors?.origin ?? '*',
    methods: config.cors?.methods ?? ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: config.cors?.allowedHeaders ?? ['Content-Type', 'Authorization'],
  });

  // 获取 Engine 实例
  const engine = DevFlowEngine.getInstance();

  // 响应包装函数
  function successResponse<T>(data: T): ApiResponse<T> {
    return { success: true, data };
  }

  function errorResponse(error: string, errorCode?: string): ApiResponse {
    return { success: false, error, errorCode };
  }

  // 根路由 - 健康检查
  fastify.get('/', async (_request: FastifyRequest, _reply: FastifyReply) => {
    return successResponse({
      name: 'DevFlow Engine',
      version: '0.1.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    });
  });

  // API 状态路由
  fastify.get('/api/status', async (_request: FastifyRequest, _reply: FastifyReply) => {
    if (!engine.isInitialized()) {
      return errorResponse('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    const state = engine.getState();
    const engineConfig = engine.getConfig();

    return successResponse({
      state,
      config: engineConfig,
      initialized: true,
    });
  });

  // API 配置路由
  fastify.get('/api/config', async (_request: FastifyRequest, _reply: FastifyReply) => {
    if (!engine.isInitialized()) {
      return errorResponse('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    const engineConfig = engine.getConfig();
    return successResponse(engineConfig);
  });

  // 注册业务路由
  await registerProjectsRoutes(fastify, engine);
  await registerWorkflowRoutes(fastify, engine);
  await registerAgentsRoutes(fastify, engine);
  await registerControlRoutes(fastify, engine);

  // 设置 WebSocket
  setupWebSocket(fastify, engine);

  // 错误处理
  fastify.setErrorHandler((error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.error(error);

    // 判断是否为已知错误
    const knownErrors = [
      'PROJECT_NOT_FOUND',
      'DESK_NOT_FOUND',
      'SESSION_NOT_FOUND',
      'TASK_NOT_FOUND',
      'AUTOMATION_PAUSED',
      'ENGINE_NOT_INITIALIZED',
    ];

    const errorCode = knownErrors.find(code => error.message.includes(code));

    reply.status(500).send(errorResponse(error.message, errorCode));
  });

  // 启动服务器
  await fastify.listen({ port: config.port, host: config.host });

  fastify.log.info(`DevFlow Server running on http://${config.host}:${config.port}`);

  return fastify;
}

/**
 * 关闭 Server
 */
export async function closeServer(fastify: FastifyInstance): Promise<void> {
  await fastify.close();
}

/**
 * 广播事件到 WebSocket 客户端
 */
export function notifyClients(event: { type: string; data?: unknown }): void {
  broadcastEvent({
    type: event.type as 'started' | 'task_started' | 'task_completed' | 'task_failed' | 'paused' | 'completed' | 'heartbeat' | 'error',
    timestamp: new Date().toISOString(),
    data: event.data,
  });
}

/**
 * 默认 Server 配置
 */
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3000,
  host: 'localhost',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  websocket: {
    path: '/ws',
    heartbeat: 30000,
  },
};