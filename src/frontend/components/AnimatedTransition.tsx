import React, { useEffect, useState } from 'react';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  animation?: 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'scale-bounce' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  trigger?: 'mount' | 'always' | 'hover';
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  animation = 'fade-up',
  duration = 'normal',
  delay = 0,
  trigger = 'mount',
  className = '',
  style = {},
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'always');
  const [hasAnimated, setHasAnimated] = useState(false);

  const durationClass = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  }[duration] || 'duration-300';

  useEffect(() => {
    if (trigger === 'mount' && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [trigger, delay, hasAnimated]);

  const getAnimationClass = (): string => {
    const animationMap: Record<string, string> = {
      'fade': 'animate-fade-in',
      'fade-up': 'animate-fade-in-up',
      'fade-down': 'animate-fade-in-down',
      'fade-left': 'animate-fade-in-left',
      'fade-right': 'animate-fade-in-right',
      'scale': 'animate-scale-in',
      'scale-bounce': 'animate-scale-in-bounce',
      'slide-up': 'animate-slide-up',
      'slide-down': 'animate-slide-down',
      'slide-left': 'animate-fade-in-left',
      'slide-right': 'animate-slide-in',
    };

    return `${animationMap[animation] || 'animate-fade-in'} ${durationClass}`;
  };

  const getInitialStyles = (): React.CSSProperties => {
    if (trigger === 'mount' && !isVisible) {
      return {
        opacity: 0,
        ...style,
      };
    }
    return style;
  };

  const containerClasses = [
    trigger === 'mount' && isVisible ? getAnimationClass() : '',
    trigger === 'always' ? getAnimationClass() : '',
    className,
  ].filter(Boolean).join(' ');

  if (trigger === 'hover') {
    return (
      <div
        className={`transition-all ${durationClass} ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      style={getInitialStyles()}
    >
      {children}
    </div>
  );
};

// Stagger Container for sequential animations
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 100,
  className = '',
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedTransition
          animation="fade-up"
          delay={index * staggerDelay}
          trigger="mount"
        >
          {child}
        </AnimatedTransition>
      ))}
    </div>
  );
};

// Fade In Group for batch animations
interface FadeInGroupProps {
  items: React.ReactNode[];
  animation?: 'fade-up' | 'fade-left' | 'fade-right';
  staggerDelay?: number;
  className?: string;
}

export const FadeInGroup: React.FC<FadeInGroupProps> = ({
  items,
  animation = 'fade-up',
  staggerDelay = 100,
  className = '',
}) => {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <AnimatedTransition
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          trigger="mount"
        >
          {item}
        </AnimatedTransition>
      ))}
    </div>
  );
};

export default AnimatedTransition;