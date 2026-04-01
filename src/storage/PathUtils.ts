/**
 * Storage Layer - PathUtils
 * 
 * 路径工具类
 * 
 * @module storage
 */

import * as path from 'path';
import * as os from 'os';

/**
 * 路径工具类
 */
export class PathUtils {
  /**
   * 项目根目录
   */
  private projectRoot: string;
  
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }
  
  /**
   * 获取绝对路径
   */
  absolute(relativePath: string): string {
    return path.resolve(this.projectRoot, relativePath);
  }
  
  /**
   * 获取相对路径
   */
  relative(absolutePath: string): string {
    return path.relative(this.projectRoot, absolutePath);
  }
  
  /**
   * 获取项目路径
   */
  getProjectPath(subPath?: string): string {
    if (subPath) {
      return path.join(this.projectRoot, subPath);
    }
    return this.projectRoot;
  }
  
  /**
   * 获取 memory 目录路径
   */
  getMemoryPath(role?: string): string {
    const memoryDir = path.join(this.projectRoot, 'memory');
    if (role) {
      return path.join(memoryDir, role);
    }
    return memoryDir;
  }
  
  /**
   * 获取 progress 目录路径
   */
  getProgressPath(): string {
    return path.join(this.projectRoot, 'progress');
  }
  
  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return path.join(this.projectRoot, 'devflow.config.yaml');
  }
  
  /**
   * 获取状态文件路径
   */
  getStatusPath(): string {
    return path.join(this.projectRoot, 'progress', 'STATUS.md');
  }
  
  /**
   * 获取历史文件路径
   */
  getHistoryPath(): string {
    return path.join(this.projectRoot, 'progress', 'HISTORY.md');
  }
  
  /**
   * 标准化路径
   */
  normalize(p: string): string {
    return path.normalize(p);
  }
  
  /**
   * 连接路径片段
   */
  join(...segments: string[]): string {
    return path.join(...segments);
  }
  
  /**
   * 获取文件扩展名
   */
  getExtension(filePath: string): string {
    return path.extname(filePath);
  }
  
  /**
   * 获取文件名（不含扩展名）
   */
  getBasename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }
  
  /**
   * 获取目录名
   */
  getDirname(filePath: string): string {
    return path.dirname(filePath);
  }
  
  /**
   * 检查路径是否在项目内
   */
  isProjectPath(filePath: string): boolean {
    const absPath = path.resolve(filePath);
    const absRoot = path.resolve(this.projectRoot);
    return absPath.startsWith(absRoot);
  }
  
  /**
   * 获取工作区根目录（用户级）
   */
  static getWorkspaceRoot(): string {
    return path.join(os.homedir(), '.openclaw');
  }
  
  /**
   * 获取项目列表目录
   */
  static getProjectsDir(): string {
    return path.join(os.homedir(), '.openclaw', 'projects');
  }
  
  /**
   * 获取全局配置目录
   */
  static getGlobalConfigDir(): string {
    return path.join(os.homedir(), '.openclaw', 'config');
  }
  
  /**
   * 获取缓存目录
   */
  static getCacheDir(): string {
    return path.join(os.homedir(), '.openclaw', 'cache');
  }
}