import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TerminalSquare } from 'lucide-react';
import { useScratchpadStore } from '../../store/scratchpadStore';

export function SandboxWidget() {
  // Consumimos o estado centralizado do Zustand
  // Nota: Confirma se no teu scratchpadStore.ts a propriedade que guarda o código se chama 'sandboxCode' ou 'code'
  const { isSandboxOpen, closeSandbox, sandboxCode } = useScratchpadStore();

  return (
    <AnimatePresence>
      {isSandboxOpen && (
        <Rnd
          default={{
            x: window.innerWidth / 2 - 250,
            y: window.innerHeight / 2 - 200,
            width: 500,
            height: 400,
          }}
          minWidth={300}
          minHeight={200}
          bounds="window"
          dragHandleClassName="sandbox-drag-handle"
          className="absolute z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Cabeçalho / Drag Handle (Estilo macOS) */}
            <div className="sandbox-drag-handle h-10 bg-[#2d2d2d] border-b border-white/5 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2 text-slate-400">
                <TerminalSquare size={16} />
                <span className="text-xs font-mono tracking-wider font-semibold uppercase">Output Playground</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                  onClick={closeSandbox}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* O Executor Isolado (iframe) */}
            <div className="flex-1 bg-white relative">
              <iframe
                title="Sandbox"
                srcDoc={sandboxCode || '<h1>Sem código detetado na folha ativa</h1>'}
                sandbox="allow-scripts"
                className="w-full h-full border-none bg-white"
              />
            </div>
          </motion.div>
        </Rnd>
      )}
    </AnimatePresence>
  );
}