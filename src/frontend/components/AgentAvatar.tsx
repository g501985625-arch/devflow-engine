import React from 'react';

interface AgentAvatarProps {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  currentTask?: string;
  completedTasks?: number;
  avatar?: string;
  onClick?: () => void;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({
  name,
  role,
  status,
  currentTask,
  completedTasks,
  onClick,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'online':
        return {
          dot: 'bg-green-500',
          glow: 'shadow-green-500/50',
          bg: 'bg-green-500/10 border-green-500/30',
          text: 'text-green-600 dark:text-green-400',
          label: '在线',
        };
      case 'busy':
        return {
          dot: 'bg-yellow-500',
          glow: 'shadow-yellow-500/50',
          bg: 'bg-yellow-500/10 border-yellow-500/30',
          text: 'text-yellow-600 dark:text-yellow-400',
          label: '忙碌',
        };
      default:
        return {
          dot: 'bg-gray-400',
          glow: 'shadow-gray-400/30',
          bg: 'bg-gray-500/10 border-gray-500/30',
          text: 'text-gray-500 dark:text-gray-400',
          label: '离线',
        };
    }
  };

  const getRoleGradient = () => {
    const gradients: Record<string, string> = {
      '总管': 'from-purple-500 to-indigo-600',
      '架构师': 'from-blue-500 to-cyan-500',
      '主程序': 'from-green-500 to-teal-500',
      '开发员': 'from-cyan-500 to-blue-500',
      '美术': 'from-pink-500 to-rose-500',
      '规划师': 'from-orange-500 to-amber-500',
      '主管': 'from-indigo-500 to-purple-500',
    };
    return gradients[role] || 'from-gray-500 to-gray-400';
  };

  const styles = getStatusStyles();

  return (
    <div
      onClick={onClick}
      className="card-hover bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRoleGradient()} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
            {name.charAt(0)}
          </div>
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${styles.dot} ring-2 ring-white dark:ring-gray-800`}></span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 dark:text-white">{name}</h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.bg} ${styles.text}`}>
              {styles.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{role}</p>
          
          {currentTask && (
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300 truncate">{currentTask}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {completedTasks !== undefined && (
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedTasks}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">已完成任务</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentAvatar;