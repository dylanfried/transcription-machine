# Music Annotation Tool — `context.md`

## Project Goal

This is a lightweight, browser-based tool to support ear training and music analysis. The user loads a song, listens to it actively, and adds timestamped annotations to identify elements like chord changes, key centers, or melody fragments. The tool is designed for personal study and collaboration with music instructors (e.g., piano or voice teachers).

## MVP Feature Set (v0.1)

These are the features that we are currently working on. 

- Upload or load an audio file via direct file input or external URL (e.g. MP3).
- Display a simple timeline with basic audio playback controls:
  - Play / Pause
  - Seek to specific time
- Add timestamped annotations manually during playback.
- Attach and edit text notes to each annotation.
- View a list of annotations in order by timestamp.
- All functionality is front-end only — no backend or persistence required.

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

## Architecture

- **Frontend**: React + TypeScript
- **Audio Playback**: Native HTML5 `<audio>` element (simple, reliable, and sufficient for MVP; Tone.js or Web Audio API can be considered for advanced features in the future)
- **Annotation Model**: Internal state (React state) with support for:
  - `time: number` (timestamp in seconds)
  - `text: string` (annotation content)
  - `layer?: string` (for future support of multiple annotation types)
- **Storage**: In-memory only for MVP. Future: localStorage, Supabase, or Firebase.
- **UI**:
  - Simple timeline with time markings, current position indicator, and annotation markers
  - Basic audio controls (play/pause, seek)
  - Button to add annotations at current playback time
  - Annotations list in sidebar, ordered by timestamp
  - (Future) Keyboard-based input for dropping annotations (e.g. press "A" to drop, then edit text)
  - (Future) Annotation layers and advanced timeline features

## Notes

- Tool is optimized for solo use but designed with future collaboration in mind.
- File management and persistence are intentionally deferred from the MVP to reduce complexity.
