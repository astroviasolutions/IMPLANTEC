import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTable } from '../lib/db'
import { useClinica } from '../lib/settings'
import Logo from '../components/Logo'
import { hm, ymd } from '../lib/util'
// Tela para a TV da recepção: relógio, próximos atendimentos e avisos. Mostra só o primeiro nome (privacidade).
export default function TV() {
  const { rows: ap } = useTable('appointments'), { rows: pt } = useTable('patients'), { rows: sv } = useTable('services'), { rows: dn } = useTable('dentists'), { rows: avisos } = useTable('notices'), { cfg } = useClinica()
  const [agora, setAgora] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setAgora(new Date()), 15000); return () => clearInterval(t) }, [])
  const hoje = ap.filter((a) => ymd(new Date(a.inicio)) === ymd(agora) && !['cancelado', 'faltou'].includes(a.status)).sort((a, b) => a.inicio.localeCompare(b.inicio))
  const atual = hoje.filter((a) => a.status === 'em_atendimento'), prox = hoje.filter((a) => ['agendado', 'confirmado'].includes(a.status) && new Date(a.fim) > agora).slice(0, 5)
  const nome = (a) => (pt.find((p) => p.id === a.patient_id)?.nome || a.nome_externo || 'Paciente').split(' ')[0]
  return (
    <div className="min-h-dvh bg-ink text-white p-6 md:p-10 flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4 flex-wrap"><Logo variant="light" size="md" /><div className="text-right"><div className="text-6xl md:text-7xl font-extrabold tabular-nums">{hm(agora)}</div><div className="text-white/70 capitalize">{agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div></div></header>
      <div className="grid md:grid-cols-2 gap-8 flex-1">
        <section><h2 className="text-gold tracking-[.2em] text-sm font-bold mb-3">EM ATENDIMENTO</h2>
          {atual.length ? atual.map((a) => <div key={a.id} className="bg-white/10 rounded-2xl p-5 mb-3 text-2xl font-bold">{nome(a)}<span className="block text-base font-normal text-white/70">{dn.find((d) => d.id === a.dentist_id)?.nome}</span></div>) : <p className="text-white/50 text-xl">Nenhum atendimento em andamento.</p>}</section>
        <section><h2 className="text-gold tracking-[.2em] text-sm font-bold mb-3">PRÓXIMOS</h2>
          {prox.length ? prox.map((a) => <div key={a.id} className="flex items-center gap-4 border-b border-white/15 py-3"><span className="text-3xl font-extrabold tabular-nums w-24">{hm(new Date(a.inicio))}</span><span className="flex-1 min-w-0"><b className="block text-xl truncate">{nome(a)}</b><span className="text-sm text-white/60">{sv.find((s) => s.id === a.service_id)?.nome}</span></span></div>) : <p className="text-white/50 text-xl">Sem próximos atendimentos hoje.</p>}</section>
      </div>
      {avisos.filter((a) => a.ativo).map((a) => <div key={a.id} className="bg-gold text-[#2a1d05] rounded-2xl p-4"><b>{a.titulo}</b> {a.texto}</div>)}
      <footer className="flex justify-between text-sm text-white/50"><span>{cfg.nome}</span><Link to="/app" className="underline">Voltar ao painel</Link></footer>
    </div>)
}
