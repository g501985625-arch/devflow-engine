/**
 * DevFlow Engine - Projects API 路由
 *
 * 项目管理 REST API
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { DevFlowEngine } from '../../core/Engine.js';
import type {
  ApiResponse,
  ProjectsListResponse,
  ProjectDetailResponse,
  ProjectSummary,
  CreateProjectRequest,
} from '../types.js';

/**
 * 注册 Projects 路由
 */
export async function registerProjectsRoutes(
  fastify: FastifyInstance,
  engine: DevFlowEngine
): Promise<void> {
  // 响应包装函数
  function successResponse<T>(data: T): ApiResponse<T> {
    return { success: true, data };
  }

  function errorResponse(error: string, errorCode?: string): ApiResponse {
    return { success: false, error, errorCode };
  }

  /**
   * GET /api/projects - 项目列表
   */
  fastify.get('/api/projects', async (_request: FastifyRequest, _reply: FastifyReply) => {
    const projectManager = engine.getProjectManager();

    if (!projectManager) {
      return errorResponse('ProjectManager not initialized', 'ENGINE_NOT_INITIALIZED');
    }

    const projects = await projectManager.list();

    const summaries: ProjectSummary[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.config.status,
      progress: { total: 10, completed: Math.floor(project.getProgress() / 10), failed: 0, pending: 10 - Math.floor(project.getProgress() / 10) },
      currentPhase: project.state.phase,
      createdAt: project.config.createdAt,
    }));

    return successResponse<ProjectsListResponse>({
      projects: summaries,
      total: summaries.length,
    });
  });

  /**
   * GET /api/projects/:id - 项目详情
   */
  fastify.get(
    '/api/projects/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) => {
      const projectManager = engine.getProjectManager();

      if (!projectManager) {
        return errorResponse('ProjectManager not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { id } = request.params;
      const project = projectManager.getProject(id);

      if (!project) {
        return errorResponse(`Project not found: ${id}`, 'PROJECT_NOT_FOUND');
      }

      return successResponse<ProjectDetailResponse>({
        config: project.config,
        state: project.state,
        path: project.path,
      });
    }
  );

  /**
   * POST /api/projects - 创建项目
   */
  fastify.post(
    '/api/projects',
    async (
      request: FastifyRequest<{ Body: CreateProjectRequest }>,
      _reply: FastifyReply
    ) => {
      const projectManager = engine.getProjectManager();

      if (!projectManager) {
        return errorResponse('ProjectManager not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const body = request.body;

      // 验证请求
      if (!body.name || body.name.trim() === '') {
        return errorResponse('Project name is required', 'INVALID_REQUEST');
      }

      // 创建项目
      const project = await projectManager.create({
        name: body.name,
        description: body.description,
        template: body.template,
        requirement: body.requirement,
      });

      return successResponse({
        id: project.id,
        name: project.name,
        status: project.config.status,
        createdAt: project.config.createdAt,
      });
    }
  );

  /**
   * DELETE /api/projects/:id - 删除项目
   */
  fastify.delete(
    '/api/projects/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) => {
      const projectManager = engine.getProjectManager();

      if (!projectManager) {
        return errorResponse('ProjectManager not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { id } = request.params;
      const project = projectManager.getProject(id);

      if (!project) {
        return errorResponse(`Project not found: ${id}`, 'PROJECT_NOT_FOUND');
      }

      await projectManager.delete(id);

      return successResponse({
        deleted: true,
        id,
      });
    }
  );

  /**
   * PUT /api/projects/:id/status - 更新项目状态
   */
  fastify.put(
    '/api/projects/:id/status',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>,
      _reply: FastifyReply
    ) => {
      const projectManager = engine.getProjectManager();

      if (!projectManager) {
        return errorResponse('ProjectManager not initialized', 'ENGINE_NOT_INITIALIZED');
      }

      const { id } = request.params;
      const { status } = request.body;

      const validStatuses = ['initialized', 'in_progress', 'paused', 'completed', 'failed'];

      if (!validStatuses.includes(status)) {
        return errorResponse(`Invalid status: ${status}`, 'INVALID_REQUEST');
      }

      const project = projectManager.getProject(id);

      if (!project) {
        return errorResponse(`Project not found: ${id}`, 'PROJECT_NOT_FOUND');
      }

      await projectManager.updateStatus(id, status as 'initialized' | 'in_progress' | 'paused' | 'completed' | 'failed');

      return successResponse({
        id,
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  );
}