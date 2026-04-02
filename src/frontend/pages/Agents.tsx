import React from 'react';
import AgentAvatar from '../components/AgentAvatar';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import AnimatedTransition from '../components/AnimatedTransition';

interface Agent {
  id: string;
  name: string;
  role: string;
  roleDisplay: string;
  status: 'online' | 'offline' | 'busy';
  currentTask?: string;
  completedTasks: number;
  avatarEmoji: string;
}

const mockAgents: Agent[] = [
  { 
    id: '1', 
    name: '总管', 
    role: 'manager', 
    roleDisplay: 'Manager',
    status: 'online', 
    currentTask: '协调开发阶段进度',
    completedTasks: 12,
    avatarEmoji: '👔'
  },
  { 
    id: '2', 
    name: '架构师', 
    role: 'architect', 
    roleDisplay: 'Architect',
    status: 'online', 
    currentTask: '系统架构文档编写',
    completedTasks: 8,
    avatarEmoji: '🏗️'
  },
  { 
    id: '3', 
    name: '主程序', 
    role: 'lead_dev', 
    roleDisplay: 'Lead Developer',
    status: 'busy', 
    currentTask: '核心模块重构',
    completedTasks: 15,
    avatarEmoji: '👨‍💻'
  },
  { 
    id: '4', 
    name: '开发员', 
    role: 'developer', 
    roleDisplay: 'Developer',
    status: 'online', 
    currentTask: 'API 接口实现',
    completedTasks: 22,
    avatarEmoji: '💻'
  },
  { 
    id: '5', 
    name: '美术', 
    role: 'designer', 
    roleDisplay: 'Designer',
    status: 'online', 
    currentTask: 'UI 界面设计',
    completedTasks: 6,
    avatarEmoji: '🎨'
  },
  { 
    id: '6', 
    name: '规划师', 
    role: 'planner', 
    roleDisplay: 'Planner',
    status: 'offline',
    completedTasks: 4,
    avatarEmoji: '📋'
  },
  { 
    id: '7', 
    name: '主管', 
    role: 'supervisor', 
    roleDisplay: 'Supervisor',
    status: 'online', 
    currentTask: '代码质量审查',
    completedTasks: 18,
    avatarEmoji: '✅'
  },
];

