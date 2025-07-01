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
- ✅ Attach and edit text notes to each annotation (inline editing in sidebar).
- ✅ Delete annotations.
- ✅ View a list of annotations in order by timestamp (sidebar).
- ✅ Click on annotation timestamps to seek to that point in the audio.
- ✅ All functionality is front-end only — no backend or persistence required.

## Potential Future Features

We do not need to include these features in any current work, I just want them here to remember and so that we can design effectively for them to be implemented in the future.

- Audio slowdown (time-stretching) without pitch change
- Pitch shifting
- Looping playback over a selected region
- Recording audio annotations (e.g., sing the tonic)
- Visual waveform view
- Multiple annotation layers (e.g., chords, melody, key)
- Show/hide layer toggles
- Shareable project URLs for collaboration with teachers
- Persistent storage (local or cloud-based)
- YouTube or Spotify integration (if licensing/logistics allow)

## Architecture ✅ IMPLEMENTED

- **Frontend**: React + TypeScript (Vite)
- **Audio Playback**: Native HTML5 `<audio>` element with custom timeline UI
- **Annotation Model**: Internal state (React state) with support for:
  - `id: string` (unique identifier)
  - `time: number` (timestamp in seconds)
  - `text: string` (annotation content)
  - `layer?: string` (for future support of multiple annotation types)
- **Storage**: In-memory only for MVP. Future: localStorage, Supabase, or Firebase.
- **UI Components**:
  - `FileUpload`: Handles file upload and URL input
  - `AudioPlayer`: Custom timeline with progress bar, annotation markers, and controls
  - `AnnotationsList`: Sidebar with editable annotation list, ordered by timestamp
- **Layout**: Two-panel design (left: upload + player, right: annotations)
- **Features**:
  - ✅ Simple timeline with time markings, current position indicator, and annotation markers
  - ✅ Basic audio controls (play/pause, seek)
  - ✅ Button to add annotations at current playback time
  - ✅ Annotations list in sidebar, ordered by timestamp
  - ✅ Click annotation timestamps to seek to that point
  - ✅ Inline editing of annotation text
  - ✅ Delete annotations
  - (Future) Keyboard-based input for dropping annotations (e.g. press "A" to drop, then edit text)
  - (Future) Annotation layers and advanced timeline features

## Notes

- Tool is optimized for solo use but designed with future collaboration in mind.
- File management and persistence are intentionally deferred from the MVP to reduce complexity.
- MVP is fully functional and ready for use.
- All components are modular and designed to support future feature additions.
