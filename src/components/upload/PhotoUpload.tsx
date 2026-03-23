import React, { useRef, useState } from 'react';
import { Image, Loader2, Trash2, X, Plus, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadMedia, getSignedUrl, deleteMedia } from '@/hooks/useMediaUpload';
import EntryMetadataForm from './EntryMetadataForm';

interface UploadedFile {
  localUrl: string;
  storagePath: string;
}

interface PhotoUploadProps {
  onBack: () => void;
  onSaveEntry: (data: { text: string; galleryCount: number; hasAudio: boolean; mediaPaths: string[]; metadata: { title: string; dateStart: string; dateEnd: string; location: string; description: string } }) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onBack, onSaveEntry }) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ title: '', dateStart: new Date().toISOString().split('T')[0], dateEnd: '', location: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of files) {
        const storagePath = await uploadMedia(file, user.id, 'gallery');
        const signedUrl = await getSignedUrl(storagePath);
        uploaded.push({ localUrl: signedUrl, storagePath });
      }
      setPhotos(prev => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    if (photo) { try { await deleteMedia(photo.storagePath); } catch {} }
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleArchive = () => {
    onSaveEntry({
      text: metadata.description,
      galleryCount: photos.length,
      hasAudio: false,
      mediaPaths: photos.map(p => p.storagePath),
      metadata,
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <h2 className="text-2xl font-display font-bold">Photo Upload</h2>
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
        {/* Photo grid */}
        <div className="bg-card rounded-[2rem] border border-border p-6 shadow-soft">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Image size={16} className="text-primary" /> Photos ({photos.length})
            </h3>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">
              <Plus size={16} />
            </button>
            <input type="file" ref={fileInputRef} multiple onChange={handleUpload} accept="image/*" className="hidden" />
          </div>

          {photos.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-16 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Image className="text-primary" size={28} />
              </div>
              <p className="text-sm font-bold text-foreground">Click to add photos</p>
              <p className="text-xs text-muted-foreground">Select one or more images</p>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo.localUrl} className="w-full h-full object-cover" alt={`Photo ${i + 1}`} />
                  <button onClick={() => removePhoto(i)} className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Trash2 className="text-destructive-foreground" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <EntryMetadataForm onMetadataChange={setMetadata} />

        {photos.length > 0 && (
          <button onClick={handleArchive} className="btn-primary">
            <Save size={20} /> Finish & Archive
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
