/**
 * Automation Engine - SupervisorAgent
 * 
 * 总管监督者
 * 监控自动化执行，处理问题
 * 
 * @module automation
 */

import type { Issue, TaskResult } from './types.js';
import type { Task } from '../workflow/types.js';
import { MemoryStore } from '../memory/MemoryStore.js';

/**
 * 失败处理决策
 */
export interface FailureDecision {
  action: 'retry' | 'repair' | 'escalate' | 'abort';
  reason: string;
  maxAttempts?: number;
}

/**
 * SupervisorAgent - 总管监督者
 */
export class SupervisorAgent {
  private memory: MemoryStore | null = null;
  private issueLog: Issue[] = [];
  
  constructor(memory?: MemoryStore) {
    this.memory = memory || null;
  }
  
  /**
   * 检查状态
   */
  async checkStatus(projectId: string): Promise<{
    healthy: boolean;
    issues: Issue[];
    recommendations: string[];
  }> {
    const issues = await this.detectIssues(projectId);
    const healthy = issues.filter(i => i.severity === 'high').length === 0;
    
    const recommendations: string[] = [];
    
    if (!healthy) {
      recommendations.push('存在高优先级问题，需要立即处理');
    }
    
    if (issues.length > 5) {
      recommendations.push('问题数量较多，建议暂停自动化');
    }
    
    return { healthy, issues, recommendations };
  }
  
  /**
   * 检测问题
   */
  async detectIssues(_projectId: string): Promise<Issue[]> {
    // 合并现有问题日志
    return [...this.issueLog];
  }
  
  /**
   * 处理问题
   */
  async handleIssues(projectId: string, issues: Issue[]): Promise<void> {
    for (const issue of issues) {
      if (issue.status === 'open') {
        // 根据问题类型决定处理方式
        switch (issue.type) {
          case 'blocked_task':
            // 尝试解决阻塞
            await this.resolveBlocker(projectId, issue);
            break;
          
          case 'failed_task':
            // 记录失败，等待决策
            await this.recordFailure(projectId, issue);
            break;
          
          case 'verification_failed':
            // 触发修复
            await this.triggerRepair(projectId, issue);
            break;
          
          default:
            // 记录问题
            await this.recordIssue(projectId, issue);
        }
        
        issue.status = 'in_progress';
      }
    }
  }
  
  /**
   * 分配任务
   */
  async assignTasks(tasks: Task[]): Promise<Map<string, Task[]>> {
    const assignments = new Map<string, Task[]>();
    
    for (const task of tasks) {
      const role = task.assignTo;
      
      if (!assignments.has(role)) {
        assignments.set(role, []);
      }
      
      const roleTasks = assignments.get(role);
      if (roleTasks) {
        roleTasks.push(task);
      }
    }
    
    return assignments;
  }
  
  /**
   * 决策失败处理
   */
  async decideOnFailure(_task: Task, result: TaskResult): Promise<FailureDecision> {
    // 分析失败原因
    const error = result.error || '';
    
    // 简单决策逻辑
    if (error.includes('timeout')) {
      return {
        action: 'retry',
        reason: '超时错误，可以重试',
        maxAttempts: 3,
      };
    }
    
    if (error.includes('permission') || error.includes('auth')) {
      return {
        action: 'escalate',
        reason: '权限问题，需要人工处理',
      };
    }
    
    if (error.includes('dependency') || error.includes('missing')) {
      return {
        action: 'repair',
        reason: '依赖问题，尝试修复',
      };
    }
    
    // 默认升级
    return {
      action: 'escalate',
      reason: '未知错误，需要人工介入',
    };
  }
  
  /**
   * 报告进度
   */
  async reportProgress(projectId: string): Promise<void> {
    if (this.memory) {
      const status = await this.checkStatus(projectId);
      
      await this.memory.addAction(projectId, 'manager', {
        type: 'supervisor_report',
        description: `监督报告: ${status.healthy ? '健康' : '有问题'}`,
        timestamp: new Date().toISOString(),
        result: status.healthy ? 'healthy' : 'issues_detected',
      });
    }
  }
  
  /**
   * 添加问题
   */
  addIssue(issue: Issue): void {
    this.issueLog.push(issue);
  }
  
  /**
   * 解决阻塞
   */
  private async resolveBlocker(projectId: string, issue: Issue): Promise<void> {
    if (this.memory) {
      await this.memory.addAction(projectId, 'manager', {
        type: 'resolve_blocker',
        description: `尝试解决阻塞: ${issue.description}`,
        timestamp: new Date().toISOString(),
        result: 'attempted',
      });
    }
  }
  
  /**
   * 记录失败
   */
  private async recordFailure(projectId: string, issue: Issue): Promise<void> {
    if (this.memory) {
      await this.memory.addEntry(projectId, 'manager', 'issues', {
        id: `failure-${Date.now()}`,
        type: 'failure',
        title: `任务失败: ${issue.taskId}`,
        content: issue.description,
        tags: ['failure', issue.type],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  
  /**
   * 触发修复
   */
  private async triggerRepair(projectId: string, issue: Issue): Promise<void> {
    if (this.memory) {
      await this.memory.addAction(projectId, 'manager', {
        type: 'trigger_repair',
        description: `触发修复: ${issue.description}`,
        timestamp: new Date().toISOString(),
        result: 'triggered',
      });
    }
  }
  
  /**
   * 记录问题
   */
  private async recordIssue(projectId: string, issue: Issue): Promise<void> {
    if (this.memory) {
      await this.memory.addAction(projectId, 'manager', {
        type: 'record_issue',
        description: `记录问题: ${issue.description}`,
        timestamp: new Date().toISOString(),
        result: 'recorded',
      });
    }
  }
}