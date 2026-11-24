import { useState } from 'react'
import { Plus, Minus, AlertTriangle } from 'lucide-react'
import { useTable } from '../lib/db'
import { ask } from '../lib/dialog'
import { Modal, Field, PageHead, Empty } from '../components/ui'
export default function Estoque() {
  const { rows, save, remove } = useTable('stock_items'), [e, setE] = useState(null)
  const baixos = rows.filter((r) => r.qtd <= r.minimo).length
  const ajusta = (r, n) => save({ ...r, qtd: Math.max(0, Number(r.qtd) + n) })
  return (<>
    <PageHead title="Estoque" sub="Materiais e insumos da clínica"><button className="btn btn-primary" onClick={() => setE({ nome: '', unidade: 'un', qtd: 0, minimo: 1 })}><Plus size={16} />Novo item</button></PageHead>
    {baixos > 0 && <div role="status" className="card p-3.5 mb-4 border-amber-300 bg-amber-50 text-sm flex items-center gap-2"><AlertTriangle size={18} className="text-amber-700" /><b>{baixos} {baixos === 1 ? 'item' : 'itens'} no mínimo ou abaixo.</b> Reponha antes de faltar.</div>}
    {rows.length === 0 ? <div className="card"><Empty>Nenhum item cadastrado.</Empty></div> : <div className="card divide-y divide-line">{[...rows].sort((a, b) => a.nome.localeCompare(b.nome)).map((r) => { const baixo = r.qtd <= r.minimo; return (
      <div key={r.id} className="px-4 py-3 flex items-center gap-3"><button className="flex-1 min-w-0 text-left" onClick={() => setE(r)}><b className="block truncate">{r.nome}</b><span className="text-xs text-slate-500">mínimo {r.minimo} {r.unidade}</span></button>
        {baixo && <span className="chip bg-rose-100 text-rose-800">repor</span>}
        <div className="flex items-center gap-1"><button className="btn btn-ghost !p-2" aria-label={`Retirar 1 de ${r.nome}`} onClick={() => ajusta(r, -1)}><Minus size={15} /></button><span className="w-14 text-center font-extrabold tabular-nums">{r.qtd}<span className="text-[10px] font-normal text-slate-500 ml-0.5">{r.unidade}</span></span><button className="btn btn-ghost !p-2" aria-label={`Adicionar 1 de ${r.nome}`} onClick={() => ajusta(r, 1)}><Plus size={15} /></button></div></div>) })}</div>}
    {e && <Modal title="Item de estoque" onClose={() => setE(null)}><form onSubmit={async (x) => { x.preventDefault(); await save(e); setE(null) }}>
      <Field label="Nome"><input className="input" required value={e.nome} onChange={(x) => setE({ ...e, nome: x.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-3"><Field label="Unidade"><input className="input" required value={e.unidade} onChange={(x) => setE({ ...e, unidade: x.target.value })} /></Field>
        <Field label="Quantidade"><input type="number" min="0" className="input" value={e.qtd} onChange={(x) => setE({ ...e, qtd: Number(x.target.value) })} /></Field>
        <Field label="Mínimo"><input type="number" min="0" className="input" value={e.minimo} onChange={(x) => setE({ ...e, minimo: Number(x.target.value) })} /></Field></div>
      <div className="flex justify-between">{e.id ? <button type="button" className="btn btn-danger" onClick={async () => { if (await ask('Remover este item?')) { await remove(e.id); setE(null) } }}>Remover</button> : <span />}<button className="btn btn-primary">Salvar</button></div></form></Modal>}
  </>)
}
