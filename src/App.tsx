import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AccountPage } from './pages/AccountPage';

export function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [currentReport, setCurrentReport] = useState<any | null>(null);

  // Check auth session on startup
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setActiveTab('dashboard');
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setCurrentReport(null);
      setActiveTab('landing');
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleReportGenerated = (reportData: any) => {
    setCurrentReport(reportData);
    setActiveTab('results');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-offwhite space-y-4">
        <div className="w-10 h-10 border-4 border-amber border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold font-display uppercase tracking-widest text-amber">
          Loading LandingIQ Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-offwhite text-navy-900 selection:bg-amber selection:text-navy-900">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!user && (tab === 'dashboard' || tab === 'history' || tab === 'account')) {
            setAuthMode('login');
            setActiveTab('login');
          } else {
            setActiveTab(tab);
          }
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* Unauthenticated Landing Page */}
        {!user && activeTab === 'landing' && (
          <LandingPage
            onStart={(mode = 'signup') => {
              setAuthMode(mode);
              setActiveTab(mode);
            }}
          />
        )}

        {/* Auth Page */}
        {!user && (activeTab === 'login' || activeTab === 'signup') && (
          <AuthPage
            initialMode={authMode}
            onAuthSuccess={handleAuthSuccess}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}

        {/* Protected Dashboard Page */}
        {user && activeTab === 'dashboard' && (
          <DashboardPage onReportGenerated={handleReportGenerated} />
        )}

        {/* Protected Results View */}
        {user && activeTab === 'results' && currentReport && (
          <ResultsPage
            report={currentReport}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {/* Protected History Page */}
        {user && activeTab === 'history' && (
          <HistoryPage
            onSelectReport={(report) => {
              setCurrentReport(report);
              setActiveTab('results');
            }}
            onNewAudit={() => setActiveTab('dashboard')}
          />
        )}

        {/* Protected Account Page */}
        {user && activeTab === 'account' && (
          <AccountPage
            user={user}
            onLogout={handleLogout}
            onAccountDeleted={() => {
              setUser(null);
              setActiveTab('landing');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-navy-700 text-gray-400 py-8 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white font-display">LandingIQ</span>
            <span>— AI Landing Page Conversion Auditor</span>
          </div>
          <p>© {new Date().getFullYear()} LandingIQ. Built with React, Express, Drizzle ORM & Claude 3.5.</p>
        </div>
      </footer>
    </div>
  );
}
export default App;
