import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardPageProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardPage({ children, title, subtitle }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-dark-200 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        {title && (
          <header className="sticky top-0 z-40 glass-strong border-b border-gray-700/50 px-8 py-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </header>
        )}

        <div className="px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
