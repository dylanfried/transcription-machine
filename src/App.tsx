import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { TimelineView } from './components/TimelineView';
import { LayerManager } from './components/LayerManager';
import type { AudioState, Annotation, Layer } from './types';
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
  
  // Layer management state
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'default',
      name: 'Default',
      color: '#3B82F6',
      isVisible: true,
      isActive: true,
      annotationCount: 0,
    }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('default');
  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(['default']);

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
      layerId: activeLayerId,
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

  // Layer management handlers
  const handleCreateLayer = (name: string, color: string) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name,
      color,
      isVisible: true,
      isActive: false,
      annotationCount: 0,
    };
    setLayers(prev => [...prev, newLayer]);
  };

  const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  };

  const handleDeleteLayer = (id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
    setVisibleLayerIds(prev => prev.filter(layerId => layerId !== id));
    
    // If the deleted layer was active, switch to default
    if (activeLayerId === id) {
      setActiveLayerId('default');
    }
  };

  const handleSetActiveLayer = (id: string) => {
    setActiveLayerId(id);
    setLayers(prev => 
      prev.map(layer => ({
        ...layer,
        isActive: layer.id === id
      }))
    );
  };

  const handleToggleLayerVisibility = (id: string) => {
    setVisibleLayerIds(prev => 
      prev.includes(id) 
        ? prev.filter(layerId => layerId !== id)
        : [...prev, id]
    );
  };

  const handleToggleAllLayers = () => {
    if (visibleLayerIds.length === layers.length) {
      setVisibleLayerIds([]);
    } else {
      setVisibleLayerIds(layers.map(layer => layer.id));
    }
  };

  // Update layer annotation counts
  useEffect(() => {
    const annotationCounts = layers.map(layer => ({
      ...layer,
      annotationCount: annotations.filter(ann => ann.layerId === layer.id).length
    }));
    setLayers(annotationCounts);
  }, [annotations]);

  // Migrate existing annotations to have layerId
  useEffect(() => {
    setAnnotations(prev => 
      prev.map(annotation => 
        annotation.layerId ? annotation : { ...annotation, layerId: 'default' }
      )
    );
  }, []);

  return (
    <>
      <LayerManager
        layers={layers}
        activeLayerId={activeLayerId}
        visibleLayerIds={visibleLayerIds}
        onCreateLayer={handleCreateLayer}
        onUpdateLayer={handleUpdateLayer}
        onDeleteLayer={handleDeleteLayer}
        onSetActiveLayer={handleSetActiveLayer}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        onToggleAllLayers={handleToggleAllLayers}
      />
      
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
                layers={layers}
                visibleLayerIds={visibleLayerIds}
                onAddAnnotation={handleAddAnnotation}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
