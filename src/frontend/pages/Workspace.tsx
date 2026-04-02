import React, { useState } from 'react';
import FileTree from '../components/FileTree';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  status?: 'committed' | 'modified' | 'staged' | 'untracked';
}

const mockFileTree: FileNode[] = [
  {
    name: 'src',
    type: 'directory',
    children: [
      {
        name: 'frontend',
        type: 'directory',
        children: [
          { name: 'App.tsx', type: 'file', status: 'committed' },
          { name: 'pages', type: 'directory', children: [
            { name: 'Dashboard.tsx', type: 'file', status: 'modified' },
            { name: 'Workflow.tsx', type: 'file', status: 'committed' },
          ]},
          { name: 'components', type: 'directory', children: [
            { name: 'Layout.tsx', type: 'file', status: 'committed' },
            { name: 'Header.tsx', type: 'file', status: 'staged' },
          ]},
          { name: 'styles', type: 'directory', children: [
            { name: 'globals.css', type: 'file', status: 'committed' },
          ]},
        ]
      },
      {
        name: 'backend',
        type: 'directory',
        children: [
          { name: 'api.ts', type: 'file', status: 'committed' },
          { name: 'storage.ts', type: 'file', status: 'committed' },
        ]
      },
      {
        name: 'core',
        type: 'directory',
        children: [
          { name: 'Engine.ts', type: 'file', status: 'committed' },
          { name: 'constants.ts', type: 'file', status: 'committed' },
        ]
      },
    ]
  },
  {
    name: 'docs',
    type: 'directory',
    children: [
      { name: 'WORKSPACE_CONSTRAINTS.md', type: 'file', status: 'committed' },
      { name: 'UI_DESIGN_WORKFLOW.md', type: 'file', status: 'committed' },
      { name: 'design', type: 'directory', children: [
        { name: 'UI_DESIGN_TASK.md', type: 'file', status: 'modified' },
      ]},
    ]
  },
  {
    name: 'project.json',
    type: 'file',
    status: 'committed'
  },
];

const Workspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const gitStats = {
    branch: 'main',
    modified: 3,
    staged: 1,
    untracked: 0,
    lastCommit: '2小时前',
  };

  const buildStatus = {
    success: true,
    time: '23:37',
    errors: 0,
    warnings: 2,
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">工作区状态</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">查看文件树、Git 状态和构建状态</p>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Git 状态 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Git 状态</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">分支</span>
              <span className="text-sm font-medium text-blue-600 dark:text-cyan-400">{gitStats.branch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">修改</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{gitStats.modified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">暂存</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{gitStats.staged}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">最后提交</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{gitStats.lastCommit}</span>
            </div>
          </div>
        </div>

        {/* 构建状态 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">构建状态</h4>
          <div className="flex items-center gap-2 mb-3">
            {buildStatus.success ? (
              <span className="text-green-500 text-2xl">✓</span>
            ) : (
              <span className="text-red-500 text-2xl">✗</span>
            )}
            <span className={`text-sm font-medium ${
              buildStatus.success 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {buildStatus.success ? '编译成功' : '编译失败'}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">时间</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{buildStatus.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">错误</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{buildStatus.errors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">警告</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{buildStatus.warnings}</span>
            </div>
          </div>
        </div>

        {/* 文件统计 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">文件统计</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">总文件</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">源代码</span>
              <span className="text-sm font-medium text-blue-600 dark:text-cyan-400">10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">文档</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">配置</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* 文件树 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          文件树
        </h3>
        <FileTree 
          tree={mockFileTree} 
          onSelect={setSelectedFile}
          selectedFile={selectedFile}
        />
        
        {/* 文件状态说明 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>已提交</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">●</span>
              <span>修改中</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">+</span>
              <span>已暂存</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">?</span>
              <span>未追踪</span>
            </div>
          </div>
        </div>
      </div>

      {/* 选中文件详情 */}
      {selectedFile && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-700 dark:text-blue-400">{selectedFile}</span>
            <span className="text-sm text-blue-600 dark:text-blue-500">已选中</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;