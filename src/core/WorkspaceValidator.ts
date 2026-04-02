/**
 * DevFlow Engine - 工作区验证器
 *
 * 强制执行工作区规范，确保所有子代理产物在正确位置
 */

import type { ProjectConfig, WorkspaceConstraints } from '../project/types.js';
import { ERROR_CODES } from './constants.js';

/**
 * 路径验证结果
 */
export interface PathValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误代码（如果无效） */
  errorCode?: string;
  /** 错误消息（如果无效） */
  errorMessage?: string;
  /** 建议的正确路径 */
  suggestedPath?: string;
}

/**
 * 工作区验证器
 */
export class WorkspaceValidator {
  private readonly projectPath: string;
  private readonly constraints: WorkspaceConstraints;
  private readonly projectName: string;
  private readonly desktopPackagePath: string;

  constructor(projectPath: string, config: ProjectConfig) {
    this.projectPath = projectPath;
    this.projectName = config.name;
    this.constraints = config.workspaceConstraints;
    this.desktopPackagePath = this.expandPath(
      config.workspaceConstraints.packageOutputPath.replace('<project-name>', this.projectName)
    );
  }

  /**
   * 展开路径（处理 ~ 符号）
   */
  private expandPath(path: string): string {
    if (path.startsWith('~')) {
      return path.replace('~', process.env.HOME || '');
    }
    return path;
  }

  /**
   * 验证写入路径
   * @param targetPath 目标写入路径
   * @param fileType 文件类型
   * @param role 当前角色
   */
  validateWritePath(
    targetPath: string,
    fileType: 'source' | 'docs' | 'assets' | 'dist' | 'package' | 'temp',
    role: string
  ): PathValidationResult {
    const expandedPath = this.expandPath(targetPath);

    // 安装包类型：强制输出到桌面
    if (fileType === 'package') {
      if (!expandedPath.startsWith(this.desktopPackagePath)) {
        return {
          valid: false,
          errorCode: ERROR_CODES.PATH_NOT_ALLOWED,
          errorMessage: `安装包必须输出到桌面: ${this.desktopPackagePath}`,
          suggestedPath: this.desktopPackagePath,
        };
      }
      return { valid: true };
    }

    // 检查是否写入个人工作区（禁止）
    if (this.constraints.disableAgentWorkspace) {
      const forbiddenPaths = this.getForbiddenPaths(role);
      for (const forbidden of forbiddenPaths) {
        if (expandedPath.startsWith(forbidden)) {
          return {
            valid: false,
            errorCode: ERROR_CODES.PATH_NOT_ALLOWED,
            errorMessage: `禁止写入个人工作区: ${forbidden}`,
            suggestedPath: this.getSuggestedPath(fileType),
          };
        }
      }
    }

    // 检查是否在项目工作区内（强制）
    if (this.constraints.enforceProjectWorkspace) {
      const allowedPaths = this.getAllowedPaths(fileType);
      const isAllowed = allowedPaths.some((allowed) => 
        expandedPath.startsWith(allowed)
      );

      // 临时文件允许在 .agent-workspace
      if (fileType === 'temp') {
        const agentWorkspace = this.getProjectSubPath('.agent-workspace', role);
        if (expandedPath.startsWith(agentWorkspace)) {
          return { valid: true };
        }
      }

      if (!isAllowed) {
        return {
          valid: false,
          errorCode: ERROR_CODES.PATH_NOT_ALLOWED,
          errorMessage: `必须写入项目工作区: ${this.projectPath}`,
          suggestedPath: this.getSuggestedPath(fileType),
        };
      }
    }

    return { valid: true };
  }

  /**
   * 获取禁止写入的路径列表（个人工作区）
   */
  private getForbiddenPaths(_role: string): string[] {
    const home = process.env.HOME || '';
    const forbidden: string[] = [];

    // 禁止所有代理写入各自的个人工作区
    const workspaceMappings: Record<string, string> = {
      manager: `${home}/.openclaw/workspace-manager`,
      architect: `${home}/.openclaw/workspace-chief-architect`,
      lead_dev: `${home}/.openclaw/workspace-lead-developer`,
      developer: `${home}/.openclaw/workspace-developer`,
      designer: `${home}/.openclaw/workspace-art-director`,
      planner: `${home}/.openclaw/workspace-planner`,
      supervisor: `${home}/.openclaw/workspace-supervisor`,
    };

    // 禁止写入所有个人工作区
    for (const workspacePath of Object.values(workspaceMappings)) {
      forbidden.push(workspacePath);
    }

    // 禁止写入桌面（除非是安装包）
    forbidden.push(`${home}/Desktop`);

    return forbidden;
  }

