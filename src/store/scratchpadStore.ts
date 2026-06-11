import { create } from 'zustand'
import localforage from 'localforage'

// ── IndexedDB config ──────────────────────────────────────────────────────
localforage.config({
  name: 'PainelIdeias',
  storeName: 'scratchpad',
  description: 'Notas e janelas do Painel de Ideias',
})

const STORAGE_KEY = 'scratchpad_v3'
const LEGACY_KEY  = 'scratchpad_v2'

// ── Interfaces ────────────────────────────────────────────────────────────
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

interface PersistedData {
  sheets: Sheet[]
  windows: WindowState[]
}

interface ScratchpadState {
  sheets: Sheet[]
  windows: WindowState[]
  topZ: number
  isSandboxOpen: boolean
  sandboxCode: string
  activeSheetId: string | null
  isHydrated: boolean

  setActiveSheet: (id: string | null) => void
  createSheet: () => void
  createSheetAt: (x: number, y: number, title: string, content: string) => void
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

// ── Helpers ───────────────────────────────────────────────────────────────
const generateId = () =>
  `sheet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const makeWindow = (sheetId: string, z: number, x?: number, y?: number): WindowState => {
  const w = Math.min(680, window.innerWidth - 80)
  const h = Math.min(520, window.innerHeight - 120)
  const offset = (z % 6) * 28
  return {
    sheetId,
    x: x ?? Math.max(24, (window.innerWidth - w) / 2 + offset),
    y: y ?? Math.max(24, (window.innerHeight - h) / 2 + offset - 40),
    width: w,
    height: h,
    status: 'normal',
    zIndex: z,
  }
}

const defaultSheet = (): Sheet => ({
  id: generateId(),
  title: 'Nova folha',
  content: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

// ── Persistência ──────────────────────────────────────────────────────────
const saveNow = (sheets: Sheet[], windows: WindowState[]) => {
  localforage.setItem<PersistedData>(STORAGE_KEY, { sheets, windows }).catch(() => {})
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
const saveDebounced = (sheets: Sheet[], windows: WindowState[]) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveNow(sheets, windows), 400)
}

// ── Migração localStorage → IndexedDB ────────────────────────────────────
export const migrateFromLocalStorage = async (): Promise<PersistedData | null> => {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.sheets) ||
      !Array.isArray(parsed.windows) ||
      parsed.sheets.length === 0
    ) {
      localStorage.removeItem(LEGACY_KEY)
      return null
    }
    await localforage.setItem<PersistedData>(STORAGE_KEY, {
      sheets: parsed.sheets,
      windows: parsed.windows,
    })
    localStorage.removeItem(LEGACY_KEY)
    console.info('[PainelIdeias] Migração localStorage → IndexedDB concluída.')
    return { sheets: parsed.sheets, windows: parsed.windows }
  } catch {
    return null
  }
}

// ── Carregamento inicial ──────────────────────────────────────────────────
export const loadFromStorage = async (): Promise<PersistedData> => {
  try {
    const stored = await localforage.getItem<PersistedData>(STORAGE_KEY)
    if (
      stored &&
      Array.isArray(stored.sheets) &&
      Array.isArray(stored.windows) &&
      stored.sheets.length > 0
    ) {
      return stored
    }
    const migrated = await migrateFromLocalStorage()
    if (migrated) return migrated
  } catch {}

  const sheet = defaultSheet()
  return { sheets: [sheet], windows: [makeWindow(sheet.id, 10)] }
}

// ── Store ─────────────────────────────────────────────────────────────────
const sheet0 = defaultSheet()

export const useScratchpadStore = create<ScratchpadState>((set, get) => ({
  sheets:  [sheet0],
  windows: [makeWindow(sheet0.id, 10)],
  topZ: 10,
  isSandboxOpen: false,
  sandboxCode: '',
  activeSheetId: null,
  isHydrated: false,

  setActiveSheet: (id) => set({ activeSheetId: id }),

  createSheet: () => {
    const sheet = defaultSheet()
    const topZ = get().topZ + 1
    const win = makeWindow(sheet.id, topZ)
    const sheets = [...get().sheets, sheet]
    const windows = [...get().windows, win]
    set({ sheets, windows, topZ })
    saveNow(sheets, windows)
  },

  createSheetAt: (x, y, title, content) => {
    const sheet: Sheet = {
      id: generateId(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const topZ = get().topZ + 1
    // Posiciona a janela centrada no ponto de drop, dentro dos limites
    const w = Math.min(680, window.innerWidth - 80)
    const h = Math.min(520, window.innerHeight - 120)
    const win = makeWindow(sheet.id, topZ,
      Math.max(0, Math.min(x - w / 2, window.innerWidth - w)),
      Math.max(0, Math.min(y - 20, window.innerHeight - h)),
    )
    const sheets = [...get().sheets, sheet]
    const windows = [...get().windows, win]
    set({ sheets, windows, topZ })
    saveNow(sheets, windows)
  },

  deleteSheet: (id) => {
    let sheets = get().sheets.filter(s => s.id !== id)
    let windows = get().windows.filter(w => w.sheetId !== id)
    if (sheets.length === 0) {
      const sheet = defaultSheet()
      sheets = [sheet]
      windows = [makeWindow(sheet.id, get().topZ + 1)]
    }
    set({ sheets, windows })
    saveNow(sheets, windows)
  },

  openWindow: (sheetId) => {
    const existing = get().windows.find(w => w.sheetId === sheetId)
    if (existing) { get().restoreWindow(sheetId); return }
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
  },

  updateSheetContent: (id, content) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, content, updatedAt: Date.now() } : s
    )
    set({ sheets })
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