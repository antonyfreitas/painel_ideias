import TurndownService from 'turndown';
import type { Sheet } from '../store/scratchpadStore';

// O "Pulo do Gato" para o Vite: Garante que instanciamos a classe correta
// quer ela venha como função direta ou encapsulada no '.default'
const Turndown = typeof TurndownService === 'function' 
  ? TurndownService 
  : (TurndownService as any).default || TurndownService;

const turndownService = new Turndown({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

export const exportSheetToMarkdown = (sheet: Sheet) => {
  if (!sheet.content) return;

  // 1. Converter HTML para Markdown
  const markdownContent = turndownService.turndown(sheet.content);

  // 2. Montar o Frontmatter (Metadados para o seu PKM)
  const date = new Date(sheet.updatedAt).toISOString().split('T')[0];
  const frontmatter = `---
title: "${sheet.title || 'Sem título'}"
date: ${date}
tags: [scratchpad, draft]
---

`;

  const finalMarkdown = frontmatter + markdownContent;

  // 3. Criar o ficheiro em memória e forçar o download
  const blob = new Blob([finalMarkdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const safeTitle = (sheet.title || 'nova_folha').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  link.href = url;
  link.download = `${safeTitle}_${date}.md`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};