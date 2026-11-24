import { ask, notify } from '../lib/dialog'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTable } from '../lib/db'
import { Modal, Field, PageHead, Empty } from '../components/ui'
export default function Avisos() {
  const { rows, save, remove } = useTable('notices'), [n, setN] = useState(null)
  return (<>
    <PageHead title="Avisos" sub="Aparecem no topo do site de agendamento"><button className="btn btn-primary" onClick={() => setN({ titulo: '', texto: '', ativo: true })}><Plus size={16} />Novo aviso</button></PageHead>
    {rows.length === 0 ? <div className="card"><Empty>Nenhum aviso.</Empty></div> : <div className="card divide-y divide-line">{rows.map((a) => <div key={a.id} className="px-4 py-3 flex items-center gap-3"><button className="flex-1 text-left" onClick={() => setN(a)}><b>{a.titulo}</b><span className="block text-sm text-slate-500">{a.texto}</span></button>
      <label className="text-xs flex items-center gap-1.5"><input type="checkbox" checked={a.ativo} onChange={(e) => save({ ...a, ativo: e.target.checked })} />ativo</label><button className="text-xs text-rose-700" onClick={async () => await ask('Remover aviso?') && remove(a.id)}>remover</button></div>)}</div>}
    {n && <Modal title="Aviso" onClose={() => setN(null)}><form onSubmit={async (e) => { e.preventDefault(); await save(n); setN(null) }}>
      <Field label="Título"><input className="input" required value={n.titulo} onChange={(e) => setN({ ...n, titulo: e.target.value })} /></Field>
      <Field label="Texto"><textarea rows={3} className="input" value={n.texto} onChange={(e) => setN({ ...n, texto: e.target.value })} /></Field><button className="btn btn-primary w-full">Salvar</button></form></Modal>}
  </>)
}
