import { useState, useEffect } from 'react'
import './App.css'
import MathMode from './MathMode'
import ReadingMode from './ReadingMode'

type Mode = 'math' | 'reading'

const MODE_KEY = 'app:simple-type:mode'

function App() {
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem(MODE_KEY)
    return (savedMode === 'math' || savedMode === 'reading') ? savedMode : 'math'
  })

  const toggleMode = () => {
    setMode(mode === 'math' ? 'reading' : 'math')
  }

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode)
  }, [mode])

  return (
    <div className="app">
      <div className="mode-toggle-container">
        <span className="toggle-label">Reading</span>
        <button
          className={`mode-toggle ${mode === 'math' ? 'math' : 'reading'}`}
          onClick={toggleMode}
          aria-label="Toggle between Reading and Math modes"
        >
          <span className="toggle-slider"></span>
        </button>
        <span className="toggle-label">Math</span>
      </div>
      {mode === 'math' ? <MathMode /> : <ReadingMode />}
    </div>
  )
}

export default App
