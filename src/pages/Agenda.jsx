import { ask, notify } from '../lib/dialog'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, MessageCircle } from 'lucide-react'
import { useTable } from '../lib/db'
import { Modal, Field, PageHead, Empty } from '../components/ui'
import { hm, ymd, mkDate, STATUS, waLink, fmtDia } from '../lib/util'
import { useClinica, fill } from '../lib/settings'

export default function Agenda() {
  const { rows: ap, save, remove } = useTable('appointments'), { rows: pt, save: savePt } = useTable('patients'), { rows: sv } = useTable('services'), { rows: dn } = useTable('dentists')
  const { cfg } = useClinica(), [modo, setModo] = useState('dia'), [dia, setDia] = useState(ymd(new Date())), [fDent, setFDent] = useState(''), [edit, setEdit] = useState(null)
  const PROX = { agendado: ['confirmado', 'Confirmar'], confirmado: ['em_atendimento', 'Iniciar'], em_atendimento: ['concluido', 'Concluir'] }
  const mover = (n) => { const d = new Date(dia + 'T12:00'); d.setDate(d.getDate() + n * (modo === 'semana' ? 7 : 1)); setDia(ymd(d)) }
  const semana = useMemo(() => { const d = new Date(dia + 'T12:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return ymd(x) }) }, [dia])
  const lista = useMemo(() => ap.filter((a) => ymd(new Date(a.inicio)) === dia && (!fDent || a.dentist_id === fDent)).sort((a, b) => a.inicio.localeCompare(b.inicio)), [ap, dia, fDent])
  const info = (a) => { const p = pt.find((x) => x.id === a.patient_id); return { nome: p?.nome || a.nome_externo || '—', tel: p?.whatsapp || a.whatsapp_externo } }
  const novo = () => setEdit({ dia, hora: '09:00', dentist_id: fDent || dn[0]?.id, service_id: sv[0]?.id, status: 'agendado', patient_id: '', nome_externo: '', whatsapp_externo: '' })
  const abrir = (a) => setEdit({ ...a, dia: ymd(new Date(a.inicio)), hora: hm(new Date(a.inicio)) })

  const salvar = async (e) => {
    e.preventDefault()
    const s = sv.find((x) => x.id === edit.service_id), ini = mkDate(edit.dia, edit.hora), fim = new Date(ini.getTime() + (s?.duracao_min || 30) * 60000)
    const choque = ap.find((a) => a.id !== edit.id && a.dentist_id === edit.dentist_id && !['cancelado', 'faltou'].includes(a.status) && ini < new Date(a.fim) && fim > new Date(a.inicio))
    if (choque && !await ask('Esse profissional já tem consulta nesse horário. Agendar mesmo assim?')) return
    let patient_id = edit.patient_id || null
    if (!patient_id && edit.nome_externo && edit.converter) { const p = await savePt({ nome: edit.nome_externo, whatsapp: edit.whatsapp_externo, anamnese: {}, odontograma: {} }); patient_id = p.id }
    const { dia: _d, hora: _h, converter: _c, ...row } = edit
    await save({ ...row, patient_id, inicio: ini.toISOString(), fim: fim.toISOString() }); setEdit(null)
  }
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  return (<>
    <PageHead title="Agenda" sub={fmtDia(dia + 'T12:00')}>
      <div className="flex rounded-xl border border-line overflow-hidden bg-white" role="group" aria-label="Visão">{[['dia', 'Dia'], ['semana', 'Semana']].map(([k, l]) => <button key={k} aria-pressed={modo === k} onClick={() => setModo(k)} className={`px-3 py-2 text-sm font-semibold ${modo === k ? 'bg-ink text-white' : ''}`}>{l}</button>)}</div>
      <button className="btn btn-primary" onClick={novo}><Plus size={16} />Nova consulta</button>
    </PageHead>
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <button className="btn btn-ghost !p-2" onClick={() => mover(-1)} aria-label="Dia anterior"><ChevronLeft size={18} /></button>
      <input type="date" className="input !w-auto" value={dia} onChange={(e) => setDia(e.target.value)} />
      <button className="btn btn-ghost !p-2" onClick={() => mover(1)} aria-label="Próximo dia"><ChevronRight size={18} /></button>
      <button className="btn btn-ghost" onClick={() => setDia(ymd(new Date()))}>Hoje</button>
      <select className="input !w-auto" value={fDent} onChange={(e) => setFDent(e.target.value)} aria-label="Profissional"><option value="">Todos os profissionais</option>{dn.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</select>
    </div>
    {modo === 'semana' && <div className="grid grid-cols-2 md:grid-cols-7 gap-2">{semana.map((dd) => { const l = ap.filter((a) => ymd(new Date(a.inicio)) === dd && !['cancelado'].includes(a.status) && (!fDent || a.dentist_id === fDent)).sort((a, b) => a.inicio.localeCompare(b.inicio)); return (
      <div key={dd} className={`card p-2 min-h-[120px] ${dd === ymd(new Date()) ? 'border-brand' : ''}`}><button className="w-full text-left text-xs font-bold uppercase text-slate-500 mb-1.5" onClick={() => { setDia(dd); setModo('dia') }}>{new Date(dd + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })} <span className="chip bg-slate-100 text-slate-600 ml-1">{l.length}</span></button>
        {l.map((a) => <button key={a.id} onClick={() => abrir(a)} className="block w-full text-left text-xs rounded-md px-1.5 py-1 mb-1 text-white truncate" style={{ background: dn.find((x) => x.id === a.dentist_id)?.cor }}>{hm(new Date(a.inicio))} {info(a).nome.split(' ')[0]}</button>)}</div>) })}</div>}
    {modo === 'dia' && (lista.length === 0 ? <div className="card"><Empty>Sem consultas neste dia.</Empty></div> : (
      <div className="grid gap-2">{lista.map((a) => { const i = info(a), d = dn.find((x) => x.id === a.dentist_id), s = sv.find((x) => x.id === a.service_id); return (
        <div key={a.id} className="card p-3.5 flex items-center gap-3 rise">
          <div className="w-14 text-center"><div className="font-extrabold">{hm(new Date(a.inicio))}</div><div className="text-[11px] text-slate-500">{hm(new Date(a.fim))}</div></div>
          <div className="w-1.5 self-stretch rounded" style={{ background: d?.cor }} />
          <button className="flex-1 min-w-0 text-left" onClick={() => abrir(a)}><b className="block truncate">{i.nome} {a.origem === 'site' && <span className="chip bg-gold/25 text-amber-900 ml-1">site</span>}</b><span className="text-xs text-slate-500">{s?.nome} · {d?.nome}</span></button>
          <span className={`chip ${STATUS[a.status][1]} hidden sm:inline-block`}>{STATUS[a.status][0]}</span>
          {PROX[a.status] && <button className="btn btn-ghost !py-1.5 !px-2.5 text-xs" onClick={() => save({ ...a, status: PROX[a.status][0] })}>{PROX[a.status][1]}</button>}
          {i.tel && <a className="btn btn-ghost !p-2" aria-label="Chamar no WhatsApp" target="_blank" rel="noreferrer" href={waLink(i.tel, fill(cfg.msg_confirma, { nome: i.nome.split(' ')[0], procedimento: s?.nome, clinica: cfg.nome, data: fmtDia(a.inicio), hora: hm(new Date(a.inicio)) }))}><MessageCircle size={18} /></a>}
        </div>) })}</div>))}
    {edit && <Modal title={edit.id ? 'Editar consulta' : 'Nova consulta'} onClose={() => setEdit(null)}>
      <form onSubmit={salvar}>
        <Field label="Paciente"><select className="input" value={edit.patient_id || ''} onChange={set('patient_id')}><option value="">— Pessoa avulsa (sem ficha) —</option>{[...pt].sort((a, b) => a.nome.localeCompare(b.nome)).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></Field>
        {!edit.patient_id && <div className="grid grid-cols-2 gap-3"><Field label="Nome"><input className="input" required value={edit.nome_externo || ''} onChange={set('nome_externo')} /></Field><Field label="WhatsApp"><input className="input" required inputMode="tel" value={edit.whatsapp_externo || ''} onChange={set('whatsapp_externo')} /></Field>
          <label className="col-span-2 flex items-center gap-2 text-sm -mt-1 mb-3"><input type="checkbox" checked={!!edit.converter} onChange={(e) => setEdit({ ...edit, converter: e.target.checked })} />Criar ficha de paciente com esses dados</label></div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Profissional"><select className="input" value={edit.dentist_id} onChange={set('dentist_id')}>{dn.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</select></Field>
          <Field label="Procedimento"><select className="input" value={edit.service_id} onChange={set('service_id')}>{sv.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.duracao_min}min)</option>)}</select></Field>
          <Field label="Data"><input type="date" className="input" required value={edit.dia} onChange={set('dia')} /></Field>
          <Field label="Hora"><input type="time" step="900" className="input" required value={edit.hora} onChange={set('hora')} /></Field>
        </div>
        <Field label="Status"><select className="input" value={edit.status} onChange={set('status')}>{Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Field label="Observações"><textarea className="input" rows={2} value={edit.observacoes || ''} onChange={set('observacoes')} /></Field>
        <div className="flex gap-2 justify-between mt-2">
          {edit.id ? <button type="button" className="btn btn-danger" onClick={async () => { if (await ask('Excluir esta consulta?')) { await remove(edit.id); setEdit(null) } }}>Excluir</button> : <span />}
          <button className="btn btn-primary">Salvar</button>
        </div>
      </form></Modal>}
  </>)
}
