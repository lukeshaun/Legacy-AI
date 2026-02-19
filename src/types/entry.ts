export interface Entry {
  id: string;
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
