/**
 * Storage Layer - StorageLayer
 * 
 * 存储层组合类
 * 整合 FileSystem、ConfigManager、FileIndexer、Watcher
 * 
 * @module storage
 */

import { FileSystem } from './FileSystem.js';
import { ConfigManager } from './ConfigManager.js';
import { FileIndexer } from './FileIndexer.js';
import { PathUtils } from './PathUtils.js';
import { Watcher, FileChangeEvent } from './Watcher.js';
import { WorkspaceValidator, createWorkspaceValidator } from '../core/WorkspaceValidator.js';
import type { FileIndex, FileInfo, FileSearchQuery } from './types.js';

/**
 * 存储层状态
 */
export interface StorageLayerState {
  projectPath: string;
  initialized: boolean;
  watching: boolean;
  lastIndexed: Date | null;
  fileCount: number;
}

/**
 * StorageLayer - 存储层组合类
 */
export class StorageLayer {
  readonly fs: FileSystem;
  readonly config: ConfigManager;
  readonly indexer: FileIndexer;
  readonly paths: PathUtils;
  readonly watcher: Watcher;
  
  private index: FileIndex | null = null;
  private initialized = false;
  private validator: WorkspaceValidator | null = null;
  
  constructor(projectPath: string) {
    this.fs = new FileSystem();
    this.config = new ConfigManager(projectPath);
    this.indexer = new FileIndexer();
    this.paths = new PathUtils(projectPath);
    this.watcher = new Watcher(projectPath);
  }
  
  /**
   * 初始化存储层
   */
  async initialize(): Promise<void> {
    // 加载配置
    await this.config.load();
    
    // 创建工作区验证器（强制执行规范）
    const projectConfig = await this.config.getProjectConfig();
    if (projectConfig?.workspaceConstraints?.enforceProjectWorkspace) {
      this.validator = createWorkspaceValidator(
        this.paths.getProjectPath(),
        projectConfig
      );
    }
    
    // 扫描文件索引
    this.index = await this.indexer.scanProject(this.paths.getProjectPath());
    
    // 创建必要目录
    await this.fs.createDir(this.paths.getMemoryPath());
    await this.fs.createDir(this.paths.getProgressPath());
    
    // 创建桌面安装包输出目录
    if (this.validator) {
      await this.fs.createDir(this.validator.getDesktopPackagePath());
    }
    
    this.initialized = true;
  }
  
  /**
   * 获取工作区验证器
   */
  getValidator(): WorkspaceValidator | null {
    return this.validator;
  }
  
  /**
   * 验证写入路径（强制执行工作区规范）
   * @param targetPath 目标路径
   * @param fileType 文件类型
   * @param role 当前角色
   */
  validateWritePath(
    targetPath: string,
    fileType: 'source' | 'docs' | 'assets' | 'dist' | 'package' | 'temp',
    role: string
  ): void {
    if (!this.validator) {
      return; // 未启用强制约束，跳过验证
    }
    
    const result = this.validator.validateWritePath(targetPath, fileType, role);
    
    if (!result.valid) {
      throw new Error(
        `[工作区规范违规] ${result.errorMessage}\n建议路径: ${result.suggestedPath}`
      );
    }
  }
  
  /**
   * 安全写入文件（自动验证路径）
   */
  async safeWriteFile(
    filePath: string,
    content: string,
    fileType: 'source' | 'docs' | 'assets' | 'dist' | 'package' | 'temp',
    role: string
  ): Promise<void> {
    this.validateWritePath(filePath, fileType, role);
    await this.fs.writeFile(filePath, content);
  }
  
  /**
   * 启动文件监视
   */
  async startWatching(onChange?: (event: FileChangeEvent) => void): Promise<void> {
    await this.watcher.start();
    
    if (onChange) {
      this.watcher.onChange(onChange);
    }
    
    // 自动更新索引
    this.watcher.onChange((event) => {
      void (async () => {
        if (event.type === 'add' || event.type === 'change') {
          const info = await this.fs.getFileInfo(event.path, this.paths.getProjectPath());
          if (this.index) {
            this.index = await this.indexer.updateIndex(this.index, [info]);
          }
        }
      })();
    });
  }
  
  /**
   * 停止文件监视
   */
  async stopWatching(): Promise<void> {
    await this.watcher.stop();
  }
  
  /**
   * 获取文件索引
   */
  getIndex(): FileIndex | null {
    return this.index;
  }
  
  /**
   * 刷新索引
   */
  async refreshIndex(): Promise<void> {
    this.index = await this.indexer.scanProject(this.paths.getProjectPath());
  }
  
  /**
   * 搜索文件
   */
  async searchFiles(query: FileSearchQuery): Promise<FileInfo[]> {
    if (!this.index) {
      await this.refreshIndex();
    }
    return this.indexer.search(this.index!, query);
  }
  
  /**
   * 获取文件内容
   */
  async readFile(relativePath: string): Promise<string> {
    const absolutePath = this.paths.absolute(relativePath);
    return this.fs.readFile(absolutePath);
  }
  
  /**
   * 写入文件内容
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    const absolutePath = this.paths.absolute(relativePath);
    await this.fs.writeFile(absolutePath, content);
  }
  
  /**
   * 获取存储层状态
   */
  getState(): StorageLayerState {
    return {
      projectPath: this.paths.getProjectPath(),
      initialized: this.initialized,
      watching: this.watcher.isWatching(),
      lastIndexed: this.index?.lastUpdated || null,
      fileCount: this.index?.files.size || 0,
    };
  }
  
  /**
   * 保存配置
   */
  async saveConfig(): Promise<void> {
    await this.config.save();
  }
  
  /**
   * 关闭存储层
   */
  async shutdown(): Promise<void> {
    await this.stopWatching();
    await this.saveConfig();
    this.initialized = false;
  }
}