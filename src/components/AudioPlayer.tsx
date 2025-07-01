import React, { useRef, useEffect, useState } from 'react';
import type { AudioState, Annotation } from '../types';

interface AudioPlayerProps {
  audioState: AudioState;
  onAudioStateChange: (state: Partial<AudioState>) => void;
  annotations: Annotation[];
  onAddAnnotation: (time: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioState,
  onAudioStateChange,
  annotations,
  onAddAnnotation,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      onAudioStateChange({ currentTime: audio.currentTime });
    };

    const handleLoadedMetadata = () => {
      onAudioStateChange({ duration: audio.duration });
    };

    const handlePlay = () => {
      onAudioStateChange({ isPlaying: true });
    };

    const handlePause = () => {
      onAudioStateChange({ isPlaying: false });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onAudioStateChange]);

  // Keyboard shortcut for adding annotations
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if audio is loaded and we're not in an input field
      if (!audioState.url || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        onAddAnnotation(audioState.currentTime);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [audioState.url, audioState.currentTime, onAddAnnotation]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioState.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioState.duration;
    
    audio.currentTime = newTime;
    onAudioStateChange({ currentTime: newTime });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioState.url) {
    return <div>No audio file loaded</div>;
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioState.url} />
      
      {/* Timeline */}
      <div className="timeline" onClick={handleSeek}>
        <div className="timeline-track">
          <div 
            className="timeline-progress" 
            style={{ width: `${(audioState.currentTime / audioState.duration) * 100}%` }}
          />
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="annotation-marker"
              style={{ left: `${(annotation.time / audioState.duration) * 100}%` }}
              title={`${formatTime(annotation.time)}: ${annotation.text}`}
            />
          ))}
        </div>
        <div className="timeline-labels">
          <span>{formatTime(audioState.currentTime)}</span>
          <span>{formatTime(audioState.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          onClick={() => audioRef.current?.play()}
          disabled={audioState.isPlaying}
        >
          Play
        </button>
        <button 
          onClick={() => audioRef.current?.pause()}
          disabled={!audioState.isPlaying}
        >
          Pause
        </button>
        <button 
          onClick={() => onAddAnnotation(audioState.currentTime)}
        >
          Add Annotation (A)
        </button>
      </div>
      
      {/* Keyboard shortcuts info */}
      <div className="keyboard-shortcuts">
        <small>Keyboard shortcuts: Press <kbd>A</kbd> to add annotation</small>
      </div>
    </div>
  );
}; 