import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Reset forçado — remove só uma vez
if (!sessionStorage.getItem('reset_done')) {
  localStorage.removeItem('scratchpad_v2')
  sessionStorage.setItem('reset_done', '1')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)