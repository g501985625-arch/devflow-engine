import React from 'react';

interface Phase {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  description?: string;
}

interface PhaseIndicatorProps {
  phases: Phase[];
  onPhaseClick?: (phaseId: string) => void;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ phases, onPhaseClick }) => {
  const getPhaseStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 border-green-500 text-white',
          connector: 'bg-green-500',
          text: 'text-green-600 dark:text-green-400',
        };
      case 'current':
        return {
          circle: 'bg-blue-500 border-blue-500 text-white animate-pulse-glow',
          connector: 'bg-gradient-to-r from-blue-500 to-cyan-400',
          text: 'text-blue-600 dark:text-blue-400 font-bold',
        };
      default:
        return {
          circle: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400',
          connector: 'bg-gray-300 dark:bg-gray-600',
          text: 'text-gray-400 dark:text-gray-500',
        };
    }
  };

  const getPhaseIcon = (index: number, status: string) => {
    if (status === 'completed') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    if (status === 'current') {
      return (
        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
      );
    }
    return <span className="text-sm font-medium">{index + 1}</span>;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center justify-between min-w-max px-4 py-6">
        {phases.map((phase, index) => {
          const styles = getPhaseStyles(phase.status);
          const isLast = index === phases.length - 1;

          return (
            <React.Fragment key={phase.id}>
              {/* Phase Circle */}
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onPhaseClick?.(phase.id)}
              >
                <div 
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${styles.circle}`}
                >
                  {getPhaseIcon(index, phase.status)}
                </div>
                <span className={`mt-2 text-sm transition-colors duration-200 ${styles.text}`}>
                  {phase.name}
                </span>
                {phase.description && (
                  <span className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-[100px] text-center">
                    {phase.description}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4 relative">
                  <div className={`h-1 rounded-full transition-all duration-500 ${
                    phases[index + 1]?.status === 'completed' || phases[index + 1]?.status === 'current'
                      ? styles.connector
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                  {phase.status === 'current' && (
                    <div className="absolute top-0 left-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-progress-flow"></div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-gray-600 dark:text-gray-300">已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse-glow"></div>
          <span className="text-gray-600 dark:text-gray-300">进行中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-300">待执行</span>
        </div>
      </div>
    </div>
  );
};

export default PhaseIndicator;