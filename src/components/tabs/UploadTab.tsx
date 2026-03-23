import React, { useState } from 'react';
import UploadSelectionScreen from '@/components/upload/UploadSelectionScreen';
import ScanUpload from '@/components/upload/ScanUpload';
import PhotoUpload from '@/components/upload/PhotoUpload';
import VoiceUpload from '@/components/upload/VoiceUpload';

type UploadType = 'scan' | 'photo' | 'voice' | null;

interface UploadTabProps {
  onSaveEntry: (data: { text: string; galleryCount: number; hasAudio: boolean; mediaPaths: string[]; metadata: { title: string; dateStart: string; dateEnd: string; location: string; description: string } }) => void;
}

const UploadTab: React.FC<UploadTabProps> = ({ onSaveEntry }) => {
  const [selectedType, setSelectedType] = useState<UploadType>(null);

  const handleBack = () => setSelectedType(null);

  if (selectedType === 'scan') return <ScanUpload onBack={handleBack} onSaveEntry={onSaveEntry} />;
  if (selectedType === 'photo') return <PhotoUpload onBack={handleBack} onSaveEntry={onSaveEntry} />;
  if (selectedType === 'voice') return <VoiceUpload onBack={handleBack} onSaveEntry={onSaveEntry} />;

  return <UploadSelectionScreen onSelect={setSelectedType} />;
};

export default UploadTab;
