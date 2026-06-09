import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export function Editor() {
  const editor = useEditor({
    extensions: [
      // O StarterKit já traz suporte nativo para atalhos de Markdown
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
    ],
    content: '<h1>Scratchpad</h1><p>Comece a digitar usando Markdown (ex: # Título)...</p>',
    editorProps: {
      attributes: {
        // Remove a borda de focus padrão e aplica a classe base para a tipografia
        class: 'prose-custom focus:outline-none w-full h-full min-h-[500px]',
      },
    },
    onUpdate: () => {
      // Futuramente, é aqui que vamos salvar o conteúdo no localStorage (Zustand)
      // const html = editor.getHTML();
    }
  })

  return (
    <div className="w-full h-full p-8 md:p-12 overflow-y-auto text-slate-700 bg-white/50 backdrop-blur-sm rounded-b-2xl">
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}