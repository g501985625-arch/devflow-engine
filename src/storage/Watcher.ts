/**
 * Storage Layer - Watcher
 * 
 * 文件监视器
 * 
 * @module storage
 */

import * as chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';

/**
 * 文件变更事件
 */
export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  timestamp: Date;
}

/**
 * 文件监视器
 */
export class Watcher {
  private watcher: FSWatcher | null = null;
  private listeners: ((event: FileChangeEvent) => void)[] = [];
  private projectPath: string;
  private ignorePatterns: string[];
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.ignorePatterns = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '**/.DS_Store',
      '**/Thumbs.db',
    ];
  }
  
  /**
   * 启动监视
   */
  async start(): Promise<void> {
    if (this.watcher) {
      return;
    }
    
    this.watcher = chokidar.watch(this.projectPath, {
      ignored: this.ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });
    
    this.watcher
      .on('add', (path: string) => this.emit('add', path))
      .on('change', (path: string) => this.emit('change', path))
      .on('unlink', (path: string) => this.emit('unlink', path))
      .on('addDir', (path: string) => this.emit('addDir', path))
      .on('unlinkDir', (path: string) => this.emit('unlinkDir', path))
      .on('error', (error: Error) => console.error('Watcher error:', error));
  }
  
  /**
   * 停止监视
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.listeners = [];
  }
  
  /**
   * 添加监听器
   */
  onChange(listener: (event: FileChangeEvent) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * 移除监听器
   */
  removeListener(listener: (event: FileChangeEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * 发送事件
   */
  private emit(type: FileChangeEvent['type'], filePath: string): void {
    const event: FileChangeEvent = {
      type,
      path: filePath,
      timestamp: new Date(),
    };
    
    for (const listener of this.listeners) {
      listener(event);
    }
  }
  
  /**
   * 获取监视状态
   */
  isWatching(): boolean {
    return this.watcher !== null;
  }
  
  /**
   * 获取监视路径
   */
  getWatchedPaths(): string[] {
    if (!this.watcher) return [];
    return Object.keys(this.watcher.getWatched());
  }
}