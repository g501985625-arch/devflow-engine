/**
 * DevFlow CLI - project 命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DevFlowEngine } from '../../core/Engine.js';

export const projectCommand = new Command('project')
  .description('项目管理命令');

// project list 子命令
projectCommand
  .command('list')
  .description('列出所有项目')
  .action(async () => {
    const engine = DevFlowEngine.getInstance();
    const projectManager = engine.getProjectManager();
    
    if (!projectManager) {
      console.error(chalk.red('Error: ProjectManager 未初始化'));
      process.exit(1);
    }
    
    const spinner = ora('正在获取项目列表...').start();
    
    try {
      const projects = await projectManager.list();
      spinner.stop();
      
      if (projects.length === 0) {
        console.log(chalk.yellow('没有找到项目'));
        return;
      }
      
      console.log(chalk.bold.green(`找到 ${projects.length} 个项目:`));
      console.log();
      
      for (const project of projects) {
        console.log(chalk.blue(`  ${project.config.name}`));
        console.log(chalk.gray(`    ID: ${project.config.id}`));
        console.log(chalk.gray(`    状态: ${project.config.status}`));
        console.log(chalk.gray(`    路径: ${project.path}`));
        console.log();
      }
      
    } catch (error) {
      spinner.fail(chalk.red('获取失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// project create 子命令
projectCommand
  .command('create')
  .description('创建新项目')
  .argument('<name>', '项目名称')
  .option('-d, --description <desc>', '项目描述')
  .action(async (name: string, options: { description?: string }) => {
    const engine = DevFlowEngine.getInstance();
    const projectManager = engine.getProjectManager();
    
    if (!projectManager) {
      console.error(chalk.red('Error: ProjectManager 未初始化'));
      process.exit(1);
    }
    
    const spinner = ora('正在创建项目...').start();
    
    try {
      const project = await projectManager.create({
        name,
        description: options.description,
      });
      
      spinner.succeed(chalk.green('项目创建成功'));
      
      console.log();
      console.log(chalk.bold('项目信息:'));
      console.log(chalk.gray(`  名称: ${project.config.name}`));
      console.log(chalk.gray(`  ID: ${project.config.id}`));
      console.log(chalk.gray(`  路径: ${project.path}`));
      console.log();
      console.log(chalk.yellow('提示: 使用 `devflow start` 启动项目'));
      
    } catch (error) {
      spinner.fail(chalk.red('创建失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// project info 子命令
projectCommand
  .command('info')
  .description('查看项目详情')
  .argument('<project-id>', '项目 ID')
  .action(async (projectId: string) => {
    const engine = DevFlowEngine.getInstance();
    const projectManager = engine.getProjectManager();
    
    if (!projectManager) {
      console.error(chalk.red('Error: ProjectManager 未初始化'));
      process.exit(1);
    }
    
    const spinner = ora('正在获取项目信息...').start();
    
    try {
      const project = projectManager.getProject(projectId);
      spinner.stop();
      
      if (!project) {
        console.log(chalk.yellow(`项目 ${projectId} 不存在`));
        return;
      }
      
      console.log(chalk.bold.green(`项目: ${project.config.name}`));
      console.log();
      
      console.log(chalk.bold('基本信息:'));
      console.log(chalk.gray(`  ID: ${project.config.id}`));
      console.log(chalk.gray(`  描述: ${project.config.description || '无'}`));
      console.log(chalk.gray(`  状态: ${project.config.status}`));
      console.log(chalk.gray(`  创建时间: ${project.config.createdAt}`));
      console.log(chalk.gray(`  路径: ${project.path}`));
      console.log();
      
      console.log(chalk.bold('工作流状态:'));
      console.log(chalk.gray(`  当前阶段: ${project.config.workflow.currentPhase}`));
      
      for (const phase of project.config.workflow.phases) {
        const statusIcon = phase.status === 'completed' ? '✅' : 
                          phase.status === 'in_progress' ? '▶️' : '⏸️';
        console.log(chalk.gray(`  ${statusIcon} ${phase.name}`));
      }
      
    } catch (error) {
      spinner.fail(chalk.red('获取失败'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });