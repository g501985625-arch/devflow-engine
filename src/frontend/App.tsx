import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workflow from './pages/Workflow';
import Agents from './pages/Agents';
import Progress from './pages/Progress';
import Workspace from './pages/Workspace';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'workflow':
        return <Workflow />;
      case 'agents':
        return <Agents />;
      case 'progress':
        return <Progress />;
      case 'workspace':
        return <Workspace />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      isDark={isDark}
      onToggleTheme={handleToggleTheme}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;