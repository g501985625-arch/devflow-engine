import React from 'react';
import PhaseIndicator from '../components/PhaseIndicator';

interface Task {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'blocked';
  dependencies: string[];
}

const mockTasks: Task[] = [
  { id: 't1', name: '需求分析', status: 'completed', dependencies: [] },
  { id: 't2', name: '架构设计', status: 'completed', dependencies: ['t1'] },
  { id: 't3', name: 'UI 设计', status: 'in_progress', dependencies: ['t2'] },
  { id: 't4', name: '前端开发', status: 'pending', dependencies: ['t3'] },
  { id: 't5', name: '后端开发', status: 'pending', dependencies: ['t2'] },
  { id: 't6', name: 'API 集成', status: 'pending', dependencies: ['t4', 't5'] },
  { id: 't7', name: '功能测试', status: 'pending', dependencies: ['t6'] },
];

const phases = [
  { id: 'requirement', name: '需求', status: 'completed' },
  { id: 'architecture', name: '架构', status: 'completed' },
  { id: 'ui_design', name: 'UI设计', status: 'current' },
  { id: 'development', name: '开发', status: 'pending' },
  { id: 'integration', name: '整合', status: 'pending' },
  { id: 'extension', name: '扩展', status: 'pending' },
];

const Workflow: React.FC = () => {
  return (
    <div className="p-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">工作流管理</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">查看项目阶段和任务依赖关系</p>
      </div>

      {/* 阶段可视化 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          开发阶段
        </h3>
        <PhaseIndicator phases={phases} />
      </div>

      {/* 任务链依赖图 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          任务依赖图
        </h3>
        
        <div className="relative overflow-x-auto">
          <div className="min-w-[600px] p-4">
            {/* 任务节点 */}
            <div className="grid grid-cols-4 gap-4">
              {/* 第一层 */}
              <div className="col-span-1">
                <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">需求分析</span>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">✓ 完成</div>
                </div>
              </div>
              
              {/* 第二层 */}
              <div className="col-span-1">
                <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">架构设计</span>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">✓ 完成</div>
                </div>
              </div>
              
              {/* 第三层 */}
              <div className="col-span-2 flex gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg p-3 text-center animate-pulse-glow">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">UI 设计</span>
                  <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">● 进行中</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">后端开发</span>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">○ 待执行</div>
                </div>
              </div>
              
              {/* 第四层 */}
              <div className="col-span-2 flex gap-4 mt-4">
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">前端开发</span>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">○ 待执行</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">API 集成</span>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">○ 待执行</div>
                </div>
              </div>
              
              {/* 第五层 */}
              <div className="col-span-2 mt-4">
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">功能测试</span>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">○ 待执行</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 阶段详情 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map((phase, index) => (
          <div 
            key={phase.id}
            className={`rounded-lg p-4 transition-all duration-300 ${
              phase.status === 'completed' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : phase.status === 'current'
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-medium ${
                phase.status === 'completed' 
                  ? 'text-green-700 dark:text-green-400'
                  : phase.status === 'current'
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {phase.name}
              </span>
              <span className="text-xs">
                {phase.status === 'completed' && '✓'}
                {phase.status === 'current' && '●'}
                {phase.status === 'pending' && '○'}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              阶段 {index + 1} / {phases.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workflow;