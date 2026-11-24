import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter } from 'react-router-dom'
import { DialogHost } from './lib/dialog'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/db'
// Artifact roda em frame isolado: rotas em memória. Fora dele, rotas por hash.
const Router = import.meta.env.VITE_ARTIFACT ? MemoryRouter : HashRouter
createRoot(document.getElementById('root')).render(<Router><AuthProvider><App /><DialogHost /></AuthProvider></Router>)
