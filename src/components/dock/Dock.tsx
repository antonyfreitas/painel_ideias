import { useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useScratchpadStore } from '../../store/scratchpadStore'
import { Plus, Code } from 'lucide-react'

const ICON_SIZE = 48
const MAGNIFY_SIZE = 72
const MAGNIFY_RANGE = 120

const DockIcon = ({
  label,
  color,
  onClick,
  mouseX,
  children,
  bounce = false,
}: {
  label: string
  color: string
  onClick: () => void
  mouseX: ReturnType<typeof useMotionValue>
  children: React.ReactNode
  bounce?: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useMotionValue(999)

  const size = useSpring(
    useTransform(distance, [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [ICON_SIZE, MAGNIFY_SIZE, ICON_SIZE]),
    { stiffness: 300, damping: 28 }
  )

  const y = useSpring(
    useTransform(distance, [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [0, -14, 0]),
    { stiffness: 300, damping: 28 }
  )

  const updateDistance = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    distance.set(mouseX.get() - center)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={updateDistance}
      onMouseLeave={() => distance.set(999)}
      style={{ y }}
      className="relative flex flex-col items-center"
    >
      <motion.button
        onClick={onClick}
        animate={bounce ? { y: [0, -18, 0, -10, 0] } : {}}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)',
        }}
        whileTap={{ scale: 0.88 }}
        title={label}
      >
        {children}
      </motion.button>

      {/* Label tooltip */}
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute -top-8 px-2 py-0.5 rounded-md text-xs pointer-events-none whitespace-nowrap"
        style={{
          background: 'rgba(20,20,20,0.82)',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          backdropFilter: 'blur(4px)',
        }}
      >
        {label}
      </motion.span>
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
  const win = windows.find(w => w.sheetId === sheetId)
  const [bouncing, setBouncing] = useState(false)

  if (!sheet || !win) return null

  const isMinimized = win.status === 'minimized'
  const isOpen = win.status !== 'minimized'

  // Letra inicial do título para o ícone
  const initial = (sheet.title || 'F').charAt(0).toUpperCase()

  // Cor baseada no índice (paleta papel e tinta)
  const colors = [
    'rgba(245,240,230,0.95)',
    'rgba(235,242,245,0.95)',
    'rgba(242,240,248,0.95)',
    'rgba(245,242,235,0.95)',
    'rgba(240,245,240,0.95)',
    'rgba(248,240,240,0.95)',
  ]
  const idx = sheets.findIndex(s => s.id === sheetId) % colors.length
  const bg = colors[idx]

  const handleClick = () => {
    if (isMinimized) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 600)
      restoreWindow(sheetId)
    } else {
      focusWindow(sheetId)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <DockIcon
        label={sheet.title || 'Nova folha'}
        color={bg}
        onClick={handleClick}
        mouseX={mouseX}
        bounce={bouncing}
      >
        <span
          style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.25rem',
            color: 'rgba(0,0,0,0.55)',
            fontWeight: 500,
            userSelect: 'none',
          }}
        >
          {initial}
        </span>
      </DockIcon>

      {/* Dot — indica janela aberta */}
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: isOpen ? 'rgba(0,0,0,0.35)' : 'transparent',
          transition: 'background 0.2s',
          marginTop: -2,
        }}
      />
    </div>
  )
}

export const Dock = () => {
  const { sheets, windows, createSheet, openSandbox, isSandboxOpen } = useScratchpadStore()
  const mouseX = useMotionValue(999)

  // Só mostra no dock folhas que têm janela aberta (normal, minimized ou maximized)
  const openSheetIds = windows.map(w => w.sheetId)

  const handleOpenSandbox = () => {
    const code = '<h1>Sandbox</h1><p>Cole seu HTML aqui.</p>'
    openSandbox(code)
  }

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2"
      style={{ zIndex: 100 }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        onMouseMove={e => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(999)}
        className="flex items-end gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(250,249,246,0.72)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid rgba(0,0,0,0.09)',
          boxShadow: '0 2px 0 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Ícones das folhas abertas */}
        <AnimatePresence mode="popLayout">
          {openSheetIds.map(id => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <SheetDockIcon sheetId={id} mouseX={mouseX} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Separador */}
        {openSheetIds.length > 0 && (
          <div
            style={{
              width: 1,
              height: 36,
              background: 'rgba(0,0,0,0.1)',
              borderRadius: 1,
              alignSelf: 'center',
              margin: '0 4px',
            }}
          />
        )}

        {/* Nova folha */}
        <DockIcon
          label="Nova folha"
          color="rgba(79,110,247,0.12)"
          onClick={createSheet}
          mouseX={mouseX}
        >
          <Plus size={22} strokeWidth={1.8} style={{ color: 'rgba(79,110,247,0.8)' }} />
        </DockIcon>

        {/* Sandbox */}
        <DockIcon
          label="Sandbox ⌃↵"
          color={isSandboxOpen ? 'rgba(20,20,28,0.9)' : 'rgba(20,20,28,0.08)'}
          onClick={handleOpenSandbox}
          mouseX={mouseX}
        >
          <Code
            size={20}
            strokeWidth={1.8}
            style={{ color: isSandboxOpen ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.45)' }}
          />
        </DockIcon>
      </motion.div>
    </div>
  )
}