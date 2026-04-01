/**
 * Workflow Engine - TaskLoader
 * 
 * 任务加载器
 * 
 * @module workflow
 */

import * as yaml from 'yaml';
import { FileSystem } from '../storage/FileSystem.js';
import type { Task, TaskChain, TaskGroup } from './types.js';
import { TASK_STATUS } from '../core/constants.js';

/**
 * TaskLoader - 任务加载器
 */
export class TaskLoader {
  private fs: FileSystem;
  
  constructor() {
    this.fs = new FileSystem();
  }
  
  /**
   * 从 YAML 加载任务链
   */
  async loadFromYaml(filePath: string): Promise<TaskChain> {
    const content = await this.fs.readFile(filePath);
    const data = yaml.parse(content) as Record<string, unknown>;
    
    return this.parseTaskChain(data);
  }
  
  /**
   * 从 JSON 加载任务链
   */
  async loadFromJson(filePath: string): Promise<TaskChain> {
    const content = await this.fs.readFile(filePath);
    const data = JSON.parse(content) as Record<string, unknown>;
    
    return this.parseTaskChain(data);
  }
  
  /**
   * 解析任务链数据
   */
  private parseTaskChain(data: Record<string, unknown>): TaskChain {
    const tasks = (data.tasks as Array<Record<string, unknown>> || []).map((t, index) => 
      this.parseTask(t, index)
    );
    
    const parallelGroups = this.computeParallelGroups(tasks);
    
    return {
      id: data.id as string || `chain-${Date.now()}`,
      moduleId: data.moduleId as string || 'default',
      tasks,
      parallelGroups,
    };
  }
  
  /**
   * 解析单个任务
   */
  private parseTask(data: Record<string, unknown>, index: number): Task {
    return {
      id: data.id as string || `task-${index}`,
      title: data.title as string || '',
      description: data.description as string || '',
      module: data.module as string || '',
      phase: data.phase as 'requirement' | 'architecture' | 'development' | 'integration' | 'extension' || 'development',
      dependsOn: (data.dependsOn as string[] || []),
      estimatedMinutes: data.estimatedMinutes as number || 30,
      assignTo: data.assignTo as 'manager' | 'architect' | 'lead_dev' | 'developer' | 'designer' || 'developer',
      canParallelize: data.canParallelize as boolean || false,
      verificationRules: {
        build: data.build as boolean || false,
        test: data.test as boolean || false,
        lint: data.lint as boolean || false,
        typeCheck: data.typeCheck as boolean || false,
        crossReview: data.crossReview as boolean || false,
        manualApproval: data.manualApproval as boolean || false,
      },
      acceptanceCriteria: data.acceptanceCriteria as string[] || [],
      expectedOutputs: data.expectedOutputs as string[] || [],
      status: TASK_STATUS.PENDING,
    };
  }
  
  /**
   * 计算并行组
   */
  private computeParallelGroups(tasks: Task[]): TaskGroup[] {
    const groups: TaskGroup[] = [];
    const processed = new Set<string>();
    
    // 找出可并行任务组
    for (const task of tasks) {
      if (processed.has(task.id)) continue;
      
      // 找出同层级可并行任务
      const parallelTasks = tasks.filter(t => 
        !processed.has(t.id) &&
        t.canParallelize &&
        t.assignTo === task.assignTo &&
        this.haveSameDependencies(t, task)
      );
      
      if (parallelTasks.length > 1) {
        groups.push({
          tasks: parallelTasks.map(t => t.id),
          requiredRole: task.assignTo,
          canParallelize: true,
        });
        
        parallelTasks.forEach(t => processed.add(t.id));
      } else {
        processed.add(task.id);
      }
    }
    
    return groups;
  }
  
  /**
   * 检查两个任务是否有相同依赖
   */
  private haveSameDependencies(a: Task, b: Task): boolean {
    if (a.dependsOn.length !== b.dependsOn.length) return false;
    return a.dependsOn.every(d => b.dependsOn.includes(d));
  }
  
  /**
   * 生成默认任务链
   */
  generateDefaultChain(module: string): TaskChain {
    // 基于模块设计生成任务链
    const defaultTasks: Task[] = [
      {
        id: `${module}-init`,
        title: '初始化模块',
        description: `初始化 ${module} 模块基础结构`,
        module,
        phase: 'development',
        dependsOn: [],
        estimatedMinutes: 30,
        assignTo: 'lead_dev',
        canParallelize: false,
        verificationRules: { build: true, test: false, lint: true, typeCheck: true, crossReview: false, manualApproval: false },
        acceptanceCriteria: ['目录结构创建', '基础文件生成'],
        expectedOutputs: ['src/' + module + '/index.ts'],
        status: TASK_STATUS.PENDING,
      },
      {
        id: `${module}-types`,
        title: '定义类型',
        description: `定义 ${module} 模块核心类型`,
        module,
        phase: 'development',
        dependsOn: [`${module}-init`],
        estimatedMinutes: 45,
        assignTo: 'developer',
        canParallelize: false,
        verificationRules: { build: true, test: false, lint: true, typeCheck: true, crossReview: false, manualApproval: false },
        acceptanceCriteria: ['类型定义完整', '无 TypeScript 错误'],
        expectedOutputs: ['src/' + module + '/types.ts'],
        status: TASK_STATUS.PENDING,
      },
    ];
    
    return {
      id: `chain-${module}`,
      moduleId: module,
      tasks: defaultTasks,
      parallelGroups: [],
    };
  }
}