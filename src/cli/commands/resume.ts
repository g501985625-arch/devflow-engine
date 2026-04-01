/**
 * DevFlow CLI - resume 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DevFlowEngine } from '../../core/Engine.js';

export const resumeCommand = new Command('resume')
  .description('恢复自动化引擎')
  .action(async () => {
    const engine = DevFlowEngine.getInstance();
    
    if (!engine.isInitialized()) {
      console.error(chalk.red('Error: Engine 未初始化'));
      process.exit(1);
    }
    
    const spinner = ora('正在恢复自动化...').start();
    
    try {
      await engine.resumeAutomation();
      spinner.succeed(chalk.green('自动化已恢复'));
      console.log(chalk.gray('自动化将继续运行'));
    } catch (error) {
      spinner.fail(chalk.red('恢复失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });