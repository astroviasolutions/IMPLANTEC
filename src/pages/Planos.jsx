import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useTable, db } from '../lib/db'
import { ask, notify } from '../lib/dialog'
import { Modal, Field, PageHead, Empty } from '../components/ui'
import { brl, ymd } from '../lib/util'
export default function Planos() {
  const { rows: planos, save: savePlano, remove: rmPlano } = useTable('plans'), { rows: subs, save: saveSub, remove: rmSub } = useTable('subscriptions'), { rows: pt } = useTable('patients')
  const [pl, setPl] = useState(null), [sb, setSb] = useState(null), mes = ymd(new Date()).slice(0, 7)
  const pagar = async (s) => {
    const p = planos.find((x) => x.id === s.plan_id); if (!p) return
    await db.upsert('payments', { patient_id: s.patient_id, valor: p.valor, forma: 'pix', data: new Date().toISOString(), obs: `Plano: ${p.nome} (${mes})` })
    await saveSub({ ...s, pagos: [...(s.pagos || []), mes] }); notify('Mensalidade registrada no caixa.')
  }
  const ativos = subs.filter((s) => s.status === 'ativo')
  const mrr = ativos.reduce((t, s) => t + Number(planos.find((p) => p.id === s.plan_id)?.valor || 0), 0)
  return (<>
    <PageHead title="Planos" sub={`${ativos.length} assinante(s) · ${brl(mrr)}/mês recorrente`}>
      <button className="btn btn-ghost" onClick={() => setPl({ nome: '', valor: '', descricao: '' })}>Novo plano</button>
      <button className="btn btn-primary" disabled={!planos.length || !pt.length} onClick={() => setSb({ patient_id: pt[0]?.id, plan_id: planos[0]?.id, inicio: ymd(new Date()), status: 'ativo', pagos: [] })}><Plus size={16} />Novo assinante</button></PageHead>
    <h2 className="font-bold mb-2">Planos</h2>
    {planos.length === 0 ? <div className="card mb-6"><Empty>Crie um plano, por exemplo manutenção ortodôntica mensal ou check-up semestral.</Empty></div> :
      <div className="grid sm:grid-cols-2 gap-3 mb-6">{planos.map((p) => <button key={p.id} onClick={() => setPl(p)} className="card p-4 text-left hover:border-brand"><b>{p.nome}</b><div className="text-xl font-extrabold text-ink">{brl(p.valor)}<span className="text-xs font-normal text-slate-500">/mês</span></div><p className="text-sm text-slate-500">{p.descricao}</p></button>)}</div>}
    <h2 className="font-bold mb-2">Assinantes</h2>
    {subs.length === 0 ? <div className="card"><Empty>Nenhum assinante.</Empty></div> : <div className="card divide-y divide-line">{subs.map((s) => { const p = planos.find((x) => x.id === s.plan_id), pago = (s.pagos || []).includes(mes); return (
      <div key={s.id} className="px-4 py-3 flex items-center gap-3 flex-wrap"><button className="flex-1 min-w-[160px] text-left" onClick={() => setSb(s)}><b>{pt.find((x) => x.id === s.patient_id)?.nome || '—'}</b><span className="block text-xs text-slate-500">{p?.nome} · desde {new Date(s.inicio + 'T12:00').toLocaleDateString('pt-BR')}</span></button>
        <span className={`chip ${s.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}>{s.status}</span>
        {s.status === 'ativo' && (pago ? <span className="chip bg-sky-100 text-sky-800 inline-flex items-center gap-1"><Check size={12} />{new Date(mes + '-15').toLocaleDateString('pt-BR', { month: 'short' })} pago</span> : <button className="btn btn-gold !py-1.5" onClick={() => pagar(s)}>Receber {brl(p?.valor)}</button>)}</div>) })}</div>}
    {pl && <Modal title="Plano" onClose={() => setPl(null)}><form onSubmit={async (e) => { e.preventDefault(); await savePlano({ ...pl, valor: Number(pl.valor) }); setPl(null) }}>
      <Field label="Nome"><input className="input" required value={pl.nome} onChange={(e) => setPl({ ...pl, nome: e.target.value })} /></Field>
      <Field label="Valor mensal (R$)"><input className="input" required type="number" step="0.01" min="0.01" value={pl.valor} onChange={(e) => setPl({ ...pl, valor: e.target.value })} /></Field>
      <Field label="O que inclui"><textarea rows={2} className="input" value={pl.descricao} onChange={(e) => setPl({ ...pl, descricao: e.target.value })} /></Field>
      <div className="flex justify-between">{pl.id ? <button type="button" className="btn btn-danger" onClick={async () => { if (await ask('Remover plano?')) { await rmPlano(pl.id); setPl(null) } }}>Remover</button> : <span />}<button className="btn btn-primary">Salvar</button></div></form></Modal>}
    {sb && <Modal title="Assinante" onClose={() => setSb(null)}><form onSubmit={async (e) => { e.preventDefault(); await saveSub(sb); setSb(null) }}>
      <Field label="Paciente"><select className="input" value={sb.patient_id} onChange={(e) => setSb({ ...sb, patient_id: e.target.value })}>{pt.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></Field>
      <Field label="Plano"><select className="input" value={sb.plan_id} onChange={(e) => setSb({ ...sb, plan_id: e.target.value })}>{planos.map((p) => <option key={p.id} value={p.id}>{p.nome} — {brl(p.valor)}</option>)}</select></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Início"><input type="date" className="input" value={sb.inicio} onChange={(e) => setSb({ ...sb, inicio: e.target.value })} /></Field><Field label="Situação"><select className="input" value={sb.status} onChange={(e) => setSb({ ...sb, status: e.target.value })}><option>ativo</option><option>pausado</option><option>cancelado</option></select></Field></div>
      <div className="flex justify-between">{sb.id ? <button type="button" className="btn btn-danger" onClick={async () => { if (await ask('Remover assinante?')) { await rmSub(sb.id); setSb(null) } }}>Remover</button> : <span />}<button className="btn btn-primary">Salvar</button></div></form></Modal>}
  </>)
}
