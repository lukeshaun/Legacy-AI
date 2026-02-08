import React, { useState } from 'react';
import { Book, Plus, ArrowLeft, Calendar, MapPin, ImageIcon, Mic } from 'lucide-react';
import { Entry } from '@/types/entry';

interface BooksTabProps {
  folders: string[];
  entries: Entry[];
  onNavigateToUpload: () => void;
}

const BooksTab: React.FC<BooksTabProps> = ({ folders, entries, onNavigateToUpload }) => {
  const [selectedBookView, setSelectedBookView] = useState<string | null>(null);

  if (selectedBookView) {
    const bookEntries = entries.filter(e => e.folder === selectedBookView);
    
    return (
      <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedBookView(null)}
          className="mb-6 flex items-center gap-2 text-muted-foreground font-bold text-sm hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-display font-black text-foreground">{selectedBookView}</h2>
            <p className="text-muted-foreground font-medium">{bookEntries.length} saved memories</p>
          </div>
        </div>
        <div className="space-y-4">
          {bookEntries.length > 0 ? (
            bookEntries.map(entry => (
              <div key={entry.id} className="bg-card p-6 rounded-[2rem] border border-border shadow-soft">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {entry.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {entry.attachments.photos > 0 && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">{entry.attachments.photos} Photos</span>}
                    {entry.attachments.audio && <span className="bg-success/10 text-success px-3 py-1 rounded-full text-[10px] font-bold">Voice Note</span>}
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed font-display text-lg">{entry.text}</p>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-card rounded-3xl border border-border">
              <Book size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-bold">This book is currently empty.</p>
              <button onClick={onNavigateToUpload} className="mt-4 text-primary text-sm font-bold">Add your first entry</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-display font-bold mb-8">Your Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map(folder => {
          const folderEntries = entries.filter(e => e.folder === folder);
          return (
            <div key={folder} className="bg-card p-6 rounded-3xl border border-border shadow-soft hover:shadow-lifted transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Book size={24} />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {folderEntries.length} Entries
                </span>
              </div>
              <h3 className="font-bold text-lg mb-4">{folder}</h3>
              <div className="space-y-3 flex-1">
                {folderEntries.slice(0, 2).map(entry => (
                  <div key={entry.id} className="text-xs text-muted-foreground flex flex-col gap-1 p-2 bg-muted rounded-lg">
                    <span className="line-clamp-1">{entry.text}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setSelectedBookView(folder)}
                className="w-full mt-6 py-2 text-primary font-bold text-xs bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
              >
                Open Book
              </button>
            </div>
          );
        })}
        <button className="aspect-square border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
          <Plus size={32} strokeWidth={1} />
          <span className="text-sm font-bold mt-2">New Book</span>
        </button>
      </div>
    </div>
  );
};

export default BooksTab;
