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

const load = (): Partial<ScratchpadState> => {
  try {
    const raw = localStorage.getItem('scratchpad_v2')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

const save = (sheets: Sheet[], windows: WindowState[]) => {
  try {
    localStorage.setItem('scratchpad_v2', JSON.stringify({ sheets, windows }))
  } catch {}
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
const initSheets: Sheet[] = persisted.sheets?.length ? persisted.sheets : [defaultSheet]
const initWindows: WindowState[] = persisted.windows?.length
  ? persisted.windows.map(w => ({ ...w, status: 'normal' as const }))
  : [makeWindow(initSheets[0].id, 10)]

export const useScratchpadStore = create<ScratchpadState>((set, get) => ({
  sheets: initSheets,
  windows: initWindows,
  topZ: 10,
  isSandboxOpen: false,
  sandboxCode: '',

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
    save(sheets, windows)
  },

  deleteSheet: (id) => {
    const sheets = get().sheets.filter(s => s.id !== id)
    const windows = get().windows.filter(w => w.sheetId !== id)
    if (sheets.length === 0) {
      const sheet = { id: generateId(), title: 'Nova folha', content: '', createdAt: Date.now(), updatedAt: Date.now() }
      sheets.push(sheet)
      windows.push(makeWindow(sheet.id, get().topZ + 1))
    }
    set({ sheets, windows })
    save(sheets, windows)
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
    save(get().sheets, windows)
  },

  closeWindow: (sheetId) => {
    const windows = get().windows.filter(w => w.sheetId !== sheetId)
    set({ windows })
    save(get().sheets, windows)
  },

  minimizeWindow: (sheetId) => {
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, status: 'minimized' as const } : w
    )
    set({ windows })
    save(get().sheets, windows)
  },

  restoreWindow: (sheetId) => {
    const topZ = get().topZ + 1
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, status: 'normal' as const, zIndex: topZ } : w
    )
    set({ windows, topZ })
    save(get().sheets, windows)
  },

  maximizeWindow: (sheetId) => {
    const win = get().windows.find(w => w.sheetId === sheetId)
    if (!win) return
    const next = win.status === 'maximized' ? 'normal' : 'maximized'
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, status: next as WindowState['status'] } : w
    )
    set({ windows })
    save(get().sheets, windows)
  },

  updateWindowBounds: (sheetId, bounds) => {
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, ...bounds } : w
    )
    set({ windows })
    save(get().sheets, windows)
  },

  focusWindow: (sheetId) => {
    const topZ = get().topZ + 1
    const windows = get().windows.map(w =>
      w.sheetId === sheetId ? { ...w, zIndex: topZ } : w
    )
    set({ windows, topZ })
  },

  updateSheetContent: (id, content) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, content, updatedAt: Date.now() } : s
    )
    set({ sheets })
    save(sheets, get().windows)
  },

  updateSheetTitle: (id, title) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, title, updatedAt: Date.now() } : s
    )
    set({ sheets })
    save(sheets, get().windows)
  },

  openSandbox: (code) => set({ isSandboxOpen: true, sandboxCode: code }),
  closeSandbox: () => set({ isSandboxOpen: false, sandboxCode: '' }),
}))