  /**
   * 获取允许写入的路径列表
   */
  private getAllowedPaths(fileType: 'source' | 'docs' | 'assets' | 'dist' | 'package' | 'temp'): string[] {
    const allowed: string[] = [];

    switch (fileType) {
      case 'source':
        allowed.push(this.getProjectSubPath('src'));
        break;
      case 'docs':
        allowed.push(this.getProjectSubPath('docs'));
        break;
      case 'assets':
        allowed.push(this.getProjectSubPath('assets'));
        break;
      case 'dist':
        allowed.push(this.getProjectSubPath('dist'));
        break;
      case 'package':
        allowed.push(this.desktopPackagePath);
        break;
      case 'temp':
        allowed.push(this.getProjectSubPath('.agent-workspace'));
        break;
    }

    return allowed;
  }

  /**
   * 获取项目子路径
   */
  private getProjectSubPath(subPath: string, role?: string): string {
    if (role && subPath === '.agent-workspace') {
      return `${this.projectPath}/${subPath}/${role}`;
    }
    return `${this.projectPath}/${subPath}`;
  }

  /**
   * 获取建议的正确路径
   */
  private getSuggestedPath(fileType: 'source' | 'docs' | 'assets' | 'dist' | 'package' | 'temp'): string {
    switch (fileType) {
      case 'source':
        return this.getProjectSubPath('src');
      case 'docs':
        return this.getProjectSubPath('docs');
      case 'assets':
        return this.getProjectSubPath('assets');
      case 'dist':
        return this.getProjectSubPath('dist');
      case 'package':
        return this.desktopPackagePath;
      case 'temp':
        return this.getProjectSubPath('.agent-workspace');
      default:
        return this.projectPath;
    }
  }

  /**
   * 获取角色对应的产出目录
   */
  getRoleOutputPath(role: string, fileType: 'source' | 'docs' | 'assets'): string {
    switch (role) {
      case 'designer':
        // 美术产出路径
        if (fileType === 'source') {
          return this.getProjectSubPath('src/frontend');
        }
        if (fileType === 'docs') {
          return this.getProjectSubPath('docs/design');
        }
        if (fileType === 'assets') {
          return this.getProjectSubPath('assets');
        }
        break;

      case 'developer':
      case 'lead_dev':
        // 开发员产出路径
        if (fileType === 'source') {
          return this.getProjectSubPath('src/backend');
        }
        break;

      case 'architect':
        // 架构师产出路径
        if (fileType === 'docs') {
          return this.getProjectSubPath('docs/architecture');
        }
        break;

      case 'planner':
        // 规划师产出路径
        return this.getProjectSubPath('progress');

      case 'supervisor':
        // 主管产出路径
        return this.getProjectSubPath('progress');
    }

    return this.getSuggestedPath(fileType);
  }

  /**
   * 验证构建配置
   * 确保构建产物和安装包输出路径正确
   */
  validateBuildConfig(buildConfig: {
    distPath?: string;
    packagePath?: string;
  }): { distPath: string; packagePath: string } {
    return {
      // 构建中间产物强制在项目内
      distPath: buildConfig.distPath || this.getProjectSubPath('dist'),
      // 安装包强制输出到桌面
      packagePath: this.desktopPackagePath,
    };
  }

  /**
   * 检查路径是否在项目内
   */
  isInProjectPath(path: string): boolean {
    const expandedPath = this.expandPath(path);
    return expandedPath.startsWith(this.projectPath);
  }

  /**
   * 检查路径是否是桌面安装包路径
   */
  isPackagePath(path: string): boolean {
    const expandedPath = this.expandPath(path);
    return expandedPath.startsWith(this.desktopPackagePath);
  }

  /**
   * 获取桌面安装包路径
   */
  getDesktopPackagePath(): string {
    return this.desktopPackagePath;
  }

  /**
   * 获取项目路径
   */
  getProjectPath(): string {
    return this.projectPath;
  }

  /**
   * 获取约束配置
   */
  getConstraints(): WorkspaceConstraints {
    return this.constraints;
  }
}

/**
 * 创建工作区验证器
 */
export function createWorkspaceValidator(
  projectPath: string,
  config: ProjectConfig
): WorkspaceValidator {
  return new WorkspaceValidator(projectPath, config);
}