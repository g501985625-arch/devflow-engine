#!/usr/bin/env node

/**
 * DevFlow CLI - 命令行入口
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { startCommand } from './commands/start.js';
import { statusCommand } from './commands/status.js';
import { pauseCommand } from './commands/pause.js';
import { resumeCommand } from './commands/resume.js';
import { shutdownCommand } from './commands/shutdown.js';
import { projectCommand } from './commands/project.js';

const program = new Command();

program
  .name('devflow')
  .description('自动化开发工作流引擎')
  .version('0.1.0');

// 注册命令
program.addCommand(initCommand);
program.addCommand(startCommand);
program.addCommand(statusCommand);
program.addCommand(pauseCommand);
program.addCommand(resumeCommand);
program.addCommand(shutdownCommand);
program.addCommand(projectCommand);

// 错误处理
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.version') {
    process.exit(0);
  }
  console.error(chalk.red(`Error: ${err.message}`));
  process.exit(1);
});

// 解析命令
program.parseAsync(process.argv).catch((error: Error) => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
});