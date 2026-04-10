import { useEffect, useState } from 'react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Setup } from '@/pages/Setup'
import { Home } from '@/pages/Home'
import { Analysis } from '@/pages/Analysis'
import { Results } from '@/pages/Results'

export default function App() {
  const [hasConfig, setHasConfig] = useState<boolean | null>(null)

  useEffect(() => {
    window.electron.getConfig().then((cfg) => {
      setHasConfig(cfg !== null)
    })
  }, [])

  if (hasConfig === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Navigate to={hasConfig ? '/home' : '/setup'} replace />} />
        <Route path="/setup" element={<Setup onConfigSaved={() => setHasConfig(true)} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/analysis/:sessionId" element={<Analysis />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </MemoryRouter>
  )
}
