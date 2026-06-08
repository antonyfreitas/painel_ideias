import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useScratchpadStore } from '../../store/scratchpadStore'

const lowlight = createLowlight(common)

interface TipTapEditorProps {
  sheetId: string
  content: string
}

export const TipTapEditor = ({ sheetId, content }: TipTapEditorProps) => {
  const { updateSheetContent, updateSheetTitle } = useScratchpadStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever... (suporta Markdown)',
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'html',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      updateSheetContent(sheetId, html)

      // Auto-título: pega o primeiro heading ou primeiras palavras
      const text = editor.getText()
      const firstLine = text.split('\n')[0]?.trim()
      if (firstLine) {
        const title = firstLine.slice(0, 40) + (firstLine.length > 40 ? '…' : '')
        updateSheetTitle(sheetId, title)
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
        spellcheck: 'false',
      },
    },
  })

  // Sincroniza conteúdo externo (troca de folha)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== content) {
      editor.commands.setContent(content || '', false)
    }
  }, [sheetId])

  return (
    <div className="w-full h-full overflow-y-auto px-10 py-8">
      <EditorContent editor={editor} className="w-full h-full" />
    </div>
  )
}