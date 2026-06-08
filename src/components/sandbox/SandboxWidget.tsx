import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, TerminalSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
// Importe o seu Zustand store aqui se já o tiver criado, 
// ex: import { useStore } from '../../store/useStore'

export function SandboxWidget() {
  // Substitua por sua variável real do Zustand (ex: const isSandboxOpen = useStore(state => state.isSandboxOpen))
  // Para fins de teste imediato, se ainda não tiver o estado global, pode forçar para `true` temporariamente.
  const isSandboxOpen = true; 
  
  const [code, setCode] = useState('');

  // Sempre que o Sandbox for aberto, ele "pesca" o código do editor
  useEffect(() => {
    if (isSandboxOpen) {
      // Captura o primeiro bloco de código gerado pelo TipTap
      const codeBlock = document.querySelector('.ProseMirror pre code');
      if (codeBlock) {
        setCode(codeBlock.textContent || '');
      } else {
        setCode('<h1>Nenhum código encontrado na folha.</h1><p>Crie um bloco usando ```html</p>');
      }
    }
  }, [isSandboxOpen]);

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
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Atualizar Execução"
                  onClick={() => {
                    const block = document.querySelector('.ProseMirror pre code');
                    if (block) setCode(block.textContent || '');
                  }}
                >
                  <Play size={14} fill="currentColor" />
                </button>
                <button 
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                  // onClick={closeSandbox} // Conecte à sua função do Zustand para fechar
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* O Executor de fato */}
            <div className="flex-1 bg-white relative">
              <iframe
                title="Sandbox"
                srcDoc={code}
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

