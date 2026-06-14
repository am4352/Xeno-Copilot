import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  LayoutDashboard,
  Upload,
  Users,
  Megaphone,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Data', icon: Upload },
  { path: '/audience', label: 'Audience Builder', icon: Users },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="xeno-shell flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-[300px] xeno-surface border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8 border-b border-border">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Xeno</h1>
            <p className="text-xs font-medium text-accent-indigo tracking-wider uppercase mt-0.5">Copilot</p>
          </div>
          <button
            className="ml-auto lg:hidden text-text-secondary hover:text-text-primary"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-bg-card-hover transition-all duration-200">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-text-muted hover:text-accent-rose transition-colors p-1.5 rounded-lg hover:bg-bg-card-hover"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-5 border-b border-border xeno-surface">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:text-text-primary p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-indigo" />
            <span className="font-bold text-text-primary text-lg">Xeno Copilot</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}