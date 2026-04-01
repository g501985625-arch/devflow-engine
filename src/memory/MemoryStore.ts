/**
 * Memory System - MemoryStore
 * 
 * 记忆存储实现
 * 基于 memdir 结构，借鉴 Claude Code 记忆系统
 * 
 * @module memory
 */

import * as path from 'path';
import { FileSystem } from '../storage/FileSystem.js';
import type { ProjectMemory, RoleMemory, WorkingMemory, MemoryEntry, Action, SessionRecord } from './types.js';

/**
 * MemoryStore - 记忆存储
 */
export class MemoryStore {
  private fs: FileSystem;
  private memoryPath: string;
  private cache: Map<string, RoleMemory> = new Map();
  
  constructor(projectPath: string) {
    this.fs = new FileSystem();
    this.memoryPath = path.join(projectPath, 'memory');
  }
  
  /**
   * 初始化记忆目录
   */
  async initialize(): Promise<void> {
    await this.fs.createDir(this.memoryPath);
    
    // 为每个角色创建目录
    const roles = ['manager', 'architect', 'lead_dev', 'developer', 'designer'];
    for (const role of roles) {
      const rolePath = path.join(this.memoryPath, role);
      await this.fs.createDir(rolePath);
      
      // 创建子目录
      await this.fs.createDir(path.join(rolePath, 'working'));
      await this.fs.createDir(path.join(rolePath, 'long_term'));
      await this.fs.createDir(path.join(rolePath, 'sessions'));
    }
  }
  
