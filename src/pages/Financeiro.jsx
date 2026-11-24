import { ask, notify } from '../lib/dialog'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTable } from '../lib/db'
import { Modal, Field, PageHead, Empty, Stat } from '../components/ui'
import { brl, ymd } from '../lib/util'
export default function Financeiro() {
  const { rows: pay } = useTable('payments'), { rows: ex, save, remove } = useTable('expenses')
  const [mes, setMes] = useState(ymd(new Date()).slice(0, 7)), [n, setN] = useState(null)
  const r = pay.filter((p) => ymd(new Date(p.data)).startsWith(mes)).reduce((s, p) => s + Number(p.valor), 0)
  const dm = ex.filter((e) => (e.data || '').startsWith(mes)).sort((a, b) => b.data.localeCompare(a.data)), d = dm.reduce((s, e) => s + Number(e.valor), 0), l = r - d
  return (<>
    <PageHead title="Financeiro" sub="Receitas e despesas do mês"><button className="btn btn-primary" onClick={() => setN({ descricao: '', categoria: 'Fixa', valor: '', data: ymd(new Date()) })}><Plus size={16} />Nova despesa</button></PageHead>
    <input type="month" className="input !w-auto mb-4" value={mes} onChange={(e) => setMes(e.target.value)} />
    <div className="grid grid-cols-3 gap-3 mb-5"><Stat label="Receita" value={brl(r)} accent="text-emerald-700" /><Stat label="Despesas" value={brl(d)} accent="text-rose-700" /><Stat label="Resultado" value={brl(l)} accent={l >= 0 ? 'text-ink' : 'text-rose-700'} /></div>
    {dm.length === 0 ? <div className="card"><Empty>Sem despesas neste mês.</Empty></div> : <div className="card divide-y divide-line">{dm.map((e) => <div key={e.id} className="px-4 py-3 flex items-center gap-3"><span className="flex-1"><b>{e.descricao}</b><span className="block text-xs text-slate-500">{e.categoria} · {new Date(e.data + 'T12:00').toLocaleDateString('pt-BR')}</span></span><b>{brl(e.valor)}</b><button className="text-xs text-rose-700" onClick={async () => await ask('Remover despesa?') && remove(e.id)}>remover</button></div>)}</div>}
    {n && <Modal title="Nova despesa" onClose={() => setN(null)}><form onSubmit={async (e) => { e.preventDefault(); await save({ ...n, valor: Number(n.valor) }); setN(null) }}>
      <Field label="Descrição"><input className="input" required value={n.descricao} onChange={(e) => setN({ ...n, descricao: e.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-3"><Field label="Categoria"><select className="input" value={n.categoria} onChange={(e) => setN({ ...n, categoria: e.target.value })}>{['Fixa', 'Materiais', 'Laboratório', 'Equipe', 'Marketing', 'Impostos', 'Outros'].map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Valor"><input className="input" required type="number" step="0.01" min="0.01" value={n.valor} onChange={(e) => setN({ ...n, valor: e.target.value })} /></Field>
        <Field label="Data"><input className="input" required type="date" value={n.data} onChange={(e) => setN({ ...n, data: e.target.value })} /></Field></div>
      <button className="btn btn-primary w-full">Salvar</button></form></Modal>}
  </>)
}
