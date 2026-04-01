/**
 * DevFlow CLI - status 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { DevFlowEngine } from '../../core/Engine.js';

export const statusCommand = new Command('status')
  .description('查看引擎状态')
  .action(async () => {
    const engine = DevFlowEngine.getInstance();
    
    if (!engine.isInitialized()) {
      console.log(chalk.yellow('Engine 未初始化'));
      console.log(chalk.gray('使用 `devflow init <project-path>` 初始化'));
      return;
    }
    
    const state = engine.getState();
    const config = engine.getConfig();
    
    console.log(chalk.bold.green('DevFlow Engine 状态'));
    console.log();
    
    console.log(chalk.bold('基本信息:'));
    console.log(chalk.gray(`  初始化状态: ${state.initialized ? '✅' : '❌'}`));
    console.log(chalk.gray(`  当前项目: ${state.currentProject || '无'}`));
    console.log(chalk.gray(`  活跃会话: ${state.activeSessions.length}`));
    console.log();
    
    if (config) {
      console.log(chalk.bold('配置信息:'));
      console.log(chalk.gray(`  项目路径: ${config.projectPath}`));
      console.log(chalk.gray(`  LLM 提供商: ${config.llm.provider}`));
      console.log(chalk.gray(`  模型: ${config.llm.model}`));
      console.log();
    }
    
    // 模块状态
    console.log(chalk.bold('模块状态:'));
    console.log(chalk.gray(`  StorageLayer: ${engine.getStorageLayer() ? '✅' : '❌'}`));
    console.log(chalk.gray(`  MemoryStore: ${engine.getMemoryStore() ? '✅' : '❌'}`));
    console.log(chalk.gray(`  ProjectManager: ${engine.getProjectManager() ? '✅' : '❌'}`));
    console.log(chalk.gray(`  AgentManager: ${engine.getAgentManager() ? '✅' : '❌'}`));
    console.log(chalk.gray(`  WorkflowEngine: ${engine.getWorkflowEngine() ? '✅' : '❌'}`));
    console.log(chalk.gray(`  AutomationEngine: ${engine.getAutomationEngine() ? '✅' : '❌'}`));
    console.log();
    
    if (state.activeSessions.length > 0) {
      console.log(chalk.bold('活跃会话:'));
      for (const sessionId of state.activeSessions) {
        console.log(chalk.gray(`  - ${sessionId}`));
      }
    }
  });