import React, { useRef, useState } from 'react';
import { Mic, Square, Upload, Headphones, Loader2, Trash2, X, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadMedia, getSignedUrl, deleteMedia } from '@/hooks/useMediaUpload';
import EntryMetadataForm from './EntryMetadataForm';

interface UploadedFile {
  localUrl: string;
  storagePath: string;
}

interface VoiceUploadProps {
  onBack: () => void;
  onSaveEntry: (data: { text: string; galleryCount: number; hasAudio: boolean; mediaPaths: string[]; metadata: { title: string; dateStart: string; dateEnd: string; location: string; description: string } }) => void;
}

const VoiceUpload: React.FC<VoiceUploadProps> = ({ onBack, onSaveEntry }) => {
  const { user } = useAuth();
  const [audioFile, setAudioFile] = useState<UploadedFile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ dateStart: new Date().toISOString().split('T')[0], dateEnd: '', location: '', description: '' });

  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 25 * 1024 * 1024) { setError('Audio file is too large (max 25MB)'); return; }
    setIsUploading(true);
    setError(null);
    try {
      const storagePath = await uploadMedia(file, user.id, 'audio');
      const signedUrl = await getSignedUrl(storagePath);
      setAudioFile({ localUrl: signedUrl, storagePath });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        if (!user) return;
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsUploading(true);
        try {
          const storagePath = await uploadMedia(blob, user.id, 'audio');
          const signedUrl = await getSignedUrl(storagePath);
          setAudioFile({ localUrl: signedUrl, storagePath });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to save recording');
        } finally {
          setIsUploading(false);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch {
      setError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAudio = async () => {
    if (audioFile) { try { await deleteMedia(audioFile.storagePath); } catch {} }
    setAudioFile(null);
  };

  const handleArchive = () => {
    onSaveEntry({
      text: metadata.description,
      galleryCount: 0,
      hasAudio: true,
      mediaPaths: audioFile ? [audioFile.storagePath] : [],
      metadata,
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <h2 className="text-2xl font-display font-bold">Voice Note</h2>
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

      <div className="space-y-6">
        <div className="bg-card rounded-[2rem] border border-border p-8 shadow-soft">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-6">
            <Mic size={16} className="text-primary" /> Audio Recording
          </h3>

          {!audioFile ? (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all border-4 ${
                  isRecording
                    ? 'bg-destructive/10 border-destructive/30 text-destructive animate-pulse'
                    : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                }`}
              >
                {isRecording ? <Square size={36} fill="currentColor" /> : <Mic size={36} />}
              </button>
              <p className="text-sm font-bold text-foreground">
                {isRecording ? 'Recording... tap to stop' : 'Tap to record'}
              </p>
              {!isRecording && (
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Upload size={14} /> Or upload an existing file
                </button>
              )}
              <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" className="hidden" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <audio src={audioFile.localUrl} controls className="h-10 flex-1" />
                <button onClick={removeAudio} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-[10px] text-center font-bold text-muted-foreground flex items-center justify-center gap-1 uppercase tracking-widest">
                <Headphones size={10} /> Audio attached
              </p>
            </div>
          )}
        </div>

        <EntryMetadataForm onMetadataChange={setMetadata} />

        {audioFile && (
          <button onClick={handleArchive} className="btn-primary">
            <Save size={20} /> Finish & Archive
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceUpload;
