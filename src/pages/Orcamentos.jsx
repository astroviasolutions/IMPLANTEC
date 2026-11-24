import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTable } from '../lib/db'
import { Modal, Field, PageHead, Empty } from '../components/ui'
import { brl } from '../lib/util'
const ST = { aberto: ['Aberto', 'bg-amber-100 text-amber-800'], aprovado: ['Aprovado', 'bg-emerald-100 text-emerald-800'], recusado: ['Recusado', 'bg-rose-100 text-rose-800'], concluido: ['Concluído', 'bg-sky-100 text-sky-800'] }
export const totalOrc = (b) => Math.max(0, (b.itens || []).reduce((s, i) => s + i.qtd * i.valor, 0) - Number(b.desconto || 0))
export default function Orcamentos() {
  const { rows, save, remove } = useTable('budgets'), { rows: pt } = useTable('patients'), { rows: sv } = useTable('services'), { rows: dn } = useTable('dentists')
  const [b, setB] = useState(null)
  const add = (sid) => { const s = sv.find((x) => x.id === sid); if (s) setB({ ...b, itens: [...b.itens, { nome: s.nome, dente: '', qtd: 1, valor: Number(s.preco) }] }) }
  const upd = (i, k, v) => setB({ ...b, itens: b.itens.map((x, j) => (j === i ? { ...x, [k]: v } : x)) })
  return (<>
    <PageHead title="Orçamentos" sub="Planos de tratamento por paciente"><button className="btn btn-primary" onClick={() => setB({ patient_id: pt[0]?.id || '', dentist_id: dn[0]?.id, itens: [], desconto: 0, parcelas: 1, status: 'aberto' })} disabled={!pt.length}><Plus size={16} />Novo orçamento</button></PageHead>
    {!pt.length && <p className="text-sm text-slate-500 mb-3">Cadastre um paciente primeiro.</p>}
    {rows.length === 0 ? <div className="card"><Empty>Nenhum orçamento.</Empty></div> : <div className="card divide-y divide-line">{[...rows].sort((a, c) => (c.criado_em || '').localeCompare(a.criado_em || '')).map((x) => (
      <button key={x.id} onClick={() => setB(x)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3"><span className="flex-1"><b>{pt.find((p) => p.id === x.patient_id)?.nome || '—'}</b><span className="block text-xs text-slate-500">{x.itens.length} item(ns) · {x.parcelas}x</span></span><b>{brl(totalOrc(x))}</b><span className={`chip ${ST[x.status][1]}`}>{ST[x.status][0]}</span></button>))}</div>}
    {b && <Modal wide title={b.id ? 'Orçamento' : 'Novo orçamento'} onClose={() => setB(null)}>
      <form onSubmit={async (e) => { e.preventDefault(); if (!b.itens.length) return alert('Adicione ao menos um procedimento.'); await save({ ...b, criado_em: b.criado_em || new Date().toISOString() }); setB(null) }}>
        <div className="grid sm:grid-cols-2 gap-x-3"><Field label="Paciente"><select className="input" value={b.patient_id} onChange={(e) => setB({ ...b, patient_id: e.target.value })}>{pt.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></Field>
          <Field label="Profissional"><select className="input" value={b.dentist_id} onChange={(e) => setB({ ...b, dentist_id: e.target.value })}>{dn.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</select></Field></div>
        <Field label="Adicionar procedimento"><select className="input" value="" onChange={(e) => add(e.target.value)}><option value="">Selecione…</option>{sv.map((s) => <option key={s.id} value={s.id}>{s.nome} — {brl(s.preco)}</option>)}</select></Field>
        <div className="space-y-2 mb-3">{b.itens.map((i, n) => <div key={n} className="grid grid-cols-[1fr_64px_52px_96px_auto] gap-2 items-center"><span className="text-sm font-semibold truncate">{i.nome}</span>
          <input className="input !p-2" placeholder="Dente" aria-label="Dente" value={i.dente} onChange={(e) => upd(n, 'dente', e.target.value)} /><input className="input !p-2" type="number" min="1" aria-label="Quantidade" value={i.qtd} onChange={(e) => upd(n, 'qtd', Number(e.target.value) || 1)} />
          <input className="input !p-2" type="number" step="0.01" min="0" aria-label="Valor" value={i.valor} onChange={(e) => upd(n, 'valor', Number(e.target.value) || 0)} /><button type="button" className="p-2 text-rose-700" aria-label="Remover" onClick={() => setB({ ...b, itens: b.itens.filter((_, j) => j !== n) })}><Trash2 size={16} /></button></div>)}</div>
        <div className="grid grid-cols-3 gap-3"><Field label="Desconto (R$)"><input className="input" type="number" min="0" step="0.01" value={b.desconto} onChange={(e) => setB({ ...b, desconto: Number(e.target.value) || 0 })} /></Field>
          <Field label="Parcelas"><input className="input" type="number" min="1" max="24" value={b.parcelas} onChange={(e) => setB({ ...b, parcelas: Number(e.target.value) || 1 })} /></Field>
          <Field label="Status"><select className="input" value={b.status} onChange={(e) => setB({ ...b, status: e.target.value })}>{Object.entries(ST).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></Field></div>
        <div className="flex items-center justify-between bg-ink text-white rounded-xl px-4 py-3 mb-3"><span>Total</span><b className="text-xl">{brl(totalOrc(b))}</b></div>
        {b.parcelas > 1 && <p className="text-sm text-slate-500 mb-3">{b.parcelas}x de {brl(totalOrc(b) / b.parcelas)} (sem juros)</p>}
        <div className="flex justify-between">{b.id ? <button type="button" className="btn btn-danger" onClick={async () => { if (confirm('Excluir orçamento?')) { await remove(b.id); setB(null) } }}>Excluir</button> : <span />}<button className="btn btn-primary">Salvar</button></div>
      </form></Modal>}
  </>)
}
