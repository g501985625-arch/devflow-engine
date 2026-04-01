/**
 * DevFlow Engine - 核心引擎
 * 
 * 主引擎类，负责初始化和协调所有模块
 */

import type { EngineConfig, EngineState } from './types.js';
import { StorageLayer } from '../storage/StorageLayer.js';
import { MemoryStore } from '../memory/MemoryStore.js';
import { ProjectManager } from '../project/ProjectManager.js';
import { AgentManager } from '../agent/AgentManager.js';
import { WorkflowEngine } from '../workflow/WorkflowEngine.js';
import { AutomationEngine } from '../automation/AutomationEngine.js';

/**
 * DevFlow Engine 主类
 * 
 * 单例模式，全局唯一实例
 */
export class DevFlowEngine {
  private static instance: DevFlowEngine | null = null;
  
  private config: EngineConfig | null = null;
  private state: EngineState;
  private initialized = false;
  
  // 模块实例
  private storageLayer: StorageLayer | null = null;
  private memoryStore: MemoryStore | null = null;
  private projectManager: ProjectManager | null = null;
  private agentManager: AgentManager | null = null;
  private workflowEngine: WorkflowEngine | null = null;
  private automationEngine: AutomationEngine | null = null;
  
  private constructor() {
    this.state = {
      initialized: false,
      currentProject: null,
      activeSessions: [],
    };
  }
  
  /**
   * 获取引擎实例
   */
  static getInstance(): DevFlowEngine {
    if (!DevFlowEngine.instance) {
      DevFlowEngine.instance = new DevFlowEngine();
    }
    return DevFlowEngine.instance;
  }
  
  /**
   * 初始化引擎
   */
  async initialize(config: EngineConfig): Promise<void> {
    if (this.initialized) {
      throw new Error('Engine already initialized');
    }
    
    this.config = config;
    
    // 初始化各模块（按依赖顺序）
    
    // 1. StorageLayer - 基础存储
    this.storageLayer = new StorageLayer(config.projectPath);
    await this.storageLayer.initialize();
    
    // 2. MemoryStore - 记忆系统
    this.memoryStore = new MemoryStore(config.projectPath);
    
    // 3. ProjectManager - 项目管理
    this.projectManager = new ProjectManager();
    
    // 4. AgentManager - Agent 管理
    this.agentManager = new AgentManager(config.projectPath);
    await this.agentManager.initialize();
    
    // 5. WorkflowEngine - 工作流引擎
    this.workflowEngine = new WorkflowEngine();
    
    // 6. AutomationEngine - 自动化引擎
    this.automationEngine = new AutomationEngine(config.projectPath);
    
    // 连接模块
    this.connectModules();
    
    this.state.initialized = true;
    this.initialized = true;
  }
  
  /**
   * 连接模块
   */
  private connectModules(): void {
    // WorkflowEngine 使用 AutomationEngine 执行任务
    if (this.workflowEngine && this.automationEngine) {
      // 模块已创建，等待后续实现任务执行连接
    }
    
    // AutomationEngine 使用 AgentManager 调用 Agent
    if (this.automationEngine && this.agentManager) {
      // 模块已创建，等待后续实现 Agent 调用连接
    }
  }
  
  /**
   * 获取引擎状态
   */
  getState(): EngineState {
    return { ...this.state };
  }
  
  /**
   * 获取配置
   */
  getConfig(): EngineConfig | null {
    return this.config;
  }
  
  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * 获取 StorageLayer
   */
  getStorageLayer(): StorageLayer | null {
    return this.storageLayer;
  }
  
  /**
   * 获取 MemoryStore
   */
  getMemoryStore(): MemoryStore | null {
    return this.memoryStore;
  }
  
  /**
   * 获取 ProjectManager
   */
  getProjectManager(): ProjectManager | null {
    return this.projectManager;
  }
  
  /**
   * 获取 AgentManager
   */
  getAgentManager(): AgentManager | null {
    return this.agentManager;
  }
  
  /**
   * 获取 WorkflowEngine
   */
  getWorkflowEngine(): WorkflowEngine | null {
    return this.workflowEngine;
  }
  
  /**
   * 获取 AutomationEngine
   */
  getAutomationEngine(): AutomationEngine | null {
    return this.automationEngine;
  }
  
  /**
   * 启动自动化
   */
  async startAutomation(): Promise<void> {
    if (!this.automationEngine) {
      throw new Error('AutomationEngine not initialized');
    }
    
    // 启动自动化引擎的主循环
    const projectId = this.state.currentProject || 'default';
    for await (const event of this.automationEngine.run(projectId)) {
      // 处理事件
      this.handleAutomationEvent(event);
    }
  }
  
  /**
   * 处理自动化事件
   */
  private handleAutomationEvent(event: { type: string; data?: unknown }): void {
    // 更新状态
    switch (event.type) {
      case 'task_started':
        this.state.currentProject = (event.data as { taskId?: string })?.taskId || null;
        break;
      
      case 'task_completed':
        this.state.currentProject = null;
        break;
      
      case 'session_created':
        this.state.activeSessions.push(
          (event.data as { sessionId?: string })?.sessionId || ''
        );
        break;
      
      case 'session_closed': {
        const sessionId = (event.data as { sessionId?: string })?.sessionId;
        if (sessionId) {
          this.state.activeSessions = this.state.activeSessions.filter(
            id => id !== sessionId
          );
        }
        break;
      }
    }
  }
  
  /**
   * 暂停自动化
   */
  async pauseAutomation(): Promise<void> {
    if (this.automationEngine && this.state.currentProject) {
      await this.automationEngine.pause(this.state.currentProject);
    }
  }
  
  /**
   * 恢复自动化
   */
  async resumeAutomation(): Promise<void> {
    if (this.automationEngine && this.state.currentProject) {
      await this.automationEngine.resume(this.state.currentProject);
    }
  }
  
  /**
   * 关闭引擎
   */
  async shutdown(): Promise<void> {
    // 关闭所有模块（逆序）
    
    // 6. AutomationEngine
    if (this.automationEngine) {
      await this.automationEngine.stop();
    }
    
    // 5. WorkflowEngine
    this.workflowEngine = null;
    
    // 4. AgentManager
    this.agentManager = null;
    
    // 3. ProjectManager
    // 清理所有活跃会话中的项目
    if (this.projectManager) {
      // 会话清理由各自的模块处理
      void this.state.activeSessions;
    }
    
    // 2. MemoryStore
    if (this.memoryStore) {
      // 保存记忆状态
    }
    
    // 1. StorageLayer
    if (this.storageLayer) {
      await this.storageLayer.stopWatching();
    }
    
    this.initialized = false;
    this.state.initialized = false;
    this.state.currentProject = null;
    this.state.activeSessions = [];
  }
}