import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AudioPlayer } from './components/AudioPlayer';
import { AnnotationsList } from './components/AnnotationsList';
import type { AudioState, Annotation } from './types';
import './App.css';

function App() {
  const [audioState, setAudioState] = useState<AudioState>({
    url: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const handleAudioLoad = (url: string) => {
    setAudioState(prev => ({ ...prev, url, currentTime: 0 }));
  };

  const handleAudioStateChange = (changes: Partial<AudioState>) => {
    setAudioState(prev => ({ ...prev, ...changes }));
  };

  const handleAddAnnotation = (time: number) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      time,
      text: 'New annotation',
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleUpdateAnnotation = (id: string, text: string) => {
    setAnnotations(prev => 
      prev.map(annotation => 
        annotation.id === id ? { ...annotation, text } : annotation
      )
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
  };

  const handleSeekToAnnotation = (time: number) => {
    handleAudioStateChange({ currentTime: time });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Music Annotation Tool</h1>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <FileUpload onAudioLoad={handleAudioLoad} />
          {audioState.url && (
            <AudioPlayer
              audioState={audioState}
              onAudioStateChange={handleAudioStateChange}
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
            />
          )}
        </div>

        <div className="right-panel">
          <AnnotationsList
            annotations={annotations}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onSeekToAnnotation={handleSeekToAnnotation}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
