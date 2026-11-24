import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronLeft, MessageCircle } from 'lucide-react'
import { DEMO, db, supabase, useTable } from '../lib/db'
import { brl, digits, hm, mkDate, pad, ymd, waLink } from '../lib/util'

const ABRE = 8, FECHA = 18, PASSO = 30
async function ocupados(dentistId, dia) {
  if (DEMO) { const a = await db.list('appointments'); return a.filter((x) => x.dentist_id === dentistId && !['cancelado', 'faltou'].includes(x.status) && ymd(new Date(x.inicio)) === dia).map((x) => [new Date(x.inicio), new Date(x.fim)]) }
  const { data } = await supabase.rpc('horarios_ocupados', { p_dentist: dentistId, p_dia: dia }); return (data || []).map((x) => [new Date(x.inicio), new Date(x.fim)])
}
export default function Booking() {
  const { rows: services } = useTable('services'), { rows: dentists } = useTable('dentists'), { rows: notices } = useTable('notices')
  const [step, setStep] = useState(0), [svc, setSvc] = useState(null), [dent, setDent] = useState(null), [dia, setDia] = useState(''), [hora, setHora] = useState('')
  const [busy, setBusy] = useState([]), [nome, setNome] = useState(''), [tel, setTel] = useState(''), [done, setDone] = useState(false), [err, setErr] = useState(''), [sending, setSending] = useState(false)
  const dias = useMemo(() => Array.from({ length: 21 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d }).filter((d) => d.getDay() !== 0), [])
  useEffect(() => { if (dent && dia) ocupados(dent.id, dia).then(setBusy) }, [dent, dia])
  const slots = useMemo(() => {
    if (!svc || !dia) return []
    const out = [], now = new Date()
    for (let m = ABRE * 60; m + svc.duracao_min <= FECHA * 60; m += PASSO) {
      const ini = mkDate(dia, `${pad(Math.floor(m / 60))}:${pad(m % 60)}`), fim = new Date(ini.getTime() + svc.duracao_min * 60000)
      if (ini < now) continue
      if (busy.some(([a, b]) => ini < b && fim > a)) continue
      out.push(hm(ini))
    }
    return out
  }, [svc, dia, busy])
  const ativos = dentists.filter((d) => d.ativo !== false), sv = services.filter((s) => s.ativo !== false)
  const confirmar = async (e) => {
    e.preventDefault(); setErr('')
    if (digits(tel).length < 10) return setErr('Informe um WhatsApp com DDD.')
    setSending(true)
    try {
      const ini = mkDate(dia, hora)
      if (DEMO) { await db.upsert('appointments', { dentist_id: dent.id, service_id: svc.id, inicio: ini.toISOString(), fim: new Date(ini.getTime() + svc.duracao_min * 60000).toISOString(), status: 'agendado', origem: 'site', nome_externo: nome, whatsapp_externo: tel }) }
      else { const { error } = await supabase.rpc('agendar_publico', { p_nome: nome, p_whatsapp: tel, p_dentist: dent.id, p_service: svc.id, p_inicio: ini.toISOString() }); if (error) throw error }
      setDone(true)
    } catch (x) { setErr(x.message?.includes('indispon') ? 'Esse horário acabou de ser ocupado. Escolha outro.' : 'Não foi possível agendar. Tente novamente.'); setStep(3); ocupados(dent.id, dia).then(setBusy) }
    finally { setSending(false) }
  }
  const titles = ['Qual tratamento?', 'Com quem?', 'Qual dia?', 'Qual horário?', 'Seus dados']
  return (
    <div className="min-h-dvh bg-bg">
      <header className="bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(900px 300px at 80% -20%, #0e7490, transparent), radial-gradient(500px 240px at 0% 120%, #c9a45c55, transparent)' }} />
        <div className="relative max-w-2xl mx-auto px-5 pt-8 pb-10">
          <div className="flex items-center justify-between"><div><div className="font-serif text-4xl leading-none">Implantec</div><div className="text-[11px] tracking-[.25em] text-gold mt-1.5">ODONTOLOGIA</div></div><Link to="/login" className="text-xs text-white/60 hover:text-white">Área da clínica</Link></div>
          <p className="font-serif text-2xl mt-8 max-w-sm leading-snug">Agende sua consulta em menos de um minuto.</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 -mt-6 pb-16 relative">
        {notices.filter((n) => n.ativo).map((n) => <div key={n.id} className="card p-4 mb-3 border-gold/60"><b>{n.titulo}</b><p className="text-sm text-slate-600">{n.texto}</p></div>)}
        <div className="card p-5 rise">
          {done ? (
            <div className="text-center py-6"><div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 grid place-items-center mb-3"><Check className="text-emerald-700" /></div>
              <h2 className="font-serif text-2xl">Consulta solicitada!</h2>
              <p className="text-slate-600 text-sm mt-2">{svc.nome} · {dent.nome}<br />{new Date(dia + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {hora}</p>
              <p className="text-xs text-slate-500 mt-3">A clínica confirmará pelo WhatsApp informado.</p>
              <button className="btn btn-ghost mt-5" onClick={() => { setDone(false); setStep(0); setSvc(null); setDent(null); setDia(''); setHora('') }}>Fazer outro agendamento</button></div>
          ) : (<>
            <div className="flex items-center gap-2 mb-4">
              {step > 0 && <button onClick={() => setStep(step - 1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100" aria-label="Voltar"><ChevronLeft size={20} /></button>}
              <h2 className="font-bold text-lg flex-1">{titles[step]}</h2><span className="text-xs text-slate-400">{step + 1}/5</span>
            </div>
            <div className="h-1 bg-slate-100 rounded mb-5"><div className="h-1 bg-brand rounded transition-all" style={{ width: `${(step + 1) * 20}%` }} /></div>
            {step === 0 && <div className="grid gap-2">{sv.map((s) => <button key={s.id} onClick={() => { setSvc(s); setStep(1) }} className="text-left p-3.5 rounded-xl border border-line hover:border-brand hover:bg-brand/5 flex justify-between gap-3"><span><b className="block">{s.nome}</b><span className="text-xs text-slate-500">{s.categoria} · {s.duracao_min} min</span></span><span className="font-bold text-ink whitespace-nowrap">{s.preco > 0 ? brl(s.preco) : 'Sem custo'}</span></button>)}</div>}
            {step === 1 && <div className="grid gap-2">{ativos.map((d) => <button key={d.id} onClick={() => { setDent(d); setStep(2) }} className="text-left p-3.5 rounded-xl border border-line hover:border-brand hover:bg-brand/5 flex items-center gap-3"><span className="w-10 h-10 rounded-full grid place-items-center text-white font-bold" style={{ background: d.cor }}>{d.nome.replace(/^(Dr\.|Dra\.)\s*/, '')[0]}</span><span><b className="block">{d.nome}</b><span className="text-xs text-slate-500">{d.especialidade}</span></span></button>)}</div>}
            {step === 2 && <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{dias.map((d) => <button key={ymd(d)} onClick={() => { setDia(ymd(d)); setHora(''); setStep(3) }} className="p-2.5 rounded-xl border border-line hover:border-brand hover:bg-brand/5 text-center"><div className="text-[11px] uppercase text-slate-500">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</div><div className="text-xl font-extrabold">{d.getDate()}</div><div className="text-[11px] text-slate-500">{d.toLocaleDateString('pt-BR', { month: 'short' })}</div></button>)}</div>}
            {step === 3 && (<>{err && <p role="alert" className="text-sm text-rose-700 mb-3">{err}</p>}{slots.length ? <div className="grid grid-cols-4 gap-2">{slots.map((h) => <button key={h} onClick={() => { setHora(h); setStep(4) }} className="py-2.5 rounded-xl border border-line font-semibold hover:border-brand hover:bg-brand/5">{h}</button>)}</div> : <p className="text-sm text-slate-500 py-6 text-center">Sem horários nesse dia. Escolha outra data.</p>}</>)}
            {step === 4 && <form onSubmit={confirmar}>
              <div className="bg-slate-50 rounded-xl p-3 text-sm mb-4"><b>{svc.nome}</b> · {dent.nome}<br />{new Date(dia + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {hora}</div>
              <label className="label" htmlFor="n">Nome completo</label><input id="n" className="input mb-3" required value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
              <label className="label" htmlFor="t">WhatsApp (com DDD)</label><input id="t" className="input mb-4" required inputMode="tel" placeholder="(41) 90000-0000" value={tel} onChange={(e) => setTel(e.target.value)} autoComplete="tel" />
              {err && <p role="alert" className="text-sm text-rose-700 mb-3">{err}</p>}
              <button className="btn btn-primary w-full" disabled={sending}>{sending ? 'Agendando…' : 'Confirmar agendamento'}</button>
              <p className="text-[11px] text-slate-500 mt-3">Seus dados são usados apenas para o contato sobre a consulta (LGPD).</p>
            </form>}
          </>)}
        </div>
      </main>
    </div>
  )
}
