import React, { useState, useEffect } from 'react';
import { ProjectManager } from './components/ProjectManager';
import { TimelineView } from './components/TimelineView';
import { LayerManager } from './components/LayerManager';
import type { AudioState, Annotation, Layer, ProjectData } from './types';
import './App.css';

function App() {
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    url: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
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

  const handleLoadProject = (projectData: ProjectData) => {
    console.log('Loading project:', projectData);
    console.log('Audio URL:', projectData.audioUrl);
    console.log('Audio State:', projectData.audioState);
    
    setCurrentProject(projectData);
    setAudioState(projectData.audioState);
    setAnnotations(projectData.annotations);
    setLayers(projectData.layers);
    setActiveLayerId(projectData.layers.find(l => l.isActive)?.id || 'default');
    setVisibleLayerIds(projectData.layers.filter(l => l.isVisible).map(l => l.id));
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

  const handleExportProject = () => {
    if (!currentProject) return;

    const exportData: ProjectData = {
      ...currentProject,
      lastModified: new Date().toISOString(),
      annotations,
      layers,
      audioState,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setAudioState({
      url: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
    setAnnotations([]);
    setLayers([
      {
        id: 'default',
        name: 'Default',
        color: '#3B82F6',
        isVisible: true,
        isActive: true,
        annotationCount: 0,
      }
    ]);
    setActiveLayerId('default');
    setVisibleLayerIds(['default']);
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

  // Show project manager if no project is loaded
  if (!currentProject) {
    return <ProjectManager onLoadProject={handleLoadProject} />;
  }

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
          <div className="app-header-content">
            <h1>{currentProject.name}</h1>
            <div className="app-header-actions">
              <button onClick={handleExportProject} className="btn-secondary">
                Export Project
              </button>
              <button onClick={handleNewProject} className="btn-secondary">
                New Project
              </button>
            </div>
          </div>
        </header>

        <main className="app-main">
          {audioState.url && (
            <div className="timeline-section">
              <TimelineView
                audioState={audioState}
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
