import React from 'react';
import type { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
}

export default function ProjectList({ projects, isLoading }: ProjectListProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{projects.length} projects</p>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {projects.map((project) => (
          <div key={project.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {project.status}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{project.progress}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    project.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {project.currentPhase && `Phase: ${project.currentPhase}`}
              {project.currentTask && ` • ${project.currentTask}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}