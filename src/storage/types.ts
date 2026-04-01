/**
 * Storage Layer - 类型定义
 */

import type { TimeRange } from '../core/types.js';

/**
 * 文件信息
 */
export interface FileInfo {
  /** 绝对路径 */
  path: string;
  /** 相对路径 */
  relativePath: string;
  /** 文件扩展名 */
  extension: string;
  /** 所在目录 */
  directory: string;
  /** 文件大小 (bytes) */
  size: number;
  /** 最后修改时间 */
  modifiedAt: Date;
  /** 项目名称 */
  projectName: string;
}

/**
 * 文件索引
 */
export interface FileIndex {
  /** 文件映射 (path -> FileInfo) */
  files: Map<string, FileInfo>;
  /** 按扩展名分组 */
  byExtension: Map<string, string[]>;
  /** 按目录分组 */
  byDirectory: Map<string, string[]>;
  /** 最后更新时间 */
  lastUpdated: Date;
}

/**
 * 文件搜索查询
 */
export interface FileSearchQuery {
  /** 路径过滤 */
  path?: string;
  /** 扩展名过滤 */
  extension?: string;
  /** 关键词过滤 */
  keyword?: string;
  /** 内容搜索 */
  content?: string;
  /** 时间范围 */
  timeRange?: TimeRange;
}