import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/requirements', icon: '◈', label: 'Requirements' },
  { to: '/testcases', icon: '◎', label: 'Test Cases' },
  { to: '/traceability', icon: '⟁', label: 'Traceability' },
  { to: '/analytics', icon: '◇', label: 'Analytics' },
  { to: '/reports', icon: '⊞', label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base-100 mesh-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-base-200/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30">RT</div>
            <div>
              <h1 className="font-bold text-base-content text-sm">ReqTrace</h1>
              <p className="text-xs text-base-content/40">ML Classification</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-base-content/30 uppercase tracking-widest px-4 mb-3 font-medium">Navigation</p>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg w-5 text-center font-mono">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="pulse-dot"></div>
            <span className="text-xs text-base-content/40">{connected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="glass-card !p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-base-content truncate">{user?.name}</p>
              <p className="text-xs text-base-content/40 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm w-full justify-start text-base-content/50 hover:text-error text-xs">
            ⊗ Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="hidden lg:flex items-center gap-2 text-xs text-base-content/40">
            <span>ReqTrace</span>
            <span>/</span>
            <span className="text-base-content/70 capitalize">{location.pathname.replace('/', '')}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={toggleTheme} className="btn btn-ghost btn-sm btn-circle" title="Toggle theme">
              {theme === 'dark' ? '☀' : '◑'}
            </button>
            <div className="text-xs text-base-content/40 hidden sm:block">
              Welcome, <span className="text-primary font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
