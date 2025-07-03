import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { TimelineView } from './components/TimelineView';
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
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleAudioLoad = (url: string, file?: File) => {
    setAudioState(prev => ({ ...prev, url, currentTime: 0 }));
    setAudioFile(file || null);
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
        <div className="file-upload-section">
          <FileUpload onAudioLoad={handleAudioLoad} />
        </div>

        {audioState.url && (
          <div className="timeline-section">
            <TimelineView
              audioState={audioState}
              audioFile={audioFile}
              onAudioStateChange={handleAudioStateChange}
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
