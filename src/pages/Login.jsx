import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth, DEMO } from '../lib/db'
export default function Login() {
  const { user, login } = useAuth(), nav = useNavigate()
  const [email, setEmail] = useState(''), [senha, setSenha] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/app" replace />
  const go = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { await login(email, senha); nav('/app') } catch (x) { setErr('E-mail ou senha incorretos.') } finally { setBusy(false) } }
  return (
    <div className="min-h-dvh grid place-items-center p-4 bg-ink">
      <form onSubmit={go} className="bg-white rounded-3xl p-7 w-full max-w-sm rise">
        <div className="flex justify-center mb-2"><Logo size="md" /></div><div className="text-[11px] tracking-[.2em] text-center text-slate-500 mb-6">ÁREA DA CLÍNICA</div>
        {DEMO && <p className="text-xs bg-amber-50 text-amber-900 rounded-lg p-2 mb-4">Modo demo: entre com qualquer e-mail/senha.</p>}
        <label className="label" htmlFor="e">E-mail</label><input id="e" className="input mb-3" type="email" required={!DEMO} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <label className="label" htmlFor="s">Senha</label><input id="s" className="input mb-4" type="password" required={!DEMO} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        {err && <p role="alert" className="text-sm text-rose-700 mb-3">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="block text-center text-xs text-slate-500 mt-4">← Voltar ao site de agendamento</Link>
      </form>
    </div>
  )
}
