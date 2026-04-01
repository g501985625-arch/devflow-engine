import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export default function StatsCard({ title, value, icon, color }: StatsCardProps): React.ReactElement {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3 text-white`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}