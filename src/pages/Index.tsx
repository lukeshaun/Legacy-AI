import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UploadTab from '@/components/tabs/UploadTab';
import BooksTab from '@/components/tabs/BooksTab';
import TimelineTab from '@/components/tabs/TimelineTab';
import BiographyTab from '@/components/tabs/BiographyTab';
import SearchTab from '@/components/tabs/SearchTab';
import SaveModal from '@/components/SaveModal';
import { useEntries } from '@/hooks/useEntries';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [copied, setCopied] = useState(false);
  
  // Save modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<{ text: string; galleryCount: number; hasAudio: boolean } | null>(null);

  // Database-backed entries
  const { entries: savedEntries, folders, loading, addEntry } = useEntries();

  const handleSaveEntry = (data: { text: string; galleryCount: number; hasAudio: boolean }) => {
    setPendingEntry(data);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async (folder: string, location: string, dateStart: string, dateEnd: string) => {
    if (!pendingEntry) return;
    
    const success = await addEntry({
      text: pendingEntry.text,
      folder,
      location,
      dateStart,
      dateEnd,
      galleryCount: pendingEntry.galleryCount,
      hasAudio: pendingEntry.hasAudio,
    });

    if (success) {
      setIsSaveModalOpen(false);
      setPendingEntry(null);
      setActiveTab('books');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col md:flex-row">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onClearBookView={() => {}}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
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
          </>
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
