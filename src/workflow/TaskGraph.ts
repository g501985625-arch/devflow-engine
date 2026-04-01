/**
 * Workflow Engine - TaskGraph
 * 
 * 任务图管理器
 * 实现依赖检查、并行组计算、关键路径、循环检测
 */

import type { Task, TaskGroup, TaskChain } from './types.js';
import { TASK_STATUS } from '../core/constants.js';

export class TaskGraph {
  private tasks: Map<string, Task> = new Map();
  
  load(chain: TaskChain): void {
    // 存储任务链
    for (const task of chain.tasks) {
      this.tasks.set(task.id, task);
    }
  }
  
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
  
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * 获取就绪任务
   * 返回所有依赖已满足且状态为 pending 的任务
   */
  getReadyTasks(): Task[] {
    const readyTasks: Task[] = [];
    
    for (const task of this.tasks.values()) {
      // 检查状态是否为 pending
      if (task.status !== TASK_STATUS.PENDING) {
        continue;
      }
      
      // 检查所有依赖是否已完成
      const dependenciesMet = this.checkDependencies(task);
      
      if (dependenciesMet) {
        readyTasks.push(task);
      }
    }
    
    return readyTasks;
  }
  
  /**
   * 检查任务依赖是否满足
   */
  checkDependencies(task: Task): boolean {
    // 无依赖，直接就绪
    if (task.dependsOn.length === 0) {
      return true;
    }
    
    // 检查每个依赖任务的状态
    for (const depId of task.dependsOn) {
      const depTask = this.tasks.get(depId);
      
      // 依赖不存在，视为未满足
      if (!depTask) {
        return false;
      }
      
      // 依赖未完成，视为未满足
      if (depTask.status !== TASK_STATUS.COMPLETED) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 计算并行组
   * 将可以同时执行的任务分组
   */
  getParallelGroups(): TaskGroup[] {
    const groups: TaskGroup[] = [];
    const processed = new Set<string>();
    
    // 按层级计算并行组
    while (processed.size < this.tasks.size) {
      // 找出当前层级可执行的任务
      const levelTasks: Task[] = [];
      
      for (const task of this.tasks.values()) {
        // 已处理，跳过
        if (processed.has(task.id)) {
          continue;
        }
        
        // 检查依赖是否都已处理
        const depsProcessed = task.dependsOn.every(depId => 
          processed.has(depId)
        );
        
        if (depsProcessed) {
          levelTasks.push(task);
        }
      }
      
      // 没有可处理的任务，可能存在循环依赖
      if (levelTasks.length === 0) {
        break;
      }
      
      // 按角色分组
      const roleGroups = this.groupByRole(levelTasks);
      
      for (const [role, tasks] of roleGroups) {
        groups.push({
          tasks: tasks.map(t => t.id),
          requiredRole: role as TaskGroup['requiredRole'],
          canParallelize: tasks.some(t => t.canParallelize),
        });
      }
      
      // 标记已处理
      for (const task of levelTasks) {
        processed.add(task.id);
      }
    }
    
    return groups;
  }
  
  /**
   * 按角色分组
   */
  private groupByRole(tasks: Task[]): Map<TaskGroup['requiredRole'], Task[]> {
    const groups = new Map<TaskGroup['requiredRole'], Task[]>();
    
    for (const task of tasks) {
      const role = task.assignTo;
      
      if (!groups.has(role)) {
        groups.set(role, []);
      }
      
      const roleTasks = groups.get(role);
      if (roleTasks) {
        roleTasks.push(task);
      }
    }
    
    return groups;
  }
  
  /**
   * 计算关键路径
   * 返回最长依赖链上的任务
   */
  getCriticalPath(): Task[] {
    // 计算每个任务的最长前置路径长度
    const pathLengths = new Map<string, number>();
    
    // 初始化：无依赖的任务长度为 0
    for (const task of this.tasks.values()) {
      if (task.dependsOn.length === 0) {
        pathLengths.set(task.id, 0);
      }
    }
    
    // 动态更新：基于依赖的最大长度 + 1
    const maxIterations = this.tasks.size * 2; // 防止无限循环
    let iterations = 0;
    
    while (pathLengths.size < this.tasks.size && iterations < maxIterations) {
      iterations++;
      
      for (const task of this.tasks.values()) {
        // 已计算，跳过
        if (pathLengths.has(task.id)) {
          continue;
        }
        
        // 所有依赖都已计算
        const allDepsCalculated = task.dependsOn.every(depId => 
          pathLengths.has(depId)
        );
        
        if (allDepsCalculated && task.dependsOn.length > 0) {
          // 取依赖中最大的长度 + 1
          const maxDepLength = Math.max(
            ...task.dependsOn.map(depId => pathLengths.get(depId) || 0)
          );
          pathLengths.set(task.id, maxDepLength + 1);
        }
      }
    }
    
    // 找最大长度
    let maxLength = 0;
    let endTaskId = '';
    
    for (const [taskId, length] of pathLengths) {
      if (length > maxLength) {
        maxLength = length;
        endTaskId = taskId;
      }
    }
    
    // 回溯关键路径
    const criticalPath: Task[] = [];
    let currentId = endTaskId;
    
    while (currentId) {
      const task = this.tasks.get(currentId);
      if (task) {
        criticalPath.unshift(task);
      }
      
      // 找依赖中路径最长的前置任务
      const deps = criticalPath[0]?.dependsOn || [];
      let prevId = '';
      let prevLength = -1;
      
      for (const depId of deps) {
        const depLength = pathLengths.get(depId) || 0;
        if (depLength > prevLength) {
          prevLength = depLength;
          prevId = depId;
        }
      }
      
      currentId = prevId;
    }
    
    return criticalPath;
  }
  
  /**
   * 检测循环依赖
   * 使用 DFS 检测是否存在循环
   */
  detectCircularDependency(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const task of this.tasks.values()) {
      // 已访问，跳过
      if (visited.has(task.id)) {
        continue;
      }
      
      // DFS 检测循环
      if (this.hasCycleDFS(task.id, visited, recursionStack)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * DFS 检测循环
   */
  private hasCycleDFS(
    taskId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    // 标记访问
    visited.add(taskId);
    recursionStack.add(taskId);
    
    // 获取任务
    const task = this.tasks.get(taskId);
    
    if (task) {
      // 检查所有依赖
      for (const depId of task.dependsOn) {
        // 依赖在递归栈中，存在循环
        if (recursionStack.has(depId)) {
          return true;
        }
        
        // 依赖未访问，继续 DFS
        if (!visited.has(depId)) {
          if (this.hasCycleDFS(depId, visited, recursionStack)) {
            return true;
          }
        }
      }
    }
    
    // 移除递归栈
    recursionStack.delete(taskId);
    
    return false;
  }
  
  /**
   * 更新任务状态
   */
  updateTaskStatus(taskId: string, status: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status as Task['status'];
    }
  }
  
  /**
   * 获取任务统计
   */
  getStats(): {
    total: number;
    pending: number;
    ready: number;
    inProgress: number;
    completed: number;
    failed: number;
  } {
    const stats = {
      total: this.tasks.size,
      pending: 0,
      ready: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
    };
    
    for (const task of this.tasks.values()) {
      switch (task.status) {
        case TASK_STATUS.PENDING:
          stats.pending++;
          break;
        case TASK_STATUS.READY:
          stats.ready++;
          break;
        case TASK_STATUS.IN_PROGRESS:
          stats.inProgress++;
          break;
        case TASK_STATUS.COMPLETED:
          stats.completed++;
          break;
        case TASK_STATUS.FAILED:
          stats.failed++;
          break;
      }
    }
    
    // 计算就绪任务
    stats.ready = this.getReadyTasks().length;
    
    return stats;
  }
}