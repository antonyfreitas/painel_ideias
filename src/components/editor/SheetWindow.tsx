import { useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { AnimatePresence, motion } from 'framer-motion'
import { TipTapEditor } from './TipTapEditor'
import { useScratchpadStore } from '../../store/scratchpadStore'
import { exportSheetToMarkdown } from '../../services/pkmExport'
import { Download } from 'lucide-react'

interface Props {
  sheetId: string
}

export const SheetWindow = ({ sheetId }: Props) => {
  const {
    sheets, windows,
    focusWindow, closeWindow, minimizeWindow, maximizeWindow, updateWindowBounds,
  } = useScratchpadStore()

  const sheet = sheets.find(s => s.id === sheetId)
  const win = windows.find(w => w.sheetId === sheetId)
  const [isHoveringTraffic, setIsHoveringTraffic] = useState(false)
  const rndRef = useRef<Rnd>(null)
  const preMaxBounds = useRef({ x: 100, y: 100, width: 680, height: 520 })
  const isDraggingFromEditor = useRef(false)

  if (!sheet || !win || win.status === 'minimized') return null

  const isMax = win.status === 'maximized'

  const handleMaximize = () => {
    if (isMax) {
      rndRef.current?.updatePosition({ x: preMaxBounds.current.x, y: preMaxBounds.current.y })
      rndRef.current?.updateSize({ width: preMaxBounds.current.width, height: preMaxBounds.current.height })
      maximizeWindow(sheetId)
    } else {
      preMaxBounds.current = { x: win.x, y: win.y, width: win.width, height: win.height }
      rndRef.current?.updatePosition({ x: 0, y: 0 })
      rndRef.current?.updateSize({ width: window.innerWidth, height: window.innerHeight })
      maximizeWindow(sheetId)
    }
  }

  return (
    <Rnd
      ref={rndRef}
      default={{ x: win.x, y: win.y, width: win.width, height: win.height }}
      minWidth={320}
      minHeight={44}
      bounds="window"
      disableDragging={isMax || isDraggingFromEditor.current}
      enableResizing={!isMax}
      cancel=".no-drag"
      style={{ zIndex: win.zIndex }}
      onMouseDown={() => focusWindow(sheetId)}
      onDragStop={(_e, d) => updateWindowBounds(sheetId, { x: d.x, y: d.y })}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        updateWindowBounds(sheetId, { x: pos.x, y: pos.y, width: ref.offsetWidth, height: ref.offsetHeight })
      }
    >
      <div
        className="w-full h-full flex flex-col overflow-hidden"
        style={{
          background: 'rgba(252,251,248,0.96)',
          boxShadow: isMax ? 'none' : '0 2px 0 0 rgba(0,0,0,0.08), 0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.07)',
          border: isMax ? 'none' : '1px solid rgba(0,0,0,0.09)',
          borderRadius: isMax ? '0' : '14px',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Titlebar — arrasta aqui */}
        <div
          className="flex items-center gap-2 px-4 shrink-0"
          style={{
            height: '44px',
            background: 'rgba(248,247,244,0.98)',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            borderRadius: isMax ? '0' : '14px 14px 0 0',
            cursor: isMax ? 'default' : 'grab',
            userSelect: 'none',
          }}
        >
          {/* Traffic Lights — bloqueiam o drag */}
          <div
            className="no-drag flex items-center gap-1.5 shrink-0"
            onMouseEnter={() => setIsHoveringTraffic(true)}
            onMouseLeave={() => setIsHoveringTraffic(false)}
          >
            <motion.button
              onClick={() => closeWindow(sheetId)}
              whileTap={{ scale: 0.82 }}
              className="w-3 h-3 rounded-full flex items-center justify-center relative shrink-0"
              style={{ background: '#ff5f57', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.14)' }}
            >
              <AnimatePresence>
                {isHoveringTraffic && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute text-[7px] font-black leading-none pointer-events-none"
                    style={{ color: 'rgba(80,0,0,0.55)' }}
                  >✕</motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={() => minimizeWindow(sheetId)}
              whileTap={{ scale: 0.82 }}
              className="w-3 h-3 rounded-full flex items-center justify-center relative shrink-0"
              style={{ background: '#febc2e', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.14)' }}
            >
              <AnimatePresence>
                {isHoveringTraffic && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute text-[9px] font-black leading-none pointer-events-none"
                    style={{ color: 'rgba(80,40,0,0.5)', marginTop: '-1px' }}
                  >−</motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={handleMaximize}
              whileTap={{ scale: 0.82 }}
              className="w-3 h-3 rounded-full flex items-center justify-center relative shrink-0"
              style={{ background: '#28c840', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.14)' }}
            >
              <AnimatePresence>
                {isHoveringTraffic && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute text-[8px] font-black leading-none pointer-events-none"
                    style={{ color: 'rgba(0,50,0,0.45)' }}
                  >⤢</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Título */}
          <span
            className="flex-1 text-center truncate px-2"
            style={{
              fontFamily: 'Lora, serif',
              color: 'rgba(0,0,0,0.4)',
              fontSize: '0.8rem',
              letterSpacing: '0.01em',
            }}
          >
            {sheet.title || 'Nova folha'}
          </span>

          {/* Exportar — bloqueia drag */}
          <button
            onClick={() => exportSheetToMarkdown(sheet)}
            className="no-drag shrink-0 p-1.5 rounded-md transition-all cursor-pointer hover:bg-black/5"
            style={{ color: 'rgba(0,0,0,0.3)' }}
            title="Exportar .md"
          >
            <Download size={13} />
          </button>

          <span
            className="no-drag shrink-0 px-1.5 py-0.5 rounded-md"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(0,0,0,0.25)',
              background: 'rgba(79,110,247,0.07)',
              fontSize: '0.65rem',
            }}
          >
            ⌃↵
          </span>
        </div>

        {/* Editor — bloqueia drag */}
        <div
          className="no-drag flex-1 overflow-hidden"
          onMouseDown={e => e.stopPropagation()}
        >
          <TipTapEditor
            key={sheet.id}
            sheetId={sheet.id}
            content={sheet.content}
          />
        </div>
      </div>
    </Rnd>
  )
}