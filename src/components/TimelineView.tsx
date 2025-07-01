import React, { useRef, useEffect, useState } from 'react';
import type { AudioState, Annotation } from '../types';

interface TimelineViewProps {
  audioState: AudioState;
  onAudioStateChange: (state: Partial<AudioState>) => void;
  annotations: Annotation[];
  onAddAnnotation: (time: number) => void;
  onUpdateAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

const SECONDS_PER_LINE = 30; // 30 seconds per horizontal line

export const TimelineView: React.FC<TimelineViewProps> = ({
  audioState,
  onAudioStateChange,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);

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

  const totalLines = Math.ceil(audioState.duration / SECONDS_PER_LINE);
  const currentLine = getCurrentLine();

  return (
    <div className="timeline-view">
      <audio ref={audioRef} src={audioState.url} />
      
      <div className="timeline-container">
        {Array.from({ length: totalLines }, (_, lineIndex) => {
          const lineStartTime = lineIndex * SECONDS_PER_LINE;
          const lineEndTime = Math.min((lineIndex + 1) * SECONDS_PER_LINE, audioState.duration);
          const lineAnnotations = annotations.filter(
            ann => ann.time >= lineStartTime && ann.time < lineEndTime
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
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="edit-textarea"
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
        <small>Keyboard shortcuts: Press <kbd>A</kbd> to add annotation</small>
      </div>
    </div>
  );
}; 