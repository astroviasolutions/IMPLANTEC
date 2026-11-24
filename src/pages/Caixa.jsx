import { ask, notify } from '../lib/dialog'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTable } from '../lib/db'
import { Modal, Field, PageHead, Empty, Stat } from '../components/ui'
import { brl, FORMAS, ymd, hm } from '../lib/util'
export default function Caixa() {
  const { rows: bds } = useTable('budgets'), { rows, save, remove } = useTable('payments'), { rows: pt } = useTable('patients'), { rows: dn } = useTable('dentists')
  const [dia, setDia] = useState(ymd(new Date())), [n, setN] = useState(null)
  const doDia = rows.filter((p) => ymd(new Date(p.data)) === dia).sort((a, b) => b.data.localeCompare(a.data))
  const total = doDia.reduce((s, p) => s + Number(p.valor), 0)
  const porForma = Object.keys(FORMAS).map((k) => [k, doDia.filter((p) => p.forma === k).reduce((s, p) => s + Number(p.valor), 0)]).filter(([, v]) => v > 0)
  return (<>
    <PageHead title="Caixa" sub="Recebimentos do dia"><button className="btn btn-primary" onClick={() => setN({ valor: '', forma: 'pix', patient_id: '', budget_id: '', dentist_id: dn[0]?.id, obs: '' })}><Plus size={16} />Novo recebimento</button></PageHead>
    <input type="date" className="input !w-auto mb-4" value={dia} onChange={(e) => setDia(e.target.value)} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"><Stat label="Total do dia" value={brl(total)} accent="text-emerald-700" />{porForma.map(([k, v]) => <Stat key={k} label={FORMAS[k]} value={brl(v)} />)}</div>
    {doDia.length === 0 ? <div className="card"><Empty>Nenhum recebimento neste dia.</Empty></div> : <div className="card divide-y divide-line">{doDia.map((p) => <div key={p.id} className="px-4 py-3 flex items-center gap-3"><span className="text-sm text-slate-500 w-12">{hm(new Date(p.data))}</span><span className="flex-1 min-w-0"><b className="block truncate">{pt.find((x) => x.id === p.patient_id)?.nome || 'Sem paciente'}</b><span className="text-xs text-slate-500">{FORMAS[p.forma]} · {dn.find((d) => d.id === p.dentist_id)?.nome}{p.obs ? ' · ' + p.obs : ''}</span></span><b>{brl(p.valor)}</b><button className="text-xs text-rose-700" onClick={async () => await ask('Remover este lançamento?') && remove(p.id)}>remover</button></div>)}</div>}
    {n && <Modal title="Novo recebimento" onClose={() => setN(null)}>
      <form onSubmit={async (e) => { e.preventDefault(); await save({ ...n, valor: Number(n.valor), patient_id: n.patient_id || null, budget_id: n.budget_id || null, data: new Date().toISOString() }); setN(null) }}>
        <Field label="Paciente"><select className="input" value={n.patient_id} onChange={(e) => setN({ ...n, patient_id: e.target.value, budget_id: '' })}><option value="">—</option>{pt.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></Field>
        {n.patient_id && bds.some((b) => b.patient_id === n.patient_id) && <Field label="Abater de orçamento"><select className="input" value={n.budget_id} onChange={(e) => setN({ ...n, budget_id: e.target.value })}><option value="">— Não vincular —</option>{bds.filter((b) => b.patient_id === n.patient_id).map((b) => <option key={b.id} value={b.id}>{b.itens.map((i) => i.nome).join(', ').slice(0, 40)}</option>)}</select></Field>}
        <div className="grid grid-cols-2 gap-3"><Field label="Valor (R$)"><input className="input" required type="number" step="0.01" min="0.01" value={n.valor} onChange={(e) => setN({ ...n, valor: e.target.value })} /></Field>
          <Field label="Forma"><select className="input" value={n.forma} onChange={(e) => setN({ ...n, forma: e.target.value })}>{Object.entries(FORMAS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field></div>
        <Field label="Profissional (comissão)"><select className="input" value={n.dentist_id} onChange={(e) => setN({ ...n, dentist_id: e.target.value })}>{dn.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</select></Field>
        <Field label="Observação"><input className="input" value={n.obs} onChange={(e) => setN({ ...n, obs: e.target.value })} /></Field>
        <button className="btn btn-primary w-full">Registrar</button></form></Modal>}
  </>)
}
