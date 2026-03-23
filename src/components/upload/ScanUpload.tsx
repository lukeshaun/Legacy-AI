import React, { useRef, useState } from 'react';
import { Camera, FileText, Loader2, Trash2, X, Sparkles, Save, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { uploadMedia, getSignedUrl, deleteMedia } from '@/hooks/useMediaUpload';
import EntryMetadataForm from './EntryMetadataForm';
import { Progress } from '@/components/ui/progress';

interface UploadedFile {
  localUrl: string;
  storagePath: string;
  base64: string;
  fileName: string;
}

interface ScanUploadProps {
  onBack: () => void;
  onSaveEntry: (data: { text: string; galleryCount: number; hasAudio: boolean; mediaPaths: string[]; metadata: { title: string; dateStart: string; dateEnd: string; location: string; description: string } }) => void;
}

const ScanUpload: React.FC<ScanUploadProps> = ({ onBack, onSaveEntry }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [digitizedText, setDigitizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ title: '', dateStart: new Date().toISOString().split('T')[0], dateEnd: '', location: '', description: '' });
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
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
        uploaded.push({ localUrl: signedUrl, storagePath, base64, fileName: file.name });
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

  const moveDocument = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= documents.length) return;
    setDocuments(prev => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  };

  const digitizeAll = async () => {
    if (!documents.length) return;
    setIsLoading(true);
    setError(null);
    setScanProgress({ current: 0, total: documents.length });
    try {
      const results: string[] = [];
      for (let i = 0; i < documents.length; i++) {
        setScanProgress({ current: i + 1, total: documents.length });
        const { data, error: fnError } = await supabase.functions.invoke('digitize-text', {
          body: { imageBase64: documents[i].base64 },
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
      setScanProgress({ current: 0, total: 0 });
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

  const progressPercent = scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0;

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

      {isLoading && scanProgress.total > 0 && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-2">
          <p className="text-sm font-bold text-primary">
            Processing page {scanProgress.current} of {scanProgress.total}...
          </p>
          <Progress value={progressPercent} className="h-2" />
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
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 group">
                  <img src={doc.localUrl} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt={`Page ${i + 1}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">Page {i + 1}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{doc.fileName}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveDocument(i, -1)}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp size={14} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => moveDocument(i, 1)}
                      disabled={i === documents.length - 1}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                  <button onClick={() => removeDocument(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 size={14} className="text-destructive" />
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
