import React, { useRef, useState } from 'react';
import { Camera, FileText, Loader2, Trash2, X, Plus, Mic, Square, Upload, Headphones, ImageIcon, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UploadTabProps {
  onSaveEntry: (data: { text: string; galleryCount: number; hasAudio: boolean }) => void;
}

const UploadTab: React.FC<UploadTabProps> = ({ onSaveEntry }) => {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [mainImageBase64, setMainImageBase64] = useState<string | null>(null);
  const [digitizedText, setDigitizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleMainFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(URL.createObjectURL(file));
        setMainImageBase64((reader.result as string).split(',')[1]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    setGalleryImages(prev => [...prev, ...newImages]);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError("Audio file is too large (max 25MB)");
        return;
      }
      setAudioBlob(file);
      setAudioURL(URL.createObjectURL(file));
      setError(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const digitizeText = async () => {
    if (!mainImageBase64) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('digitize-text', {
        body: { imageBase64: mainImageBase64 }
      });

      if (functionError) throw new Error(functionError.message);
      if (data?.error) throw new Error(data.error);
      if (data?.text) {
        setDigitizedText(data.text);
      } else {
        throw new Error('No text was extracted from the image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetUploadState = () => {
    setMainImage(null);
    setMainImageBase64(null);
    setDigitizedText('');
    setGalleryImages([]);
    setAudioURL(null);
    setAudioBlob(null);
    setError(null);
  };

  const handleArchive = () => {
    onSaveEntry({
      text: digitizedText,
      galleryCount: galleryImages.length,
      hasAudio: !!audioURL
    });
  };

  const hasContent = mainImage || digitizedText || galleryImages.length > 0 || audioURL;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-display font-bold">New Memory Entry</h2>
        {hasContent && (
          <button onClick={resetUploadState} className="text-sm font-bold text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-all">
            Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-medium flex items-center gap-2 animate-in fade-in duration-300">
          <X size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Image Upload */}
        <div className="lg:col-span-4 space-y-6">
          <div 
            onClick={() => !mainImage && fileInputRef.current?.click()}
            className={`relative aspect-[3/4] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all bg-card shadow-soft overflow-hidden
              ${mainImage ? 'border-transparent' : 'border-border hover:border-primary/50 cursor-pointer'}`}
          >
            {mainImage ? (
              <div className="group relative w-full h-full">
                <img src={mainImage} className="w-full h-full object-contain p-4" alt="Main" />
                <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={(e) => { e.stopPropagation(); setMainImage(null); setMainImageBase64(null); }} className="bg-card p-3 rounded-full text-destructive shadow-xl">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">Scan Primary Doc</p>
                <p className="text-xs text-muted-foreground mt-2">Will be used for AI transcription</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleMainFileUpload} accept="image/*" className="hidden" />
          </div>

          <button
            disabled={!mainImage || isLoading}
            onClick={digitizeText}
            className="btn-primary"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Run Transcription
          </button>
        </div>

        {/* Right Column - Text and Attachments */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card rounded-[2rem] border border-border p-6 shadow-soft min-h-[250px] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={12} /> Entry Narrative
              </span>
              {(digitizedText || audioURL) && (
                <button onClick={handleArchive} className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Save size={14} /> Finish & Archive
                </button>
              )}
            </div>
            <textarea 
              value={digitizedText}
              onChange={(e) => setDigitizedText(e.target.value)}
              placeholder="Transcription result will appear here, or you can type manually..."
              className="flex-1 w-full text-sm leading-relaxed text-foreground/80 resize-none bg-transparent focus:outline-none placeholder:italic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo Gallery */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  Photo Gallery
                </h3>
                <button onClick={() => galleryInputRef.current?.click()} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">
                  <Plus size={16} />
                </button>
                <input type="file" ref={galleryInputRef} multiple onChange={handleGalleryUpload} accept="image/*" className="hidden" />
              </div>
              <div className="grid grid-cols-3 gap-2 h-24 overflow-y-auto">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                    <button 
                      onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                    >
                      <X className="text-destructive-foreground" size={14} />
                    </button>
                  </div>
                ))}
                {galleryImages.length === 0 && (
                  <div className="col-span-3 flex flex-col items-center justify-center text-muted-foreground/50 h-full border-2 border-dashed border-border rounded-xl">
                    <p className="text-[10px] font-bold">Add supporting photos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Note */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Mic size={16} className="text-primary" />
                  Voice Note
                </h3>
                {!audioURL && !isRecording && (
                  <button 
                    onClick={() => audioInputRef.current?.click()} 
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    title="Upload existing recording"
                  >
                    <Upload size={16} />
                  </button>
                )}
                <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" className="hidden" />
              </div>
              <div className="flex flex-col gap-3">
                {!audioURL ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all border ${
                      isRecording 
                      ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' 
                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    }`}
                  >
                    {isRecording ? <><Square size={14} fill="currentColor" /> Stop Recording</> : <><Mic size={14} /> Start Recording</>}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-xl border border-primary/10">
                      <audio src={audioURL} controls className="h-8 flex-1" />
                      <button onClick={() => { setAudioURL(null); setAudioBlob(null); }} className="p-2 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[9px] text-center font-bold text-muted-foreground flex items-center justify-center gap-1 uppercase tracking-widest">
                      <Headphones size={10} /> Audio attached
                    </p>
                  </div>
                )}
                {!audioURL && !isRecording && (
                  <p className="text-[9px] text-center text-muted-foreground uppercase font-black tracking-tighter mt-1">
                    Record or upload audio memory
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTab;
