import { GridBackground } from './components/canvas/GridBackground'
import { SheetWindow } from './components/editor/SheetWindow'
import { SandboxWidget } from './components/sandbox/SandboxWidget'
import { SheetManager } from './components/sheets/SheetManager'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  // Inicializa a escuta global dos atalhos de teclado (Ctrl+Enter, Esc)
  useKeyboardShortcuts()

  return (
    <main className="relative w-screen h-screen overflow-hidden text-slate-800">
      {/* Camada 1: O Background Quadriculado (Z-index 0) */}
      <GridBackground />

      {/* Camada 2: A Interface Principal */}
      <SheetManager />
      <SheetWindow />

      {/* Camada 3: Widgets Flutuantes (Sandbox) */}
      <SandboxWidget />
    </main>
  )
}

export default App