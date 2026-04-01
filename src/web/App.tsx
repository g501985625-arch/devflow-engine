/**
 * DevFlow Dashboard - App 入口
 */

import React from 'react';
import Dashboard from './components/Dashboard';

export default function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Dashboard />
    </div>
  );
}