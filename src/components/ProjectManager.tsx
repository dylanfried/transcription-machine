import React, { useState, useRef } from 'react';
import type { ProjectData } from '../types';

interface ProjectManagerProps {
  onLoadProject: (projectData: ProjectData) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onLoadProject }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !audioUrl.trim()) {
      alert('Please provide both a project name and audio URL');
      return;
    }

    setIsLoading(true);

    try {
      // Test if the audio URL is accessible
      const testAudio = new Audio();
      testAudio.preload = 'metadata';
      
      const canLoadAudio = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('Audio test timeout after 10 seconds');
          resolve(false);
        }, 10000); // 10 second timeout
        
        testAudio.onloadedmetadata = () => {
          clearTimeout(timeout);
          console.log('Audio loaded successfully:', testAudio.src);
          resolve(true);
        };
        
        testAudio.onerror = (e) => {
          clearTimeout(timeout);
          console.error('Audio test error:', e);
          console.error('Audio test error details:', testAudio.error);
          console.error('Attempted URL:', testAudio.src);
          resolve(false);
        };
        
        console.log('Testing audio URL:', audioUrl.trim());
        testAudio.src = audioUrl.trim();
      });

      if (!canLoadAudio) {
        console.error('Audio validation failed for URL:', audioUrl.trim());
        alert('Unable to load audio from the provided URL. Please check that:\n\n1. The URL is correct\n2. The file is publicly accessible\n3. The file is a valid audio format (MP3, etc.)\n4. The server allows cross-origin requests\n\nFor Google Drive files, try using a different hosting service like Dropbox or AWS S3.');
        setIsLoading(false);
        return;
      }

      const newProject: ProjectData = {
        name: projectName.trim(),
        audioUrl: audioUrl.trim(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        layers: [
          {
            id: 'default',
            name: 'Default',
            color: '#3B82F6',
            isVisible: true,
            isActive: true,
            annotationCount: 0,
          }
        ],
        annotations: [],
        audioState: {
          url: audioUrl.trim(),
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        }
      };

      onLoadProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string) as ProjectData;
        
        // Validate the project data structure
        if (!projectData.name || !projectData.audioUrl || !projectData.layers || !projectData.annotations) {
          throw new Error('Invalid project file format');
        }

        onLoadProject(projectData);
      } catch (error) {
        alert('Error loading project file. Please make sure it\'s a valid project export.');
        console.error('Error parsing project file:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  };

  const handleExportProject = () => {
    // This will be implemented when we have a current project
    alert('Export functionality will be available when you have a project loaded.');
  };

  return (
    <div className="project-manager">
      <div className="project-manager-header">
        <h1>Music Annotation Tool</h1>
        <p>Create a new project or load an existing one</p>
      </div>

      <div className="project-options">
        <div className="project-option">
          <h3>Create New Project</h3>
          <p>Start a new annotation project with a remote audio file</p>
          
          {isCreating ? (
            <div className="create-project-form">
              <div className="form-group">
                <label htmlFor="project-name">Project Name *</label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="audio-url">Audio URL *</label>
                <input
                  id="audio-url"
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  required
                />
                <small>Provide a direct link to an MP3 file (Google Drive, Dropbox, etc.)</small>
              </div>
              
              <div className="form-actions">
                <button 
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || !audioUrl.trim() || isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </button>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="btn-primary"
            >
              Create New Project
            </button>
          )}
        </div>

        <div className="project-option">
          <h3>Load Existing Project</h3>
          <p>Import a previously exported project file</p>
          
          <div className="load-project-actions">
            <button 
              onClick={handleImportProject}
              className="btn-secondary"
            >
              Import Project File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="project-help">
        <h4>Getting Started</h4>
        <ul>
          <li>Upload your MP3 to a cloud service (Google Drive, Dropbox, etc.)</li>
          <li>Get a direct link to the MP3 file</li>
          <li>Create a new project with the link</li>
          <li>Export your project to share with others</li>
        </ul>
      </div>
    </div>
  );
}; 