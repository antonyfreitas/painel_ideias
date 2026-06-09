import { create } from 'zustand'

export interface Sheet {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface WindowState {
  sheetId: string
  x: number
  y: number
  width: number
  height: number
  status: 'normal' | 'minimized' | 'maximized'
  zIndex: number
}

interface ScratchpadState {
  sheets: Sheet[]
  windows: WindowState[]
  topZ: number
  isSandboxOpen: boolean
  sandboxCode: string
  activeSheetId: string | null
  setActiveSheet: (id: string | null) => void

  createSheet: () => void
  deleteSheet: (id: string) => void
  openWindow: (sheetId: string) => void
  closeWindow: (sheetId: string) => void
  minimizeWindow: (sheetId: string) => void
  restoreWindow: (sheetId: string) => void
  maximizeWindow: (sheetId: string) => void
  updateWindowBounds: (sheetId: string, bounds: Partial<Pick<WindowState, 'x' | 'y' | 'width' | 'height'>>) => void
  focusWindow: (sheetId: string) => void
  updateSheetContent: (id: string, content: string) => void
  updateSheetTitle: (id: string, title: string) => void
  openSandbox: (code: string) => void
  closeSandbox: () => void
}

const generateId = () => `sheet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const STORAGE_KEY = 'scratchpad_v2'

const load = (): Partial<ScratchpadState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // Valida estrutura mínima — se inválida, descarta silenciosamente
    if (
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.sheets) ||
      !Array.isArray(parsed.windows)
    ) {
      localStorage.removeItem(STORAGE_KEY)
      return {}
    }
    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

// Salva imediatamente para operações estruturais (criar, deletar, mover janela)
const saveNow = (sheets: Sheet[], windows: WindowState[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sheets, windows }))
  } catch {}
}

// Debounce de 400ms para conteúdo — evita write a cada keystroke
let saveTimer: ReturnType<typeof setTimeout> | null = null
const saveDebounced = (sheets: Sheet[], windows: WindowState[]) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveNow(sheets, windows), 400)
}

const defaultSheet: Sheet = {
  id: generateId(),
  title: 'Nova folha',
  content: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const makeWindow = (sheetId: string, z: number): WindowState => {
  const w = Math.min(680, window.innerWidth - 80)
  const h = Math.min(520, window.innerHeight - 120)
  const offset = (z % 6) * 28
  return {
    sheetId,
    x: Math.max(24, (window.innerWidth - w) / 2 + offset),
    y: Math.max(24, (window.innerHeight - h) / 2 + offset - 40),
    width: w,
    height: h,
    status: 'normal',
    zIndex: z,
  }
}

const persisted = load()
const initSheets: Sheet[] = Array.isArray(persisted.sheets) && persisted.sheets.length
  ? persisted.sheets
  : [defaultSheet]
const initWindows: WindowState[] = Array.isArray(persisted.windows) && persisted.windows.length
  ? persisted.windows.map(w => ({ ...w, status: 'normal' as const }))
  : [makeWindow(initSheets[0].id, 10)]

export const useScratchpadStore = create<ScratchpadState>((set, get) => ({
  sheets: initSheets,
  windows: initWindows,
  topZ: 10,
  isSandboxOpen: false,
  sandboxCode: '',
  activeSheetId: null,
  setActiveSheet: (id) => set({ activeSheetId: id }),

  createSheet: () => {
    const sheet: Sheet = {
      id: generateId(),
      title: 'Nova folha',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const topZ = get().topZ + 1
    const win = makeWindow(sheet.id, topZ)
    const sheets = [...get().sheets, sheet]
    const windows = [...get().windows, win]
    set({ sheets, windows, topZ })
    saveNow(sheets, windows)
  },

  deleteSheet: (id) => {
    let sheets = get().sheets.filter(s => s.id !== id)
    let windows = get().windows.filter(w => w.sheetId !== id)
    if (sheets.length === 0) {
      const sheet: Sheet = {
        id: generateId(),
        title: 'Nova folha',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      sheets = [sheet]
      windows = [makeWindow(sheet.id, get().topZ + 1)]
    }
    set({ sheets, windows })
    saveNow(sheets, windows)
  },

  openWindow: (sheetId) => {
    const existing = get().windows.find(w => w.sheetId === sheetId)
    if (existing) {
      get().restoreWindow(sheetId)
      return
    }
    const topZ = get().topZ + 1
    const win = makeWindow(sheetId, topZ)
    const windows = [...get().windows, win]
    set({ windows, topZ })
    saveNow(get().sheets, windows)
  },

  closeWindow: (sheetId) => {
    const windows = get().windows.filter(w => w.sheetId !== sheetId)
    set({ windows })
    saveNow(get().sheets, windows)
  },

  minimizeWindow: (sheetId) => {
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, status: 'minimized' as const } : w
    )
    set({ windows })
    saveNow(get().sheets, windows)
  },

  restoreWindow: (sheetId) => {
    const topZ = get().topZ + 1
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, status: 'normal' as const, zIndex: topZ } : w
    )
    set({ windows, topZ })
    saveNow(get().sheets, windows)
  },

  maximizeWindow: (sheetId) => {
    const win = get().windows.find(w => w.sheetId === sheetId)
    if (!win) return
    const next = win.status === 'maximized' ? 'normal' : 'maximized'
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, status: next as WindowState['status'] } : w
    )
    set({ windows })
    saveNow(get().sheets, windows)
  },

  updateWindowBounds: (sheetId, bounds) => {
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, ...bounds } : w
    )
    set({ windows })
    saveNow(get().sheets, windows)
  },

  focusWindow: (sheetId) => {
    const topZ = get().topZ + 1
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, zIndex: topZ } : w
    )
    set({ windows, topZ })
    // focusWindow não persiste — só altera zIndex em memória
  },

  updateSheetContent: (id, content) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, content, updatedAt: Date.now() } : s
    )
    set({ sheets })
    // Debounced: não escreve no localStorage a cada tecla
    saveDebounced(sheets, get().windows)
  },

  updateSheetTitle: (id, title) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, title, updatedAt: Date.now() } : s
    )
    set({ sheets })
    saveDebounced(sheets, get().windows)
  },

  openSandbox: (code) => set({ isSandboxOpen: true, sandboxCode: code }),
  closeSandbox: () => set({ isSandboxOpen: false, sandboxCode: '' }),
}))