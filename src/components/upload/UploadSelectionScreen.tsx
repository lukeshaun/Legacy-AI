import React from 'react';
import { FileText, Image, Mic } from 'lucide-react';

type UploadType = 'scan' | 'photo' | 'voice';

interface UploadSelectionScreenProps {
  onSelect: (type: UploadType) => void;
}

const options: { type: UploadType; icon: React.ElementType; title: string; description: string }[] = [
  { type: 'scan', icon: FileText, title: 'Scan Primary Document', description: 'Upload one or more documents for AI-powered text transcription' },
  { type: 'photo', icon: Image, title: 'Photo Upload', description: 'Add photos to preserve visual memories and moments' },
  { type: 'voice', icon: Mic, title: 'Voice Note', description: 'Record or upload an audio memory or oral history' },
];

const UploadSelectionScreen: React.FC<UploadSelectionScreenProps> = ({ onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-foreground">New Memory Entry</h2>
        <p className="text-sm text-muted-foreground mt-2">Choose how you'd like to capture this memory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map(({ type, icon: Icon, title, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="group relative bg-card border-2 border-border rounded-[2rem] p-8 flex flex-col items-center text-center gap-5
              hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300
              active:scale-[0.98]"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center
              group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Icon size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UploadSelectionScreen;
