import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileUp, 
  Sparkles, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Palette,
  Sunset,
  Zap,
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, changeTheme, themes } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', name: 'ATS Analyzer', icon: FileUp },
    { path: '/improve', name: 'AI Bullet Optimizer', icon: Sparkles },
    { path: '/interview', name: 'AI Mock Interview', icon: MessageSquare },
    { path: '/recruiter', name: 'Recruiter Hub', icon: Users },
    { path: '/settings', name: 'Credentials', icon: Settings },
  ];

  return (
    <div 
      className={`glass-panel min-h-screen border-r border-white/5 transition-all duration-300 flex flex-col justify-between sticky top-0 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo block */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-cyber-cyan animate-pulse" />
              <span className="font-extrabold text-lg text-gradient-cyan-indigo tracking-wider">
                ATS.OPTIMA
              </span>
            </div>
          )}
          {isCollapsed && (
            <ShieldCheck className="h-6 w-6 text-cyber-cyan mx-auto animate-pulse" />
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hidden md:block"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User preview header */}
        {!isCollapsed && user && (
          <div className="p-4 mx-4 mt-6 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyber-cyan to-cyber-indigo flex items-center justify-center font-bold text-white shadow-glow-cyan">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate text-white">{user.name}</h4>
              <p className="text-xs text-cyber-cyan capitalize tracking-wide">{user.role} tier</p>
            </div>
          </div>
        )}

        {/* Main list navigation */}
        <nav className="mt-8 px-3 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyber-cyan/15 to-cyber-indigo/15 border-l-2 border-cyber-cyan text-cyber-cyan shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              
              {!isCollapsed && (
                <span className="text-sm tracking-wide">{item.name}</span>
              )}

              {/* Tooltip for collapsed bar */}
              {isCollapsed && (
                <div className="absolute left-full ml-6 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-40">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme Picker Widget */}
        {!isCollapsed ? (
          <div className="mx-4 mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5 transition-all duration-500">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Palette size={12} className="text-cyber-cyan animate-pulse" /> Active Aura
              </span>
              <span className="text-[9px] text-cyber-cyan font-mono capitalize px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/10 font-bold">
                {themes.find(t => t.id === theme)?.name || theme}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={t.name}
                  className={`h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative border group ${
                    theme === t.id
                      ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan shadow-glow-cyan scale-105'
                      : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {t.id === 'sunset' && <Sunset size={15} />}
                  {t.id === 'prism' && <Zap size={15} />}
                  {t.id === 'matrix' && <Terminal size={15} />}
                  {t.id === 'aurora' && <Sparkles size={15} />}
                  
                  <span className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-white/10 text-[10px] text-white px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-50">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={() => {
                const currentIndex = themes.findIndex(t => t.id === theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                changeTheme(themes[nextIndex].id);
              }}
              title="Cycle Theme Aura"
              className="h-10 w-10 rounded-xl bg-white/5 border border-cyber-cyan/30 text-cyber-cyan hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center shadow-glow-cyan animate-pulse group relative"
            >
              <Palette size={16} />
              <div className="absolute left-full ml-6 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-40">
                Cycle Theme Aura
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Logout triggers */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-cyber-rose hover:bg-cyber-rose/10 transition-all duration-200"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">Disconnect</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
