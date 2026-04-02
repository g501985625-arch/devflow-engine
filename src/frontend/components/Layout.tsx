import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  isDark,
  onToggleTheme,
}) => {
  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <Header isDark={isDark} onToggleTheme={onToggleTheme} />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={onNavigate}
            isDark={isDark}
          />
          
          {/* Main Content */}
          <main className="flex-1 p-6 ml-64 mt-16">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;