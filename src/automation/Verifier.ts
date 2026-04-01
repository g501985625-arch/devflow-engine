/**
 * Automation Engine - Verifier
 * 
 * 验证器
 * 
 * @module automation
 */

import * as childProcess from 'child_process';
import type { Task } from '../workflow/types.js';

/**
 * 验证结果
 */
export interface VerificationResult {
  success: boolean;
  build: boolean;
  test: boolean;
  lint: boolean;
  typeCheck: boolean;
  errors: string[];
}

/**
 * Verifier - 验证器
 */
export class Verifier {
  private _projectPath: string;
  
  constructor(projectPath: string) {
    this._projectPath = projectPath;
  }
  
  /**
   * 验证任务
   */
  async verifyTask(task: Task): Promise<VerificationResult> {
    const rules = task.verificationRules;
    const errors: string[] = [];
    
    let build = true;
    let test = true;
    let lint = true;
    let typeCheck = true;
    
    // 构建验证
    if (rules.build) {
      const buildResult = await this.runBuild();
      build = buildResult.success;
      if (!buildResult.success) {
        errors.push(`构建失败: ${buildResult.error}`);
      }
    }
    
    // 测试验证
    if (rules.test) {
      const testResult = await this.runTest();
      test = testResult.success;
      if (!testResult.success) {
        errors.push(`测试失败: ${testResult.error}`);
      }
    }
    
    // Lint 验证
    if (rules.lint) {
      const lintResult = await this.runLint();
      lint = lintResult.success;
      if (!lintResult.success) {
        errors.push(`Lint 失败: ${lintResult.error}`);
      }
    }
    
    // 类型检查
    if (rules.typeCheck) {
      const typeResult = await this.runTypeCheck();
      typeCheck = typeResult.success;
      if (!typeResult.success) {
        errors.push(`类型检查失败: ${typeResult.error}`);
      }
    }
    
    const success = build && test && lint && typeCheck;
    
    return {
      success,
      build,
      test,
      lint,
      typeCheck,
      errors,
    };
  }
  
  /**
   * 运行构建
   */
  private async runBuild(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.exec('npm run build');
      return { success: result.code === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  /**
   * 运行测试
   */
  private async runTest(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.exec('npm test');
      return { success: result.code === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  /**
   * 运行 Lint
   */
  private async runLint(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.exec('npm run lint');
      return { success: result.code === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  /**
   * 运行类型检查
   */
  private async runTypeCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.exec('npx tsc --noEmit');
      return { success: result.code === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  /**
   * 执行命令
   */
  private exec(command: string): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise(resolve => {
      childProcess.exec(
        command,
        { cwd: this._projectPath },
        (error, stdout, stderr) => {
          if (error) {
            resolve({
              code: 1,
              stdout,
              stderr: error.message,
            });
          } else {
            resolve({
              code: 0,
              stdout,
              stderr,
            });
          }
        }
      );
    });
  }
  
  /**
   * 快速验证
   */
  async quickVerify(): Promise<boolean> {
    // 只做构建验证
    const buildResult = await this.runBuild();
    return buildResult.success;
  }
}