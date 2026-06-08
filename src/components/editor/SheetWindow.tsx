import { Rnd } from 'react-rnd'
import { motion } from 'framer-motion'
import { TipTapEditor } from './TipTapEditor'
import { useScratchpadStore } from '../../store/scratchpadStore'
import { Download } from 'lucide-react'
import { exportSheetToMarkdown } from '../../services/pkmExport'

export const SheetWindow = () => {
  const { sheets, activeSheetId } = useScratchpadStore()
  const activeSheet = sheets.find(s => s.id === activeSheetId)

  if (!activeSheet) return null

  const initialW = Math.min(760, window.innerWidth - 48)
  const initialH = Math.min(560, window.innerHeight - 80)
  const initialX = Math.max(24, (window.innerWidth - initialW) / 2)
  const initialY = Math.max(24, (window.innerHeight - initialH) / 2)

  return (
    <Rnd
      default={{
        x: initialX,
        y: initialY,
        width: initialW,
        height: initialH,
      }}
      minWidth={320}
      minHeight={240}
      bounds="window"
      dragHandleClassName="drag-handle"
      style={{ zIndex: 10 }}
    >
      <motion.div
        key={activeSheet.id}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full h-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Titlebar */}
        <div
          className="drag-handle flex items-center gap-2 px-4 py-3 select-none cursor-grab active:cursor-grabbing"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-hover)',
          }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
          </div>

          {/* Título centralizado */}
          <span
            className="flex-1 text-center text-sm truncate"
            style={{
              fontFamily: 'Lora, serif',
              color: 'var(--ink-muted)',
              letterSpacing: '0.01em',
            }}
          >
            {activeSheet.title || 'Nova folha'}
          </span>

          {/* Botão de Exportar - Inserido com segurança na Titlebar */}
          <button
            onClick={() => exportSheetToMarkdown(activeSheet)}
            onPointerDown={(e) => e.stopPropagation()} // Evita conflito com o drag-and-drop
            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-black/5 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Exportar para Markdown (.md)"
          >
            <Download size={14} />
          </button>

          {/* Atalho hint */}
          <span
            className="text-xs px-2 py-0.5 rounded-md ml-1"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--ink-muted)',
              background: 'var(--accent-soft)',
              fontSize: '0.7rem',
            }}
          >
            ⌃↵ sandbox
          </span>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <TipTapEditor
            key={activeSheet.id}
            sheetId={activeSheet.id}
            content={activeSheet.content}
          />
        </div>
      </motion.div>
    </Rnd>
  )
}