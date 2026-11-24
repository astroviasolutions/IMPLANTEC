import { useState } from 'react'
import { Plus, Copy, Trash2 } from 'lucide-react'
import { ask, notify } from '../lib/dialog'
import { useTable, db, DEMO } from '../lib/db'
import { useClinica, DEFAULTS } from '../lib/settings'
import { Modal, Field, PageHead } from '../components/ui'
import { brl } from '../lib/util'

const TABELAS = ['dentists', 'services', 'patients', 'appointments', 'budgets', 'payments', 'expenses', 'notices', 'signed_terms', 'stock_items', 'plans', 'subscriptions', 'settings']
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function Lista({ titulo, tabela, vazio, campos, render }) {
  const { rows, save, remove } = useTable(tabela), [e, setE] = useState(null)
  return (<section>
    <div className="flex items-center justify-between mb-2"><h2 className="font-bold">{titulo}</h2><button className="btn btn-ghost !py-1.5" onClick={() => setE({ ...vazio })}><Plus size={14} />Adicionar</button></div>
    <div className="card divide-y divide-line">{rows.map((r) => <button key={r.id} onClick={() => setE(r)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between gap-3 text-sm ${r.ativo === false ? 'opacity-50' : ''}`}>{render(r)}</button>)}</div>
    {e && <Modal title={titulo} onClose={() => setE(null)}><form onSubmit={async (x) => { x.preventDefault(); await save(e); setE(null) }}>
      {campos.map(([k, l, tipo]) => tipo === 'bool'
        ? <label key={k} className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" checked={e[k] !== false} onChange={(x) => setE({ ...e, [k]: x.target.checked })} />{l}</label>
        : <Field key={k} label={l}><input className="input" required={tipo !== 'opt'} type={tipo === 'number' ? 'number' : tipo === 'color' ? 'color' : 'text'} step="any" value={e[k] ?? ''} onChange={(x) => setE({ ...e, [k]: tipo === 'number' ? Number(x.target.value) : x.target.value })} /></Field>)}
      <div className="flex justify-between"><button type="button" className="btn btn-danger" onClick={async () => { if (e.id) { if (await ask('Remover? Consultas antigas ficam sem este vínculo.')) { await remove(e.id); setE(null) } } else setE(null) }}>{e.id ? 'Remover' : 'Cancelar'}</button><button className="btn btn-primary">Salvar</button></div></form></Modal>}
  </section>)
}

function Clinica({ cfg, saveCfg }) {
  const [f, setF] = useState(cfg), set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })
  return (<form onSubmit={async (e) => { e.preventDefault(); await saveCfg(f); notify('Dados da clínica salvos.') }} className="card p-5 max-w-2xl">
    <Field label="Nome da clínica"><input className="input" required value={f.nome} onChange={set('nome')} /></Field>
    <div className="grid sm:grid-cols-2 gap-x-3"><Field label="WhatsApp da clínica"><input className="input" inputMode="tel" value={f.whatsapp} onChange={set('whatsapp')} /></Field>
      <Field label="Retorno após (meses sem consulta)"><input className="input" type="number" min="1" max="36" value={f.retorno_meses} onChange={set('retorno_meses')} /></Field></div>
    <Field label="Endereço (aparece no site)"><input className="input" value={f.endereco} onChange={set('endereco')} /></Field>
    <label className="flex items-center gap-2 text-sm mb-4"><input type="checkbox" checked={f.estoque_alerta} onChange={(e) => setF({ ...f, estoque_alerta: e.target.checked })} />Avisar no painel quando o estoque ficar abaixo do mínimo</label>
    <button className="btn btn-primary">Salvar</button></form>)
}

function Online({ cfg, saveCfg }) {
  const [f, setF] = useState(cfg), [b, setB] = useState({ data: '', motivo: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })
  const toggle = (d) => setF({ ...f, dias: f.dias.includes(d) ? f.dias.filter((x) => x !== d) : [...f.dias, d].sort() })
  return (<form onSubmit={async (e) => { e.preventDefault(); await saveCfg(f); notify('Regras de agendamento salvas.') }} className="card p-5 max-w-2xl">
    <label className="flex items-center gap-2 font-semibold mb-4"><input type="checkbox" checked={f.online_ativo} onChange={(e) => setF({ ...f, online_ativo: e.target.checked })} />Agendamento online ligado</label>
    <div className="label">Dias de atendimento</div>
    <div className="flex gap-1.5 mb-4 flex-wrap">{DIAS.map((l, d) => <button type="button" key={d} onClick={() => toggle(d)} aria-pressed={f.dias.includes(d)} className={`btn !px-3 !py-1.5 ${f.dias.includes(d) ? 'btn-primary' : 'btn-ghost'}`}>{l}</button>)}</div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3">
      <Field label="Abre"><input type="time" className="input" value={f.abre} onChange={set('abre')} /></Field><Field label="Fecha"><input type="time" className="input" value={f.fecha} onChange={set('fecha')} /></Field>
      <Field label="Almoço de"><input type="time" className="input" value={f.almoco_ini} onChange={set('almoco_ini')} /></Field><Field label="Almoço até"><input type="time" className="input" value={f.almoco_fim} onChange={set('almoco_fim')} /></Field></div>
    <div className="grid sm:grid-cols-3 gap-x-3">
      <Field label="Intervalo entre horários"><select className="input" value={f.intervalo} onChange={set('intervalo')}>{[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} min</option>)}</select></Field>
      <Field label="Antecedência mínima (horas)"><input type="number" min="0" max="72" className="input" value={f.antecedencia_h} onChange={set('antecedencia_h')} /></Field>
      <Field label="Abrir agenda para (dias)"><input type="number" min="7" max="90" className="input" value={f.janela_dias} onChange={set('janela_dias')} /></Field></div>
    <div className="label">Feriados e dias bloqueados</div>
    <div className="flex gap-2 mb-2 flex-wrap"><input type="date" className="input !w-auto" aria-label="Data" value={b.data} onChange={(e) => setB({ ...b, data: e.target.value })} /><input className="input !w-auto flex-1 min-w-[140px]" placeholder="Motivo (opcional)" value={b.motivo} onChange={(e) => setB({ ...b, motivo: e.target.value })} />
      <button type="button" className="btn btn-ghost" disabled={!b.data} onClick={() => { setF({ ...f, bloqueios: [...f.bloqueios.filter((x) => x.data !== b.data), b].sort((x, y) => x.data.localeCompare(y.data)) }); setB({ data: '', motivo: '' }) }}>Bloquear</button></div>
    <ul className="mb-4 text-sm">{f.bloqueios.map((x) => <li key={x.data} className="flex justify-between py-1.5 border-b border-line"><span>{new Date(x.data + 'T12:00').toLocaleDateString('pt-BR')} {x.motivo && <span className="text-slate-500">· {x.motivo}</span>}</span><button type="button" aria-label="Remover bloqueio" onClick={() => setF({ ...f, bloqueios: f.bloqueios.filter((y) => y.data !== x.data) })}><Trash2 size={15} className="text-rose-700" /></button></li>)}</ul>
    <button className="btn btn-primary">Salvar regras</button></form>)
}

function Mensagens({ cfg, saveCfg }) {
  const [f, setF] = useState(cfg)
  const campos = [['msg_confirma', 'Confirmação de consulta', '{nome} {procedimento} {clinica} {data} {hora}'], ['msg_retorno', 'Chamada de retorno', '{nome} {clinica}'], ['msg_aniversario', 'Aniversário', '{nome} {clinica}']]
  return (<form onSubmit={async (e) => { e.preventDefault(); await saveCfg(f); notify('Mensagens salvas.') }} className="card p-5 max-w-2xl">
    {campos.map(([k, l, v]) => <Field key={k} label={l}><textarea rows={3} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /><span className="text-[11px] text-slate-500">Variáveis: {v}</span></Field>)}
    <div className="flex gap-2"><button className="btn btn-primary">Salvar</button><button type="button" className="btn btn-ghost" onClick={() => setF({ ...f, msg_confirma: DEFAULTS.msg_confirma, msg_retorno: DEFAULTS.msg_retorno, msg_aniversario: DEFAULTS.msg_aniversario })}>Restaurar padrão</button></div></form>)
}

function Dados() {
  const [txt, setTxt] = useState('')
  const exportar = async () => { const o = {}; for (const t of TABELAS) o[t] = await db.list(t); const j = JSON.stringify(o); setTxt(j); try { await navigator.clipboard.writeText(j); notify('Backup copiado.') } catch { notify('Backup gerado abaixo. Copie o texto.') } }
  const importar = async () => {
    let o; try { o = JSON.parse(txt) } catch { return notify('Texto inválido. Cole um backup completo.') }
    if (!(await ask('Importar este backup? Registros com o mesmo ID serão sobrescritos.'))) return
    let n = 0; for (const t of TABELAS) for (const r of o[t] || []) { await db.upsert(t, r); n++ } notify(`${n} registros importados.`)
  }
  return (<div className="card p-5 max-w-2xl">
    <h2 className="font-bold mb-1">Backup dos dados</h2><p className="text-sm text-slate-500 mb-3">Copie tudo (pacientes, consultas, financeiro) como texto e guarde em local seguro. Contém dados de saúde: não envie por canais abertos.</p>
    <div className="flex gap-2 mb-3 flex-wrap"><button className="btn btn-primary" onClick={exportar}><Copy size={15} />Gerar e copiar backup</button><button className="btn btn-ghost" disabled={!txt.trim()} onClick={importar}>Importar do texto abaixo</button></div>
    <textarea className="input font-mono text-xs" rows={6} aria-label="Backup" placeholder="O backup aparece aqui. Para importar, cole um backup e use o botão." value={txt} onChange={(e) => setTxt(e.target.value)} />
    {DEMO && <button className="btn btn-danger mt-4" onClick={async () => (await ask('Apagar todos os dados de demonstração e voltar ao exemplo?')) && db.reset()}>Resetar dados de demonstração</button>}</div>)
}

const ABAS = [['clinica', 'Clínica'], ['online', 'Agendamento online'], ['msg', 'Mensagens'], ['equipe', 'Equipe'], ['proc', 'Procedimentos'], ['dados', 'Dados']]
export default function Config() {
  const [aba, setAba] = useState('clinica'), { cfg, loading, saveCfg } = useClinica()
  return (<>
    <PageHead title="Configurações" sub="Regras da clínica, equipe e catálogo" />
    <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" role="tablist">{ABAS.map(([k, l]) => <button key={k} role="tab" aria-selected={aba === k} onClick={() => setAba(k)} className={`btn !py-1.5 whitespace-nowrap ${aba === k ? 'btn-primary' : 'btn-ghost'}`}>{l}</button>)}</div>
    {!loading && aba === 'clinica' && <Clinica key="c" cfg={cfg} saveCfg={saveCfg} />}
    {!loading && aba === 'online' && <Online key="o" cfg={cfg} saveCfg={saveCfg} />}
    {!loading && aba === 'msg' && <Mensagens key="m" cfg={cfg} saveCfg={saveCfg} />}
    {aba === 'equipe' && <Lista titulo="Profissionais" tabela="dentists" vazio={{ nome: '', cro: '', especialidade: '', comissao_pct: 30, cor: '#0e4a7b', ativo: true }}
      campos={[['nome', 'Nome'], ['cro', 'CRO', 'opt'], ['especialidade', 'Especialidade', 'opt'], ['comissao_pct', 'Comissão (%)', 'number'], ['cor', 'Cor na agenda', 'color'], ['ativo', 'Ativo (aparece no agendamento online)', 'bool']]}
      render={(d) => <><span><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: d.cor }} /><b>{d.nome}</b> <span className="text-slate-500">{d.especialidade} {d.cro}</span></span><span className="text-slate-500">{d.comissao_pct}%</span></>} />}
    {aba === 'proc' && <Lista titulo="Procedimentos" tabela="services" vazio={{ nome: '', categoria: 'Clínica', duracao_min: 30, preco: 0, ativo: true }}
      campos={[['nome', 'Nome'], ['categoria', 'Categoria', 'opt'], ['duracao_min', 'Duração (min)', 'number'], ['preco', 'Preço (R$)', 'number'], ['ativo', 'Ativo (aparece no agendamento online)', 'bool']]}
      render={(s) => <><span><b>{s.nome}</b> <span className="text-slate-500">{s.categoria} · {s.duracao_min}min</span></span><b>{brl(s.preco)}</b></>} />}
    {aba === 'dados' && <Dados />}
  </>)
}
