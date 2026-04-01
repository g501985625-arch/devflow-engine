/**
 * DevFlow Engine - Agents API 路由
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { DevFlowEngine } from '../../core/Engine.js';
import type { ApiResponse } from '../types.js';

export async function registerAgentsRoutes(
  fastify: FastifyInstance,
  engine: DevFlowEngine
): Promise<void> {
  function successResponse<T>(data: T): ApiResponse<T> {
    return { success: true, data };
  }

  function errorResponse(error: string, errorCode?: string): ApiResponse {
    return { success: false, error, errorCode };
  }

  /**
 * GET /api/agents - Agent 状态列表
   */
  fastify.get('/api/agents', async (_request: FastifyRequest, _reply: FastifyReply) => {
    const agentManager = engine.getAgentManager();

    if (!agentManager) {
      return errorResponse('AgentManager not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    // 获取 Agent 状态 (使用 getState 方法)
    const state = engine.getState();

    return successResponse({
      agents: state.activeSessions.map((sessionId) => ({
        id: sessionId,
        status: 'active',
      })),
      total: state.activeSessions.length,
    });
  });

  /**
   * GET /api/agents/:id - Agent 详情
   */
  fastify.get(
    '/api/agents/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) => {
      const agentManager = engine.getAgentManager();

      if (!agentManager) {
        return errorResponse('AgentManager not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { id } = request.params;

      // 检查 session 是否存在
      const state = engine.getState();
      const exists = state.activeSessions.includes(id);

      if (!exists) {
        return errorResponse(`Agent session not found: ${id}`, 'SESSION_NOT_FOUND');
      }

      return successResponse({
        id,
        status: 'active',
      });
    }
  );
}