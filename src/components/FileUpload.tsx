import React, { useState } from 'react';

interface FileUploadProps {
  onAudioLoad: (url: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onAudioLoad }) => {
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAudioLoad(url);
    }
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (urlInput.trim()) {
      onAudioLoad(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="file-upload">
      <h3>Load Audio</h3>
      
      {/* File Upload */}
      <div className="upload-section">
        <label htmlFor="audio-file">Upload Audio File:</label>
        <input
          id="audio-file"
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
        />
      </div>

      {/* URL Input */}
      <div className="url-section">
        <form onSubmit={handleUrlSubmit}>
          <label htmlFor="audio-url">Or Enter Audio URL:</label>
          <div className="url-input-group">
            <input
              id="audio-url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/audio.mp3"
            />
            <button type="submit" disabled={!urlInput.trim()}>
              Load
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 