# Music Annotation Tool — `context.md`

## Project Goal

This is a lightweight, browser-based tool to support ear training and music analysis. The user loads a song, listens to it actively, and adds timestamped annotations to identify elements like chord changes, key centers, or melody fragments. The tool is designed for personal study and collaboration with music instructors (e.g., piano or voice teachers).

## MVP Feature Set (v0.1)

- Upload or load an audio file via direct file input or external URL (e.g. MP3).
- Display a simple timeline with basic audio playback controls:
  - Play / Pause
  - Seek to specific time
- Add timestamped annotations manually during playback.
- Attach and edit text notes to each annotation.
- View a list of annotations in order by timestamp.
- All functionality is front-end only — no backend or persistence required.

## Potential Future Features

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

## Suggested Architecture

- **Frontend**: React
- **Audio Playback**: Native HTML5 `<audio>` + Web Audio API (or optionally Tone.js for more advanced playback control)
- **Annotation Model**: Internal state (React state or context) with support for:
  - `time: number`
  - `text: string`
  - `layer?: string`
- **Storage**: In-memory only for MVP. Future: localStorage, Supabase, or Firebase.
- **UI**: 
  - Simple timeline UI with play/pause/seek
  - Keyboard-based input for dropping annotations (e.g. press “A” to drop, then edit text)
  - Optional: Annotations list in sidebar

## Notes

- Tool is optimized for solo use but designed with future collaboration in mind.
- File management and persistence are intentionally deferred from the MVP to reduce complexity.
