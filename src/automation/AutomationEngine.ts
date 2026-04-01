/**
 * Automation Engine - AutomationEngine
 * 
 * 自动化引擎主循环
 * 借鉴 Claude Code Query Loop 模式
 * 
 * @module automation
 */

import type { AutomationEvent, AutomationOptions, AutomationStatus, Issue, TaskResult } from './types.js';
import { SupervisorAgent } from './SupervisorAgent.js';
import { WorkflowEngine } from '../workflow/WorkflowEngine.js';
import { MemoryStore } from '../memory/MemoryStore.js';
import type { Task } from '../workflow/types.js';
import { ISSUE_TYPES, ISSUE_SEVERITY, TASK_STATUS } from '../core/constants.js';

/**
 * AutomationEngine - 自动化引擎
 */
export class AutomationEngine {
  private running = false;
  private paused = false;
  private workflow: WorkflowEngine;
  private supervisor: SupervisorAgent;
  private memory: MemoryStore | null = null;
  private options: AutomationOptions;
  private startTime: Date | null = null;
  private completedCount = 0;
  private failedCount = 0;
  private issues: Issue[] = [];
  
  constructor(projectPath: string) {
    this.workflow = new WorkflowEngine();
    this.supervisor = new SupervisorAgent();
    this.memory = new MemoryStore(projectPath);
    this.options = {
      autoRepair: true,
      autoRetry: true,
      maxRetries: 3,
      reportInterval: 60,
      notifyOnIssue: true,
    };
  }
  
  /**
   * 主循环 - AsyncGenerator 模式
   * 
   * 借鉴 Claude Code Query Loop:
   * - yield events for external monitoring
   * - handle interruptions gracefully
   * - support pause/resume
   */
  async *run(
    projectId: string,
    options?: AutomationOptions
  ): AsyncGenerator<AutomationEvent> {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    
    this.running = true;
    this.startTime = new Date();
    
    yield { type: 'started', projectId };
    
    // 启动工作流
    await this.workflow.start(projectId);
    
    // 主循环
    while (this.running && !this.paused) {
      // 获取下一个任务
      const task = await this.workflow.getNextTask(projectId);
      
      if (!task) {
        // 检查是否完成
        const complete = await this.workflow.isComplete(projectId);
        if (complete) {
          yield { type: 'completed', projectId };
          break;
        }
        
        // 检查是否阻塞
        const blockers = this.issues.filter(i => i.status === 'open' && i.severity === 'high');
        if (blockers.length > 0) {
          yield { type: 'blocked', blockers };
          break;
        }
        
        // 无任务可执行，等待
        await this.delay(1000);
        continue;
      }
      
      // 开始任务
      yield { type: 'task_started', task };
      await this.workflow.updateTaskStatus(projectId, task.id, TASK_STATUS.IN_PROGRESS);
      
      // 执行任务
      const result = await this.executeTask(task);
      
      if (result.success) {
        yield { type: 'task_completed', task, result };
        await this.workflow.updateTaskStatus(projectId, task.id, TASK_STATUS.COMPLETED);
        this.completedCount++;
        
        // 记录成功
        if (this.memory) {
          await this.memory.addAction(projectId, 'automation', {
            type: 'task_completed',
            description: `完成任务: ${task.title}`,
            timestamp: new Date().toISOString(),
            result: 'success',
          });
        }
      } else {
        yield { type: 'task_failed', task, error: result.error || 'Unknown error' };
        await this.workflow.updateTaskStatus(projectId, task.id, TASK_STATUS.FAILED);
        this.failedCount++;
        
        // 处理失败
        const decision = await this.supervisor.decideOnFailure(task, result);
        
        if (decision.action === 'retry' && this.options.autoRetry) {
          // 重试
          const maxAttempts = decision.maxAttempts || this.options.maxRetries;
          for (let i = 0; i < maxAttempts; i++) {
            yield { type: 'task_started', task };
            const retryResult = await this.executeTask(task);
            
            if (retryResult.success) {
              yield { type: 'task_completed', task, result: retryResult };
              await this.workflow.updateTaskStatus(projectId, task.id, TASK_STATUS.COMPLETED);
              this.completedCount++;
              break;
            }
          }
        } else if (decision.action === 'escalate') {
          // 创建问题
          const issue = this.createIssue(task, result.error || 'Unknown error');
          this.issues.push(issue);
          yield { type: 'needs_intervention', task, reason: decision.reason };
        }
      }
      
      // 报告间隔
      if (this.options.reportInterval > 0) {
        await this.reportProgress(projectId);
      }
    }
    
    // 暂停或完成
    if (this.paused) {
      yield { type: 'paused' };
    }
    
    this.running = false;
  }
  
