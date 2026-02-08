import React from 'react';
import { Plus, History, MapPin, Sparkles, UserCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClearBookView: () => void;
}

const navItems = [
  { id: 'upload', icon: Plus, label: 'Upload Entry' },
  { id: 'books', icon: History, label: 'View Books' },
  { id: 'timeline', icon: MapPin, label: 'Location Timeline' },
  { id: 'biography', icon: Sparkles, label: 'Create Biography' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onClearBookView }) => {
  return (
    <nav className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-primary rounded-xl shadow-lg">
          <Sparkles className="text-primary-foreground w-6 h-6" />
        </div>
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
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">Legacy Account</p>
            <p className="text-[10px] text-muted-foreground">ID: USER-9921-X</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
