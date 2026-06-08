interface CodePreviewProps {
  code: string
}

export const CodePreview = ({ code }: CodePreviewProps) => {
  const srcDoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: system-ui, sans-serif; 
      padding: 1rem;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`

  return (
    <iframe
      srcDoc={srcDoc}
      title="Code Preview"
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full rounded-xl"
      style={{ border: 'none', background: '#fff' }}
    />
  )
}