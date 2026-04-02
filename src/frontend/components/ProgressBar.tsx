import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'striped' | 'animated';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  color = 'blue',
}) => {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'from-blue-600 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
    purple: 'from-purple-500 to-indigo-500',
  };

  const getBarStyles = () => {
    let styles = `h-full rounded-full bg-gradient-to-r ${colorClasses[color]}`;
    
    if (variant === 'striped') {
      styles += ' bg-stripes';
    }
    
    return styles;
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {progress}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${getBarStyles()} transition-all duration-500 ease-out ${
            variant === 'animated' ? 'animate-progress-flow' : ''
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          {size === 'lg' && showPercentage && (
            <span className="flex items-center justify-center h-full text-xs font-medium text-white">
              {progress}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;