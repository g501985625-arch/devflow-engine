/**
 * Project Manager - ProjectManager
 * 
 * 项目管理器实现
 * 
 * @module project
 */

import * as path from 'path';
import * as os from 'os';
import { FileSystem } from '../storage/FileSystem.js';
import { StorageLayer } from '../storage/StorageLayer.js';
import { MemoryStore } from '../memory/MemoryStore.js';
import { Project } from './Project.js';
import type { ProjectConfig, ProjectCreateOptions, ProjectState, ProjectStatus } from './types.js';
import { DEFAULTS } from '../core/constants.js';

/**
 * ProjectManager - 项目管理器
 */
export class ProjectManager {
  private fs: FileSystem;
  private projectsDir: string;
  private currentProject: Project | null = null;
  private projects: Map<string, Project> = new Map();
  
  constructor() {
    this.fs = new FileSystem();
    this.projectsDir = path.join(os.homedir(), '.openclaw', 'devflow-projects');
  }
  
  /**
   * 初始化项目管理器
   */
  async initialize(): Promise<void> {
    await this.fs.createDir(this.projectsDir);
  }
  
  /**
   * 创建新项目
   */
  async create(options: ProjectCreateOptions): Promise<Project> {
    // 生成项目 ID
    const projectId = this.generateProjectId(options.name);
    
    // 创建项目目录
    const projectPath = path.join(this.projectsDir, projectId);
    await this.fs.createDir(projectPath);
    
    // 创建标准子目录结构（强制规范：所有产物必须在此目录）
    await this.fs.createDir(path.join(projectPath, 'src'));           // 源代码
    await this.fs.createDir(path.join(projectPath, 'src', 'frontend')); // 前端代码（美术产出）
    await this.fs.createDir(path.join(projectPath, 'src', 'backend'));  // 后端代码
    await this.fs.createDir(path.join(projectPath, 'src', 'shared'));   // 共享代码
    await this.fs.createDir(path.join(projectPath, 'docs'));           // 项目文档
    await this.fs.createDir(path.join(projectPath, 'docs', 'design')); // 设计文档（美术产出）
    await this.fs.createDir(path.join(projectPath, 'docs', 'architecture')); // 架构文档
    await this.fs.createDir(path.join(projectPath, 'assets'));         // 资源文件（美术产出）
    await this.fs.createDir(path.join(projectPath, 'assets', 'images')); // 图片资源
    await this.fs.createDir(path.join(projectPath, 'assets', 'icons'));  // 图标资源
    await this.fs.createDir(path.join(projectPath, 'dist'));           // 构建产物
    await this.fs.createDir(path.join(projectPath, 'dist', 'web'));    // Web 构建产物
    await this.fs.createDir(path.join(projectPath, 'dist', 'desktop')); // 桌面应用构建产物
    await this.fs.createDir(path.join(projectPath, 'dist', 'mobile'));  // 移动应用构建产物
    await this.fs.createDir(path.join(projectPath, 'memory'));         // Agent 记忆数据
    await this.fs.createDir(path.join(projectPath, 'progress'));       // 开发进度
    await this.fs.createDir(path.join(projectPath, 'tests'));          // 测试代码
    await this.fs.createDir(path.join(projectPath, '.agent-workspace')); // 子代理工作区（强制统一）
    
    // 创建代理工作区子目录（按角色划分）
    for (const role of DEFAULTS.roles) {
      await this.fs.createDir(path.join(projectPath, '.agent-workspace', role));
    }
    
    // 创建配置
    const config: ProjectConfig = {
      id: projectId,
      name: options.name,
      description: options.description || '',
      createdAt: new Date().toISOString(),
      status: 'initialized',
      workflow: {
        currentPhase: 'requirement',
        phases: [
          { id: 'requirement', name: '需求阶段', status: 'pending' },
          { id: 'architecture', name: '架构阶段', status: 'pending' },
          { id: 'ui_design', name: 'UI设计阶段', status: 'pending' },
          { id: 'development', name: '开发阶段', status: 'pending' },
          { id: 'integration', name: '整合阶段', status: 'pending' },
          { id: 'extension', name: '扩展阶段', status: 'pending' },
        ],
      },
      team: {
        roles: DEFAULTS.roles,
      },
      verification: {
        autoBuild: true,
        autoTest: true,
        requireCodeReview: true,
        requireVisualVerification: false,
      },
      // 工作区强制约束（所有子代理必须遵守）
      workspaceConstraints: {
        enforceProjectWorkspace: true,  // 强制使用项目工作区
        disableAgentWorkspace: true,    // 禁止写入代理个人工作区
        sourcePath: 'src',              // 源代码路径
        distPath: 'dist',               // 构建产物路径（项目内）
        packageOutputPath: '~/Desktop/<project-name>-Packages/', // 安装包输出路径（桌面）
        docsPath: 'docs',               // 文档路径
        assetsPath: 'assets',           // 资源文件路径
        agentWorkspacePath: '.agent-workspace', // 子代理临时工作路径
      },
    };
    
    // 保存配置文件
    await this.fs.writeFile(
      path.join(projectPath, 'project.json'),
      JSON.stringify(config, null, 2)
    );
    
    // 创建 README
    await this.fs.writeFile(
      path.join(projectPath, 'README.md'),
      this.generateReadme(options)
    );
    
    // 创建初始状态文件
    const state: ProjectState = {
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
    
    await this.fs.writeFile(
      path.join(projectPath, 'progress', 'STATUS.md'),
      this.generateStatusMarkdown(state)
    );
    
    // 创建项目实例
    const project = new Project(projectId, options.name, projectPath, config);
    
    // 初始化存储层
    const storage = new StorageLayer(projectPath);
    await storage.initialize();
    
    // 初始化记忆
    const memoryStore = new MemoryStore(projectPath);
    await memoryStore.initialize();
    
    // 缓存项目
    this.projects.set(projectId, project);
    this.currentProject = project;
    
    return project;
  }
  
  /**
   * 打开项目
   */
  async open(projectPath: string): Promise<Project> {
    // 加载配置
    const configPath = path.join(projectPath, 'project.json');
    const configContent = await this.fs.readFile(configPath);
    const config = JSON.parse(configContent) as ProjectConfig;
    
    // 创建项目实例
    const project = new Project(config.id, config.name, projectPath, config);
    
    // 初始化存储层
    const storage = new StorageLayer(projectPath);
    await storage.initialize();
    
    // 加载记忆
    const memoryStore = new MemoryStore(projectPath);
    project.memory = await memoryStore.getProjectMemory(config.id);
    
    // 缓存项目
    this.projects.set(config.id, project);
    this.currentProject = project;
    
    return project;
  }
  
  /**
   * 关闭项目
   */
  async close(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    
    if (project) {
      // 保存状态
      await this.saveProjectState(project);
      
      // 移除缓存
      this.projects.delete(projectId);
      
      if (this.currentProject?.id === projectId) {
        this.currentProject = null;
      }
    }
  }
  
  /**
   * 列出所有项目
   */
  async list(): Promise<Project[]> {
    const dirs = await this.fs.listDir(this.projectsDir);
    const projects: Project[] = [];
    
    for (const dir of dirs) {
      const projectPath = path.join(this.projectsDir, dir);
      const configPath = path.join(projectPath, 'project.json');
      
      if (await this.fs.exists(configPath)) {
        try {
          const project = await this.open(projectPath);
          projects.push(project);
        } catch {
          // 跳过无法打开的项目
        }
      }
    }
    
    return projects;
  }
  
  /**
   * 删除项目
   */
  async delete(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    
    if (project) {
      await this.fs.deleteDir(project.path);
      this.projects.delete(projectId);
      
      if (this.currentProject?.id === projectId) {
        this.currentProject = null;
      }
    }
  }
  
  /**
   * 获取当前项目
   */
  getCurrent(): Project | null {
    return this.currentProject;
  }
  
  /**
   * 获取项目
   */
  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }
  
