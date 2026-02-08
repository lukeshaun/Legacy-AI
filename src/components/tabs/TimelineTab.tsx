import React from 'react';
import { MapPin, Calendar, ImageIcon, Mic } from 'lucide-react';
import { Entry } from '@/types/entry';

interface TimelineTabProps {
  entries: Entry[];
}

const TimelineTab: React.FC<TimelineTabProps> = ({ entries }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-display font-bold mb-8">Location Timeline</h2>
      <div className="relative border-l-2 border-border ml-4 pl-8 space-y-10">
        {entries.map((entry) => (
          <div key={entry.id} className="relative">
            <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-card shadow-sm" />
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <MapPin size={16} />
                  {entry.location}
                </div>
                <div className="flex gap-2">
                  {entry.attachments.photos > 0 && <ImageIcon size={14} className="text-primary/50" />}
                  {entry.attachments.audio && <Mic size={14} className="text-success/70" />}
                </div>
              </div>
              <p className="text-sm text-foreground/80 mb-3">{entry.text}</p>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                <span>{entry.folder}</span>
                <span className="flex items-center gap-1"><Calendar size={10}/> {entry.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTab;
