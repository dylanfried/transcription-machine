# Music Annotation Tool — `context.md`

## Project Goal

This is a lightweight, browser-based tool to support ear training and music analysis. The user loads a song, listens to it actively, and adds timestamped annotations to identify elements like chord changes, key centers, or melody fragments. The tool is designed for personal study and collaboration with music instructors (e.g., piano or voice teachers).

## MVP Feature Set (v0.1) ✅ COMPLETED

These features have been implemented and are working:

- ✅ Upload or load an audio file via direct file input or external URL (e.g. MP3).
- ✅ Display a simple timeline with basic audio playback controls:
  - Play / Pause
  - Seek to specific time (click on timeline)
- ✅ Add timestamped annotations manually during playback (via "Add Annotation" button).
- ✅ Attach and edit text notes to each annotation (inline editing in timeline).
- ✅ Delete annotations.
- ✅ View annotations inline on the timeline as speech bubbles with connecting lines.
- ✅ Click on annotation timestamps to seek to that point in the audio.
- ✅ All functionality is front-end only — no backend or persistence required.

## Potential Future Features

We do not need to include these features in any current work, I just want them here to remember and so that we can design effectively for them to be implemented in the future.

- Audio slowdown (time-stretching) without pitch change
- Pitch shifting
- Looping playback over a selected region
- Recording audio annotations (e.g., sing the tonic)
- ✅ Real-time waveform visualization
- Multiple annotation layers (e.g., chords, melody, key)
- Show/hide layer toggles
- Shareable project URLs for collaboration with teachers
- Persistent storage (local or cloud-based)
- YouTube or Spotify integration (if licensing/logistics allow)
- **Timeline zoom in/out** - Adjust granularity to show more or less detail per page width
- **Timeline overview/mini-map** - Quick navigation to different parts of longer audio files
- Ability to have another person add comments to an annotation. This would allow us to share with a teacher and then have them comment on correctness. This could be coupled with the notion of a "user" that would show with each annotation and/or comment who left.

## Architecture ✅ IMPLEMENTED

- **Frontend**: React + TypeScript (Vite)
- **Audio Playback**: Native HTML5 `<audio>` element with custom timeline UI and real-time waveform analysis
- **Annotation Model**: Internal state (React state) with support for:
  - `id: string` (unique identifier)
  - `time: number` (timestamp in seconds)
  - `text: string` (annotation content)
  - `layer?: string` (for future support of multiple annotation types)
- **Storage**: In-memory only for MVP. Future: localStorage, Supabase, or Firebase.
- **Audio Analysis**: Web Audio API for real-time waveform generation and analysis
- **UI Components**:
  - `FileUpload`: Handles file upload and URL input
  - `TimelineView`: Multi-line timeline with inline annotations, controls, and waveform
  - `Waveform`: Real-time audio waveform visualization component
  - `AudioPlayer`: Audio playback controls (integrated into TimelineView)
- **Layout**: Timeline-focused design with file upload at top, scrollable timeline below
- **Features**:
  - ✅ Real-time waveform visualization using Web Audio API analysis
  - ✅ Simple timeline with time markings, current position indicator, and annotation markers
  - ✅ Basic audio controls (play/pause, seek) with keyboard shortcuts (Space)
  - ✅ Button to add annotations at current playback time
  - ✅ Multi-line timeline (30 seconds per line) with horizontal scrolling
  - ✅ Inline annotation bubbles with connecting lines to timeline
  - ✅ Annotations stacked vertically when overlapping
  - ✅ Inline editing and deletion of annotations
  - ✅ Keyboard shortcut: Press "A" to add annotation at current time
  - ✅ Focus behavior: hover and click bring annotations to front
  - ✅ Continuous connecting lines from timeline to annotation bubbles
  - ✅ Semi-transparent progress bar that shows waveform underneath
  - ✅ Responsive waveform that adjusts to window resizing
  - (Future) Additional keyboard shortcuts for other actions
  - (Future) Annotation layers and advanced timeline features

## Notes

- Tool is optimized for solo use but designed with future collaboration in mind.
- File management and persistence are intentionally deferred from the MVP to reduce complexity.
- MVP is fully functional and ready for use.
- All components are modular and designed to support future feature additions.
- Current implementation uses a timeline-focused layout with inline annotations rather than a sidebar approach.
