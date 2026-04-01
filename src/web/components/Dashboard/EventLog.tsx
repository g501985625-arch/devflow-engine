import React from 'react';

interface LogEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  projectId?: string;
}

interface EventLogProps {
  events: LogEvent[];
}

const eventTypeColors: Record<string, string> = {
  started: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  phase_started: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  task_started: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  task_completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  task_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  phase_completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  paused: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function EventLog({ events }: EventLogProps): React.ReactElement {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Log</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Real-time events</p>
      </div>
      <div className="overflow-y-auto max-h-96">
        {events.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            No events yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event) => (
              <div key={event.id} className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    eventTypeColors[event.type] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{event.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}