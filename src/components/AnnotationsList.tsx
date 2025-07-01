import React, { useState } from 'react';
import type { Annotation } from '../types';

interface AnnotationsListProps {
  annotations: Annotation[];
  onUpdateAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onSeekToAnnotation: (time: number) => void;
}

export const AnnotationsList: React.FC<AnnotationsListProps> = ({
  annotations,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onSeekToAnnotation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const sortedAnnotations = [...annotations].sort((a, b) => a.time - b.time);

  return (
    <div className="annotations-list">
      <h3>Annotations ({annotations.length})</h3>
      {sortedAnnotations.length === 0 ? (
        <p>No annotations yet. Add some while playing!</p>
      ) : (
        <ul>
          {sortedAnnotations.map((annotation) => (
            <li key={annotation.id} className="annotation-item">
              <div className="annotation-header">
                <span 
                  className="annotation-time"
                  onClick={() => onSeekToAnnotation(annotation.time)}
                  title="Click to seek to this time"
                >
                  {formatTime(annotation.time)}
                </span>
                <div className="annotation-actions">
                  <button 
                    onClick={() => handleEdit(annotation)}
                    disabled={editingId === annotation.id}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteAnnotation(annotation.id)}
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
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="annotation-text">{annotation.text}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 