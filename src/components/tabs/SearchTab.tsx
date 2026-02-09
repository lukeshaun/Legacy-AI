import React, { useState, useMemo } from 'react';
import { Search, Calendar, MapPin, ImageIcon, Mic, Book, X } from 'lucide-react';
import { Entry } from '@/types/entry';
import { Input } from '@/components/ui/input';

interface SearchTabProps {
  entries: Entry[];
  folders: string[];
}

const SearchTab: React.FC<SearchTabProps> = ({ entries, folders }) => {
  const [query, setQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim() && !selectedFolder) return [];

    return entries.filter(entry => {
      const matchesFolder = !selectedFolder || entry.folder === selectedFolder;
      const matchesQuery = !query.trim() || 
        entry.text.toLowerCase().includes(query.toLowerCase()) ||
        entry.location.toLowerCase().includes(query.toLowerCase()) ||
        entry.folder.toLowerCase().includes(query.toLowerCase());
      return matchesFolder && matchesQuery;
    });
  }, [query, selectedFolder, entries]);

  const showResults = query.trim() || selectedFolder;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-display font-bold mb-2">Smart Search</h2>
      <p className="text-muted-foreground mb-8">Search across all your archived memories.</p>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entries by text, location, or book name..."
          className="pl-12 py-6 text-base rounded-2xl border-border bg-card shadow-soft"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Folder Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedFolder(null)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            !selectedFolder
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          All Books
        </button>
        {folders.map(folder => (
          <button
            key={folder}
            onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedFolder === folder
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* Results */}
      {showResults ? (
        <>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
          <div className="space-y-4">
            {results.map(entry => (
              <div key={entry.id} className="bg-card p-6 rounded-[2rem] border border-border shadow-soft">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={10} /> {entry.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Book size={10} /> {entry.folder}
                    </span>
                    {entry.attachments.photos > 0 && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                        {entry.attachments.photos} Photos
                      </span>
                    )}
                    {entry.attachments.audio && (
                      <span className="bg-success/10 text-success px-3 py-1 rounded-full text-[10px] font-bold">
                        Voice Note
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed font-display text-lg">
                  {highlightMatch(entry.text, query)}
                </p>
              </div>
            ))}
            {results.length === 0 && (
              <div className="py-20 text-center bg-card rounded-3xl border border-border">
                <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-bold">No matching entries found.</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search term or filter.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-20 text-center bg-card rounded-3xl border border-border">
          <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-bold">Start typing to search your memories</p>
          <p className="text-sm text-muted-foreground mt-1">Or select a book to browse its entries.</p>
        </div>
      )}
    </div>
  );
};

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
    ) : part
  );
}

export default SearchTab;
