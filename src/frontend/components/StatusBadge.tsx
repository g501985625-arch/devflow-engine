import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'pending' | 'completed' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'glow';
  showDot?: boolean;
  animated?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  variant = 'solid',
  showDot = true,
  animated = false,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'green',
          bgClass: 'bg-green-500/15 dark:bg-green-500/25',
          textClass: 'text-green-600 dark:text-green-400',
          dotClass: 'bg-green-500',
          glowClass: 'shadow-green-500/50',
          defaultLabel: '在线',
        };
      case 'busy':
        return {
          color: 'yellow',
          bgClass: 'bg-yellow-500/15 dark:bg-yellow-500/25',
          textClass: 'text-yellow-600 dark:text-yellow-400',
          dotClass: 'bg-yellow-500',
          glowClass: 'shadow-yellow-500/50',
          defaultLabel: '忙碌',
        };
      case 'offline':
        return {
          color: 'gray',
          bgClass: 'bg-gray-500/15 dark:bg-gray-500/25',
          textClass: 'text-gray-500 dark:text-gray-400',
          dotClass: 'bg-gray-400',
          glowClass: '',
          defaultLabel: '离线',
        };
      case 'pending':
        return {
          color: 'blue',
          bgClass: 'bg-blue-500/15 dark:bg-blue-500/25',
          textClass: 'text-blue-600 dark:text-blue-400',
          dotClass: 'bg-blue-500',
          glowClass: 'shadow-blue-500/50',
          defaultLabel: '待处理',
        };
      case 'completed':
        return {
          color: 'emerald',
          bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25',
          textClass: 'text-emerald-600 dark:text-emerald-400',
          dotClass: 'bg-emerald-500',
          glowClass: 'shadow-emerald-500/50',
          defaultLabel: '已完成',
        };
      case 'error':
        return {
          color: 'red',
          bgClass: 'bg-red-500/15 dark:bg-red-500/25',
          textClass: 'text-red-600 dark:text-red-400',
          dotClass: 'bg-red-500',
          glowClass: 'shadow-red-500/50',
          defaultLabel: '错误',
        };
      default:
        return {
          color: 'gray',
          bgClass: 'bg-gray-500/15',
          textClass: 'text-gray-500',
          dotClass: 'bg-gray-400',
          glowClass: '',
          defaultLabel: '未知',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-0.5 text-xs gap-1',
          dot: 'w-2 h-2',
        };
      case 'lg':
        return {
          container: 'px-4 py-1.5 text-base gap-2',
          dot: 'w-3 h-3',
        };
      default:
        return {
          container: 'px-3 py-1 text-sm gap-1.5',
          dot: 'w-2.5 h-2.5',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();

  const containerClasses = [
    'inline-flex items-center rounded-full font-medium',
    sizeClasses.container,
    variant === 'solid' && config.bgClass,
    variant === 'outline' && `border border-${config.color}-500/30`,
    variant === 'glow' && config.bgClass,
    config.textClass,
    className,
  ].filter(Boolean).join(' ');

  const dotClasses = [
    'rounded-full',
    sizeClasses.dot,
    config.dotClass,
    animated && status === 'online' && 'animate-pulse-ring',
    animated && status === 'busy' && 'animate-pulse-dot',
    showDot && variant === 'glow' && `shadow-lg ${config.glowClass}`,
  ].filter(Boolean).join(' ');

  return (
    <span className={containerClasses}>
      {showDot && <span className={dotClasses} />}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};

export default StatusBadge;