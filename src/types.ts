export interface Annotation {
  id: string;
  time: number; // timestamp in seconds
  text: string; // annotation content
  layer?: string; // for future support of multiple annotation types
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