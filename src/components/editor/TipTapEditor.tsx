import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Underline from '@tiptap/extension-underline'
import { common, createLowlight } from 'lowlight'
import { useScratchpadStore } from '../../store/scratchpadStore'

const lowlight = createLowlight(common)

interface Props {
  sheetId: string
  content: string
}

const ToolBtn = ({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick() }}
    title={title}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 26, borderRadius: 6, border: 'none',
      background: active ? 'rgba(79,110,247,0.15)' : 'transparent',
      color: active ? 'rgba(79,110,247,0.95)' : 'rgba(0,0,0,0.55)',
      cursor: 'pointer',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.78rem',
      fontWeight: active ? 700 : 500,
      flexShrink: 0,
    }}
  >
    {children}
  </button>
)

const Divider = () => (
  <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.1)', margin: '0 2px', flexShrink: 0 }} />
)

export const TipTapEditor = ({ sheetId, content }: Props) => {
  const { updateSheetContent, updateSheetTitle } = useScratchpadStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Comece a escrever… (suporta Markdown)' }),
      Typography,
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'html' }),
      Underline,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      updateSheetContent(sheetId, html)
      const text = editor.getText()
      const first = text.split('\n')[0]?.trim()
      if (first) updateSheetTitle(sheetId, first.slice(0, 40) + (first.length > 40 ? '…' : ''))
    },
    editorProps: {
      attributes: { class: 'tiptap', spellcheck: 'false' },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content || '', false)
    }
  }, [sheetId])

  return (
    <div className="w-full h-full overflow-y-auto px-10 py-7" style={{ position: 'relative' }}>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: [120, 80], placement: 'top', offset: [0, 8] }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 1,
            padding: '3px 5px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">H1</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">H2</ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito">
              <span style={{ fontWeight: 800, fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>B</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico">
              <span style={{ fontStyle: 'italic', fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>I</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado">
              <span style={{ textDecoration: 'underline', fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>U</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
              <span style={{ textDecoration: 'line-through', fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>S</span>
            </ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código">
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>{`<>`}</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
              <span style={{ fontSize: '0.85rem' }}>"</span>
            </ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="1.5" cy="3" r="1.2" fill="currentColor"/>
                <rect x="4" y="2.2" width="8" height="1.5" rx="0.75" fill="currentColor"/>
                <circle cx="1.5" cy="7" r="1.2" fill="currentColor"/>
                <rect x="4" y="6.2" width="8" height="1.5" rx="0.75" fill="currentColor"/>
                <circle cx="1.5" cy="11" r="1.2" fill="currentColor"/>
                <rect x="4" y="10.2" width="8" height="1.5" rx="0.75" fill="currentColor"/>
              </svg>
            </ToolBtn>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="w-full h-full" />
    </div>
  )
}