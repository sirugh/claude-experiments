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
      <button className="mode-toggle" onClick={toggleMode}>
        {mode === 'math' ? '📖 Reading' : '🔢 Math'}
      </button>
      {mode === 'math' ? <MathMode /> : <ReadingMode />}
    </div>
  )
}

export default App