  /**
   * 执行任务
   */
  private async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      // TODO: 实际任务执行逻辑
      // 这里应该调用 Agent 执行具体任务
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        output: { taskId: task.id },
        durationMs,
        modifiedFiles: [],
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      return {
        success: false,
        error: (error as Error).message,
        durationMs,
        modifiedFiles: [],
      };
    }
  }
  
  /**
   * 暂停
   */
  async pause(projectId: string): Promise<void> {
    this.paused = true;
    
    if (this.memory) {
      await this.memory.addAction(projectId, 'automation', {
        type: 'pause',
        description: '自动化引擎暂停',
        timestamp: new Date().toISOString(),
        result: 'paused',
      });
    }
  }
  
  /**
   * 恢复
   */
  async resume(projectId: string): Promise<void> {
    this.paused = false;
    
    if (this.memory) {
      await this.memory.addAction(projectId, 'automation', {
        type: 'resume',
        description: '自动化引擎恢复',
        timestamp: new Date().toISOString(),
        result: 'resumed',
      });
    }
  }
  
  /**
   * 停止
   */
  async stop(): Promise<void> {
    this.running = false;
    this.paused = false;
  }
  
  /**
   * 获取状态
   */
  async getStatus(projectId: string): Promise<AutomationStatus> {
    const workflowStatus = await this.workflow.getStatus(projectId);
    
    return {
      projectId,
      running: this.running && !this.paused,
      currentTask: workflowStatus.currentTask,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
      issues: this.issues,
      startedAt: this.startTime,
      estimatedCompletion: this.estimateCompletion(),
    };
  }
  
  /**
   * 检测问题
   */
  async detectIssues(projectId: string): Promise<Issue[]> {
    const workflowStatus = await this.workflow.getStatus(projectId);
    
    // 检查阻塞任务
    if (workflowStatus.blockers.length > 0) {
      for (const blocker of workflowStatus.blockers) {
        const issue = this.createIssueFromBlocker(blocker);
        this.issues.push(issue);
      }
    }
    
    return this.issues;
  }
  
  /**
   * 创建问题
   */
  private createIssue(task: Task, error: string): Issue {
    return {
      id: `issue-${Date.now()}`,
      type: ISSUE_TYPES.FAILED_TASK,
      severity: ISSUE_SEVERITY.HIGH,
      taskId: task.id,
      description: `任务 ${task.title} 失败: ${error}`,
      suggestedAction: '需要人工介入或修复',
      status: 'open',
    };
  }
  
  /**
   * 从阻塞创建问题
   */
  private createIssueFromBlocker(blocker: string): Issue {
    return {
      id: `issue-${Date.now()}`,
      type: ISSUE_TYPES.BLOCKED_TASK,
      severity: ISSUE_SEVERITY.HIGH,
      description: `阻塞: ${blocker}`,
      suggestedAction: '解决阻塞问题',
      status: 'open',
    };
  }
  
  /**
   * 报告进度
   */
  private async reportProgress(projectId: string): Promise<void> {
    if (this.memory) {
      await this.memory.addAction(projectId, 'automation', {
        type: 'progress_report',
        description: `进度: ${this.completedCount} 完成, ${this.failedCount} 失败`,
        timestamp: new Date().toISOString(),
        result: 'reported',
      });
    }
  }
  
  /**
   * 预估完成时间
   */
  private estimateCompletion(): Date | null {
    if (!this.startTime || this.completedCount === 0) {
      return null;
    }
    
    const elapsedMs = Date.now() - this.startTime.getTime();
    const avgTimePerTask = elapsedMs / this.completedCount;
    
    // 假设还有一定数量的任务
    const remainingTasks = 10 - this.completedCount;
    const estimatedMs = remainingTasks * avgTimePerTask;
    
    return new Date(Date.now() + estimatedMs);
  }
  
  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}