import type { WaveformData } from '../types';

export function generateMockWaveformData(duration: number): WaveformData {
  const sampleRate = 44100; // Standard audio sample rate
  const totalSamples = Math.floor(duration * sampleRate);
  const samples: number[] = [];
  
  // Generate realistic-looking waveform data
  for (let i = 0; i < totalSamples; i++) {
    const time = i / sampleRate;
    
    // Create a pattern that looks like music with varying intensity
    const baseVolume = 0.3 + 0.4 * Math.sin(time * 0.5); // Slow oscillation
    const beatPattern = Math.sin(time * 2) * 0.2; // Faster beat pattern
    const randomVariation = (Math.random() - 0.5) * 0.1; // Some randomness
    
    // Add some "choruses" and "verses" with different intensity
    const sectionPattern = Math.sin(time * 0.1) * 0.3; // Very slow section changes
    
    let volume = baseVolume + beatPattern + randomVariation + sectionPattern;
    
    // Ensure volume is between 0 and 1
    volume = Math.max(0, Math.min(1, volume));
    
    samples.push(volume);
  }
  
  return {
    samples,
    sampleRate,
    duration
  };
} 