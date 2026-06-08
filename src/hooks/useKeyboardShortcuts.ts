import { useEffect } from 'react'
import { useScratchpadStore } from '../store/scratchpadStore'

const extractCodeBlocks = (html: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks = doc.querySelectorAll('pre code, pre')
  if (blocks.length === 0) return doc.body.innerText || ''
  return Array.from(blocks).map(b => b.textContent || '').join('\n\n')
}

export const useKeyboardShortcuts = () => {
  const store = useScratchpadStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        // Pega a janela com maior zIndex (a focada)
        const { windows, sheets, openSandbox } = useScratchpadStore.getState()
        const topWin = windows
          .filter(w => w.status !== 'minimized')
          .sort((a, b) => b.zIndex - a.zIndex)[0]
        if (!topWin) return
        const sheet = sheets.find(s => s.id === topWin.sheetId)
        if (!sheet) return
        const code = extractCodeBlocks(sheet.content)
        openSandbox(code)
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        useScratchpadStore.getState().closeSandbox()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store])
}