  /**
   * 更新项目状态
   */
  async updateStatus(projectId: string, status: ProjectStatus): Promise<void> {
    const project = this.projects.get(projectId);
    
    if (project) {
      project.config.status = status;
      await this.saveProjectConfig(project);
    }
  }
  
  /**
   * 保存项目配置
   */
  private async saveProjectConfig(project: Project): Promise<void> {
    const configPath = path.join(project.path, 'project.json');
    await this.fs.writeFile(configPath, JSON.stringify(project.config, null, 2));
  }
  
  /**
   * 保存项目状态
   */
  private async saveProjectState(project: Project): Promise<void> {
    const statusPath = path.join(project.path, 'progress', 'STATUS.md');
    await this.fs.writeFile(statusPath, this.generateStatusMarkdown(project.state));
  }
  
  /**
   * 生成项目 ID
   */
  private generateProjectId(name: string): string {
    const timestamp = Date.now();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return `${slug}-${timestamp}`;
  }
  
  /**
   * 生成 README
   */
  private generateReadme(options: ProjectCreateOptions): string {
    const name = options.name;
    const desc = options.description || 'DevFlow Engine 项目';
    const date = new Date().toISOString();
    
    return `# ${name}

${desc}

---

## 项目结构

- src/ - 源代码
- docs/ - 文档
- memory/ - 记忆存储
- progress/ - 进度追踪
- templates/ - 项目模板
- tests/ - 测试文件

---

## 工作流程

1. 需求阶段 - 收集和分析需求
2. 架构阶段 - 设计系统架构
3. 开发阶段 - 实现功能模块
4. 整合阶段 - 集成和测试
5. 扩展阶段 - 优化和扩展

---

创建时间: ${date}
`;
  }
  
  /**
   * 生成状态 Markdown
   */
  private generateStatusMarkdown(state: ProjectState): string {
    const phase = state.phase;
    const module = state.module || '无';
    const task = state.task || '无';
    const total = state.progress.totalTasks;
    const completed = state.progress.completedTasks;
    const failed = state.progress.failedTasks;
    const pending = state.progress.pendingTasks;
    const percentage = state.progress.percentage;
    
    return `# 项目状态

> 实时追踪进度

---

## 当前状态

阶段: ${phase}
模块: ${module}
任务: ${task}

---

## 进度统计

总任务:   ${total}
已完成:   ${completed}
失败:     ${failed}
待开始:   ${pending}
进度:     ${percentage}%

---

**更新时间**: ${new Date().toISOString()}
`;
  }
}