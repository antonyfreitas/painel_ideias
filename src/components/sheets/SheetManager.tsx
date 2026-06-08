import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScratchpadStore } from '../../store/scratchpadStore'

export const SheetManager = () => {
  const { sheets, activeSheetId, createSheet, deleteSheet, setActiveSheet } = useScratchpadStore()
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <div
      className="fixed top-4 left-4"
      style={{ zIndex: 30 }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{
          background: isOpen ? 'var(--surface-hover)' : 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem',
          color: 'var(--ink-muted)',
          backdropFilter: 'blur(8px)',
        }}
        title="Gerenciar folhas"
      >
        <span>📄</span>
        <span>{sheets.length} {sheets.length === 1 ? 'folha' : 'folhas'}</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-12 left-0 w-64 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--surface-hover)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Lista de folhas */}
            <div className="p-2 flex flex-col gap-1 max-h-72 overflow-y-auto">
              {sheets.map(sheet => (
                <div
                  key={sheet.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group"
                  style={{
                    background: sheet.id === activeSheetId
                      ? 'var(--accent-soft)'
                      : 'transparent',
                  }}
                  onClick={() => {
                    setActiveSheet(sheet.id)
                    setIsOpen(false)
                  }}
                >
                  <span className="text-sm">
                    {sheet.id === activeSheetId ? '✦' : '○'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate"
                      style={{
                        fontFamily: 'Lora, serif',
                        color: sheet.id === activeSheetId
                          ? 'var(--accent)'
                          : 'var(--ink)',
                      }}
                    >
                      {sheet.title || 'Nova folha'}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {formatDate(sheet.updatedAt)}
                    </p>
                  </div>

                  {/* Deletar */}
                  {sheets.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        deleteSheet(sheet.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded-lg"
                      style={{
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.08)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      title="Deletar folha"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Nova folha */}
            <div
              className="p-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={() => {
                  createSheet()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.8rem',
                }}
              >
                <span>+</span>
                <span>Nova folha</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}