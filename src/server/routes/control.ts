/**
 * DevFlow Engine - Control API 路由
 *
 * 启动/暂停/恢复/关闭控制
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { DevFlowEngine } from '../../core/Engine.js';
import type { ApiResponse } from '../types.js';
import type { Task } from '../../workflow/types.js';
import { broadcastAutomationEvent } from '../websocket.js';

export async function registerControlRoutes(
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
   * POST /api/control/start - 启动自动化
   */
  fastify.post(
    '/api/control/start',
    async (request: FastifyRequest<{ Body: { projectId: string } }>, _reply: FastifyReply) => {
      if (!engine.isInitialized()) {
        return errorResponse('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { projectId } = request.body;
      const automationEngine = engine.getAutomationEngine();

      if (!automationEngine) {
        return errorResponse('AutomationEngine not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      // 异步启动自动化循环
      (async () => {
        try {
          for await (const event of automationEngine.run(projectId)) {
            broadcastAutomationEvent(event);
          }
        } catch (error) {
          const systemTask: Task = {
            id: 'system',
            title: 'System',
            description: 'System error',
            module: 'server',
            phase: 'development',
            dependsOn: [],
            estimatedMinutes: 0,
            assignTo: 'manager',
            canParallelize: false,
            verificationRules: { build: false, test: false, lint: false, typeCheck: false, crossReview: false, manualApproval: false },
            acceptanceCriteria: [],
            expectedOutputs: [],
            status: 'pending',
          };
          broadcastAutomationEvent({
            type: 'task_failed',
            task: systemTask,
            error: (error as Error).message,
          });
        }
      })();

      return successResponse({
        started: true,
        projectId,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * POST /api/control/pause - 暂停自动化
   */
  fastify.post('/api/control/pause', async (_request: FastifyRequest, _reply: FastifyReply) => {
    if (!engine.isInitialized()) {
      return errorResponse('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    engine.pauseAutomation();

    broadcastAutomationEvent({ type: 'paused' });

    return successResponse({
      paused: true,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /api/control/resume - 恢复自动化
   */
  fastify.post('/api/control/resume', async (_request: FastifyRequest, _reply: FastifyReply) => {
    if (!engine.isInitialized()) {
      return errorResponse('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    engine.resumeAutomation();

    return successResponse({
      resumed: true,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /api/control/shutdown - 关闭 Engine
   */
  fastify.post('/api/control/shutdown', async (_request: FastifyRequest, _reply: FastifyReply) => {
    if (!engine.isInitialized()) {
      return errorResponse('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    await engine.shutdown();

    return successResponse({
      shutdown: true,
      timestamp: new Date().toISOString(),
    });
  });
}