# Music Annotation Tool — `context.md`

## Project Goal

This is a lightweight, browser-based tool to support ear training and music analysis. The user loads a song, listens to it actively, and adds timestamped annotations to identify elements like chord changes, key centers, or melody fragments. The tool is designed for personal study and collaboration with music instructors (e.g., piano or voice teachers).

## Implemented Features ✅

### Core Audio & Timeline
- Upload or load an audio file via direct file input or external URL (e.g. MP3)
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

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript (Vite)
- **Audio Playback**: Native HTML5 `<audio>` element with custom timeline UI
- **Audio Analysis**: Web Audio API for real-time waveform generation and analysis
- **Storage**: In-memory only for MVP. Future: localStorage, Supabase, or Firebase

### Data Models
- **Annotation**: `{ id, time, text, layerId }`
- **Layer**: `{ id, name, color, isVisible, isActive, annotationCount }`
- **AudioState**: `{ url, isPlaying, currentTime, duration }`
- **WaveformData**: `{ samples, sampleRate, duration }`

### UI Components
- `FileUpload`: Handles file upload and URL input
- `TimelineView`: Multi-line timeline with inline annotations, controls, and waveform
- `Waveform`: Real-time audio waveform visualization component
- `LayerManager`: Collapsible sidebar for layer management and visibility controls

### Layout
Timeline-focused design with collapsible layer sidebar, file upload at top, scrollable timeline below.

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

### Timeline Enhancement
- Timeline zoom in/out - Adjust granularity to show more or less detail per page width
- Timeline overview/mini-map - Quick navigation to different parts of longer audio files

### Platform Integration
- YouTube or Spotify integration (if licensing/logistics allow)
- Persistent storage (local or cloud-based)

## Notes

- Tool is optimized for solo use but designed with future collaboration in mind
- File management and persistence are intentionally deferred from the MVP to reduce complexity
- MVP is fully functional and ready for use
- All components are modular and designed to support future feature additions
- Current implementation uses a timeline-focused layout with inline annotations rather than a sidebar approach
