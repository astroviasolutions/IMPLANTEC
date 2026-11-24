import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTable, db, DEMO } from '../lib/db'
import { Modal, Field, PageHead } from '../components/ui'
import { brl } from '../lib/util'
function Lista({ titulo, tabela, vazio, campos, render }) {
  const { rows, save, remove } = useTable(tabela), [e, setE] = useState(null)
  return (<section className="mb-8">
    <div className="flex items-center justify-between mb-2"><h2 className="font-bold">{titulo}</h2><button className="btn btn-ghost !py-1.5" onClick={() => setE({ ...vazio })}><Plus size={14} />Adicionar</button></div>
    <div className="card divide-y divide-line">{rows.map((r) => <button key={r.id} onClick={() => setE(r)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between gap-3 text-sm">{render(r)}</button>)}</div>
    {e && <Modal title={titulo} onClose={() => setE(null)}><form onSubmit={async (x) => { x.preventDefault(); await save(e); setE(null) }}>
      {campos.map(([k, l, tipo, opts]) => <Field key={k} label={l}>{opts ? <select className="input" value={e[k]} onChange={(x) => setE({ ...e, [k]: x.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</select> : <input className="input" required={tipo !== 'opt'} type={tipo === 'number' ? 'number' : tipo === 'color' ? 'color' : 'text'} step="any" value={e[k] ?? ''} onChange={(x) => setE({ ...e, [k]: tipo === 'number' ? Number(x.target.value) : x.target.value })} />}</Field>)}
      <div className="flex justify-between"><button type="button" className="btn btn-danger" onClick={async () => { if (e.id && confirm('Remover? Consultas antigas ficam sem este vínculo.')) { await remove(e.id); setE(null) } else if (!e.id) setE(null) }}>{e.id ? 'Remover' : 'Cancelar'}</button><button className="btn btn-primary">Salvar</button></div></form></Modal>}
  </section>)
}
export default function Config() {
  return (<>
    <PageHead title="Configurações" sub="Equipe e catálogo de procedimentos" />
    <Lista titulo="Profissionais" tabela="dentists" vazio={{ nome: '', cro: '', especialidade: '', comissao_pct: 30, cor: '#0e7490', ativo: true }}
      campos={[['nome', 'Nome'], ['cro', 'CRO', 'opt'], ['especialidade', 'Especialidade', 'opt'], ['comissao_pct', 'Comissão (%)', 'number'], ['cor', 'Cor na agenda', 'color']]}
      render={(d) => <><span><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: d.cor }} /><b>{d.nome}</b> <span className="text-slate-500">{d.especialidade}</span></span><span className="text-slate-500">{d.comissao_pct}%</span></>} />
    <Lista titulo="Procedimentos" tabela="services" vazio={{ nome: '', categoria: 'Clínica', duracao_min: 30, preco: 0, ativo: true }}
      campos={[['nome', 'Nome'], ['categoria', 'Categoria', 'opt'], ['duracao_min', 'Duração (min)', 'number'], ['preco', 'Preço (R$)', 'number']]}
      render={(s) => <><span><b>{s.nome}</b> <span className="text-slate-500">{s.categoria} · {s.duracao_min}min</span></span><b>{brl(s.preco)}</b></>} />
    {DEMO && <button className="btn btn-danger" onClick={() => confirm('Apagar todos os dados de demonstração?') && db.reset()}>Resetar dados de demonstração</button>}
  </>)
}
