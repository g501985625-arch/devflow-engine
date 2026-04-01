import { useState, useEffect, useCallback } from 'react';
import type { Project } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import ProjectList from './Dashboard/ProjectList';
import StatsCard from './Dashboard/StatsCard';
import EventLog from './Dashboard/EventLog';
import ConnectionStatus from './Dashboard/ConnectionStatus';

interface DashboardProps {
  apiBaseUrl?: string;
  wsUrl?: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
}

interface LogEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  projectId?: string;
}

export default function Dashboard({
  apiBaseUrl = '/api',
  wsUrl = 'ws://localhost:3000/ws',
}: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleWebSocketMessage = useCallback((event: { type: string; timestamp?: string; message?: string; task?: string; phase?: string; projectId?: string }) => {
    // Add event to log
    const logEvent: LogEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      type: event.type,
      message: event.message || getDefaultEventMessage(event.type, event.task, event.phase),
      projectId: event.projectId,
    };

    setEvents((prev) => [logEvent, ...prev].slice(0, 100)); // Keep last 100 events

    // Update projects if needed
    if (event.projectId && event.type === 'task_completed') {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === event.projectId
            ? { ...p, progress: Math.min(100, p.progress + 10) }
            : p
        )
      );
    }
  }, []);

  const { isConnected, isConnecting, error: wsError, reconnect } = useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onOpen: () => console.log('[Dashboard] WebSocket connected'),
    onClose: () => console.log('[Dashboard] WebSocket disconnected'),
  });

  // Convert null to undefined for wsError
  const wsErrorStr = wsError ?? undefined;

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await fetch(`${apiBaseUrl}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setProjects(data.data || data);
      updateStats(data.data || data);
    } catch (error) {
      console.error('[Dashboard] Failed to fetch projects:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to fetch projects');
      // Use mock data for development
      setProjects(getMockProjects());
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  const updateStats = useCallback((projectList: Project[]) => {
    const totalProjects = projectList.length;
    const activeProjects = projectList.filter((p) => p.status === 'active').length;
    const completedTasks = projectList.reduce((acc, p) => acc + Math.floor(p.progress / 10), 0);
    const pendingTasks = projectList.reduce((acc, p) => acc + (100 - p.progress) / 10, 0);

    setStats({
      totalProjects,
      activeProjects,
      completedTasks,
      pendingTasks: Math.floor(pendingTasks),
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Refresh projects periodically
  useEffect(() => {
    const interval = setInterval(fetchProjects, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                DevFlow Engine
              </h1>
            </div>
            <ConnectionStatus
              isConnected={isConnected}
              isConnecting={isConnecting}
              error={wsErrorStr}
              onReconnect={reconnect}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {apiError && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  API connection issue: {apiError}. Showing cached/mock data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            }
            color="blue"
          />
          <StatsCard
            title="Active"
            value={stats.activeProjects}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            color="green"
          />
          <StatsCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="purple"
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="orange"
          />
        </div>

        {/* Projects and Events Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Project List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ProjectList projects={projects} isLoading={isLoading} />
          </div>

          {/* Event Log - Takes 1 column */}
          <div className="lg:col-span-1">
            <EventLog events={events} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to generate default event messages
function getDefaultEventMessage(type: string, task?: string, phase?: string): string {
  switch (type) {
    case 'started':
      return 'Automation started';
    case 'phase_started':
      return `Phase "${phase}" started`;
    case 'task_started':
      return `Task "${task}" started`;
    case 'task_completed':
      return `Task "${task}" completed`;
    case 'task_failed':
      return `Task "${task}" failed`;
    case 'phase_completed':
      return `Phase "${phase}" completed`;
    case 'blocked':
      return 'Automation blocked - needs intervention';
    case 'needs_intervention':
      return 'Manual intervention required';
    case 'paused':
      return 'Automation paused';
    case 'completed':
      return 'Automation completed successfully';
    default:
      return type;
  }
}

// Mock data for development
function getMockProjects(): Project[] {
  return [
    {
      id: '1',
      name: 'DevFlow Engine',
      path: '/projects/devflow-engine',
      status: 'active',
      currentPhase: 'implementation',
      currentTask: 'Phase 4: Dashboard Module',
      progress: 65,
      createdAt: '2024-04-01T10:00:00Z',
      updatedAt: '2024-04-01T15:00:00Z',
    },
    {
      id: '2',
      name: 'API Gateway',
      path: '/projects/api-gateway',
      status: 'active',
      currentPhase: 'testing',
      currentTask: 'Integration Tests',
      progress: 40,
      createdAt: '2024-04-01T08:00:00Z',
      updatedAt: '2024-04-01T14:00:00Z',
    },
    {
      id: '3',
      name: 'CLI Tool',
      path: '/projects/cli-tool',
      status: 'completed',
      progress: 100,
      createdAt: '2024-03-30T10:00:00Z',
      updatedAt: '2024-03-31T16:00:00Z',
    },
  ];
}