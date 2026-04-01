/**
 * DevFlow CLI - init 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DevFlowEngine } from '../../core/Engine.js';
import type { EngineConfig } from '../../core/types.js';

export const initCommand = new Command('init')
  .description('初始化 DevFlow Engine')
  .argument('<project-path>', '项目路径')
  .option('-p, --provider <provider>', 'LLM 提供商 (anthropic|openai|local)', 'anthropic')
  .option('-m, --model <model>', '模型名称', 'claude-3-opus')
  .option('--api-key <key>', 'API Key (可选，可从环境变量读取)')
  .option('--base-url <url>', 'API Base URL (可选)')
  .action(async (projectPath: string, options: InitOptions) => {
    const spinner = ora('正在初始化 DevFlow Engine...').start();
    
    try {
      const engine = DevFlowEngine.getInstance();
      
      const config: EngineConfig = {
        projectPath,
        storagePath: projectPath,
        llm: {
          provider: options.provider,
          model: options.model,
          apiKey: options.apiKey,
          baseUrl: options.baseUrl,
        },
      };
      
      await engine.initialize(config);
      
      spinner.succeed(chalk.green('DevFlow Engine 初始化完成'));
      
      console.log();
      console.log(chalk.bold('配置信息:'));
      console.log(chalk.gray(`  项目路径: ${projectPath}`));
      console.log(chalk.gray(`  LLM 提供商: ${options.provider}`));
      console.log(chalk.gray(`  模型: ${options.model}`));
      console.log();
      console.log(chalk.yellow('提示: 使用 `devflow start` 启动自动化'));
      
    } catch (error) {
      spinner.fail(chalk.red('初始化失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

interface InitOptions {
  provider: 'anthropic' | 'openai' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
}