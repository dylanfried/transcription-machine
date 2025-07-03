# Music Annotation Tool — `context.md`

## Project Goal

This is a lightweight, browser-based tool to support ear training and music analysis. The user loads a song, listens to it actively, and adds timestamped annotations to identify elements like chord changes, key centers, or melody fragments. The tool is designed for personal study and collaboration with music instructors (e.g., piano or voice teachers).

## Implemented Features ✅

### Project Management & Audio Loading
- Project-based workflow with named projects and metadata
- Support for remote MP3 URLs (Dropbox, AWS S3, direct links)
- Project export/import functionality for sharing and backup
- Project metadata includes name, audio URL, creation date, and annotation count
- Automatic project validation and error handling for audio loading issues
- CORS-aware audio URL validation with helpful error messages

### Core Audio & Timeline
- Real-time waveform visualization using Web Audio API analysis
- Multi-line timeline (30 seconds per line) with horizontal scrolling
- Audio playback controls (play/pause, seek) with keyboard shortcuts (Space)
- Semi-transparent progress bar that shows waveform underneath
- Responsive waveform that adjusts to window resizing

### Annotation System
- Add timestamped annotations manually during playback (via "Add Annotation" button or "A" key)
- Attach and edit text notes to each annotation (inline editing in timeline)
- Delete annotations
- View annotations inline on the timeline as speech bubbles with connecting lines
- Click on annotation timestamps to seek to that point in the audio
- Annotations stacked vertically when overlapping with focus behavior (hover/click brings to front)

### Annotation Layers
- Multiple layers with predefined color palette (10 colors)
- Layer creation, renaming, and deletion (protected against non-empty layers)
- Individual and bulk layer visibility toggles
- Active layer selection for new annotations
- Colored bars on annotation bubbles to indicate layer membership
- Collapsible sidebar layout with smooth animations
- Automatic annotation count tracking per layer
- Migration of existing annotations to "Default" layer

### Technical Features
- All functionality is front-end only — no backend or persistence required
- Keyboard shortcuts: Space (play/pause), A (add annotation)
- Responsive design that adapts to window resizing
- Export/import system for project sharing and collaboration

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript (Vite)
- **Audio Playback**: Native HTML5 `<audio>` element with custom timeline UI
- **Audio Analysis**: Web Audio API for real-time waveform generation and analysis
- **Storage**: In-memory with export/import for persistence. Future: localStorage, Supabase, or Firebase

### Data Models
- **Project**: `{ id, name, audioUrl, createdAt, annotations, layers }`
- **Annotation**: `{ id, time, text, layerId }`
- **Layer**: `{ id, name, color, isVisible, isActive, annotationCount }`
- **AudioState**: `{ url, isPlaying, currentTime, duration }`
- **WaveformData**: `{ samples, sampleRate, duration }`

### UI Components
- `ProjectManager`: Handles project creation, audio URL input, and export/import
- `TimelineView`: Multi-line timeline with inline annotations, controls, and waveform
- `Waveform`: Real-time audio waveform visualization component
- `LayerManager`: Collapsible sidebar for layer management and visibility controls

### Layout
Timeline-focused design with collapsible layer sidebar, project management at top, scrollable timeline below.

## Future Features

### Audio Enhancement
- Audio slowdown (time-stretching) without pitch change
- Pitch shifting
- Looping playback over a selected region
- Recording audio annotations (e.g., sing the tonic)

### Collaboration & Sharing
- Shareable project URLs for collaboration with teachers
- Ability to have another person add comments to an annotation
- User system showing who left each annotation/comment
- Cloud storage integration for automatic project syncing

### Timeline Enhancement
- Timeline zoom in/out - Adjust granularity to show more or less detail per page width
- Timeline overview/mini-map - Quick navigation to different parts of longer audio files

### Platform Integration
- YouTube or Spotify integration (if licensing/logistics allow)
- Enhanced persistent storage with cloud sync

## Notes

- Tool is optimized for solo use but designed with future collaboration in mind
- Project-based workflow enables easy sharing and backup of annotation work
- Remote audio URLs provide flexibility for different hosting services
- Export/import system allows for offline work and collaboration
- All components are modular and designed to support future feature additions
- Current implementation uses a timeline-focused layout with inline annotations rather than a sidebar approach
