import { AnimatePresence } from 'framer-motion'
import { GridBackground } from './components/canvas/GridBackground'
import { SheetWindow } from './components/editor/SheetWindow'
import { SandboxWidget } from './components/sandbox/SandboxWidget'
import { Dock } from './components/dock/Dock'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useScratchpadStore } from './store/scratchpadStore'

function App() {
  useKeyboardShortcuts()
  const { windows } = useScratchpadStore()

  return (
    <main className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#f7f6f2' }}
    >
      <GridBackground />

      {/* Janelas das folhas */}
      <AnimatePresence>
        {windows.map(win => (
          <SheetWindow key={win.sheetId} sheetId={win.sheetId} />
        ))}
      </AnimatePresence>

      {/* Sandbox flutuante */}
      <SandboxWidget />

      {/* Dock macOS */}
      <Dock />
    </main>
  )
}

export default App