import React, { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  image: string | null;
  onFileSelect: (file: File) => void;
  onReset: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ image, onFileSelect, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!image) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "upload-zone",
        image ? "upload-zone-filled" : "upload-zone-empty"
      )}
    >
      {image ? (
        <>
          <img 
            src={image} 
            alt="Upload preview" 
            className="w-full h-full object-contain fade-in" 
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="absolute top-4 right-4 p-2.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <Trash2 size={18} />
          </button>
        </>
      ) : (
        <div className="text-center p-8">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Upload className="text-primary" size={24} />
          </div>
          <p className="text-sm font-medium text-foreground">
            Click or drag to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            PNG, JPG or JPEG supported
          </p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default UploadZone;
