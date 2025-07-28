import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { AudioState, Annotation, WaveformData, Layer } from '../types';
import { Waveform } from './Waveform';
import { analyzeAudioFile, analyzeAudioFromUrl } from '../utils/audioAnalysis';

interface TimelineViewProps {
  audioState: AudioState;
  onAudioStateChange: (state: Partial<AudioState>) => void;
  annotations: Annotation[];
  layers: Layer[];
  visibleLayerIds: string[];
  onAddAnnotation: (time: number) => void;
  onUpdateAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

const SECONDS_PER_LINE = 30; // 30 seconds per horizontal line

export const TimelineView: React.FC<TimelineViewProps> = ({
  audioState,
  onAudioStateChange,
  annotations,
  layers,
  visibleLayerIds,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timelineWidth, setTimelineWidth] = useState(800);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);

  // Analyze audio file when URL changes
  useEffect(() => {
    if (audioState.url && audioState.duration > 0) {
      setIsAnalyzingAudio(true);
      
      const analyzeAudio = async () => {
        try {
          // Use URL analysis for remote audio files
          if (!audioState.url) {
            throw new Error('No audio URL provided');
          }
          console.log('Starting audio analysis for:', audioState.url);
          const data = await analyzeAudioFromUrl(audioState.url);
          console.log('Audio analysis completed:', data);
          setWaveformData(data);
        } catch (error) {
          console.error('Failed to analyze audio:', error);
          // Fallback to empty waveform data
          setWaveformData({
            samples: new Array(1000).fill(0.1),
            sampleRate: 44100,
            duration: audioState.duration
          });
        } finally {
          setIsAnalyzingAudio(false);
        }
      };
      
      analyzeAudio();
    }
  }, [audioState.url, audioState.duration]);

