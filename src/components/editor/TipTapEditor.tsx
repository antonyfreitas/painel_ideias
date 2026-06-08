import { useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useScratchpadStore } from '../../store/scratchpadStore'

// Instalar se ainda não tiver:
// npm install @tiptap/extension-underline @tiptap/extension-highlight @tiptap/extension-text-align

// Tente importar opcionalmente — se não instalados, o editor funciona sem eles
let Underline: any = null
let Highlight: any = null
let TextAlign: any = null

try { Underline  = require('@tiptap/extension-underline').default  } catch {}
try { Highlight  = require('@tiptap/extension-highlight').default  } catch {}
try { TextAlign  = require('@tiptap/extension-text-align').default } catch {}

const lowlight = createLowlight(common)

interface Props {
  sheetId: string
  content: string
}

// ─── Botão da toolbar ─────────────────────────────────────────────────────
const ToolBtn = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick() }}
    title={title}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 26,
      borderRadius: 6,
      border: 'none',
      background: active ? 'rgba(79,110,247,0.15)' : 'transparent',
      color: active ? 'rgba(79,110,247,0.95)' : 'rgba(0,0,0,0.55)',
      cursor: 'pointer',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.78rem',
      fontWeight: active ? 700 : 500,
      transition: 'background 0.1s, color 0.1s',
      flexShrink: 0,
    }}
    onMouseEnter={e => {
      if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.06)'
    }}
    onMouseLeave={e => {
      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
    }}
  >
    {children}
  </button>
)

const Divider = () => (
  <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.1)', margin: '0 2px', flexShrink: 0 }} />
)

// ─── Componente principal ─────────────────────────────────────────────────
export const TipTapEditor = ({ sheetId, content }: Props) => {
  const { updateSheetContent, updateSheetTitle } = useScratchpadStore()

  const extensions = [
    StarterKit.configure({ codeBlock: false }),
    Placeholder.configure({ placeholder: 'Comece a escrever… (suporta Markdown)' }),
    Typography,
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'html' }),
    ...(Underline ? [Underline] : []),
    ...(Highlight ? [Highlight.configure({ multicolor: false })] : []),
    ...(TextAlign ? [TextAlign.configure({ types: ['heading', 'paragraph'] })] : []),
  ]

  const editor = useEditor({
    extensions,
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      updateSheetContent(sheetId, html)
      const text = editor.getText()
      const first = text.split('\n')[0]?.trim()
      if (first) updateSheetTitle(sheetId, first.slice(0, 40) + (first.length > 40 ? '…' : ''))
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
        spellcheck: 'false',
      },
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

      {/* ── Bubble Menu — aparece ao selecionar texto ──────────────────── */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: [120, 80],
            placement: 'top',
            offset: [0, 8],
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: '3px 5px',
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.8)',
                '0 0 0 0.5px rgba(0,0,0,0.08)',
                '0 4px 16px rgba(0,0,0,0.12)',
                '0 1px 3px rgba(0,0,0,0.08)',
              ].join(', '),
            }}
          >
            {/* Heading shortcuts */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Título H1"
            >H1</ToolBtn>

            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Título H2"
            >H2</ToolBtn>

            <Divider />

            {/* Bold */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Negrito  ⌘B"
            >
              <span style={{ fontWeight: 800, fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>B</span>
            </ToolBtn>

            {/* Italic */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Itálico  ⌘I"
            >
              <span style={{ fontStyle: 'italic', fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>I</span>
            </ToolBtn>

            {/* Underline (se disponível) */}
            {Underline && (
              <ToolBtn
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                title="Sublinhado  ⌘U"
              >
                <span style={{ textDecoration: 'underline', fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>U</span>
              </ToolBtn>
            )}

            {/* Strike */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Tachado"
            >
              <span style={{ textDecoration: 'line-through', fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>S</span>
            </ToolBtn>

            <Divider />

            {/* Code inline */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Código inline"
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>{`<>`}</span>
            </ToolBtn>

            {/* Blockquote */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Citação"
            >
              <span style={{ fontSize: '0.85rem' }}>"</span>
            </ToolBtn>

            <Divider />

            {/* Bullet list */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Lista"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="1.5" cy="3" r="1.2" fill="currentColor"/>
                <rect x="4" y="2.2" width="8" height="1.5" rx="0.75" fill="currentColor"/>
                <circle cx="1.5" cy="7" r="1.2" fill="currentColor"/>
                <rect x="4" y="6.2" width="8" height="1.5" rx="0.75" fill="currentColor"/>
                <circle cx="1.5" cy="11" r="1.2" fill="currentColor"/>
                <rect x="4" y="10.2" width="8" height="1.5" rx="0.75" fill="currentColor"/>
              </svg>
            </ToolBtn>

            {/* Highlight (se disponível) */}
            {Highlight && (
              <ToolBtn
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive('highlight')}
                title="Destacar"
              >
                <span style={{ fontSize: '0.9rem' }}>◑</span>
              </ToolBtn>
            )}
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="w-full h-full" />
    </div>
  )
}