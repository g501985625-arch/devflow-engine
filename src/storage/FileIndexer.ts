/**
 * Storage Layer - FileIndexer
 * 
 * 文件索引器
 * 
 * @module storage
 */

import * as path from 'path';
import { FileSystem } from './FileSystem.js';
import type { FileIndex, FileInfo, FileSearchQuery } from './types.js';

/**
 * 文件索引器
 */
export class FileIndexer {
  private fs: FileSystem;
  private ignorePatterns: string[];
  
  constructor() {
    this.fs = new FileSystem();
    this.ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.DS_Store',
      'Thumbs.db',
    ];
  }
  
  /**
   * 扫描项目文件
   */
  async scanProject(projectPath: string): Promise<FileIndex> {
    const files: FileInfo[] = [];
    await this.scanDir(projectPath, projectPath, files);
    return this.buildIndex(files);
  }
  
  /**
   * 递归扫描目录
   */
  private async scanDir(
    dirPath: string,
    basePath: string,
    files: FileInfo[]
  ): Promise<void> {
    const entries = await this.fs.listDir(dirPath);
    
    for (const entry of entries) {
      // 跳过忽略的目录/文件
      if (this.shouldIgnore(entry)) {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry);
      const stats = this.fs.getStatsSync(fullPath);
      
      if (!stats) continue;
      
      if (stats.isDirectory()) {
        await this.scanDir(fullPath, basePath, files);
      } else if (stats.isFile()) {
        files.push({
          path: fullPath,
          relativePath: path.relative(basePath, fullPath),
          extension: path.extname(fullPath),
          directory: path.dirname(fullPath),
          size: stats.size,
          modifiedAt: stats.mtime,
          projectName: path.basename(basePath),
        });
      }
    }
  }
  
  /**
   * 检查是否应该忽略
   */
  private shouldIgnore(name: string): boolean {
    return this.ignorePatterns.some(pattern => 
      name === pattern || name.startsWith(pattern)
    );
  }
  
  /**
   * 构建索引
   */
  async buildIndex(files: FileInfo[]): Promise<FileIndex> {
    const fileMap = new Map<string, FileInfo>();
    const byExtension = new Map<string, string[]>();
    const byDirectory = new Map<string, string[]>();
    
    for (const file of files) {
      // 文件映射
      fileMap.set(file.path, file);
      
      // 按扩展名分组
      const ext = file.extension || 'no-extension';
      if (!byExtension.has(ext)) {
        byExtension.set(ext, []);
      }
      const extFiles = byExtension.get(ext);
      if (extFiles) {
        extFiles.push(file.path);
      }
      
      // 按目录分组
      if (!byDirectory.has(file.directory)) {
        byDirectory.set(file.directory, []);
      }
      const dirFiles = byDirectory.get(file.directory);
      if (dirFiles) {
        dirFiles.push(file.path);
      }
    }
    
    return {
      files: fileMap,
      byExtension,
      byDirectory,
      lastUpdated: new Date(),
    };
  }
  
  /**
   * 搜索文件
   */
  async search(index: FileIndex, query: FileSearchQuery): Promise<FileInfo[]> {
    const results: FileInfo[] = [];
    
    for (const [filePath, info] of index.files) {
      let matches = true;
      
      // 扩展名过滤
      if (query.extension && info.extension !== query.extension) {
        matches = false;
      }
      
      // 目录过滤
      if (query.path && !filePath.includes(query.path)) {
        matches = false;
      }
      
      // 关键词过滤（文件名）
      if (query.keyword) {
        const basename = path.basename(filePath);
        if (!basename.toLowerCase().includes(query.keyword.toLowerCase())) {
          matches = false;
        }
      }
      
      if (matches) {
        results.push(info);
      }
    }
    
    return results;
  }
  
  /**
   * 更新索引
   */
  async updateIndex(index: FileIndex, changes: FileInfo[]): Promise<FileIndex> {
    for (const file of changes) {
      index.files.set(file.path, file);
      
      // 更新扩展名分组
      const ext = file.extension || 'no-extension';
      if (!index.byExtension.has(ext)) {
        index.byExtension.set(ext, []);
      }
      const extList = index.byExtension.get(ext)!;
      if (!extList.includes(file.path)) {
        extList.push(file.path);
      }
      
      // 更新目录分组
      if (!index.byDirectory.has(file.directory)) {
        index.byDirectory.set(file.directory, []);
      }
      const dirList = index.byDirectory.get(file.directory)!;
      if (!dirList.includes(file.path)) {
        dirList.push(file.path);
      }
    }
    
    index.lastUpdated = new Date();
    return index;
  }
  
  /**
   * 获取文件统计
   */
  getStats(index: FileIndex): {
    totalFiles: number;
    totalSize: number;
    extensions: Record<string, number>;
    directories: number;
  } {
    let totalSize = 0;
    const extensions: Record<string, number> = {};
    
    for (const info of index.files.values()) {
      totalSize += info.size;
      const ext = info.extension || 'no-extension';
      extensions[ext] = (extensions[ext] || 0) + 1;
    }
    
    return {
      totalFiles: index.files.size,
      totalSize,
      extensions,
      directories: index.byDirectory.size,
    };
  }
}