import { useEditor, EditorContent } from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'

import { common, createLowlight } from 'lowlight'
import { useScratchpadStore } from '../../store/scratchpadStore'

import {
  Bold as IconBold,
  Italic as IconItalic,
  Underline as IconUnderline,
  AlignLeft as IconAlignLeft,
  AlignCenter as IconAlignCenter,
  Code as IconCode,
  Highlighter as IconHighlighter,
} from 'lucide-react'

const lowlight = createLowlight(common)

export const TipTapEditor = ({ sheetId, content }: { sheetId: string; content: string }) => {
  const { updateSheetContent, updateSheetTitle } = useScratchpadStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'list_item'] }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'html' }),
    ],
    // `content` é passado apenas na montagem — o TipTap gerencia seu próprio
    // estado interno depois disso. Não sincronizamos de fora para evitar
    // reset de cursor/seleção a cada keystroke.
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      updateSheetContent(sheetId, html)

      const text = editor.getText()
      const firstLine = text.split('\n')[0]?.slice(0, 40).trim()
      if (firstLine) updateSheetTitle(sheetId, firstLine)
    },
  })

  // ── Sem useEffect de sync ─────────────────────────────────────────────────
  // O motivo: o TipTap é a fonte de verdade do conteúdo enquanto a janela
  // está aberta. Sincronizar de fora (store → editor) reseta cursor e
  // desfaz seleções. A única exceção seria conteúdo carregado externamente
  // (ex: colaboração em tempo real), que não é o caso aqui.

  if (!editor) return null

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-black/5 bg-slate-50/50 backdrop-blur-md overflow-x-auto custom-scrollbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconBold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconItalic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconUnderline size={16} />
        </button>

        <div className="w-[1px] h-4 bg-black/10 mx-1" />

        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconAlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconAlignCenter size={16} />
        </button>

        <div className="w-[1px] h-4 bg-black/10 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('codeBlock') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconCode size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('highlight') ? 'bg-yellow-200 text-yellow-800' : 'text-slate-600 hover:bg-black/5'}`}
        >
          <IconHighlighter size={16} />
        </button>

        <input
          type="color"
          onInput={event =>
            editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()
          }
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer ml-2 bg-transparent"
          title="Cor do Texto"
        />
      </div>

      {/* Área de edição */}
      <div className="flex-1 overflow-y-auto px-8 py-6 prose-custom custom-scrollbar">
        <EditorContent editor={editor} className="min-h-full tiptap-editor focus:outline-none" />
      </div>
    </div>
  )
}