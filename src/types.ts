export interface Annotation {
  id: string;
  time: number; // timestamp in seconds
  text: string; // annotation content
  layerId: string; // ID of the layer this annotation belongs to
  layer?: string; // for future support of multiple annotation types (keeping for backward compatibility)
}

export interface AudioState {
  url: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface WaveformData {
  samples: number[]; // Array of volume levels (0-1)
  sampleRate: number; // How many samples per second
  duration: number; // Total duration in seconds
}

export interface Layer {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
  isActive: boolean;
  annotationCount: number;
} 