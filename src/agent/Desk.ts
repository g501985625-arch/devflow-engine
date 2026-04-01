/**
 * Agent Manager - Desk
 * 
 * 工位
 * 每个 AI Agent 的工作位置
 * 
 * @module agent
 */

import * as path from 'path';
import { FileSystem } from '../storage/FileSystem.js';
import type { AgentConfig, ToolResult, DeskDefinition } from './types.js';

/**
 * 内置工具定义
 */
const BUILTIN_TOOLS: Record<string, ToolDefinition> = {
  read_file: {
    name: 'read_file',
    description: '读取文件内容',
    parameters: {
      path: { type: 'string', description: '文件路径' },
    },
    required: ['path'],
  },
  write_file: {
    name: 'write_file',
    description: '写入文件内容',
    parameters: {
      path: { type: 'string', description: '文件路径' },
      content: { type: 'string', description: '文件内容' },
    },
    required: ['path', 'content'],
  },
  list_dir: {
    name: 'list_dir',
    description: '列出目录内容',
    parameters: {
      path: { type: 'string', description: '目录路径' },
    },
    required: ['path'],
  },
  execute_command: {
    name: 'execute_command',
    description: '执行命令',
    parameters: {
      command: { type: 'string', description: '命令' },
      timeout: { type: 'number', description: '超时时间(ms)' },
    },
    required: ['command'],
  },
  search_files: {
    name: 'search_files',
    description: '搜索文件',
    parameters: {
      query: { type: 'string', description: '搜索查询' },
      path: { type: 'string', description: '搜索路径' },
    },
    required: ['query'],
  },
};

interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string }>;
  required: string[];
}

/**
 * Desk - 工位
 */
export class Desk {
  private role: string;
  private config: AgentConfig;
  private projectPath: string;
  private fs: FileSystem;
  private tools: Map<string, ToolDefinition> = new Map();
  
  constructor(role: string, config: AgentConfig, projectPath: string) {
    this.role = role;
    this.config = config;
    this.projectPath = projectPath;
    this.fs = new FileSystem();
    
    // 注册内置工具
    this.registerBuiltinTools();
    
    // 注册角色特定工具
    this.registerRoleTools();
  }
  
  /**
   * 获取配置
   */
  getConfig(): DeskDefinition {
    return {
      role: this.role,
      name: this.config.name,
      description: this.config.description,
      capabilities: this.config.capabilities,
      tools: Array.from(this.tools.keys()),
    };
  }
  
  /**
   * 获取角色
   */
  getRole(): string {
    return this.role;
  }
  
  /**
   * 获取可用工具
   */
  getAvailableTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * 执行工具
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${name}`,
      };
    }
    
    try {
      // 验证参数
      for (const required of tool.required) {
        if (args[required] === undefined) {
          return {
            success: false,
            error: `Missing required parameter: ${required}`,
          };
        }
      }
      
      // 执行工具
      const result = await this.executeToolInternal(name, args);
      
      return {
        success: true,
        output: result,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  
  /**
   * 内部工具执行
   */
  private async executeToolInternal(
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    switch (name) {
      case 'read_file':
        return this.executeReadFile(args.path as string);
      
      case 'write_file':
        return this.executeWriteFile(
          args.path as string,
          args.content as string
        );
      
      case 'list_dir':
        return this.executeListDir(args.path as string);
      
      case 'execute_command':
        return this.executeCommand(
          args.command as string,
          args.timeout as number | undefined
        );
      
      case 'search_files':
        return this.executeSearchFiles(
          args.query as string,
          args.path as string | undefined
        );
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
  
  /**
   * 注册内置工具
   */
  private registerBuiltinTools(): void {
    for (const [name, tool] of Object.entries(BUILTIN_TOOLS)) {
      this.tools.set(name, tool);
    }
  }
  
  /**
   * 注册角色特定工具
   */
  private registerRoleTools(): void {
    // 根据角色添加特定工具
    switch (this.role) {
      case 'manager':
        this.tools.set('create_project', {
          name: 'create_project',
          description: '创建新项目',
          parameters: {
            name: { type: 'string', description: '项目名称' },
            description: { type: 'string', description: '项目描述' },
          },
          required: ['name'],
        });
        break;
      
      case 'architect':
        this.tools.set('design_module', {
          name: 'design_module',
          description: '设计模块架构',
          parameters: {
            module: { type: 'string', description: '模块名称' },
            spec: { type: 'object', description: '模块规范' },
          },
          required: ['module'],
        });
        break;
      
      case 'lead_dev':
        this.tools.set('implement_feature', {
          name: 'implement_feature',
          description: '实现功能',
          parameters: {
            feature: { type: 'string', description: '功能名称' },
            code: { type: 'string', description: '代码' },
          },
          required: ['feature', 'code'],
        });
        break;
      
      case 'developer':
        this.tools.set('write_test', {
          name: 'write_test',
          description: '编写测试',
          parameters: {
            module: { type: 'string', description: '模块名称' },
            testType: { type: 'string', description: '测试类型' },
          },
          required: ['module'],
        });
        break;
      
      case 'designer':
        this.tools.set('create_design', {
          name: 'create_design',
          description: '创建设计',
          parameters: {
            type: { type: 'string', description: '设计类型' },
            spec: { type: 'object', description: '设计规范' },
          },
          required: ['type'],
        });
        break;
    }
  }
  
  /**
   * 执行读取文件
   */
  private async executeReadFile(filePath: string): Promise<string> {
    const fullPath = this.resolvePath(filePath);
    return await this.fs.readFile(fullPath);
  }
  
  /**
   * 执行写入文件
   */
  private async executeWriteFile(filePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    await this.fs.writeFile(fullPath, content);
  }
  
  /**
   * 执行列出目录
   */
  private async executeListDir(dirPath: string): Promise<string[]> {
    const fullPath = this.resolvePath(dirPath);
    return await this.fs.listDir(fullPath);
  }
  
  /**
   * 执行命令
   */
  private async executeCommand(
    command: string,
    _timeout?: number
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    // TODO: 使用 child_process 执行
    // 占位实现
    return {
      stdout: '',
      stderr: `Command not executed: ${command}`,
      code: 1,
    };
  }
  
  /**
   * 执行搜索文件
   */
  private async executeSearchFiles(
    _query: string,
    searchPath?: string
  ): Promise<string[]> {
    // TODO: 实现文件搜索
    // 占位实现
    void _query;
    const _basePath = searchPath ? this.resolvePath(searchPath) : this.projectPath;
    void _basePath;
    return [];
  }
  
  /**
   * 解析路径
   */
  private resolvePath(filePath: string): string {
    if (filePath.startsWith('/')) {
      return filePath;
    }
    
    return path.join(this.projectPath, filePath);
  }
}