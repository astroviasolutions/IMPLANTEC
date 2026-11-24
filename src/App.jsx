import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from './lib/db'
import Layout from './components/Layout'
import Login from './pages/Login'
const Booking = lazy(() => import('./pages/Booking'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Agenda = lazy(() => import('./pages/Agenda'))
const Pacientes = lazy(() => import('./pages/Pacientes'))
const Orcamentos = lazy(() => import('./pages/Orcamentos'))
const Caixa = lazy(() => import('./pages/Caixa'))
const Financeiro = lazy(() => import('./pages/Financeiro'))
const Comissoes = lazy(() => import('./pages/Comissoes'))
const Avisos = lazy(() => import('./pages/Avisos'))
const Config = lazy(() => import('./pages/Config'))

function Private({ children }) {
  const { user } = useAuth()
  if (user === undefined) return <div className="p-10 text-center text-slate-500">Carregando…</div>
  return user ? children : <Navigate to="/login" replace />
}
export default function App() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Carregando…</div>}>
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Private><Layout /></Private>}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="orcamentos" element={<Orcamentos />} />
          <Route path="caixa" element={<Caixa />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="comissoes" element={<Comissoes />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="config" element={<Config />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
