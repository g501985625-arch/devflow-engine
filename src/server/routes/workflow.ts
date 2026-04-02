/**
 * DevFlow Engine - Workflow API 路由
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { DevFlowEngine } from '../../core/Engine.js';
import type { ApiResponse } from '../types.js';

// 默认工作流阶段定义
const DEFAULT_PHASES = [
  { id: 'requirement', name: '需求阶段', status: 'pending' },
  { id: 'architecture', name: '架构阶段', status: 'pending' },
  { id: 'ui_design', name: 'UI设计阶段', status: 'pending' },
  { id: 'development', name: '开发阶段', status: 'pending' },
  { id: 'integration', name: '整合阶段', status: 'pending' },
  { id: 'extension', name: '扩展阶段', status: 'pending' },
];

export async function registerWorkflowRoutes(
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
   * GET /api/workflow/phases - 获取工作流阶段定义
   */
  fastify.get(
    '/api/workflow/phases',
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return successResponse({
        phases: DEFAULT_PHASES,
        total: DEFAULT_PHASES.length,
      });
    }
  );

  /**
   * GET /api/workflow/:projectId - 工作流状态
   */
  fastify.get(
    '/api/workflow/:projectId',
    async (request: FastifyRequest<{ Params: { projectId: string } }>, _reply: FastifyReply) => {
      const workflowEngine = engine.getWorkflowEngine();

      if (!workflowEngine) {
        return errorResponse('WorkflowEngine not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { projectId } = request.params;
      const projectManager = engine.getProjectManager();

      if (!projectManager) {
        return errorResponse('ProjectManager not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const project = projectManager.getProject(projectId);

      if (!project) {
        return errorResponse(`Project not found: ${projectId}`, 'PROJECT_NOT_FOUND');
      }

      // 返回工作流状态
      return successResponse({
        projectId,
        currentPhase: project.state.phase,
        workflowConfig: project.config.workflow,
        state: project.state,
      });
    }
  );

  /**
   * GET /api/workflow/:projectId/tasks - 任务列表
   */
  fastify.get(
    '/api/workflow/:projectId/tasks',
    async (request: FastifyRequest<{ Params: { projectId: string } }>, _reply: FastifyReply) => {
      const workflowEngine = engine.getWorkflowEngine();

      if (!workflowEngine) {
        return errorResponse('WorkflowEngine not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { projectId } = request.params;

      // 获取任务列表
      const taskGraph = workflowEngine.getTaskGraph(projectId);

      if (!taskGraph) {
        return successResponse({
          projectId,
          tasks: [],
          total: 0,
        });
      }

      const stats = taskGraph.getStats();

      return successResponse({
        projectId,
        stats,
      });
    }
  );
}