import { useState } from 'react'
import ReactPlayer from 'react-player'

function App() {
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [annotations, setAnnotations] = useState<Array<{id: string, timestamp: number, text: string}>>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUrl(event.target.value)
  }

  const addAnnotation = (timestamp: number) => {
    const newAnnotation = {
      id: Date.now().toString(),
      timestamp,
      text: 'New annotation'
    }
    setAnnotations([...annotations, newAnnotation])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Transcription Machine</h1>
        
        {/* File Upload */}
        <div className="mb-8">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="mb-4"
          />
          <div className="mb-4">
            <input
              type="text"
              placeholder="Or enter audio URL"
              value={audioUrl}
              onChange={handleUrlInput}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-8">
            <ReactPlayer
              url={audioUrl}
              controls
              width="100%"
              height="50px"
              playing={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Annotations List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Annotations</h2>
          {annotations.length === 0 ? (
            <p className="text-gray-500">No annotations yet. Click the "Add Annotation" button while playing to add one.</p>
          ) : (
            <ul className="space-y-2">
              {annotations.map(annotation => (
                <li key={annotation.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{new Date(annotation.timestamp * 1000).toISOString().substr(11, 8)}</span>
                    <span>{annotation.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App 