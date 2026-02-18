import React, { useState, useEffect } from 'react';
import { Plus, History, MapPin, Sparkles, UserCircle, Search, Sun, Moon, Flame } from 'lucide-react';
import logo from '@/assets/logo.png';

type Theme = 'light' | 'warm' | 'dark';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClearBookView: () => void;
}

const navItems = [
  { id: 'search', icon: Search, label: 'Smart Search' },
  { id: 'upload', icon: Plus, label: 'Upload Entry' },
  { id: 'books', icon: History, label: 'View Books' },
  { id: 'timeline', icon: MapPin, label: 'Location Timeline' },
  { id: 'biography', icon: Sparkles, label: 'Create Biography' },
];

const themeOptions: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'warm', icon: Flame, label: 'Warm' },
  { id: 'dark', icon: Moon, label: 'Dark' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onClearBookView }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'warm');
    if (theme !== 'light') {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <nav className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <img src={logo} alt="Legacy AI" className="w-14 h-14 object-contain" />
        <h1 className="text-xl font-display font-bold tracking-tight">Legacy AI</h1>
      </div>
      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); onClearBookView(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.id 
              ? 'bg-primary/10 text-primary shadow-sm' 
              : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-auto p-4 bg-muted rounded-2xl border border-border">
        <div className="flex items-center gap-3">
          <UserCircle className="text-muted-foreground" size={32} />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold truncate">Legacy Account</p>
            <p className="text-[10px] text-muted-foreground">ID: USER-9921-X</p>
          </div>
          <div className="flex gap-1">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                title={opt.label}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === opt.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <opt.icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
