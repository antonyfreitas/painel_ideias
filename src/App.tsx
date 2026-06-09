import { GridBackground } from './components/canvas/GridBackground'
import { SheetWindow } from './components/editor/SheetWindow'
import { SandboxWidget } from './components/sandbox/SandboxWidget'
import { Dock } from './components/dock/Dock'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useScratchpadStore } from './store/scratchpadStore'

function App() {
  useKeyboardShortcuts()
  const windows = useScratchpadStore(s => s.windows ?? [])

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <GridBackground />

      {windows.map(win => (
        <SheetWindow key={win.sheetId} sheetId={win.sheetId} />
      ))}

      <SandboxWidget />
      <Dock />
    </main>
  )
}

export default App