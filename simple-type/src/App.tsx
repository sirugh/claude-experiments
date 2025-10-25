import { useState } from 'react'
import './App.css'
import MathMode from './MathMode'
import ReadingMode from './ReadingMode'

type Mode = 'math' | 'reading'

function App() {
  const [mode, setMode] = useState<Mode>('math')

  const toggleMode = () => {
    setMode(mode === 'math' ? 'reading' : 'math')
  }

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
