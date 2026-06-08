import { useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useScratchpadStore } from '../../store/scratchpadStore'
import { Plus, Code } from 'lucide-react'

const ICON_SIZE = 44
const MAGNIFY_SIZE = 58
const MAGNIFY_RANGE = 100

const DockIcon = ({
  label,
  color,
  textColor,
  onClick,
  mouseX,
  children,
  active = false,
}: {
  label: string
  color: string
  textColor?: string
  onClick: () => void
  mouseX: ReturnType<typeof useMotionValue>
  children: React.ReactNode
  active?: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const distance = useMotionValue(999)

  const size = useSpring(
    useTransform(distance, [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [ICON_SIZE, MAGNIFY_SIZE, ICON_SIZE]),
    { stiffness: 320, damping: 30 }
  )
  const y = useSpring(
    useTransform(distance, [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [0, -10, 0]),
    { stiffness: 320, damping: 30 }
  )

  const updateDistance = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    distance.set(mouseX.get() - (rect.left + rect.width / 2))
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={updateDistance}
      onMouseLeave={() => distance.set(999)}
      style={{ y }}
      className="relative flex flex-col items-center"
    >
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.9 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.12 }}
        className="absolute pointer-events-none whitespace-nowrap"
        style={{
          bottom: 'calc(100% + 10px)',
          background: 'rgba(30,30,32,0.85)',
          backdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.92)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.62rem',
          letterSpacing: '0.02em',
          padding: '3px 8px',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        {label}
      </motion.div>

      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        className="flex items-center justify-center rounded-[11px] cursor-pointer relative overflow-hidden shrink-0"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.7)',
            'inset 0 0 0 0.5px rgba(255,255,255,0.4)',
            '0 1px 3px rgba(0,0,0,0.10)',
            '0 2px 10px rgba(0,0,0,0.08)',
          ].join(', '),
        }}
        title={label}
      >
        {children}
      </motion.button>

      {/* Dot indicator */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.4 }}
        transition={{ duration: 0.18 }}
        style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.28)',
          marginTop: 4,
        }}
      />
    </motion.div>
  )
}

const SheetDockIcon = ({
  sheetId,
  mouseX,
}: {
  sheetId: string
  mouseX: ReturnType<typeof useMotionValue>
}) => {
  const { sheets, windows, restoreWindow, focusWindow } = useScratchpadStore()
  const sheet = sheets.find(s => s.id === sheetId)
  const win   = windows.find(w => w.sheetId === sheetId)
  if (!sheet || !win) return null

  const isActive = win.status !== 'minimized'
  const initial  = (sheet.title || 'F').charAt(0).toUpperCase()

  // Paleta neutra papel — muito sutil
  const palettes = [
    { bg: 'rgba(245,242,235,0.92)', text: 'rgba(0,0,0,0.45)' },
    { bg: 'rgba(235,241,248,0.92)', text: 'rgba(0,0,0,0.45)' },
    { bg: 'rgba(242,238,250,0.92)', text: 'rgba(0,0,0,0.45)' },
    { bg: 'rgba(238,247,240,0.92)', text: 'rgba(0,0,0,0.45)' },
    { bg: 'rgba(250,238,238,0.92)', text: 'rgba(0,0,0,0.45)' },
  ]
  const { bg, text } = palettes[sheets.findIndex(s => s.id === sheetId) % palettes.length]

  const handleClick = () => {
    if (win.status === 'minimized') restoreWindow(sheetId)
    else focusWindow(sheetId)
  }

  return (
    <DockIcon
      label={sheet.title || 'Nova folha'}
      color={bg}
      textColor={text}
      onClick={handleClick}
      mouseX={mouseX}
      active={isActive}
    >
      <span style={{
        fontFamily: 'Lora, serif',
        fontSize: '1.1rem',
        color: text,
        fontWeight: 500,
        userSelect: 'none',
      }}>
        {initial}
      </span>
    </DockIcon>
  )
}

export const Dock = () => {
  const { windows, createSheet, openSandbox, isSandboxOpen } = useScratchpadStore()
  const mouseX = useMotionValue(999)
  const openSheetIds = windows.map(w => w.sheetId)

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2" style={{ zIndex: 200 }}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        onMouseMove={e => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(999)}
        className="flex items-end gap-1.5 px-3 pb-2 pt-2.5 rounded-2xl"
        style={{
          // Mais branco, menos transparente
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(32px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.9)',
            '0 0 0 0.5px rgba(0,0,0,0.07)',
            '0 2px 8px rgba(0,0,0,0.08)',
            '0 8px 32px rgba(0,0,0,0.10)',
          ].join(', '),
        }}
      >
        {/* Sheet icons */}
        <AnimatePresence mode="popLayout">
          {openSheetIds.map(id => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.5, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              <SheetDockIcon sheetId={id} mouseX={mouseX} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Separador */}
        {openSheetIds.length > 0 && (
          <div style={{
            width: 1,
            height: 28,
            background: 'rgba(0,0,0,0.08)',
            borderRadius: 1,
            alignSelf: 'center',
            margin: '0 3px 4px',
            flexShrink: 0,
          }} />
        )}

        {/* Nova folha */}
        <DockIcon
          label="Nova folha"
          color="rgba(79,110,247,0.10)"
          onClick={createSheet}
          mouseX={mouseX}
          active={false}
        >
          <Plus size={18} strokeWidth={2} style={{ color: 'rgba(79,110,247,0.75)' }} />
        </DockIcon>

        {/* Sandbox */}
        <DockIcon
          label="Sandbox  ⌃↵"
          color={isSandboxOpen ? 'rgba(22,22,30,0.88)' : 'rgba(22,22,30,0.07)'}
          onClick={() => openSandbox('<h1>Sandbox</h1>')}
          mouseX={mouseX}
          active={false}
        >
          <Code
            size={17}
            strokeWidth={2}
            style={{ color: isSandboxOpen ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.38)' }}
          />
        </DockIcon>
      </motion.div>
    </div>
  )
}