/**
 * ProjectManager 项目管理器测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectManager } from '../../src/project/ProjectManager.js';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

describe('ProjectManager', () => {
  let projectManager: ProjectManager;
  let testProjectsDir: string;

  beforeEach(async () => {
    testProjectsDir = path.join(os.tmpdir(), `projects-test-${Date.now()}`);
    await fs.mkdir(testProjectsDir, { recursive: true });
    projectManager = new ProjectManager();
    // 临时覆盖项目目录
    (projectManager as unknown as { projectsDir: string }).projectsDir = testProjectsDir;
    await projectManager.initialize();
  });

  afterEach(async () => {
    await fs.rm(testProjectsDir, { recursive: true, force: true });
  });

  describe('初始化', () => {
    it('应该创建项目目录', async () => {
      const exists = await fs.stat(testProjectsDir).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('创建项目', () => {
    it('应该创建完整的项目结构', async () => {
      const project = await projectManager.create({
        name: 'Test Project',
        description: 'A test project',
      });

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.path).toBeDefined();

      // 验证目录结构
      const dirs = ['src', 'docs', 'assets', 'dist', 'memory', 'progress', 'tests', '.agent-workspace'];
      for (const dir of dirs) {
        const dirPath = path.join(project.path, dir);
        const exists = await fs.stat(dirPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it('应该创建项目配置文件', async () => {
      const project = await projectManager.create({
        name: 'Config Test',
        description: 'Testing config',
      });

      const configPath = path.join(project.path, 'project.json');
      const exists = await fs.stat(configPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      expect(config.name).toBe('Config Test');
      expect(config.status).toBe('initialized');
      expect(config.workflow.currentPhase).toBe('requirement');
    });

    it('应该创建 README 文件', async () => {
      const project = await projectManager.create({
        name: 'Readme Test',
        description: 'Testing README',
      });

      const readmePath = path.join(project.path, 'README.md');
      const exists = await fs.stat(readmePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('应该创建状态文件', async () => {
      const project = await projectManager.create({
        name: 'Status Test',
      });

      const statusPath = path.join(project.path, 'progress', 'STATUS.md');
      const exists = await fs.stat(statusPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('项目列表', () => {
    it('应该列出所有项目', async () => {
      await projectManager.create({ name: 'Project 1' });
      await projectManager.create({ name: 'Project 2' });

      const projects = await projectManager.list();
      expect(projects.length).toBe(2);
    });
  });

  describe('当前项目', () => {
    it('应该跟踪当前项目', async () => {
      const project = await projectManager.create({ name: 'Current Test' });
      
      const current = projectManager.getCurrent();
      expect(current?.id).toBe(project.id);
    });
  });

  describe('获取项目', () => {
    it('应该通过 ID 获取项目', async () => {
      const project = await projectManager.create({ name: 'Get Test' });
      
      const found = projectManager.getProject(project.id);
      expect(found?.id).toBe(project.id);
    });
  });

  describe('删除项目', () => {
    it('应该删除项目及其目录', async () => {
      const project = await projectManager.create({ name: 'Delete Test' });
      const projectPath = project.path;

      await projectManager.delete(project.id);

      const exists = await fs.stat(projectPath).then(() => true).catch(() => false);
      expect(exists).toBe(false);
      
      const found = projectManager.getProject(project.id);
      expect(found).toBeUndefined();
    });
  });

  describe('项目 ID 生成', () => {
    it('应该生成唯一的 ID', async () => {
      const project1 = await projectManager.create({ name: 'Unique 1' });
      const project2 = await projectManager.create({ name: 'Unique 2' });

      expect(project1.id).not.toBe(project2.id);
    });

    it('ID 应该包含项目名称', async () => {
      const project = await projectManager.create({ name: 'My Special Project' });
      
      expect(project.id).toContain('my-special-project');
    });
  });
});