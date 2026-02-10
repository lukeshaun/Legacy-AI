import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, MapPin, Book, CalendarRange } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folder: string, location: string, dateStart: string, dateEnd: string) => void;
  folders: string[];
  initialText?: string;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, folders, initialText }) => {
  const [selectedFolder, setSelectedFolder] = useState(folders[0] || 'Personal Journal');
  const [locationInput, setLocationInput] = useState('');
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState('');
  const [useRange, setUseRange] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDateStart(today);
      setDateEnd('');
      setUseRange(false);
      setLocationInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedFolder, locationInput || "Unknown Location", dateStart, useRange ? dateEnd : '');
  };

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-border flex justify-between items-center bg-primary/5">
          <h3 className="font-display font-bold text-xl text-foreground">Archive Details</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-accent/20 border border-accent/30 p-4 rounded-2xl">
            <p className="text-xs text-accent-foreground font-medium">
              {isVerifying ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin w-3 h-3"/> Legacy AI is identifying details...</span>
              ) : (
                "Please verify or add the date range and location for this memory."
              )}
            </p>
          </div>

          {/* Date Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-primary"/> {useRange ? 'Date Range' : 'Entry Date'}
              </label>
              <button
                type="button"
                onClick={() => setUseRange(!useRange)}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                  useRange 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarRange size={12} />
                {useRange ? 'Using range' : 'Add time range'}
              </button>
            </div>
            <div className={`grid gap-3 ${useRange ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                {useRange && <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">From</span>}
                <input 
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full px-5 py-4 bg-muted border-none rounded-2xl text-sm font-medium"
                />
              </div>
              {useRange && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">To</span>
                  <input 
                    type="date"
                    value={dateEnd}
                    min={dateStart}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full px-5 py-4 bg-muted border-none rounded-2xl text-sm font-medium"
                  />
                </div>
              )}
            </div>
            {useRange && (
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                Specify the period you were at this location.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-3 block tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-primary"/> Location
            </label>
            <input 
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Where were you during this time?"
              className="w-full px-5 py-4 bg-muted border-none rounded-2xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-3 block tracking-widest flex items-center gap-2">
              <Book size={14} className="text-primary"/> Select Book
            </label>
            <div className="grid grid-cols-2 gap-2">
              {folders.map(f => (
                <button 
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`px-3 py-3 rounded-2xl text-[11px] text-left transition-all border ${selectedFolder === f ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border hover:bg-muted'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-8 bg-secondary/30 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-muted-foreground">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isVerifying}
            className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
          >
            Archive Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
