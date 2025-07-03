import React, { useState } from 'react';
import type { Layer } from '../types';

interface LayerManagerProps {
  layers: Layer[];
  activeLayerId: string;
  visibleLayerIds: string[];
  onCreateLayer: (name: string, color: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onSetActiveLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleAllLayers: () => void;
}

const PREDEFINED_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
];

export const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  activeLayerId,
  visibleLayerIds,
  onCreateLayer,
  onUpdateLayer,
  onDeleteLayer,
  onSetActiveLayer,
  onToggleLayerVisibility,
  onToggleAllLayers,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState(PREDEFINED_COLORS[0]);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateLayer = () => {
    if (newLayerName.trim()) {
      onCreateLayer(newLayerName.trim(), newLayerColor);
      setNewLayerName('');
      setNewLayerColor(PREDEFINED_COLORS[0]);
      setShowCreateForm(false);
    }
  };

  const handleStartEdit = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleSaveEdit = () => {
    if (editingName.trim() && editingLayerId) {
      onUpdateLayer(editingLayerId, { name: editingName.trim() });
      setEditingLayerId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleDeleteLayer = (layer: Layer) => {
    if (layer.annotationCount === 0) {
      onDeleteLayer(layer.id);
    }
  };

  return (
    <div className={`layer-manager ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle Button */}
      <button 
        className="layer-manager-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse layers' : 'Expand layers'}
      >
        {isExpanded ? '◀' : '▶'}
      </button>

      {isExpanded && (
        <div className="layer-manager-content">
          <div className="layer-manager-header">
            <h3>Layers</h3>
            <button 
              className="toggle-all-btn"
              onClick={onToggleAllLayers}
              title="Toggle all layers"
            >
              {visibleLayerIds.length === layers.length ? 'Hide All' : 'Show All'}
            </button>
          </div>

          {/* Layer List */}
          <div className="layer-list">
            {layers.map((layer) => (
              <div key={layer.id} className={`layer-item ${layer.id === activeLayerId ? 'active' : ''}`}>
                {/* Visibility Toggle */}
                <button
                  className="layer-visibility-toggle"
                  onClick={() => onToggleLayerVisibility(layer.id)}
                  style={{ color: visibleLayerIds.includes(layer.id) ? layer.color : '#ccc' }}
                  title={visibleLayerIds.includes(layer.id) ? 'Hide layer' : 'Show layer'}
                >
                  {visibleLayerIds.includes(layer.id) ? '●' : '○'}
                </button>

                {/* Layer Color Indicator */}
                <div 
                  className="layer-color-indicator"
                  style={{ backgroundColor: layer.color }}
                />

                {/* Layer Name */}
                <div className="layer-name-section">
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={handleSaveEdit}
                      autoFocus
                      className="layer-name-edit"
                    />
                  ) : (
                    <span 
                      className="layer-name"
                      onClick={() => onSetActiveLayer(layer.id)}
                      title={`${layer.name} (${layer.annotationCount} annotations)`}
                    >
                      {layer.name}
                    </span>
                  )}
                  <span className="layer-count">({layer.annotationCount})</span>
                </div>

                {/* Layer Actions */}
                <div className="layer-actions">
                  {editingLayerId !== layer.id && (
                    <>
                      <button
                        className="layer-edit-btn"
                        onClick={() => handleStartEdit(layer)}
                        title="Rename layer"
                      >
                        ✏️
                      </button>
                      <button
                        className="layer-delete-btn"
                        onClick={() => handleDeleteLayer(layer)}
                        disabled={layer.annotationCount > 0}
                        title={layer.annotationCount > 0 ? 'Cannot delete layer with annotations' : 'Delete layer'}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create New Layer */}
          <div className="create-layer-section">
            {showCreateForm ? (
              <div className="create-layer-form">
                <input
                  type="text"
                  placeholder="Layer name"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateLayer();
                    if (e.key === 'Escape') setShowCreateForm(false);
                  }}
                  className="new-layer-name"
                />
                <div className="color-picker">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${newLayerColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLayerColor(color)}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
                <div className="create-layer-actions">
                  <button onClick={handleCreateLayer} disabled={!newLayerName.trim()}>
                    Create
                  </button>
                  <button onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="create-layer-btn"
                onClick={() => setShowCreateForm(true)}
              >
                + New Layer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 