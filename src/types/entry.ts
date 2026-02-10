export interface Entry {
  id: number;
  text: string;
  folder: string;
  location: string;
  timestamp: string;
  timestampEnd?: string;
  attachments: {
    photos: number;
    audio: boolean;
  };
}

export interface BioConfig {
  wordCount: number;
  focusTopic: string;
}
