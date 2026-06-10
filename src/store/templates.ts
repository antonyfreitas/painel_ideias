export interface Template {
    id: string
    label: string
    emoji: string
    color: string
    content: string
  }
  
  export const TEMPLATES: Template[] = [
    {
      id: 'sla-bug',
      label: 'Registro SLA/Bug',
      emoji: '🐛',
      color: 'rgba(255,80,80,0.10)',
      content: `<h1>🐛 Registro de SLA / Bug</h1>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  <p><strong>Ticket / ID:</strong> </p>
  <p><strong>Severidade:</strong> </p>
  <hr>
  <h2>Descrição do Problema</h2>
  <p></p>
  <h2>Passos para Reproduzir</h2>
  <ol><li></li><li></li><li></li></ol>
  <h2>Impacto no Cliente</h2>
  <p></p>
  <h2>Solução / Workaround</h2>
  <p></p>
  <h2>Status</h2>
  <p>⏳ Em andamento</p>`,
    },
    {
      id: 'treino-boxe',
      label: 'Treino de Boxe',
      emoji: '🥊',
      color: 'rgba(255,150,0,0.10)',
      content: `<h1>🥊 Planejamento de Treino</h1>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  <p><strong>Duração:</strong> </p>
  <hr>
  <h2>Aquecimento</h2>
  <ul><li>Pular corda — 3 min</li><li>Shadowboxing — 2 rounds</li></ul>
  <h2>Técnico</h2>
  <ul><li></li><li></li><li></li></ul>
  <h2>Condicionamento</h2>
  <ul><li></li><li></li></ul>
  <h2>Observações</h2>
  <p></p>`,
    },
    {
      id: 'reuniao',
      label: 'Reunião Geral',
      emoji: '📋',
      color: 'rgba(79,110,247,0.10)',
      content: `<h1>📋 Reunião</h1>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  <p><strong>Participantes:</strong> </p>
  <hr>
  <h2>Pauta</h2>
  <ol><li></li><li></li><li></li></ol>
  <h2>Discussão</h2>
  <p></p>
  <h2>Decisões</h2>
  <ul><li></li></ul>
  <h2>Próximos Passos</h2>
  <ul><li>[ ] </li><li>[ ] </li></ul>`,
    },
  ]