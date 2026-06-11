import { useRef } from 'react'
import { GridBackground } from './components/canvas/GridBackground'
import { SheetWindow } from './components/editor/SheetWindow'
import { SandboxWidget } from './components/sandbox/SandboxWidget'
import { Dock } from './components/dock/Dock'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDropZone } from './hooks/useDropZone'
import { useScratchpadStore } from './store/scratchpadStore'

function App() {
  useKeyboardShortcuts()
  const mainRef = useRef<HTMLElement>(null)
  const windows = useScratchpadStore(s => s.windows ?? [])
  const { isDragOver } = useDropZone(mainRef as React.RefObject<HTMLElement>)

  return (
    <main ref={mainRef} className="relative w-screen h-screen overflow-hidden">
      <GridBackground />

      {windows.map(win => (
        <SheetWindow key={win.sheetId} sheetId={win.sheetId} />
      ))}

      <SandboxWidget />
      <Dock />

      {/* Overlay de drag & drop */}
      {isDragOver && (
        <div
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
          style={{
            zIndex: 9999,
            background: 'rgba(79,110,247,0.08)',
            backdropFilter: 'blur(2px)',
            border: '2px dashed rgba(79,110,247,0.4)',
          }}
        >
          <div
            className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px rgba(79,110,247,0.15)',
              border: '1px solid rgba(79,110,247,0.2)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>📄</span>
            <p style={{
              fontFamily: 'Lora, serif',
              color: 'rgba(79,110,247,0.85)',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}>
              Solte o arquivo .md aqui
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

export default App