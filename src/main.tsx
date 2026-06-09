import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useScratchpadStore, loadFromStorage } from './store/scratchpadStore'

// Hydrate: carrega IndexedDB (ou migra localStorage) ANTES de renderizar.
// O utilizador nunca vê o estado placeholder — o App só monta após os dados
// estarem prontos.
loadFromStorage().then(({ sheets, windows }) => {
  useScratchpadStore.setState({
    sheets,
    windows: windows.map(w => ({ ...w, status: 'normal' as const })),
    topZ: Math.max(10, ...windows.map(w => w.zIndex)),
    isHydrated: true,
  })

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})