/**
 * DevFlow CLI - start 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DevFlowEngine } from '../../core/Engine.js';
import type { AutomationEvent } from '../../automation/types.js';

export const startCommand = new Command('start')
  .description('启动自动化引擎')
  .option('-p, --project <id>', '项目 ID', 'default')
  .action(async (options: StartOptions) => {
    const engine = DevFlowEngine.getInstance();
    
    if (!engine.isInitialized()) {
      console.error(chalk.red('Error: Engine 未初始化，请先运行 `devflow init`'));
      process.exit(1);
    }
    
    const spinner = ora('正在启动自动化...').start();
    
    try {
      // 启动自动化循环
      spinner.text = '自动化运行中...';
      
      const projectId = options.project;
      const automationEngine = engine.getAutomationEngine();
      
      if (!automationEngine) {
        spinner.fail(chalk.red('AutomationEngine 未初始化'));
        process.exit(1);
      }
      
      for await (const event of automationEngine.run(projectId)) {
        handleEvent(event, spinner);
      }
      
    } catch (error) {
      spinner.fail(chalk.red('启动失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

function handleEvent(event: AutomationEvent, spinner: ReturnType<typeof ora>): void {
  switch (event.type) {
    case 'started':
      spinner.succeed(chalk.green('自动化已启动'));
      console.log(chalk.gray(`  项目: ${event.projectId}`));
      break;
    
    case 'task_started':
      spinner.start(chalk.blue(`▶ 执行任务: ${event.task.id}`));
      break;
    
    case 'task_completed':
      spinner.succeed(chalk.green(`✓ 任务完成: ${event.task.id}`));
      break;
    
    case 'task_failed':
      spinner.fail(chalk.red(`✗ 任务失败: ${event.task.id}`));
      console.log(chalk.gray(`  错误: ${event.error}`));
      break;
    
    case 'completed':
      spinner.succeed(chalk.green('所有任务已完成'));
      break;
    
    case 'paused':
      spinner.info(chalk.yellow('自动化已暂停'));
      break;
    
    case 'needs_intervention':
      spinner.warn(chalk.yellow(`需要人工干预: ${event.task.id}`));
      console.log(chalk.gray(`  原因: ${event.reason}`));
      break;
    
    case 'blocked':
      spinner.warn(chalk.yellow('工作流被阻塞'));
      break;
    
    case 'phase_started':
      spinner.info(chalk.blue(`进入阶段: ${event.phase}`));
      break;
    
    case 'phase_completed':
      spinner.succeed(chalk.green(`阶段完成: ${event.phase}`));
      break;
  }
}

interface StartOptions {
  project: string;
}