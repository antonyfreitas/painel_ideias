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
    <main className="relative w-screen h-screen overflow-hidden">
      <GridBackground />

      {/*
        AnimatePresence removido daqui.
        O SheetWindow gerencia seu próprio AnimatePresence internamente,
        o que permite o exit animation (genie minimize) funcionar corretamente
        mesmo quando o componente some do array de windows.
        
        Mantemos todos os SheetWindows sempre montados (o isMin está dentro do componente)
        para preservar o estado do editor TipTap entre minimize/restore.
      */}
      {windows.map(win => (
        <SheetWindow key={win.sheetId} sheetId={win.sheetId} />
      ))}

      <SandboxWidget />
      <Dock />
    </main>
  )
}

export default App