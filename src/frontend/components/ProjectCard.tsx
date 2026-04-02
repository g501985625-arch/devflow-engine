import React from 'react';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  progress: number;
  phase: string;
  agents: { name: string; status: 'online' | 'offline' | 'busy' }[];
  lastUpdated: string;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  progress,
  phase,
  agents,
  lastUpdated,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPhaseColor = (currentPhase: string) => {
    const phases: Record<string, string> = {
      '需求': 'from-purple-500 to-pink-500',
      '架构': 'from-blue-500 to-indigo-500',
      'UI设计': 'from-cyan-500 to-blue-500',
      '开发': 'from-green-500 to-emerald-500',
      '整合': 'from-orange-500 to-yellow-500',
      '扩展': 'from-red-500 to-orange-500',
    };
    return phases[currentPhase] || 'from-gray-500 to-gray-400';
  };

  return (
    <div
      onClick={onClick}
      className="card-hover bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
    >
      {/* Phase Banner */}
      <div className={`h-2 bg-gradient-to-r ${getPhaseColor(phase)}`}></div>
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getPhaseColor(phase)} text-white`}>
            {phase}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 dark:text-gray-300">进度</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Agents */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {agents.slice(0, 4).map((agent, index) => (
              <div
                key={index}
                className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800"
                title={agent.name}
              >
                {agent.name.charAt(0)}
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${getStatusColor(agent.status)}`}
                ></span>
              </div>
            ))}
            {agents.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800">
                +{agents.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;