const Agents: React.FC = () => {
  const onlineCount = mockAgents.filter(a => a.status === 'online').length;
  const busyCount = mockAgents.filter(a => a.status === 'busy').length;
  const offlineCount = mockAgents.filter(a => a.status === 'offline').length;
  const totalTasks = mockAgents.reduce((sum, a) => sum + a.completedTasks, 0);

  return (
    <div className="p-6 animate-fade-in">
      {/* 页面标题 */}
      <AnimatedTransition animation="fade-down">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Agent 团队
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                查看团队成员状态和任务分配
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新状态
              </button>
              <button className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                添加 Agent
              </button>
            </div>
          </div>
        </div>
      </AnimatedTransition>

      {/* 团队概览 - Vercel 卡片风格 */}
      <AnimatedTransition animation="fade-up" delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-agent-manager flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                👥
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">总成员数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAgents.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">在线成员</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{onlineCount}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <StatusBadge status="online" size="sm" animated />
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-pulse-ring">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">忙碌成员</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{busyCount}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <StatusBadge status="busy" size="sm" animated />
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">离线成员</p>
                <p className="text-2xl font-bold text-gray-500">{offlineCount}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <StatusBadge status="offline" size="sm" />
            </div>
          </div>
        </div>
      </AnimatedTransition>

      {/* Agent 详情列表 */}
      <AnimatedTransition animation="fade-up" delay={200}>
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              成员详情
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                总完成任务: <span className="font-bold gradient-text">{totalTasks}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockAgents.map((agent, index) => (
              <AnimatedTransition key={agent.id} animation="scale" delay={index * 50 + 300}>
                <div className="card card-interactive rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg ${
                        agent.role === 'manager' ? 'gradient-agent-manager shadow-purple-500/30' :
                        agent.role === 'architect' ? 'gradient-agent-architect shadow-blue-500/30' :
                        agent.role === 'lead_dev' ? 'gradient-agent-lead-dev shadow-green-500/30' :
                        agent.role === 'developer' ? 'gradient-agent-developer shadow-cyan-500/30' :
                        agent.role === 'designer' ? 'gradient-agent-designer shadow-pink-500/30' :
                        agent.role === 'planner' ? 'gradient-agent-planner shadow-orange-500/30' :
                        'gradient-agent-supervisor shadow-red-500/30'
                      }`}>
                        {agent.avatarEmoji}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 ${
                        agent.status === 'online' ? 'status-online-pulse' :
                        agent.status === 'busy' ? 'status-busy' :
                        'status-offline'
                      }`}></span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{agent.name}</h4>
                        <StatusBadge 
                          status={agent.status} 
                          size="sm" 
                          animated={agent.status !== 'offline'}
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{agent.roleDisplay}</p>
                      
                      {agent.currentTask && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-blue-500 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300 truncate">{agent.currentTask}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold gradient-text">{agent.completedTasks}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">已完成</div>
                    </div>
                  </div>

                  {/* Progress Mini Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">本月贡献</span>
                      <span className="font-medium gradient-text">
                        {Math.round((agent.completedTasks / totalTasks) * 100)}%
                      </span>
                    </div>
                    <ProgressBar 
                      progress={Math.round((agent.completedTasks / totalTasks) * 100)} 
                      size="sm" 
                      variant="animated"
                    />
                  </div>
                </div>
              </AnimatedTransition>
            ))}
          </div>
        </div>
      </AnimatedTransition>

      {/* Agent 快速状态栏 - Discord 风格 */}
      <AnimatedTransition animation="fade-up" delay={500}>
        <div className="glass-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">实时状态</h4>
            <span className="text-xs text-gray-400">自动刷新</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {mockAgents.map((agent) => (
              <div 
                key={agent.id}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    agent.role === 'manager' ? 'gradient-agent-manager' :
                    agent.role === 'architect' ? 'gradient-agent-architect' :
                    agent.role === 'lead_dev' ? 'gradient-agent-lead-dev' :
                    agent.role === 'developer' ? 'gradient-agent-developer' :
                    agent.role === 'designer' ? 'gradient-agent-designer' :
                    agent.role === 'planner' ? 'gradient-agent-planner' :
                    'gradient-agent-supervisor'
                  }`}>
                    {agent.avatarEmoji}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 ${
                    agent.status === 'online' ? 'status-online' :
                    agent.status === 'busy' ? 'status-busy' :
                    'status-offline'
                  } w-3 h-3 ring-2 ring-gray-800`}></span>
                </div>
                <div className="min-w-[100px]">
                  <p className="text-sm font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {agent.currentTask || '空闲'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedTransition>

      {/* 团队分布图 */}
      <AnimatedTransition animation="fade-up" delay={600}>
        <div className="mt-8 glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            任务分布
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 按角色分布 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">按角色</h4>
              <div className="space-y-3">
                {mockAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      agent.role === 'manager' ? 'gradient-agent-manager' :
                      agent.role === 'architect' ? 'gradient-agent-architect' :
                      agent.role === 'lead_dev' ? 'gradient-agent-lead-dev' :
                      agent.role === 'developer' ? 'gradient-agent-developer' :
                      agent.role === 'designer' ? 'gradient-agent-designer' :
                      agent.role === 'planner' ? 'gradient-agent-planner' :
                      'gradient-agent-supervisor'
                    }`}>
                      <span className="text-sm">{agent.avatarEmoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-900 dark:text-white">{agent.name}</span>
                        <span className="text-sm font-medium gradient-text">{agent.completedTasks}</span>
                      </div>
                      <ProgressBar 
                        progress={(agent.completedTasks / totalTasks) * 100} 
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 按状态分布 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">按状态</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 dark:text-white">在线</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{onlineCount}</span>
                    </div>
                    <ProgressBar progress={(onlineCount / mockAgents.length) * 100} size="sm" color="green" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 dark:text-white">忙碌</span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{busyCount}</span>
                    </div>
                    <ProgressBar progress={(busyCount / mockAgents.length) * 100} size="sm" color="yellow" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 dark:text-white">离线</span>
                      <span className="text-sm font-medium text-gray-500">{offlineCount}</span>
                    </div>
                    <ProgressBar progress={(offlineCount / mockAgents.length) * 100} size="sm" color="purple" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default Agents;