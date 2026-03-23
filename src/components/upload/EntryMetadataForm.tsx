import React, { useState } from 'react';
import { Calendar, CalendarRange, MapPin, FileText } from 'lucide-react';

interface EntryMetadataFormProps {
  onMetadataChange: (metadata: { title: string; dateStart: string; dateEnd: string; location: string; description: string }) => void;
}

const EntryMetadataForm: React.FC<EntryMetadataFormProps> = ({ onMetadataChange }) => {
  const [title, setTitle] = useState('');
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState('');
  const [useRange, setUseRange] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const notify = (updates: Partial<{ title: string; dateStart: string; dateEnd: string; location: string; description: string }>) => {
    const next = {
      title: updates.title ?? title,
      dateStart: updates.dateStart ?? dateStart,
      dateEnd: updates.dateEnd ?? (useRange ? dateEnd : ''),
      location: updates.location ?? location,
      description: updates.description ?? description,
    };
    onMetadataChange(next);
  };

  return (
    <div className="bg-card rounded-[2rem] border border-border p-6 shadow-soft space-y-5">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Details (optional)</h3>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
          <FileText size={14} className="text-primary" /> Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); notify({ title: e.target.value }); }}
          placeholder="Give this memory a title..."
          className="w-full px-4 py-3 bg-muted border-none rounded-2xl text-sm font-semibold"
        />
      </div>

      {/* Date */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-primary" /> {useRange ? 'Date Range' : 'Date'}
          </label>
          <button
            type="button"
            onClick={() => setUseRange(!useRange)}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
              useRange ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarRange size={12} />
            {useRange ? 'Using range' : 'Add range'}
          </button>
        </div>
        <div className={`grid gap-3 ${useRange ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => { setDateStart(e.target.value); notify({ dateStart: e.target.value }); }}
            className="w-full px-4 py-3 bg-muted border-none rounded-2xl text-sm font-medium"
          />
          {useRange && (
            <input
              type="date"
              value={dateEnd}
              min={dateStart}
              onChange={(e) => { setDateEnd(e.target.value); notify({ dateEnd: e.target.value }); }}
              className="w-full px-4 py-3 bg-muted border-none rounded-2xl text-sm font-medium animate-in fade-in duration-200"
            />
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-primary" /> Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => { setLocation(e.target.value); notify({ location: e.target.value }); }}
          placeholder="Where was this?"
          className="w-full px-4 py-3 bg-muted border-none rounded-2xl text-sm"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
          <FileText size={14} className="text-primary" /> Short Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => { setDescription(e.target.value); notify({ description: e.target.value }); }}
          placeholder="A brief note about this memory..."
          className="w-full px-4 py-3 bg-muted border-none rounded-2xl text-sm"
        />
      </div>
    </div>
  );
};

export default EntryMetadataForm;
