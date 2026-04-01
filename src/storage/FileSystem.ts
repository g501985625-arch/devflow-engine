/**
 * Storage Layer - FileSystem
 * 
 * 文件系统操作类
 * 核心功能：读写文件、目录操作、文件信息获取
 * 
 * @module storage
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as fss from 'fs';
import type { FileInfo } from './types.js';

/**
 * FileSystem 类
 * 
 * 提供异步文件系统操作
 */
export class FileSystem {
  /**
   * 读取文件内容
   */
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 写入文件内容
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      await this.createDir(dir);
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 文件不存在不算错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to delete file ${filePath}: ${(error as Error).message}`);
      }
    }
  }
  
  /**
   * 检查文件/目录是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 创建目录（递归）
   */
  async createDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 删除目录（递归）
   */
  async deleteDir(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to delete directory ${dirPath}: ${(error as Error).message}`);
      }
    }
  }
  
  /**
   * 列出目录内容
   */
  async listDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      throw new Error(`Failed to list directory ${dirPath}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string, basePath: string): Promise<FileInfo> {
    try {
      const stats = await fs.stat(filePath);
      
      return {
        path: filePath,
        relativePath: path.relative(basePath, filePath),
        extension: path.extname(filePath),
        directory: path.dirname(filePath),
        size: stats.size,
        modifiedAt: stats.mtime,
        projectName: path.basename(basePath),
      };
    } catch (error) {
      throw new Error(`Failed to get file info ${filePath}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 复制文件
   */
  async copyFile(source: string, target: string): Promise<void> {
    try {
      await this.createDir(path.dirname(target));
      await fs.copyFile(source, target);
    } catch (error) {
      throw new Error(`Failed to copy file from ${source} to ${target}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 移动文件
   */
  async moveFile(source: string, target: string): Promise<void> {
    try {
      await this.createDir(path.dirname(target));
      await fs.rename(source, target);
    } catch (error) {
      throw new Error(`Failed to move file from ${source} to ${target}: ${(error as Error).message}`);
    }
  }
  
  /**
   * 同步检查文件是否存在
   */
  existsSync(filePath: string): boolean {
    return fss.existsSync(filePath);
  }
  
  /**
   * 获取文件统计信息（同步）
   */
  getStatsSync(filePath: string): fss.Stats | null {
    try {
      return fss.statSync(filePath);
    } catch {
      return null;
    }
  }
}