/**
 * Memory System - DreamIntegrator
 * 
 * 记忆整合器
 * 借鉴 Claude Code Dream 功能，定期整合记忆
 * 
 * @module memory
 */

import type { MemoryEntry, Action } from './types.js';
import { MemoryStore } from './MemoryStore.js';

/**
 * 整合结果
 */
export interface IntegrationResult {
  summaries: MemoryEntry[];
  insights: string[];
  cleanedActions: number;
}

/**
 * DreamIntegrator - 记忆整合器
 */
export class DreamIntegrator {
  private store: MemoryStore;
  
  constructor(store: MemoryStore) {
    this.store = store;
  }
  
  /**
   * 整合记忆
   * 
   * 类似 Claude Code 的 Dream 功能：
   * - 总结近期操作
   * - 提取关键决策
   * - 发现模式和洞察
   * - 清理过期数据
   */
  async integrate(projectId: string, role: string): Promise<IntegrationResult> {
    const memory = await this.store.load(projectId, role);
    
    // 1. 分析近期操作
    const recentActions = memory.working.recentActions;
    const actionPatterns = this.findActionPatterns(recentActions);
    
    // 2. 创建操作总结
    const summaries: MemoryEntry[] = [];
    
    if (recentActions.length > 10) {
      summaries.push({
        id: `summary-${Date.now()}`,
        type: 'action_summary',
        title: `近期操作总结 (${recentActions.length} 条)`,
        content: this.summarizeActions(recentActions),
        tags: ['auto-generated', 'integration'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // 3. 提取洞察
    const insights = this.extractInsights(actionPatterns, memory.longTerm);
    
    // 4. 清理过期操作记录
    const cleanedActions = Math.max(0, recentActions.length - 50);
    if (recentActions.length > 50) {
      memory.working.recentActions = recentActions.slice(-50);
      await this.store.save(projectId, role, memory);
    }
    
    // 5. 保存整合结果
    for (const summary of summaries) {
      await this.store.addEntry(projectId, role, 'summaries', summary);
    }
    
    return {
      summaries,
      insights,
      cleanedActions,
    };
  }
  
  /**
   * 查找操作模式
   */
  private findActionPatterns(actions: Action[]): Map<string, number> {
    const patterns = new Map<string, number>();
    
    for (const action of actions) {
      const type = action.type;
      patterns.set(type, (patterns.get(type) || 0) + 1);
    }
    
    return patterns;
  }
  
  /**
   * 总结操作
   */
  private summarizeActions(actions: Action[]): string {
    const typeGroups: Record<string, Action[]> = {};
    
    for (const action of actions) {
      if (!typeGroups[action.type]) {
        typeGroups[action.type] = [];
      }
      const group = typeGroups[action.type];
      if (group) {
        group.push(action);
      }
    }
    
    const summaries: string[] = [];
    
    for (const [type, group] of Object.entries(typeGroups)) {
      const successCount = group.filter(a => a.result === 'success').length;
      const failCount = group.filter(a => a.result === 'failed').length;
      
      summaries.push(
        `${type}: ${group.length} 次 (${successCount} 成功, ${failCount} 失败)`
      );
    }
    
    return summaries.join('\n');
  }
  
  /**
   * 提取洞察
   */
  private extractInsights(
    patterns: Map<string, number>,
    longTerm: Record<string, MemoryEntry[]>
  ): string[] {
    const insights: string[] = [];
    
    // 分析高频操作
    for (const [type, count] of patterns) {
      if (count > 10) {
        insights.push(`高频操作: ${type} (${count} 次) - 可能需要优化`);
      }
    }
    
    // 分析历史决策
    const decisions = longTerm.decisions || [];
    if (decisions && decisions.length > 5) {
      insights.push(`已记录 ${decisions.length} 个关键决策`);
    }
    
    // 分析问题历史
    const issues = longTerm.issues || [];
    if (issues) {
      const resolvedIssues = issues.filter(i => i.tags.includes('resolved'));
      if (resolvedIssues.length > 0) {
        insights.push(`已解决 ${resolvedIssues.length} 个问题`);
      }
    }
    
    return insights;
  }
  
  /**
   * 建议下一步
   */
  suggestNextSteps(_projectId: string, _role: string): Promise<string[]> {
    // TODO: 基于 LLM 生成建议
    return Promise.resolve([
      '建议整合周期记忆',
      '检查是否存在重复操作',
      '优化高频任务流程',
    ]);
  }
}