import { useMemo, useState } from 'react'
import { useTable } from '../lib/db'
import { PageHead, Stat } from '../components/ui'
import { brl, ymd, FORMAS } from '../lib/util'
const mesesAtras = (n) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - n); return ymd(d).slice(0, 7) }
const rotulo = (m) => new Date(m + '-15').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
function Barras({ itens, fmt = brl }) {
  const max = Math.max(1, ...itens.map((i) => i.v))
  return <ul className="space-y-2.5">{itens.map((i) => <li key={i.k}><div className="flex justify-between text-sm mb-1"><span className="font-semibold">{i.k}</span><span className="tabular-nums">{fmt(i.v)}{i.extra && <span className="text-slate-500"> · {i.extra}</span>}</span></div><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded" style={{ width: `${(i.v / max) * 100}%`, background: i.cor || 'var(--color-brand)' }} /></div></li>)}</ul>
}
export default function Relatorios() {
  const { rows: pay } = useTable('payments'), { rows: ap } = useTable('appointments'), { rows: dn } = useTable('dentists'), { rows: sv } = useTable('services'), { rows: ex } = useTable('expenses'), { rows: pt } = useTable('patients')
  const [mes, setMes] = useState(mesesAtras(0))
  const r = useMemo(() => {
    const serie = Array.from({ length: 6 }, (_, i) => mesesAtras(5 - i)).map((m) => ({ k: rotulo(m), m, v: pay.filter((p) => ymd(new Date(p.data)).startsWith(m)).reduce((s, p) => s + Number(p.valor), 0) }))
    const pm = pay.filter((p) => ymd(new Date(p.data)).startsWith(mes)), am = ap.filter((a) => ymd(new Date(a.inicio)).startsWith(mes))
    const rec = pm.reduce((s, p) => s + Number(p.valor), 0), desp = ex.filter((e) => (e.data || '').startsWith(mes)).reduce((s, e) => s + Number(e.valor), 0)
    const porDent = dn.map((d) => ({ k: d.nome, cor: d.cor, v: pm.filter((p) => p.dentist_id === d.id).reduce((s, p) => s + Number(p.valor), 0) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v)
    const porForma = Object.keys(FORMAS).map((k) => ({ k: FORMAS[k], v: pm.filter((p) => p.forma === k).reduce((s, p) => s + Number(p.valor), 0) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v)
    const conc = am.filter((a) => a.status === 'concluido'), faltas = am.filter((a) => a.status === 'faltou'), cancel = am.filter((a) => a.status === 'cancelado')
    const base = conc.length + faltas.length
    const porProc = sv.map((s) => ({ k: s.nome, v: conc.filter((a) => a.service_id === s.id).length })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 6)
    const novos = pt.filter((p) => (p.criado_em || '').startsWith(mes)).length
    return { serie, rec, desp, porDent, porForma, porProc, total: am.length, conc: conc.length, faltas: faltas.length, cancel: cancel.length, taxaFalta: base ? Math.round((faltas.length / base) * 100) : 0, site: am.filter((a) => a.origem === 'site').length, ticket: pm.length ? rec / pm.length : 0, novos }
  }, [pay, ap, dn, sv, ex, pt, mes])
  const pico = Math.max(1, ...r.serie.map((s) => s.v))
  return (<>
    <PageHead title="Relatórios" sub="Resultado e operação por mês" />
    <input type="month" className="input !w-auto mb-4" value={mes} onChange={(e) => setMes(e.target.value)} aria-label="Mês" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <Stat label="Receita" value={brl(r.rec)} accent="text-emerald-700" /><Stat label="Resultado" value={brl(r.rec - r.desp)} hint={`Despesas ${brl(r.desp)}`} />
      <Stat label="Ticket médio" value={brl(r.ticket)} hint="por recebimento" /><Stat label="Faltas" value={`${r.taxaFalta}%`} hint={`${r.faltas} de ${r.conc + r.faltas} agendados`} accent={r.taxaFalta > 15 ? 'text-rose-700' : 'text-ink'} />
    </div>
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="card p-5"><h2 className="font-bold mb-4">Receita dos últimos 6 meses</h2>
        <div className="flex items-end gap-2 h-40" role="img" aria-label="Receita por mês">{r.serie.map((s) => <div key={s.m} className="flex-1 flex flex-col items-center justify-end h-full gap-1"><span className="text-[10px] text-slate-500 tabular-nums">{s.v ? Math.round(s.v / 100) / 10 + 'k' : ''}</span><div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max(2, (s.v / pico) * 100)}%`, background: s.m === mes ? 'var(--color-gold)' : 'var(--color-brand)' }} /><span className="text-xs font-semibold">{s.k}</span></div>)}</div></section>
      <section className="card p-5"><h2 className="font-bold mb-4">Receita por profissional</h2>{r.porDent.length ? <Barras itens={r.porDent} /> : <p className="text-sm text-slate-500">Sem recebimentos no mês.</p>}</section>
      <section className="card p-5"><h2 className="font-bold mb-4">Formas de pagamento</h2>{r.porForma.length ? <Barras itens={r.porForma} /> : <p className="text-sm text-slate-500">Sem recebimentos no mês.</p>}</section>
      <section className="card p-5"><h2 className="font-bold mb-4">Procedimentos concluídos</h2>{r.porProc.length ? <Barras itens={r.porProc} fmt={(n) => `${n}x`} /> : <p className="text-sm text-slate-500">Nenhuma consulta concluída no mês.</p>}</section>
      <section className="card p-5 lg:col-span-2"><h2 className="font-bold mb-3">Agenda do mês</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">{[['Consultas', r.total], ['Concluídas', r.conc], ['Faltas', r.faltas], ['Canceladas', r.cancel], ['Vindas do site', r.site]].map(([l, v]) => <div key={l}><dt className="label">{l}</dt><dd className="text-xl font-extrabold">{v}</dd></div>)}</dl></section>
    </div></>)
}
