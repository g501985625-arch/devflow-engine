/**
 * DevFlow CLI - pause 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DevFlowEngine } from '../../core/Engine.js';

export const pauseCommand = new Command('pause')
  .description('暂停自动化引擎')
  .action(async () => {
    const engine = DevFlowEngine.getInstance();
    
    if (!engine.isInitialized()) {
      console.error(chalk.red('Error: Engine 未初始化'));
      process.exit(1);
    }
    
    const spinner = ora('正在暂停自动化...').start();
    
    try {
      await engine.pauseAutomation();
      spinner.succeed(chalk.green('自动化已暂停'));
      console.log(chalk.gray('使用 `devflow resume` 恢复'));
    } catch (error) {
      spinner.fail(chalk.red('暂停失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });