import type { WaveformData } from '../types';

export async function analyzeAudioFile(audioFile: File): Promise<WaveformData> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get the first channel (mono) or mix all channels
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // Downsample the audio data for waveform visualization
        // We want roughly 1 sample per pixel, so we'll average chunks
        const targetSamples = Math.min(10000, channelData.length); // Cap at 10k samples for performance
        const samplesPerChunk = Math.floor(channelData.length / targetSamples);
        const samples: number[] = [];
        
        for (let i = 0; i < targetSamples; i++) {
          const startIndex = i * samplesPerChunk;
          const endIndex = Math.min(startIndex + samplesPerChunk, channelData.length);
          const chunk = channelData.slice(startIndex, endIndex);
          
          // Calculate RMS (Root Mean Square) for this chunk
          const rms = Math.sqrt(chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length);
          samples.push(rms);
        }
        
        // Normalize the samples to 0-1 range
        const maxSample = Math.max(...samples);
        const normalizedSamples = samples.map(sample => sample / maxSample);
        
        resolve({
          samples: normalizedSamples,
          sampleRate: sampleRate,
          duration: duration
        });
        
      } catch (error) {
        reject(error);
      } finally {
        audioContext.close();
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read audio file'));
    };

    reader.readAsArrayBuffer(audioFile);
  });
}

export async function analyzeAudioFromUrl(audioUrl: string): Promise<WaveformData> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        // Get the first channel (mono) or mix all channels
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // Downsample the audio data for waveform visualization
        const targetSamples = Math.min(10000, channelData.length);
        const samplesPerChunk = Math.floor(channelData.length / targetSamples);
        const samples: number[] = [];
        
        for (let i = 0; i < targetSamples; i++) {
          const startIndex = i * samplesPerChunk;
          const endIndex = Math.min(startIndex + samplesPerChunk, channelData.length);
          const chunk = channelData.slice(startIndex, endIndex);
          
          // Calculate RMS (Root Mean Square) for this chunk
          const rms = Math.sqrt(chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length);
          samples.push(rms);
        }
        
        // Normalize the samples to 0-1 range
        const maxSample = Math.max(...samples);
        const normalizedSamples = samples.map(sample => sample / maxSample);
        
        resolve({
          samples: normalizedSamples,
          sampleRate: sampleRate,
          duration: duration
        });
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        audioContext.close();
      });
  });
} 