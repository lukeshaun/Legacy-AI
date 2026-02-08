import React, { useState } from 'react';
import { FileText, Loader2, Sparkles, AlignLeft, Copy, Check } from 'lucide-react';
import { Entry, BioConfig } from '@/types/entry';
import { supabase } from '@/integrations/supabase/client';

interface BiographyTabProps {
  folders: string[];
  entries: Entry[];
}

const BiographyTab: React.FC<BiographyTabProps> = ({ folders, entries }) => {
  const [selectedFolderForBio, setSelectedFolderForBio] = useState<string[]>([]);
  const [bioConfig, setBioConfig] = useState<BioConfig>({ wordCount: 500, focusTopic: '' });
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [generatedBio, setGeneratedBio] = useState('');
  const [copied, setCopied] = useState(false);

  const generateBiography = async () => {
    if (selectedFolderForBio.length === 0) return;
    setIsGeneratingBio(true);

    const context = entries
      .filter(e => selectedFolderForBio.includes(e.folder))
      .map(e => `[${e.timestamp} @ ${e.location}]: ${e.text}`)
      .join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('digitize-text', {
        body: { 
          prompt: `Synthesize a biography based on these personal records: \n${context}\n\nTarget Length: Approximately ${bioConfig.wordCount} words. ${bioConfig.focusTopic ? `Focus specifically on: ${bioConfig.focusTopic}.` : ''} Style: Legacy, narrative, and reflective. Organize into chapters or cohesive sections.`
        }
      });

      if (error) throw error;
      setGeneratedBio(data?.text || "Generation failed.");
    } catch (err) {
      setGeneratedBio("Error generating biography. Please try again.");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedBio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = generatedBio;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-display font-bold mb-4">Create Legacy Biography</h2>
      <p className="text-muted-foreground mb-8">Synthesize your personal archives into a cohesive narrative story.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-soft space-y-6">
            {/* Folder Selection */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3">Include Books</label>
              <div className="flex flex-col gap-2">
                {folders.map(folder => (
                  <label key={folder} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedFolderForBio.includes(folder) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-foreground/80 hover:bg-muted'}`}>
                    <span className="text-xs font-bold">{folder}</span>
                    <input 
                      type="checkbox" 
                      checked={selectedFolderForBio.includes(folder)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedFolderForBio([...selectedFolderForBio, folder]);
                        else setSelectedFolderForBio(selectedFolderForBio.filter(f => f !== folder));
                      }}
                      className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Word Count Selection */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3 flex items-center gap-2">
                <AlignLeft size={14} className="text-primary" /> Target Word Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[300, 500, 1000].map(count => (
                  <button
                    key={count}
                    onClick={() => setBioConfig({ ...bioConfig, wordCount: count })}
                    className={`py-2 rounded-xl text-[10px] font-black transition-all border ${bioConfig.wordCount === count ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/30'}`}
                  >
                    {count === 1000 ? '1k+' : count} Words
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Topic Input */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3">Narrative Focus</label>
              <input 
                type="text"
                value={bioConfig.focusTopic}
                onChange={(e) => setBioConfig({...bioConfig, focusTopic: e.target.value})}
                placeholder="e.g. Career, travel, family lessons..."
                className="w-full px-4 py-3 bg-muted border-none rounded-xl text-xs font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button 
              onClick={generateBiography}
              disabled={isGeneratingBio || selectedFolderForBio.length === 0}
              className="btn-primary"
            >
              {isGeneratingBio ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Synthesize Story
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8">
          <div className="bg-card rounded-[2.5rem] border border-border min-h-[600px] flex flex-col overflow-hidden shadow-soft relative">
            <div className="px-8 py-6 bg-secondary/30 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center shadow-sm">
                  <FileText size={16} className="text-primary" />
                </div>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Draft Output</span>
              </div>
              {generatedBio && (
                <button onClick={copyToClipboard} className="p-2.5 bg-card border border-border text-muted-foreground hover:text-primary rounded-xl transition-all shadow-sm">
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
              )}
            </div>
            
            <div className="p-10 flex-1 overflow-y-auto relative">
              {isGeneratingBio && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 relative mb-4">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-black text-primary uppercase tracking-tighter">Synthesizing Narrative...</p>
                  <p className="text-xs text-muted-foreground mt-2">Connecting memories across {selectedFolderForBio.length} books</p>
                </div>
              )}
              
              {generatedBio ? (
                <div className="prose prose-slate max-w-none text-foreground/80 leading-relaxed font-display text-xl whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {generatedBio}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 text-center py-20">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={32} className="opacity-20" />
                  </div>
                  <h3 className="text-lg font-bold text-muted-foreground mb-2">Ready for Synthesis</h3>
                  <p className="text-sm italic max-w-xs mx-auto">Select folders on the left to begin weaving your life story together.</p>
                </div>
              )}
            </div>
            
            {generatedBio && (
              <div className="p-6 bg-primary/5 border-t border-primary/10 text-center">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">This content is AI-synthesized from your specific archived entries.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiographyTab;