  // Select all text when editing starts
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.select();
    }
  }, [editingId]);

  // Measure timeline track width for waveform
  useEffect(() => {
    const updateTimelineWidth = () => {
      // Get the first timeline track element
      const timelineTrack = document.querySelector('.timeline-track') as HTMLElement;
      if (timelineTrack) {
        const width = timelineTrack.offsetWidth;
        setTimelineWidth(width);
      }
    };

    // Update width after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updateTimelineWidth, 100);
    
    // Add resize listener to update width when window is resized
    window.addEventListener('resize', updateTimelineWidth);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateTimelineWidth);
    };
  }, [audioState.duration, waveformData]); // Re-measure when audio duration or waveform data changes

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

    const handleEnded = () => {
      onAudioStateChange({ isPlaying: false, currentTime: 0 });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('waiting', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('playing', handlePlay);
      audio.removeEventListener('waiting', handlePause);
    };
  }, [audioState.url]); // Only recreate listeners when URL changes

  // Manual time update fallback when audio is playing
  useEffect(() => {
    if (!audioState.isPlaying) return;

    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        onAudioStateChange({ currentTime: audio.currentTime });
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [audioState.isPlaying, onAudioStateChange]);

  // Keyboard shortcut for adding annotations and play/pause
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!audioState.url || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        onAddAnnotation(audioState.currentTime);
      }
      if (event.code === 'Space') {
        event.preventDefault();
        const audio = audioRef.current;
        if (audio && audioState.duration > 0) {
          try {
            if (audio.paused) {
              audio.play();
              // Manual state update as fallback
              onAudioStateChange({ isPlaying: true });
            } else {
              audio.pause();
              // Manual state update as fallback
              onAudioStateChange({ isPlaying: false });
            }
          } catch (error) {
            console.error('Error controlling audio with spacebar:', error);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [audioState.url, audioState.currentTime, onAddAnnotation]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLineForTime = (time: number): number => {
    return Math.floor(time / SECONDS_PER_LINE);
  };

  const getPositionInLine = (time: number): number => {
    return (time % SECONDS_PER_LINE) / SECONDS_PER_LINE;
  };

  const getCurrentLine = (): number => {
    return getLineForTime(audioState.currentTime);
  };

  const handleSeek = (lineIndex: number, clickX: number, lineWidth: number) => {
    const audio = audioRef.current;
    if (!audio || !audioState.duration) return;

    const percentage = clickX / lineWidth;
    const newTime = (lineIndex * SECONDS_PER_LINE) + (percentage * SECONDS_PER_LINE);
    
    audio.currentTime = Math.min(newTime, audioState.duration);
    onAudioStateChange({ currentTime: audio.currentTime });
  };

  const handleEdit = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.text);
  };

  const handleSave = () => {
    if (editingId) {
      onUpdateAnnotation(editingId, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAnnotationClick = (annotationId: string) => {
    if (focusedAnnotationId === annotationId) {
      setFocusedAnnotationId(null); // Click again to unfocus
    } else {
      setFocusedAnnotationId(annotationId); // Focus this annotation
    }
  };

  const getZIndex = (annotationId: string, index: number): number => {
    if (focusedAnnotationId === annotationId) {
      return 1000; // Focused annotation always on top
    }
    return index + 1; // Normal z-index based on order
  };

  if (!audioState.url) {
    return <div>No audio file loaded</div>;
  }

  if (isAnalyzingAudio) {
    return (
      <div className="timeline-view">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Analyzing audio file...</div>
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
            This may take a few seconds for large files
          </div>
        </div>
      </div>
    );
  }

  const totalLines = Math.ceil(audioState.duration / SECONDS_PER_LINE);
  const currentLine = getCurrentLine();

  return (
    <div className="timeline-view">
      <audio 
        ref={audioRef} 
        src={audioState.url} 
        preload="metadata"
        onError={(e) => {
          console.error('Audio error:', e);
          console.error('Audio URL:', audioState.url);
          console.error('Audio element:', audioRef.current);
        }}
        onLoadStart={() => console.log('Audio loading started:', audioState.url)}
        onCanPlay={() => console.log('Audio can play:', audioState.url)}
        onLoadedMetadata={() => console.log('Audio metadata loaded:', audioState.url)}
      />
      
      <div className="timeline-container">
        {Array.from({ length: totalLines }, (_, lineIndex) => {
          const lineStartTime = lineIndex * SECONDS_PER_LINE;
          const lineEndTime = Math.min((lineIndex + 1) * SECONDS_PER_LINE, audioState.duration);
          const lineAnnotations = annotations.filter(
            ann => ann.time >= lineStartTime && 
                   ann.time < lineEndTime && 
                   visibleLayerIds.includes(ann.layerId)
          );
          const isCurrentLine = lineIndex === currentLine;

          return (
            <div key={lineIndex} className="timeline-line">
              {/* Line header with time range and controls */}
              <div className="line-header">
                <span className="line-time-range">
                  {formatTime(lineStartTime)} - {formatTime(lineEndTime)}
                </span>
                {isCurrentLine && (
                  <div className="line-controls">
                    <button
                                              onClick={async () => {
                          const audio = audioRef.current;
                          if (audio && audioState.duration > 0) {
                            try {
                              if (audio.paused) {
                                await audio.play();
                                // Manual state update as fallback
                                onAudioStateChange({ isPlaying: true });
                              } else {
                                audio.pause();
                                // Manual state update as fallback
                                onAudioStateChange({ isPlaying: false });
                              }
                            } catch (error) {
                              console.error('Error controlling audio:', error);
                            }
                          }
                        }}
                      aria-label={audioState.isPlaying ? 'Pause' : 'Play'}
                      disabled={!audioState.duration}
                    >
                      {audioState.isPlaying ? (
                        // Pause icon
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4" y="3" width="4" height="14" rx="1" fill="white" />
                          <rect x="12" y="3" width="4" height="14" rx="1" fill="white" />
                        </svg>
                      ) : (
                        // Play icon
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="5,3 17,10 5,17" fill="white" />
                        </svg>
                      )}
                    </button>
                    <button 
                      onClick={() => onAddAnnotation(audioState.currentTime)}
                    >
                      Add (A)
                    </button>
                  </div>
                )}
              </div>

              {/* Timeline track with continuous connecting lines */}
              <div className="timeline-section">
                <div 
                  className="timeline-track"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleSeek(lineIndex, e.clientX - rect.left, rect.width);
                  }}
                >
                  {/* Waveform background */}
                  {waveformData && (
                    <div className="waveform-container" style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: 0, 
                      right: 0, 
                      transform: 'translateY(-50%)', 
                      zIndex: 0,
                      height: '40px'
                    }}>
                      <Waveform
                        data={waveformData}
                        width={timelineWidth}
                        height={40}
                        zoomLevel={zoomLevel}
                        startTime={lineStartTime}
                        endTime={lineEndTime}
                        onSeek={(time) => {
                          const audio = audioRef.current;
                          if (audio) {
                            audio.currentTime = time;
                            onAudioStateChange({ currentTime: time });
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  <div 
                    className="timeline-progress" 
                    style={{ 
                      width: isCurrentLine 
                        ? `${getPositionInLine(audioState.currentTime) * 100}%`
                        : lineIndex < currentLine ? '100%' : '0%'
                    }}
                  />
                  
                  {/* Annotation markers on timeline */}
                  {lineAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="annotation-marker"
                      style={{ 
                        left: `${getPositionInLine(annotation.time) * 100}%`
                      }}
                      title={`${formatTime(annotation.time)}: ${annotation.text}`}
                    />
                  ))}
                </div>

                {/* Continuous connecting lines */}
                {lineAnnotations.map((annotation) => (
                  <div
                    key={`line-${annotation.id}`}
                    className="annotation-connecting-line"
                    style={{
                      left: `${getPositionInLine(annotation.time) * 100}%`
                    }}
                  />
                ))}
              </div>

              {/* Annotations below timeline */}
              {lineAnnotations.length > 0 && (
                <div className="annotations-area">
                  {lineAnnotations
                    .sort((a, b) => a.time - b.time)
                    .map((annotation, index) => (
                      <div
                        key={annotation.id}
                        className="annotation-bubble"
                        style={{
                          left: `${getPositionInLine(annotation.time) * 100}%`,
                          top: '0px',
                          zIndex: getZIndex(annotation.id, index)
                        }}
                        onMouseEnter={(e) => {
                          if (focusedAnnotationId !== annotation.id) {
                            e.currentTarget.style.zIndex = '999';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (focusedAnnotationId !== annotation.id) {
                            e.currentTarget.style.zIndex = getZIndex(annotation.id, index).toString();
                          }
                        }}
                        onClick={(e) => {
                          handleAnnotationClick(annotation.id);
                        }}
                      >
                        <div className="annotation-content">
                          {/* Layer color bar */}
                          {(() => {
                            const layer = layers.find(l => l.id === annotation.layerId);
                            return layer ? (
                              <div 
                                className="annotation-layer-bar"
                                style={{ backgroundColor: layer.color }}
                              />
                            ) : null;
                          })()}
                          <div className="annotation-header">
                            <div className="annotation-time">
                              {formatTime(annotation.time)}
                            </div>
                            <div className="annotation-actions">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(annotation);
                                }}
                                disabled={editingId === annotation.id}
                                className="edit-btn"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteAnnotation(annotation.id);
                                }}
                                className="delete-btn"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {editingId === annotation.id ? (
                            <div className="annotation-edit">
                              <textarea
                                ref={textareaRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSave();
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancel();
                                  }
                                }}
                                rows={2}
                                className="edit-textarea"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button onClick={handleSave} className="save-btn">Save</button>
                                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="annotation-text">
                              {annotation.text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Keyboard shortcuts info */}
      <div className="keyboard-shortcuts">
        <small>Keyboard shortcuts: Press <kbd>A</kbd> to add annotation, <kbd>Space</kbd> to play/pause</small>
      </div>
    </div>
  );
}; 