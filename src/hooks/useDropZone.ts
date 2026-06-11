import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import { useScratchpadStore } from '../store/scratchpadStore'

// Configura o marked para output seguro
marked.setOptions({ async: false })

const parseMd = (text: string): string => {
  const result = marked.parse(text)
  // marked v18 retorna string quando async:false
  return typeof result === 'string' ? result : ''
}

const isMdFile = (file: File) =>
  file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown'

export const useDropZone = (ref: React.RefObject<HTMLElement>) => {
  const { createSheetAt } = useScratchpadStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter.current++
      const hasMd = Array.from(e.dataTransfer?.items ?? []).some(
        item => item.kind === 'file'
      )
      if (hasMd) setIsDragOver(true)
    }

    const onDragLeave = () => {
      dragCounter.current--
      if (dragCounter.current === 0) setIsDragOver(false)
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer?.files ?? []).filter(isMdFile)
      if (files.length === 0) return

      const dropX = e.clientX
      const dropY = e.clientY

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const text = await file.text()
        const html = parseMd(text)
        const title = file.name.replace(/\.(md|markdown)$/i, '')
        // Espaça múltiplos arquivos soltos juntos
        createSheetAt(dropX + i * 32, dropY + i * 32, title, html)
      }
    }

    el.addEventListener('dragenter', onDragEnter)
    el.addEventListener('dragleave', onDragLeave)
    el.addEventListener('dragover', onDragOver)
    el.addEventListener('drop', onDrop)

    return () => {
      el.removeEventListener('dragenter', onDragEnter)
      el.removeEventListener('dragleave', onDragLeave)
      el.removeEventListener('dragover', onDragOver)
      el.removeEventListener('drop', onDrop)
    }
  }, [ref, createSheetAt])

  return { isDragOver }
}