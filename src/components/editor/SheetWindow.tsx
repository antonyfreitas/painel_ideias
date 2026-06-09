import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TipTapEditor } from './TipTapEditor'
import { useScratchpadStore } from '../../store/scratchpadStore'
import { exportSheetToMarkdown } from '../../services/pkmExport'
import { Download } from 'lucide-react'

interface Props {
  sheetId: string
}

// Spring config Apple-like: rápido, sem bounce excessivo
const SPRING = { stiffness: 380, damping: 38, mass: 0.8 }
const SPRING_SLOW = { stiffness: 260, damping: 32, mass: 1 }

export const SheetWindow = ({ sheetId }: Props) => {
  const {
    sheets, windows,
    focusWindow, closeWindow, minimizeWindow, maximizeWindow, updateWindowBounds,
  } = useScratchpadStore()

  const sheet = sheets.find(s => s.id === sheetId)
  const win   = windows.find(w => w.sheetId === sheetId)

  // ── Estado local de geometria (não vai pro store a cada pixel) ────────────
  const [pos,  setPos]  = useState({ x: win?.x ?? 120, y: win?.y ?? 80 })
  const [size, setSize] = useState({ width: win?.width ?? 680, height: win?.height ?? 520 })
  const [isHoveringTraffic, setIsHoveringTraffic] = useState(false)
  const [isDraggingState, setIsDraggingState] = useState(false)

  // Refs para drag
  const isDragging  = useRef(false)
  const dragOffset  = useRef({ x: 0, y: 0 })
  const posRef      = useRef(pos)
  const sizeRef     = useRef(size)
  posRef.current  = pos
  sizeRef.current = size

  // Pre-maximize snapshot
  const preMaxBounds = useRef({ x: pos.x, y: pos.y, width: size.width, height: size.height })

  // Sync ao restaurar do minimize
  const prevStatus = useRef(win?.status)
  useEffect(() => {
    if (!win) return
    if (prevStatus.current === 'minimized' && win.status === 'normal') {
      setPos({ x: win.x, y: win.y })
      setSize({ width: win.width, height: win.height })
    }
    prevStatus.current = win.status
  }, [win?.status])

  // Resize com mouse manual (bordas/cantos) ──────────────────────────────────
  const resizeState  = useRef<null | { dir: string; startX: number; startY: number; startW: number; startH: number; startPX: number; startPY: number }>(null)

  const startResize = useCallback((e: React.PointerEvent, dir: string) => {
    e.preventDefault()
    e.stopPropagation()
    resizeState.current = {
      dir,
      startX: e.clientX, startY: e.clientY,
      startW: sizeRef.current.width, startH: sizeRef.current.height,
      startPX: posRef.current.x, startPY: posRef.current.y,
    }
    const onMove = (ev: PointerEvent) => {
      const r = resizeState.current!
      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY
      let { startW: w, startH: h, startPX: px, startPY: py } = r

      if (dir.includes('e'))  w = Math.max(320, w + dx)
      if (dir.includes('s'))  h = Math.max(180, h + dy)
      if (dir.includes('w')) { w = Math.max(320, w - dx); px = r.startPX + (r.startW - w) }
      if (dir.includes('n')) { h = Math.max(180, h - dy); py = r.startPY + (r.startH - h) }

      setSize({ width: w, height: h })
      setPos({ x: px, y: py })
    }
    const onUp = () => {
      updateWindowBounds(sheetId, {
        x: posRef.current.x, y: posRef.current.y,
        width: sizeRef.current.width, height: sizeRef.current.height,
      })
      resizeState.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [sheetId, updateWindowBounds])

  // Drag titlebar ────────────────────────────────────────────────────────────
  const handleTitlebarPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (win?.status === 'maximized') return
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('.no-drag')) return

    e.preventDefault()
    isDragging.current = true
    setIsDraggingState(true)
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y }
    focusWindow(sheetId)

    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return
      const nx = ev.clientX - dragOffset.current.x
      const ny = ev.clientY - dragOffset.current.y
      setPos({
        x: Math.max(-sizeRef.current.width + 80, Math.min(window.innerWidth - 80, nx)),
        y: Math.max(0, Math.min(window.innerHeight - 44, ny)),
      })
    }
    const onUp = () => {
      isDragging.current = false
      setIsDraggingState(false)
      setPos(prev => {
        updateWindowBounds(sheetId, { x: prev.x, y: prev.y })
        return prev
      })
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [win?.status, sheetId, focusWindow, updateWindowBounds])

  // Maximize ─────────────────────────────────────────────────────────────────
  const handleMaximize = useCallback(() => {
    if (win?.status === 'maximized') {
      const b = preMaxBounds.current
      setPos({ x: b.x, y: b.y })
      setSize({ width: b.width, height: b.height })
      updateWindowBounds(sheetId, b)
      maximizeWindow(sheetId)
    } else {
      preMaxBounds.current = { x: posRef.current.x, y: posRef.current.y, width: sizeRef.current.width, height: sizeRef.current.height }
      const b = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
      setPos({ x: 0, y: 0 })
      setSize({ width: b.width, height: b.height })
      updateWindowBounds(sheetId, b)
      maximizeWindow(sheetId)
    }
  }, [win?.status, sheetId, maximizeWindow, updateWindowBounds])

  // ── Guards DEPOIS de todos os hooks ───────────────────────────────────────
  if (!sheet || !win) return null

  const isMin = win.status === 'minimized'
  const isMax = win.status === 'maximized'

  const windowVariants = {
    hidden: {
      opacity: 0,
      scale: 0.88,
      y: 24,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { ...SPRING, filter: { duration: 0.2 } },
    },
    // Genie effect: encolhe em direção ao dock (bottom-center)
    minimized: {
      opacity: 0,
      scale: 0.3,
      y: typeof window !== 'undefined' ? window.innerHeight - pos.y - 80 : 400,
      x: typeof window !== 'undefined' ? window.innerWidth / 2 - pos.x - (size.width / 2) : 0,
      filter: 'blur(4px)',
      transition: { ...SPRING_SLOW, filter: { duration: 0.15 } },
    },
  }

  return (
    <AnimatePresence>
      {!isMin && (
        <motion.div
          key={sheetId}
          variants={windowVariants}
          initial="hidden"
          animate="visible"
          exit="minimized"
          style={{
            position: 'fixed',
            left: isMax ? 0 : pos.x,
            top:  isMax ? 0 : pos.y,
            width:  isMax ? '100vw' : size.width,
            height: isMax ? '100vh' : size.height,
            zIndex: win.zIndex,
            // Transição suave só no maximize/restore, não durante drag
            transition: isDraggingState ? 'none' : 'left 0.32s cubic-bezier(0.16,1,0.3,1), top 0.32s cubic-bezier(0.16,1,0.3,1), width 0.32s cubic-bezier(0.16,1,0.3,1), height 0.32s cubic-bezier(0.16,1,0.3,1)',
            willChange: 'transform',
          }}
          onMouseDown={() => focusWindow(sheetId)}
        >
          {/* ── Handles de resize (bordas e cantos) ─────────────────────── */}
          {!isMax && (
            <>
              {/* N */}
              <div onPointerDown={e => startResize(e, 'n')} style={{ position:'absolute',top:0,left:8,right:8,height:5,cursor:'n-resize',zIndex:10 }} />
              {/* S */}
              <div onPointerDown={e => startResize(e, 's')} style={{ position:'absolute',bottom:0,left:8,right:8,height:5,cursor:'s-resize',zIndex:10 }} />
              {/* W */}
              <div onPointerDown={e => startResize(e, 'w')} style={{ position:'absolute',top:8,bottom:8,left:0,width:5,cursor:'w-resize',zIndex:10 }} />
              {/* E */}
              <div onPointerDown={e => startResize(e, 'e')} style={{ position:'absolute',top:8,bottom:8,right:0,width:5,cursor:'e-resize',zIndex:10 }} />
              {/* NW */}
              <div onPointerDown={e => startResize(e, 'nw')} style={{ position:'absolute',top:0,left:0,width:12,height:12,cursor:'nw-resize',zIndex:11 }} />
              {/* NE */}
              <div onPointerDown={e => startResize(e, 'ne')} style={{ position:'absolute',top:0,right:0,width:12,height:12,cursor:'ne-resize',zIndex:11 }} />
              {/* SW */}
              <div onPointerDown={e => startResize(e, 'sw')} style={{ position:'absolute',bottom:0,left:0,width:12,height:12,cursor:'sw-resize',zIndex:11 }} />
              {/* SE */}
              <div onPointerDown={e => startResize(e, 'se')} style={{ position:'absolute',bottom:0,right:0,width:12,height:12,cursor:'se-resize',zIndex:11 }} />
            </>
          )}

          {/* ── Janela principal ────────────────────────────────────────── */}
          <div
            className="w-full h-full flex flex-col overflow-hidden"
            style={{
              background: isMax
                ? 'rgba(255,254,252,0.99)'
                : 'rgba(255,255,255,0.82)',
              backdropFilter: isMax ? 'none' : 'blur(32px) saturate(1.5) brightness(1.04)',
              WebkitBackdropFilter: isMax ? 'none' : 'blur(32px) saturate(1.5) brightness(1.04)',
              boxShadow: isMax ? 'none' : [
                // Brilho interno no topo (simula reflexo de luz)
                '0 1px 0 rgba(255,255,255,0.75) inset',
                '0 0 0 0.5px rgba(255,255,255,0.5) inset',
                // Sombra externa
                '0 0 0 1px rgba(0,0,0,0.07)',
                '0 2px 4px rgba(0,0,0,0.06)',
                '0 12px 40px rgba(0,0,0,0.11)',
                '0 40px 100px rgba(0,0,0,0.07)',
              ].join(', '),
              border: isMax ? 'none' : '1px solid rgba(255,255,255,0.62)',
              borderRadius: isMax ? 0 : 14,
            }}
          >
            {/* ── Titlebar ────────────────────────────────────────────── */}
            <div
              onPointerDown={handleTitlebarPointerDown}
              onDoubleClick={handleMaximize}
              className="flex items-center gap-2 px-3.5 shrink-0 select-none"
              style={{
                height: 40,
                background: isMax
                  ? 'rgba(250,249,246,0.99)'
                  : 'rgba(255,255,255,0.55)',
                backdropFilter: isMax ? 'none' : 'blur(24px)',
                WebkitBackdropFilter: isMax ? 'none' : 'blur(24px)',
                borderBottom: '1px solid rgba(0,0,0,0.055)',
                borderRadius: isMax ? 0 : '14px 14px 0 0',
                cursor: isDraggingState ? 'grabbing' : (isMax ? 'default' : 'grab'),
              }}
            >
              {/* Traffic Lights */}
              <div
                className="no-drag flex items-center gap-[6px] shrink-0"
                onMouseEnter={() => setIsHoveringTraffic(true)}
                onMouseLeave={() => setIsHoveringTraffic(false)}
              >
                {/* Fechar */}
                <motion.button
                  onClick={() => closeWindow(sheetId)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.82 }}
                  className="relative shrink-0 flex items-center justify-center"
                  style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.35)' }}
                >
                  <AnimatePresence>
                    {isHoveringTraffic && (
                      <motion.span initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.6 }}
                        transition={{ duration: 0.08 }}
                        className="absolute pointer-events-none"
                        style={{ fontSize: 7, fontWeight: 900, color: 'rgba(100,0,0,0.6)', lineHeight: 1 }}
                      >✕</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Minimizar */}
                <motion.button
                  onClick={() => minimizeWindow(sheetId)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.82 }}
                  className="relative shrink-0 flex items-center justify-center"
                  style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.35)' }}
                >
                  <AnimatePresence>
                    {isHoveringTraffic && (
                      <motion.span initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.6 }}
                        transition={{ duration: 0.08 }}
                        className="absolute pointer-events-none"
                        style={{ fontSize: 9, fontWeight: 900, color: 'rgba(80,40,0,0.55)', lineHeight: 1, marginTop: -1 }}
                      >−</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Maximizar */}
                <motion.button
                  onClick={handleMaximize}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.82 }}
                  className="relative shrink-0 flex items-center justify-center"
                  style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.35)' }}
                >
                  <AnimatePresence>
                    {isHoveringTraffic && (
                      <motion.span initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.6 }}
                        transition={{ duration: 0.08 }}
                        className="absolute pointer-events-none"
                        style={{ fontSize: 8, fontWeight: 900, color: 'rgba(0,60,0,0.5)', lineHeight: 1 }}
                      >⤢</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Título */}
              <div className="flex-1 flex items-center justify-center min-w-0 px-2">
                <span
                  className="truncate"
                  style={{
                    fontFamily: 'Lora, serif',
                    color: 'rgba(0,0,0,0.42)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.015em',
                    textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                  }}
                >
                  {sheet.title || 'Nova folha'}
                </span>
              </div>

              {/* Ações */}
              <div className="no-drag flex items-center gap-1 shrink-0">
                <motion.button
                  onClick={() => exportSheetToMarkdown(sheet)}
                  whileHover={{ scale: 1.08, background: 'rgba(0,0,0,0.06)' }}
                  whileTap={{ scale: 0.92 }}
                  className="p-1.5 rounded-lg cursor-pointer"
                  style={{ color: 'rgba(0,0,0,0.32)' }}
                  title="Exportar .md"
                >
                  <Download size={12} strokeWidth={2} />
                </motion.button>

                <span
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'rgba(0,0,0,0.22)',
                    background: 'rgba(79,110,247,0.07)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  ⌃↵
                </span>
              </div>
            </div>

            {/* ── Editor ──────────────────────────────────────────────── */}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}