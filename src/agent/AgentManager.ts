/**
 * Agent Manager - AgentManager
 * 
 * Agent 管理器
 * 管理 AI Agent 会话和工具调用
 * 
 * @module agent
 */

import type { AgentSession, AgentContext, Message, ToolCall, AgentConfig } from './types.js';
import { Desk } from './Desk.js';
import { MemoryStore } from '../memory/MemoryStore.js';

/**
 * AgentManager - Agent 管理器
 */
export class AgentManager {
  private desks: Map<string, Desk> = new Map();
  private sessions: Map<string, AgentSession> = new Map();
  private memory: MemoryStore | null = null;
  private projectPath: string;
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.memory = new MemoryStore(projectPath);
  }
  
  /**
   * 初始化 Agent Manager
   */
  async initialize(): Promise<void> {
    // 创建默认工位
    await this.createDesk('manager', {
      role: 'manager',
      name: '总管',
      description: '项目总管，负责协调和监督',
      capabilities: ['plan', 'coordinate', 'review', 'approve'],
    });
    
    await this.createDesk('architect', {
      role: 'architect',
      name: '架构师',
      description: '系统架构设计',
      capabilities: ['design', 'architecture', 'tech-decision'],
    });
    
    await this.createDesk('lead_dev', {
      role: 'lead_dev',
      name: '主程序',
      description: '核心功能实现',
      capabilities: ['implement', 'code', 'debug', 'optimize'],
    });
    
    await this.createDesk('developer', {
      role: 'developer',
      name: '开发员',
      description: '功能开发和测试',
      capabilities: ['implement', 'test', 'fix'],
    });
    
    await this.createDesk('designer', {
      role: 'designer',
      name: '美术',
      description: '视觉设计和UI',
      capabilities: ['design', 'ui', 'visual'],
    });
  }
  
  /**
   * 创建工位
   */
  async createDesk(role: string, config: AgentConfig): Promise<Desk> {
    const desk = new Desk(role, config, this.projectPath);
    this.desks.set(role, desk);
    return desk;
  }
  
  /**
   * 获取工位
   */
  getDesk(role: string): Desk | undefined {
    return this.desks.get(role);
  }
  
  /**
   * 创建会话
   */
  async createSession(
    role: string,
    taskId: string,
    context: AgentContext
  ): Promise<AgentSession> {
    const desk = this.desks.get(role);
    
    if (!desk) {
      throw new Error(`Desk not found for role: ${role}`);
    }
    
    const sessionId = `${role}-${taskId}-${Date.now()}`;
    
    const session: AgentSession = {
      id: sessionId,
      role,
      taskId,
      desk: desk.getConfig(),
      status: 'pending',
      messages: [],
      toolCalls: [],
      context,
      startTime: new Date().toISOString(),
    };
    
    this.sessions.set(sessionId, session);
    
    // 加载角色记忆
    if (this.memory) {
      const projectId = this.projectPath.split('/').pop() || 'default';
      const projectMemory = await this.memory.getProjectMemory(projectId);
      if (projectMemory && projectMemory[role]) {
        session.context.roleMemory = projectMemory[role];
      }
    }
    
    return session;
  }
  
  /**
   * 发送消息
   */
  async sendMessage(
    sessionId: string,
    content: string,
    role: 'user' | 'assistant' | 'system' = 'user'
  ): Promise<Message> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    
    session.messages.push(message);
    
    return message;
  }
  
  /**
   * 执行工具调用
   */
  async executeToolCall(
    sessionId: string,
    toolCall: ToolCall
  ): Promise<unknown> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const desk = this.desks.get(session.role);
    
    if (!desk) {
      throw new Error(`Desk not found for role: ${session.role}`);
    }
    
    // 记录工具调用
    session.toolCalls.push(toolCall);
    
    // 执行工具
    const args = toolCall.arguments || toolCall.input || {};
    const result = await desk.executeTool(toolCall.name, args);
    
    // 记录结果消息
    await this.sendMessage(sessionId, JSON.stringify(result), 'assistant');
    
    return result;
  }
  
  /**
   * 完成会话
   */
  async completeSession(sessionId: string, result: unknown): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    session.status = 'completed';
    session.endTime = new Date().toISOString();
    session.result = result;
    
    // 保存会话记忆
    if (this.memory) {
      await this.saveSessionMemory(session);
    }
  }
  
  /**
   * 获取会话
   */
  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }
  
  /**
   * 列出所有会话
   */
  listSessions(): AgentSession[] {
    return Array.from(this.sessions.values());
  }
  
  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(maxAgeMs: number = 3600000): Promise<number> {
    const now = Date.now();
    const expired: string[] = [];
    
    for (const [id, session] of this.sessions) {
      const startTime = new Date(session.startTime).getTime();
      
      if (now - startTime > maxAgeMs) {
        expired.push(id);
      }
    }
    
    for (const id of expired) {
      this.sessions.delete(id);
    }
    
    return expired.length;
  }
  
  /**
   * 保存会话记忆
   */
  private async saveSessionMemory(session: AgentSession): Promise<void> {
    if (!this.memory) return;
    
    const projectId = this.projectPath.split('/').pop() || 'default';
    
    // 添加会话记录
    await this.memory.addEntry(projectId, session.role, 'sessions', {
      id: session.id,
      type: 'session',
      title: `会话: ${session.taskId}`,
      content: JSON.stringify({
        messages: session.messages.length,
        toolCalls: session.toolCalls.length,
        result: session.result,
      }),
      tags: ['session', session.role],
      createdAt: session.startTime,
      updatedAt: session.endTime || new Date().toISOString(),
    });
    
    // 添加动作记录
    await this.memory.addAction(projectId, session.role, {
      type: 'session_complete',
      description: `完成会话: ${session.taskId}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
  }
}