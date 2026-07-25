import React from 'react';
import { Sparkles, LayoutDashboard, History, User, LogOut, Zap } from 'lucide-react';

interface NavbarProps {
  user: { email: string } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700 text-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
          className="flex items-center space-x-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-amber flex items-center justify-center text-navy-900 shadow-amber-glow group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-offwhite group-hover:text-amber transition-colors">
              LandingIQ
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-navy-800 text-amber border border-amber/20">
              AI Auditor
            </span>
          </div>
        </button>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-amber text-navy-900 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Analyzer</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-amber text-navy-900 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'bg-amber text-navy-900 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
              </button>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-navy-800 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('landing')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'landing' ? 'text-amber' : 'text-gray-300 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className="bg-amber hover:bg-amber-hover text-navy-900 font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                Get Started Free
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
