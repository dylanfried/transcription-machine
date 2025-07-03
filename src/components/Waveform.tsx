import React from 'react';
import type { WaveformData } from '../types';

interface WaveformProps {
  data: WaveformData;
  width: number;
  height: number;
  zoomLevel: number;
  startTime: number;
  endTime: number;
  onSeek?: (time: number) => void;
}

export const Waveform: React.FC<WaveformProps> = ({
  data,
  width,
  height,
  zoomLevel,
  startTime,
  endTime,
  onSeek
}) => {
  const visibleDuration = endTime - startTime;
  
  // Calculate which samples to show for this time range
  const totalSamples = data.samples.length;
  const startSampleIndex = Math.floor((startTime / data.duration) * totalSamples);
  const endSampleIndex = Math.floor((endTime / data.duration) * totalSamples);
  const visibleSamples = data.samples.slice(startSampleIndex, endSampleIndex);
  
  // Group samples into blocks for rendering
  const blocks: number[] = [];
  const samplesPerBlock = Math.max(1, Math.floor(visibleSamples.length / width));
  
  for (let i = 0; i < width; i++) {
    const blockStart = i * samplesPerBlock;
    const blockEnd = Math.min(blockStart + samplesPerBlock, visibleSamples.length);
    const blockSamples = visibleSamples.slice(blockStart, blockEnd);
    
    if (blockSamples.length > 0) {
      const avgVolume = blockSamples.reduce((sum, sample) => sum + sample, 0) / blockSamples.length;
      blocks.push(avgVolume);
    } else {
      blocks.push(0);
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!onSeek) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / width;
    const seekTime = startTime + (percentage * visibleDuration);
    onSeek(seekTime);
  };

  return (
    <div 
      className="waveform"
      style={{ 
        width, 
        height, 
        position: 'relative',
        cursor: onSeek ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center'
      }}
      onClick={handleClick}
    >
      {blocks.map((volume, index) => (
        <div
          key={index}
          className="waveform-block"
          style={{
            position: 'absolute',
            left: `${index}px`,
            top: `${(height - Math.max(1, volume * height)) / 2}px`,
            width: '1px',
            height: `${Math.max(1, volume * height)}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '1px'
          }}
        />
      ))}
    </div>
  );
}; 