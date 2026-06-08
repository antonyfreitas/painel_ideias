import { useEffect } from 'react'
import { useScratchpadStore } from '../store/scratchpadStore'

const extractCodeBlocks = (html: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks = doc.querySelectorAll('pre code, pre')
  
  if (blocks.length === 0) {
    // Fallback: tenta extrair texto puro
    return doc.body.innerText || ''
  }

  return Array.from(blocks)
    .map(b => b.textContent || '')
    .join('\n\n')
}

export const useKeyboardShortcuts = () => {
  const { isSandboxOpen, closeSandbox, openSandbox, sheets, activeSheetId } = useScratchpadStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Enter → abre sandbox com código da folha ativa
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        const activeSheet = sheets.find(s => s.id === activeSheetId)
        if (!activeSheet) return
        const code = extractCodeBlocks(activeSheet.content)
        openSandbox(code)
        return
      }

      // Esc → fecha sandbox
      if (e.key === 'Escape' && isSandboxOpen) {
        e.preventDefault()
        closeSandbox()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isSandboxOpen, sheets, activeSheetId, openSandbox, closeSandbox])
}
