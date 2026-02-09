import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UploadTab from '@/components/tabs/UploadTab';
import BooksTab from '@/components/tabs/BooksTab';
import TimelineTab from '@/components/tabs/TimelineTab';
import BiographyTab from '@/components/tabs/BiographyTab';
import SearchTab from '@/components/tabs/SearchTab';
import SaveModal from '@/components/SaveModal';
import { Entry } from '@/types/entry';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [copied, setCopied] = useState(false);
  
  // Save modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<{ text: string; galleryCount: number; hasAudio: boolean } | null>(null);

  // Books and Entries
  const [folders] = useState(['Personal Journal', 'Travel 2024', 'Childhood Memories']);
  const [savedEntries, setSavedEntries] = useState<Entry[]>([
    { id: 1, text: "Visited the Eiffel Tower today. The lights were beautiful.", folder: "Travel 2024", location: "Paris, France", timestamp: "2024-01-10", attachments: { photos: 1, audio: false } },
    { id: 2, text: "Started learning to play the piano. It's harder than it looks.", folder: "Personal Journal", location: "New York, USA", timestamp: "2024-02-15", attachments: { photos: 0, audio: true } }
  ]);

  const handleSaveEntry = (data: { text: string; galleryCount: number; hasAudio: boolean }) => {
    setPendingEntry(data);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = (folder: string, location: string, date: string) => {
    if (!pendingEntry) return;
    
    const newEntry: Entry = {
      id: Date.now(),
      text: pendingEntry.text,
      folder,
      location,
      timestamp: date,
      attachments: {
        photos: pendingEntry.galleryCount,
        audio: pendingEntry.hasAudio
      }
    };
    
    setSavedEntries([newEntry, ...savedEntries]);
    setIsSaveModalOpen(false);
    setPendingEntry(null);
    setActiveTab('books');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col md:flex-row">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onClearBookView={() => {}}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'upload' && (
          <UploadTab onSaveEntry={handleSaveEntry} />
        )}

        {activeTab === 'books' && (
          <BooksTab 
            folders={folders} 
            entries={savedEntries}
            onNavigateToUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'search' && (
          <SearchTab entries={savedEntries} folders={folders} />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab entries={savedEntries} />
        )}

        {activeTab === 'biography' && (
          <BiographyTab folders={folders} entries={savedEntries} />
        )}
      </main>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleConfirmSave}
        folders={folders}
        initialText={pendingEntry?.text}
      />

      {copied && (
        <div className="fixed bottom-8 right-8 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
          <Check className="text-success" size={18} />
          <span className="text-sm font-bold tracking-tight">Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default Index;
