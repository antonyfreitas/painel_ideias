import { create } from 'zustand'

export interface Sheet {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface ScratchpadState {
  sheets: Sheet[]
  activeSheetId: string | null
  isSandboxOpen: boolean
  sandboxCode: string

  // Actions
  createSheet: () => void
  deleteSheet: (id: string) => void
  setActiveSheet: (id: string) => void
  updateSheetContent: (id: string, content: string) => void
  updateSheetTitle: (id: string, title: string) => void
  openSandbox: (code: string) => void
  closeSandbox: () => void
}

const generateId = () => `sheet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const loadFromStorage = (): Partial<ScratchpadState> => {
  try {
    const raw = localStorage.getItem('scratchpad_state')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

const saveToStorage = (sheets: Sheet[], activeSheetId: string | null) => {
  try {
    localStorage.setItem('scratchpad_state', JSON.stringify({ sheets, activeSheetId }))
  } catch {}
}

const defaultSheet: Sheet = {
  id: generateId(),
  title: 'Nova folha',
  content: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const persisted = loadFromStorage()

export const useScratchpadStore = create<ScratchpadState>((set, get) => ({
  sheets: persisted.sheets?.length ? persisted.sheets : [defaultSheet],
  activeSheetId: persisted.activeSheetId ?? persisted.sheets?.[0]?.id ?? defaultSheet.id,
  isSandboxOpen: false,
  sandboxCode: '',

  createSheet: () => {
    const newSheet: Sheet = {
      id: generateId(),
      title: 'Nova folha',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const sheets = [...get().sheets, newSheet]
    set({ sheets, activeSheetId: newSheet.id })
    saveToStorage(sheets, newSheet.id)
  },

  deleteSheet: (id) => {
    const sheets = get().sheets.filter(s => s.id !== id)
    if (sheets.length === 0) {
      const newSheet: Sheet = {
        id: generateId(),
        title: 'Nova folha',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      sheets.push(newSheet)
    }
    const activeSheetId = get().activeSheetId === id ? sheets[0].id : get().activeSheetId
    set({ sheets, activeSheetId })
    saveToStorage(sheets, activeSheetId)
  },

  setActiveSheet: (id) => {
    set({ activeSheetId: id })
    saveToStorage(get().sheets, id)
  },

  updateSheetContent: (id, content) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, content, updatedAt: Date.now() } : s
    )
    set({ sheets })
    saveToStorage(sheets, get().activeSheetId)
  },

  updateSheetTitle: (id, title) => {
    const sheets = get().sheets.map(s =>
      s.id === id ? { ...s, title, updatedAt: Date.now() } : s
    )
    set({ sheets })
    saveToStorage(sheets, get().activeSheetId)
  },

  openSandbox: (code) => set({ isSandboxOpen: true, sandboxCode: code }),
  closeSandbox: () => set({ isSandboxOpen: false, sandboxCode: '' }),
}))