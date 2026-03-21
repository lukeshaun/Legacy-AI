import React, { useRef, useState } from 'react';
import { Camera, FileText, Loader2, Trash2, X, Sparkles, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { uploadMedia, getSignedUrl, deleteMedia } from '@/hooks/useMediaUpload';
import EntryMetadataForm from './EntryMetadataForm';

interface UploadedFile {
  localUrl: string;
  storagePath: string;
  base64: string;
}

interface ScanUploadProps {
  onBack: () => void;
  onSaveEntry: (data: { text: string; galleryCount: number; hasAudio: boolean; mediaPaths: string[]; metadata: { dateStart: string; dateEnd: string; location: string; description: string } }) => void;
}

const ScanUpload: React.FC<ScanUploadProps> = ({ onBack, onSaveEntry }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [digitizedText, setDigitizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ dateStart: new Date().toISOString().split('T')[0], dateEnd: '', location: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of files) {
        const [base64, storagePath] = await Promise.all([
          readFileAsBase64(file),
          uploadMedia(file, user.id, 'documents'),
        ]);
        const signedUrl = await getSignedUrl(storagePath);
        uploaded.push({ localUrl: signedUrl, storagePath, base64 });
      }
      setDocuments(prev => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = async (index: number) => {
    const doc = documents[index];
    if (doc) { try { await deleteMedia(doc.storagePath); } catch {} }
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const digitizeAll = async () => {
    if (!documents.length) return;
    setIsLoading(true);
    setError(null);
    try {
      const results: string[] = [];
      for (const doc of documents) {
        const { data, error: fnError } = await supabase.functions.invoke('digitize-text', {
          body: { imageBase64: doc.base64 },
        });
        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        if (data?.text) results.push(data.text);
      }
      setDigitizedText(results.join('\n\n---\n\n'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = () => {
    onSaveEntry({
      text: digitizedText,
      galleryCount: 0,
      hasAudio: false,
      mediaPaths: documents.map(d => d.storagePath),
      metadata,
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <h2 className="text-2xl font-display font-bold">Scan Documents</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-medium flex items-center gap-2">
          <X size={16} /> {error}
        </div>
      )}
      {isUploading && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-sm font-medium flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Uploading...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left - Documents */}
        <div className="lg:col-span-4 space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] rounded-[2rem] border-2 border-dashed border-border hover:border-primary/50 bg-card shadow-soft flex flex-col items-center justify-center cursor-pointer transition-all"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Camera className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">Add Documents</p>
            <p className="text-xs text-muted-foreground mt-1">Select one or more images</p>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />

          {documents.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {documents.map((doc, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={doc.localUrl} className="w-full h-full object-cover" alt={`Doc ${i + 1}`} />
                  <button onClick={() => removeDocument(i)} className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Trash2 className="text-destructive-foreground" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button disabled={!documents.length || isLoading} onClick={digitizeAll} className="btn-primary">
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Scan All ({documents.length})
          </button>
        </div>

        {/* Right - Text + Metadata */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card rounded-[2rem] border border-border p-6 shadow-soft min-h-[200px] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={12} /> Transcription
              </span>
              {digitizedText && (
                <button onClick={handleArchive} className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Save size={14} /> Finish & Archive
                </button>
              )}
            </div>
            <textarea
              value={digitizedText}
              onChange={(e) => setDigitizedText(e.target.value)}
              placeholder="Transcription will appear here, or type manually..."
              className="flex-1 w-full text-sm leading-relaxed text-foreground/80 resize-none bg-transparent focus:outline-none placeholder:italic"
            />
          </div>
          <EntryMetadataForm onMetadataChange={setMetadata} />
        </div>
      </div>
    </div>
  );
};

export default ScanUpload;
