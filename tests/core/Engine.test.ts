/**
 * DevFlow Engine 核心引擎测试
 * 
 * 测试引擎的基本功能
 */

import { describe, it, expect } from 'vitest';

describe('DevFlowEngine', () => {
  describe('基础验证', () => {
    it('测试框架正常工作', () => {
      expect(true).toBe(true);
    });

    it('可以导入引擎模块', async () => {
      const { DevFlowEngine } = await import('../../src/core/Engine.js');
      expect(DevFlowEngine).toBeDefined();
      expect(typeof DevFlowEngine.getInstance).toBe('function');
    });
  });
});