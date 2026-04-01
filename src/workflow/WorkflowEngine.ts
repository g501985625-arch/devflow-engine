/**
 * Workflow Engine - WorkflowEngine
 * 
 * 工作流引擎实现
 * 
 * @module workflow
 */

import type { WorkflowStatus, Task, TaskChain } from './types.js';
import { TaskGraph } from './TaskGraph.js';
import { Project } from '../project/Project.js';

/**
 * WorkflowEngine - 工作流引擎
 */
export class WorkflowEngine {
  private graphs: Map<string, TaskGraph> = new Map();
  
  /**
   * 启动工作流
   */
  async start(projectId: string): Promise<void> {
    // 创建任务图
    const graph = new TaskGraph();
    this.graphs.set(projectId, graph);
    
    // TODO: 加载任务链
    // const chain = await this.loadTaskChain(projectId);
    // graph.load(chain);
  }
  
  /**
   * 暂停工作流
   */
  async pause(projectId: string): Promise<void> {
    // TODO: 暂停执行
    console.warn(`Pausing workflow for project ${projectId}`);
  }
  
  /**
   * 恢复工作流
   */
  async resume(projectId: string): Promise<void> {
    // TODO: 恢复执行
    console.warn(`Resuming workflow for project ${projectId}`);
  }
  
  /**
   * 获取工作流状态
   */
  async getStatus(projectId: string): Promise<WorkflowStatus> {
    return {
      projectId,
      currentPhase: 'requirement',
      currentTask: null,
      progress: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        pendingTasks: 0,
        percentage: 0,
      },
      status: 'idle',
      blockers: [],
    };
  }
  
  /**
   * 加载任务链
   */
  async loadTaskChain(project: Project): Promise<TaskChain> {
    // TODO: 从项目配置加载任务链
    return {
      id: `chain-${project.id}`,
      moduleId: 'default',
      tasks: [],
      parallelGroups: [],
    };
  }
  
  /**
   * 获取下一个任务
   */
  async getNextTask(projectId: string): Promise<Task | null> {
    const graph = this.graphs.get(projectId);
    
    if (!graph) {
      return null;
    }
    
    const readyTasks = graph.getReadyTasks();
    return readyTasks[0] || null;
  }
  
  /**
   * 获取所有可执行任务
   */
  async getReadyTasks(projectId: string): Promise<Task[]> {
    const graph = this.graphs.get(projectId);
    
    if (!graph) {
      return [];
    }
    
    return graph.getReadyTasks();
  }
  
  /**
   * 获取任务图
   */
  getTaskGraph(projectId: string): TaskGraph | undefined {
    return this.graphs.get(projectId);
  }
  
  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked'
  ): Promise<void> {
    const graph = this.graphs.get(projectId);
    
    if (graph) {
      graph.updateTaskStatus(taskId, status);
    }
  }
  
  /**
   * 检查是否完成
   */
  async isComplete(projectId: string): Promise<boolean> {
    const graph = this.graphs.get(projectId);
    
    if (!graph) {
      return false;
    }
    
    const tasks = graph.getAllTasks();
    return tasks.every(t => t.status === 'completed');
  }
}