  /**
   * 加载角色记忆
   */
  async load(projectId: string, role: string): Promise<RoleMemory> {
    const cacheKey = `${projectId}:${role}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const rolePath = path.join(this.memoryPath, role);
    const exists = await this.fs.exists(rolePath);
    
    if (!exists) {
      // 返回默认记忆结构
      return this.createDefaultMemory(role);
    }
    
    // 加载工作记忆
    const workingPath = path.join(rolePath, 'working', 'current.json');
    const loadedWorking = await this.loadJSON(workingPath);
    const working: WorkingMemory = loadedWorking ? {
      currentTask: (loadedWorking as WorkingMemory).currentTask || null,
      recentActions: (loadedWorking as WorkingMemory).recentActions || [],
      context: (loadedWorking as WorkingMemory).context || {},
      updatedAt: (loadedWorking as WorkingMemory).updatedAt || new Date().toISOString(),
    } : this.createDefaultWorkingMemory();
    
    // 加载长期记忆
    const longTermPath = path.join(rolePath, 'long_term');
    const longTerm = await this.loadLongTermMemory(longTermPath);
    
    // 加载会话记录
    const sessionsPath = path.join(rolePath, 'sessions');
    const sessions = await this.loadSessions(sessionsPath);
    
    const memory: RoleMemory = {
      working,
      longTerm,
      sessions,
    };
    
    // 缓存
    this.cache.set(cacheKey, memory);
    
    return memory;
  }
  
  /**
   * 保存角色记忆
   */
  async save(projectId: string, role: string, memory: RoleMemory): Promise<void> {
    const rolePath = path.join(this.memoryPath, role);
    await this.fs.createDir(rolePath);
    
    // 保存工作记忆
    const workingPath = path.join(rolePath, 'working', 'current.json');
    await this.saveJSON(workingPath, memory.working);
    
    // 保存长期记忆
    for (const [category, entries] of Object.entries(memory.longTerm)) {
      const categoryPath = path.join(rolePath, 'long_term', `${category}.json`);
      await this.saveJSON(categoryPath, entries);
    }
    
    // 更新缓存
    const cacheKey = `${projectId}:${role}`;
    this.cache.set(cacheKey, memory);
  }
  
  /**
   * 添加记忆条目
   */
  async addEntry(
    projectId: string,
    role: string,
    category: string,
    entry: MemoryEntry
  ): Promise<void> {
    const memory = await this.load(projectId, role);
    
    if (!memory.longTerm[category]) {
      memory.longTerm[category] = [];
    }
    
    memory.longTerm[category].push(entry);
    
    await this.save(projectId, role, memory);
  }
  
  /**
   * 添加操作记录
   */
  async addAction(
    projectId: string,
    role: string,
    action: Action
  ): Promise<void> {
    const memory = await this.load(projectId, role);
    memory.working.recentActions.push(action);
    
    // 保留最近100条操作
    if (memory.working.recentActions.length > 100) {
      memory.working.recentActions = memory.working.recentActions.slice(-100);
    }
    
    memory.working.updatedAt = new Date().toISOString();
    
    await this.save(projectId, role, memory);
  }
  
  /**
   * 更新当前任务
   */
  async updateCurrentTask(
    projectId: string,
    role: string,
    taskId: string | null
  ): Promise<void> {
    const memory = await this.load(projectId, role);
    memory.working.currentTask = taskId;
    memory.working.updatedAt = new Date().toISOString();
    
    await this.save(projectId, role, memory);
  }
  
  /**
   * 搜索记忆
   */
  async search(projectId: string, query: string): Promise<MemoryEntry[]> {
    const results: MemoryEntry[] = [];
    const roles = ['manager', 'architect', 'lead_dev', 'developer', 'designer'];
    
    for (const role of roles) {
      const memory = await this.load(projectId, role);
      
      for (const entries of Object.values(memory.longTerm)) {
        for (const entry of entries) {
          if (
            entry.title.toLowerCase().includes(query.toLowerCase()) ||
            entry.content.toLowerCase().includes(query.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          ) {
            results.push(entry);
          }
        }
      }
    }
    
    return results;
  }
  
  /**
   * 获取项目记忆（所有角色）
   */
  async getProjectMemory(projectId: string): Promise<ProjectMemory> {
    const memory: ProjectMemory = {};
    const roles = ['manager', 'architect', 'lead_dev', 'developer', 'designer'];
    
    for (const role of roles) {
      memory[role] = await this.load(projectId, role);
    }
    
    return memory;
  }
  
  /**
   * 加载 JSON 文件
   */
  private async loadJSON(filePath: string): Promise<unknown> {
    try {
      const content = await this.fs.readFile(filePath);
      const data: unknown = JSON.parse(content);
      return data;
    } catch {
      return null;
    }
  }
  
  /**
   * 保存 JSON 文件
   */
  private async saveJSON(filePath: string, data: unknown): Promise<void> {
    await this.fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
  
  /**
   * 加载长期记忆
   */
  private async loadLongTermMemory(dirPath: string): Promise<Record<string, MemoryEntry[]>> {
    const longTerm: Record<string, MemoryEntry[]> = {};
    
    try {
      const files = await this.fs.listDir(dirPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const category = file.replace('.json', '');
          const filePath = path.join(dirPath, file);
          const entries = await this.loadJSON(filePath) as MemoryEntry[] | null;
          
          if (entries) {
            longTerm[category] = entries;
          }
        }
      }
    } catch {
      // 目录不存在，返回空对象
    }
    
    return longTerm;
  }
  
  /**
   * 加载会话记录
   */
  private async loadSessions(dirPath: string): Promise<SessionRecord[]> {
    try {
      const files = await this.fs.listDir(dirPath);
      const sessions: SessionRecord[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dirPath, file);
          const session = await this.loadJSON(filePath) as SessionRecord | null;
          
          if (session) {
            sessions.push(session);
          }
        }
      }
      
      return sessions.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    } catch {
      return [];
    }
  }
  
  /**
   * 创建默认记忆结构
   */
  private createDefaultMemory(_role: string): RoleMemory {
    return {
      working: this.createDefaultWorkingMemory(),
      longTerm: {
        decisions: [],
        learnings: [],
        issues: [],
      },
      sessions: [],
    };
  }
  
  /**
   * 创建默认工作记忆
   */
  private createDefaultWorkingMemory(): WorkingMemory {
    return {
      currentTask: null,
      recentActions: [],
      context: {},
      updatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}