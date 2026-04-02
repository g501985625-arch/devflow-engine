import React from 'react';
import ProgressBar from '../components/ProgressBar';

interface Task {
  id: string;
  name: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'pending' | 'blocked';
  assignee: string;
}

interface Issue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  createdAt: string;
}

const mockTasks: Task[] = [
  { id: 't1', name: '用户认证模块', progress: 45, status: 'in_progress', assignee: '开发员' },
  { id: 't2', name: '数据存储层', progress: 60, status: 'in_progress', assignee: '主程序' },
  { id: 't3', name: 'API 接口', progress: 85, status: 'in_progress', assignee: '开发员' },
  { id: 't4', name: 'UI 组件库', progress: 30, status: 'in_progress', assignee: '美术' },
  { id: 't5', name: '测试框架', progress: 0, status: 'pending', assignee: '主管' },
  { id: 't6', name: '文档编写', progress: 100, status: 'completed', assignee: '架构师' },
];

const mockIssues: Issue[] = [
  { id: 'i1', severity: 'high', type: '构建失败', description: '依赖缺失: @types/node', createdAt: '2小时前' },
  { id: 'i2', severity: 'medium', type: '编译警告', description: 'TypeScript 类型冲突', createdAt: '4小时前' },
  { id: 'i3', severity: 'low', type: '风格问题', description: '代码格式不规范', createdAt: '1天前' },
];

const Progress: React.FC = () => {
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = mockTasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = mockTasks.filter(t => t.status === 'pending').length;
  const totalProgress = Math.round(
    mockTasks.reduce((sum, t) => sum + t.progress, 0) / mockTasks.length
  );

  return (
    <div className="p-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">进度追踪</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">查看任务进度和问题状态</p>
      </div>

      {/* 进度概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <div className="text-2xl font-bold text-blue-600 dark:text-cyan-400">{totalProgress}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总体进度</div>
          <ProgressBar progress={totalProgress} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">已完成</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inProgressTasks}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">进行中</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pendingTasks}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">待执行</div>
        </div>
      </div>

      {/* 任务进度列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          任务进度
        </h3>
        <div className="space-y-4">
          {mockTasks.map((task, index) => (
            <div 
              key={task.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    task.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : task.status === 'blocked'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {task.status === 'completed' && '✓ 完成'}
                    {task.status === 'in_progress' && '● 进行'}
                    {task.status === 'blocked' && '⚠ 阻塞'}
                    {task.status === 'pending' && '○ 待执行'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{task.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{task.assignee}</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-cyan-400">{task.progress}%</span>
                </div>
              </div>
              <ProgressBar progress={task.progress} />
            </div>
          ))}
        </div>
      </div>

      {/* 问题面板 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          问题列表
        </h3>
        <div className="space-y-3">
          {mockIssues.map((issue, index) => (
            <div 
              key={issue.id}
              className={`p-4 rounded-lg border animate-slide-in ${
                issue.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : issue.severity === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg ${
                  issue.severity === 'high' ? '🔴' :
                  issue.severity === 'medium' ? '⚠️' : 'ℹ️'
                }`}></span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      issue.severity === 'high'
                        ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
                        : issue.severity === 'medium'
                        ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{issue.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{issue.description}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">{issue.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;