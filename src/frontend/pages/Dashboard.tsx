import React from 'react';
import ProjectCard from '../components/ProjectCard';
import AgentAvatar from '../components/AgentAvatar';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import AnimatedTransition from '../components/AnimatedTransition';

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  phase: string;
  status: 'active' | 'paused' | 'completed';
  agents: { name: string; status: 'online' | 'offline' | 'busy' }[];
  lastUpdated: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  currentTask?: string;
  completedTasks?: number;
}

const mockProjects: Project[] = [
  { 
    id: '1', 
    name: 'VideoPlayer', 
    description: '高性能视频播放器，支持多格式解码和流媒体',
    progress: 85, 
    phase: '整合', 
    status: 'active',
    agents: [
      { name: '总管', status: 'online' },
      { name: '架构师', status: 'online' },
      { name: '主程序', status: 'busy' },
      { name: '开发员', status: 'online' },
    ],
    lastUpdated: '10分钟前'
  },
  { 
    id: '2', 
    name: 'DevFlow Engine', 
    description: '智能开发工作流引擎，自动化项目协作',
    progress: 45, 
    phase: '开发', 
    status: 'active',
    agents: [
      { name: '架构师', status: 'online' },
      { name: '美术', status: 'online' },
      { name: '开发员', status: 'busy' },
    ],
    lastUpdated: '30分钟前'
  },
  { 
    id: '3', 
    name: 'TaskManager', 
    description: '任务管理系统，支持团队协作和进度追踪',
    progress: 30, 
    phase: 'UI设计', 
    status: 'paused',
    agents: [
      { name: '美术', status: 'offline' },
      { name: '规划师', status: 'offline' },
    ],
    lastUpdated: '2小时前'
  },
  { 
    id: '4', 
    name: 'DataVisualizer', 
    description: '数据可视化工具，支持图表生成和实时更新',
    progress: 15, 
    phase: '架构', 
    status: 'active',
    agents: [
      { name: '架构师', status: 'online' },
      { name: '开发员', status: 'online' },
    ],
    lastUpdated: '45分钟前'
  },
];

const mockAgents: Agent[] = [
  { id: '1', name: '总管', role: 'Manager', status: 'online', currentTask: '协调开发阶段', completedTasks: 12 },
  { id: '2', name: '架构师', role: 'Architect', status: 'online', currentTask: '系统架构设计', completedTasks: 8 },
  { id: '3', name: '主程序', role: 'Lead Developer', status: 'busy', currentTask: '核心模块开发', completedTasks: 15 },
  { id: '4', name: '开发员', role: 'Developer', status: 'online', currentTask: 'API 实现', completedTasks: 22 },
  { id: '5', name: '美术', role: 'Designer', status: 'online', currentTask: 'UI 界面设计', completedTasks: 6 },
  { id: '6', name: '规划师', role: 'Planner', status: 'offline', completedTasks: 4 },
  { id: '7', name: '主管', role: 'Supervisor', status: 'online', currentTask: '质量验证', completedTasks: 18 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 animate-fade-in">
      {/* 页面标题 - Linear 风格 */}
      <AnimatedTransition animation="fade-down">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                项目概览
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                查看所有项目进度和团队状态
              </p>
            </div>
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button className="btn btn-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新建项目
              </button>
              <button className="btn btn-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                启动工作流
              </button>
            </div>
          </div>
        </div>
      </AnimatedTransition>

      {/* 统计卡片 - Vercel 风格 */}
      <AnimatedTransition animation="fade-up" delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">活跃项目</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {mockProjects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>+2 本周</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">在线 Agent</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {mockAgents.filter(a => a.status === 'online').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status="online" size="sm" animated />
              <StatusBadge status="busy" size="sm" label="1" />
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">总进度</p>
                <p className="text-3xl font-bold gradient-text mt-1">
                  {Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar progress={Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length)} size="sm" />
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">已完成任务</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {mockAgents.reduce((sum, a) => sum + (a.completedTasks || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>+24 本周</span>
            </div>
          </div>
        </div>
      </AnimatedTransition>

      {/* 项目卡片网格 */}
      <AnimatedTransition animation="fade-up" delay={200}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            项目列表
          </h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              筛选
            </button>
            <button className="btn btn-ghost text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              排序
            </button>
          </div>
        </div>
      </AnimatedTransition>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        {mockProjects.map((project, index) => (
          <AnimatedTransition key={project.id} animation="fade-up" delay={index * 100 + 300}>
            <ProjectCard
              id={project.id}
              name={project.name}
              description={project.description}
              progress={project.progress}
              phase={project.phase}
              agents={project.agents}
              lastUpdated={project.lastUpdated}
            />
          </AnimatedTransition>
        ))}
      </div>

      {/* Agent 状态面板 */}
      <AnimatedTransition animation="fade-up" delay={500}>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              团队状态
            </h3>
            <button className="btn btn-ghost text-sm">
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockAgents.map((agent, index) => (
              <AnimatedTransition key={agent.id} animation="scale" delay={index * 50 + 600}>
                <AgentAvatar
                  name={agent.name}
                  role={agent.role}
                  status={agent.status}
                  currentTask={agent.currentTask}
                  completedTasks={agent.completedTasks}
                />
              </AnimatedTransition>
            ))}
          </div>

          {/* 状态说明 */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="status-online-pulse"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">在线</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-busy"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">忙碌</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-offline"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">离线</span>
            </div>
          </div>
        </div>
      </AnimatedTransition>

      {/* 本周进度 */}
      <AnimatedTransition animation="fade-up" delay={700}>
        <div className="mt-8 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              本周进度
            </h3>
            <span className="badge badge-primary">更新于 5分钟前</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">总体进度</span>
                <span className="font-bold gradient-text">68%</span>
              </div>
              <ProgressBar progress={68} variant="animated" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">已完成任务</span>
                <span className="font-bold text-green-600 dark:text-green-400">24/35</span>
              </div>
              <ProgressBar progress={68} color="green" variant="animated" />
            </div>
          </div>

          {/* 进度里程碑 */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">需求分析</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">架构设计</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full gradient-primary animate-pulse-glow flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm font-medium gradient-text">UI 设计</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <span className="text-xs text-gray-400">4</span>
                  </div>
                  <span className="text-sm text-gray-500">开发</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default Dashboard;