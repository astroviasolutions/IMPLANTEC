import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, FileText, Wallet, TrendingUp, Percent, Megaphone, Settings, LogOut } from 'lucide-react'
import { useAuth, DEMO } from '../lib/db'
const items = [
  ['/app', 'Painel', LayoutDashboard, true], ['/app/agenda', 'Agenda', CalendarDays], ['/app/pacientes', 'Pacientes', Users],
  ['/app/orcamentos', 'Orçamentos', FileText], ['/app/caixa', 'Caixa', Wallet], ['/app/financeiro', 'Financeiro', TrendingUp],
  ['/app/comissoes', 'Comissões', Percent], ['/app/avisos', 'Avisos', Megaphone], ['/app/config', 'Config', Settings],
]
export default function Layout() {
  const { logout } = useAuth(), nav = useNavigate()
  const link = ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-white/12 text-white' : 'text-white/65 hover:text-white hover:bg-white/8'}`
  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden md:flex md:w-60 shrink-0 flex-col bg-ink p-4 sticky top-0 h-dvh">
        <div className="px-2 py-3 mb-4"><div className="font-serif text-2xl text-white leading-none">Implantec</div><div className="text-[11px] tracking-[.2em] text-gold mt-1">ODONTOLOGIA</div></div>
        <nav className="flex flex-col gap-1 flex-1">{items.map(([to, l, I, end]) => <NavLink key={to} to={to} end={end} className={link}><I size={18} />{l}</NavLink>)}</nav>
        <button onClick={async () => { await logout(); nav('/login') }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white"><LogOut size={18} />Sair</button>
      </aside>
      <main className="flex-1 min-w-0 pb-24 md:pb-8">
        {DEMO && <div className="bg-amber-100 text-amber-900 text-xs font-semibold text-center py-1.5 px-3">MODO DEMO — dados fictícios salvos só neste navegador. Configure o Supabase para produção.</div>}
        <div className="max-w-6xl mx-auto p-4 md:p-8"><Outlet /></div>
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-ink flex overflow-x-auto px-1 pb-[env(safe-area-inset-bottom)] z-40" aria-label="Menu">
        {items.map(([to, l, I, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex-1 min-w-[68px] flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${isActive ? 'text-gold' : 'text-white/60'}`}><I size={20} />{l}</NavLink>)}
      </nav>
    </div>
  )
}
