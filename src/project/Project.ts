/**
 * Project Manager - Project
 * 
 * 项目类
 * 
 * TODO: 实现 T2.2
 */

import type { ProjectConfig, ProjectState } from './types.js';
import type { ProjectMemory } from '../memory/types.js';
import type { FileIndex } from '../storage/types.js';

export class Project {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly config: ProjectConfig;
  
  state: ProjectState;
  memory: ProjectMemory;
  index: FileIndex;
  
  constructor(
    id: string,
    name: string,
    path: string,
    config: ProjectConfig
  ) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.config = config;
    
    // 初始化默认值
    this.state = {
      phase: 'requirement',
      module: null,
      task: null,
      progress: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        pendingTasks: 0,
        percentage: 0,
      },
    };
    
    this.memory = {};
    this.index = {
      files: new Map(),
      byExtension: new Map(),
      byDirectory: new Map(),
      lastUpdated: new Date(),
    };
  }
  
  updateState(state: Partial<ProjectState>): void {
    this.state = { ...this.state, ...state };
  }
  
  getProgress(): number {
    return this.state.progress.percentage;
  }
}