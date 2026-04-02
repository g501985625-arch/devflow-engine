/**
 * MemoryStore 记忆存储测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryStore } from '../../src/memory/MemoryStore.js';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

describe('MemoryStore', () => {
  let memoryStore: MemoryStore;
  let testPath: string;

  beforeEach(async () => {
    testPath = path.join(os.tmpdir(), `memory-test-${Date.now()}`);
    await fs.mkdir(testPath, { recursive: true });
    memoryStore = new MemoryStore(testPath);
  });

  afterEach(async () => {
    memoryStore.clearCache();
    await fs.rm(testPath, { recursive: true, force: true });
  });

  describe('初始化', () => {
    it('应该创建记忆目录结构', async () => {
      await memoryStore.initialize();

      const roles = ['manager', 'architect', 'lead_dev', 'developer', 'designer'];
      for (const role of roles) {
        const rolePath = path.join(testPath, 'memory', role);
        const exists = await fs.stat(rolePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  describe('记忆加载', () => {
    it('应该加载默认记忆结构', async () => {
      await memoryStore.initialize();

      const memory = await memoryStore.load('test-project', 'manager');

      expect(memory.working).toBeDefined();
      expect(memory.working.currentTask).toBeNull();
      expect(memory.working.recentActions).toEqual([]);
      expect(memory.longTerm).toBeDefined();
      expect(memory.sessions).toBeDefined();
    });

    it('应该使用缓存加速加载', async () => {
      await memoryStore.initialize();

      const memory1 = await memoryStore.load('test-project', 'manager');
      const memory2 = await memoryStore.load('test-project', 'manager');

      expect(memory1).toEqual(memory2);
    });
  });

  describe('记忆保存', () => {
    it('应该保存工作记忆', async () => {
      await memoryStore.initialize();

      const memory = await memoryStore.load('test-project', 'manager');
      memory.working.currentTask = 'task-123';
      
      await memoryStore.save('test-project', 'manager', memory);

      // 清除缓存重新加载
      memoryStore.clearCache();
      const loaded = await memoryStore.load('test-project', 'manager');
      
      expect(loaded.working.currentTask).toBe('task-123');
    });
  });

  describe('添加操作', () => {
    it('应该添加操作记录', async () => {
      await memoryStore.initialize();

      await memoryStore.addAction('test-project', 'manager', {
        type: 'file_write',
        timestamp: new Date().toISOString(),
        details: { file: 'test.ts' },
      });

      const memory = await memoryStore.load('test-project', 'manager');
      expect(memory.working.recentActions.length).toBe(1);
      expect(memory.working.recentActions[0].type).toBe('file_write');
    });

    it('应该限制操作记录数量', async () => {
      await memoryStore.initialize();

      // 添加 150 条操作
      for (let i = 0; i < 150; i++) {
        await memoryStore.addAction('test-project', 'manager', {
          type: 'test',
          timestamp: new Date().toISOString(),
          details: { index: i },
        });
      }

      const memory = await memoryStore.load('test-project', 'manager');
      expect(memory.working.recentActions.length).toBe(100);
    });
  });

  describe('记忆搜索', () => {
    it('应该搜索匹配的记忆条目', async () => {
      await memoryStore.initialize();

      await memoryStore.addEntry('test-project', 'manager', 'decisions', {
        id: 'd1',
        title: '架构决策',
        content: '采用 TypeScript 作为主要开发语言',
        timestamp: new Date().toISOString(),
        tags: ['architecture', 'typescript'],
      });

      const results = await memoryStore.search('test-project', 'TypeScript');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('架构决策');
    });
  });

  describe('项目记忆', () => {
    it('应该获取所有角色的记忆', async () => {
      await memoryStore.initialize();

      const projectMemory = await memoryStore.getProjectMemory('test-project');

      expect(projectMemory.manager).toBeDefined();
      expect(projectMemory.architect).toBeDefined();
      expect(projectMemory.lead_dev).toBeDefined();
      expect(projectMemory.developer).toBeDefined();
      expect(projectMemory.designer).toBeDefined();
    });
  });
});