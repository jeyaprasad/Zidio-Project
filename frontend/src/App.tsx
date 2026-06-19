import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser, clearAuthSession, type User } from './services/api';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AuthModal } from './components/AuthModal';
import { useNotifications, type NotificationPayload } from './hooks/useNotifications';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getUser());
  const [showAuth, setShowAuth] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<NotificationPayload[]>([]);

  useNotifications({
    user,
    onNotification: (notif) => {
      setToasts((prev) => [...prev, notif]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notif.id));
      }, 6000);
    },
  });

  const handleAuth = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowAuth(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-200 selection:bg-indigo-500/30 selection:text-white ${
        theme === 'dark' ? 'bg-[#080D1C] text-[#E2E8F0]' : 'bg-slate-50 text-slate-900'
      }`}>
        {/* Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between px-[5%] backdrop-blur-md border-b transition-colors duration-200 ${
          theme === 'dark' ? 'bg-slate-950/85 border-white/5' : 'bg-white/85 border-slate-200'
        }`}>
          <div
            className={`flex items-center gap-2.5 font-black text-lg tracking-tight cursor-pointer ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
            onClick={() => window.location.href = '/'}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-xs font-black text-white">
              N
            </div>
            NexusHR
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                theme === 'dark' 
                  ? 'border-white/10 text-slate-300 hover:bg-white/5' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            {user ? (
              <>
                <span className={`hidden sm:inline text-xs font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>{user.email}</span>
                <button
                  className={`px-4 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-white/10 text-slate-300 hover:bg-white/5'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className={`px-4 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-white/10 text-slate-300 hover:bg-white/5'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setShowAuth(true)}
                >
                  Sign In
                </button>
                <button
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg hover:shadow-indigo-500/10 cursor-pointer transition-all"
                  onClick={() => setShowAuth(true)}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage onOpenAuth={() => setShowAuth(true)} theme={theme} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} theme={theme} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Auth Modal Overlay */}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}

        {/* Real-time Toast Notification Stack */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 flex flex-col gap-1 ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-white/10 text-white shadow-black/40'
                  : 'bg-white/90 border-slate-200 text-slate-900 shadow-slate-300/40'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    toast.type === 'SUCCESS' ? 'bg-emerald-500' :
                    toast.type === 'WARNING' ? 'bg-amber-500' :
                    toast.type === 'ALERT' ? 'bg-rose-500' : 'bg-indigo-500'
                  }`} />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {toast.type || 'NOTIFICATION'}
                  </h4>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-200 text-xs font-bold leading-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-sm font-extrabold">{toast.title}</h3>
              <p className="text-xs text-slate-300/80 leading-relaxed font-medium">{toast.message}</p>
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
};

export default App;
