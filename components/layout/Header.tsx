'use client';

import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-20 glass-strong border-b border-white/10 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Rechercher un citoyen, véhicule, rapport..."
            className="w-full pl-12 pr-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-police-blue/50 focus:border-police-blue
                     transition-all duration-200 text-dark-100 placeholder:text-dark-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-8">
        {/* Notifications */}
        <button className="relative p-3 rounded-xl hover:glass transition-all duration-200 group">
          <Bell className="w-5 h-5 text-dark-300 group-hover:text-white transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full animate-pulse"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl glass hover:glass-strong transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-police-blue to-accent-purple flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Officier Dupont</p>
              <p className="text-xs text-dark-400">Badge #1234</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-strong rounded-xl border border-white/10 overflow-hidden z-50 animate-fade-in">
              <div className="p-4 border-b border-white/10">
                <p className="text-sm font-semibold text-white">Officier Dupont</p>
                <p className="text-xs text-dark-400">dupont@lspd.gov</p>
                <div className="mt-2 inline-flex px-3 py-1 rounded-lg bg-accent-green/20 text-accent-green text-xs font-semibold">
                  En service
                </div>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-dark-200 hover:text-white">
                  Mon profil
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-dark-200 hover:text-white">
                  Paramètres
                </button>
                <div className="my-2 h-px bg-white/10"></div>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-accent-red hover:text-accent-red">
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
