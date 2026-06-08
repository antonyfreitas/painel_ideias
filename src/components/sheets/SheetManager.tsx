import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScratchpadStore } from '../../store/scratchpadStore'
import { Files, Plus, X, ChevronDown, FileText } from 'lucide-react'

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
    <div className="fixed top-4 left-4" style={{ zIndex: 30 }}>
      {/* Botão Principal (Toggle) */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/40 shadow-sm text-slate-700"
        title="Gerir folhas"
      >
        <Files size={16} className="text-indigo-500" />
        <span className="font-mono text-xs font-medium">
          {sheets.length} {sheets.length === 1 ? 'folha' : 'folhas'}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Menu Dropdown Flutuante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-12 left-0 w-64 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            {/* Lista de Folhas */}
            <div className="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {sheets.map(sheet => {
                const isActive = sheet.id === activeSheetId;
                
                return (
                  <div
                    key={sheet.id}
                    onClick={() => {
                      setActiveSheet(sheet.id)
                      setIsOpen(false)
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                      isActive 
                        ? 'bg-indigo-50/80 shadow-sm border border-indigo-100/50' 
                        : 'hover:bg-black/5 border border-transparent'
                    }`}
                  >
                    <FileText 
                      size={14} 
                      className={isActive ? 'text-indigo-500' : 'text-slate-400'} 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${isActive ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        {sheet.title || 'Nova folha'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {formatDate(sheet.updatedAt)}
                      </p>
                    </div>

                    {/* Botão de Deletar (Surge no Hover) */}
                    {sheets.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          deleteSheet(sheet.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Eliminar folha"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Separador e Botão Nova Folha */}
            <div className="p-2 border-t border-black/5 bg-black/[0.02]">
              <button
                onClick={() => {
                  createSheet()
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-colors bg-white/50 hover:bg-white text-indigo-600 border border-transparent hover:border-white/80 shadow-sm hover:shadow"
              >
                <Plus size={16} />
                <span className="font-mono text-xs font-medium">Nova folha</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}