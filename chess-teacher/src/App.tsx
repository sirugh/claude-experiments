import { useState, useEffect } from 'react'
import MainMenu from './components/MainMenu'
import TutorialMode from './modes/TutorialMode'
import PlayMode from './modes/PlayMode'
import type { GameMode } from './types/chess'
import './App.css'

const STORAGE_KEY = 'chess-teacher:progress'

function App() {
  const [mode, setMode] = useState<GameMode>('menu')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState<number[]>([])

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const progress = JSON.parse(saved)
        setCompletedLevels(progress.completedLevels || [])
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completedLevels })
    )
  }, [completedLevels])

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level)
    setMode('tutorial')
  }

  const handleLevelComplete = () => {
    if (!completedLevels.includes(currentLevel)) {
      setCompletedLevels([...completedLevels, currentLevel])
    }
    setMode('menu')
  }

  const handleBackToMenu = () => {
    setMode('menu')
  }

  const handlePlayComputer = () => {
    setMode('play')
  }

  return (
    <div className="app">
      {mode === 'menu' && (
        <MainMenu
          completedLevels={completedLevels}
          onSelectLevel={handleSelectLevel}
          onPlayComputer={handlePlayComputer}
        />
      )}

      {mode === 'tutorial' && (
        <TutorialMode
          currentLevel={currentLevel}
          onLevelComplete={handleLevelComplete}
          onBack={handleBackToMenu}
        />
      )}

      {mode === 'play' && <PlayMode onBack={handleBackToMenu} />}
    </div>
  )
}

export default App
