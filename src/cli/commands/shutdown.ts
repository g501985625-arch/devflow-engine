/**
 * DevFlow CLI - shutdown 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DevFlowEngine } from '../../core/Engine.js';

export const shutdownCommand = new Command('shutdown')
  .description('关闭 DevFlow Engine')
  .option('-f, --force', '强制关闭，不等待任务完成')
  .action(async (options: ShutdownOptions) => {
    const engine = DevFlowEngine.getInstance();
    
    if (!engine.isInitialized()) {
      console.log(chalk.yellow('Engine 未运行'));
      return;
    }
    
    const spinner = ora('正在关闭 Engine...').start();
    
    try {
      if (options.force) {
        spinner.text = '强制关闭中...';
      }
      
      await engine.shutdown();
      spinner.succeed(chalk.green('Engine 已关闭'));
      
      console.log();
      console.log(chalk.gray('所有模块已停止，状态已保存'));
      
    } catch (error) {
      spinner.fail(chalk.red('关闭失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

interface ShutdownOptions {
  force: boolean;
}