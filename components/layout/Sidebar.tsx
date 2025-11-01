'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Search,
  Settings,
  Bell,
  ChevronLeft,
  Shield,
  Activity,
} from 'lucide-react';

const menuItems = [
  {
    name: 'Tableau de bord',
    icon: LayoutDashboard,
    href: '/',
    badge: null,
  },
  {
    name: 'Rapports',
    icon: FileText,
    href: '/rapports',
    badge: '12',
  },
  {
    name: 'Planification',
    icon: Calendar,
    href: '/planification',
    badge: null,
  },
  {
    name: 'Personnel',
    icon: Users,
    href: '/personnel',
    badge: null,
  },
  {
    name: 'Recherche',
    icon: Search,
    href: '/recherche',
    badge: null,
  },
  {
    name: 'Activité',
    icon: Activity,
    href: '/activite',
    badge: '3',
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-50 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Glass background */}
      <div className="h-full glass-strong border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-police-blue to-accent-purple flex items-center justify-center glow-blue">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gradient-blue">OlympusMDT</h1>
                  <p className="text-xs text-dark-400">v2.0.1</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isCollapsed ? 'justify-center' : ''}
                  ${
                    isActive
                      ? 'glass-strong glow-blue text-white'
                      : 'hover:glass text-dark-300 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-police-blue-light' : ''}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-accent-red text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/notifications"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
              hover:glass text-dark-300 hover:text-white
            `}
          >
            <Bell className="w-5 h-5" />
            {!isCollapsed && <span className="flex-1 font-medium">Notifications</span>}
            {!isCollapsed && (
              <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse"></span>
            )}
          </Link>

          <Link
            href="/parametres"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
              hover:glass text-dark-300 hover:text-white
            `}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="flex-1 font-medium">Paramètres</span>}
          </Link>

          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full p-3 rounded-xl hover:glass transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 rotate-180 mx-auto" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
