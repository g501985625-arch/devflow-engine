/**
 * Storage Layer - ConfigManager
 * 
 * 配置管理器
 * 
 * @module storage
 */

import * as yaml from 'yaml';
import { FileSystem } from './FileSystem.js';
import { PathUtils } from './PathUtils.js';

/**
 * 配置管理器
 */
export class ConfigManager {
  private fs: FileSystem;
  private pathUtils: PathUtils;
  private config: Record<string, unknown> = {};
  private configPath: string;
  
  constructor(projectRoot: string) {
    this.fs = new FileSystem();
    this.pathUtils = new PathUtils(projectRoot);
    this.configPath = this.pathUtils.getConfigPath();
  }
  
  /**
   * 加载配置
   */
  async load(): Promise<void> {
    const exists = await this.fs.exists(this.configPath);
    if (exists) {
      const content = await this.fs.readFile(this.configPath);
      this.config = yaml.parse(content) as Record<string, unknown> || {};
    } else {
      this.config = this.getDefaultConfig();
    }
  }
  
  /**
   * 保存配置
   */
  async save(): Promise<void> {
    const content = yaml.stringify(this.config);
    await this.fs.writeFile(this.configPath, content);
  }
  
  /**
   * 获取配置项
   */
  get<T = unknown>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: unknown = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue as T;
      }
    }
    
    return value as T;
  }
  
  /**
   * 设置配置项
   */
  set(key: string, value: unknown): void {
    const keys = key.split('.');
    let target: Record<string, unknown> = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]!;
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k] as Record<string, unknown>;
    }
    
    target[keys[keys.length - 1]!] = value;
  }
  
  /**
   * 获取整个配置
   */
  getAll(): Record<string, unknown> {
    return { ...this.config };
  }
  
  /**
   * 更新配置
   */
  update(config: Record<string, unknown>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = this.getDefaultConfig();
  }
  
  /**
   * 获取默认配置
   */
  private getDefaultConfig(): Record<string, unknown> {
    return {
      project: {
        name: '',
        version: '0.1.0',
        description: '',
      },
      workflow: {
        currentPhase: 'requirement',
        phases: ['requirement', 'architecture', 'development', 'integration', 'extension'],
        autoRepair: true,
        autoRetry: true,
        maxRetries: 3,
      },
      team: {
        roles: ['manager', 'architect', 'lead_dev', 'developer', 'designer'],
        fixedDesks: true,
      },
      verification: {
        autoBuild: true,
        autoTest: true,
        requireCodeReview: true,
        requireVisualVerification: false,
      },
      storage: {
        memoryDir: 'memory',
        progressDir: 'progress',
        templateDir: 'templates',
      },
      llm: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
      },
    };
  }
}