import { ask, notify } from '../lib/dialog'
import { useEffect, useRef, useState } from 'react'
import { Plus, Search, PenLine } from 'lucide-react'
import { useTable, db, DEMO, supabase } from '../lib/db'
import { Modal, Field, PageHead, Empty } from '../components/ui'
import { digits, waLink, brl, STATUS } from '../lib/util'

const SN = ['', 'Sim', 'Não']
const PERGUNTAS = [
  ['diabetes', 'Diabetes?'], ['hipertensao', 'Hipertensão / problema cardíaco?'], ['anticoagulante', 'Usa anticoagulante?'], ['gravida', 'Gestante ou amamentando?'],
  ['alergia_anestesia', 'Alergia a anestesia?'], ['alergia_medic', 'Alergia a medicamento (penicilina etc.)?'], ['hemorragia', 'Problema de cicatrização / hemorragia?'],
  ['fumante', 'Fumante?'], ['bruxismo', 'Range ou aperta os dentes?'], ['sangra_gengiva', 'Sangramento na gengiva?'], ['cirurgia_previa', 'Cirurgia ou internação recente?'],
]
// Odontograma (FDI)
const SUP = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], INF = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const ST = { saudavel: ['Hígido', '#fff', '#334155'], carie: ['Cárie', '#fecaca', '#991b1b'], restaurado: ['Restaurado', '#bfdbfe', '#1e40af'], canal: ['Canal', '#fde68a', '#92400e'], coroa: ['Coroa', '#e9d5ff', '#6b21a8'], implante: ['Implante', '#a7f3d0', '#065f46'], ausente: ['Ausente', '#e2e8f0', '#64748b'] }
const ORDEM = Object.keys(ST)

function Odonto({ value, onChange }) {
  const [sel, setSel] = useState('carie')
  const Dente = ({ n }) => { const k = value[n] || 'saudavel', [, bg, fg] = ST[k]; return (
    <button type="button" onClick={() => onChange({ ...value, [n]: k === sel ? 'saudavel' : sel })} aria-label={`Dente ${n}: ${ST[k][0]}`} className="flex flex-col items-center gap-0.5">
      <span className="w-[clamp(18px,4.6vw,34px)] h-[clamp(24px,6vw,42px)] rounded-[40%_40%_50%_50%] border-2 grid place-items-center text-[9px] font-bold" style={{ background: bg, borderColor: fg, color: fg, opacity: k === 'ausente' ? .5 : 1 }}>{k === 'ausente' ? '✕' : ''}</span>
      <span className="text-[9px] text-slate-500">{n}</span></button>) }
  return (<div>
    <div className="flex flex-wrap gap-1.5 mb-4">{ORDEM.map((k) => <button type="button" key={k} onClick={() => setSel(k)} className={`chip border ${sel === k ? 'ring-2 ring-brand' : ''}`} style={{ background: ST[k][1], color: ST[k][2], borderColor: ST[k][2] }}>{ST[k][0]}</button>)}</div>
    <p className="text-xs text-slate-500 mb-2">Escolha a condição e toque nos dentes para marcar. Toque de novo para limpar.</p>
    <div className="overflow-x-auto pb-2"><div className="min-w-[320px] space-y-3">
      <div className="flex justify-between gap-0.5">{SUP.map((n) => <Dente key={n} n={n} />)}</div>
      <div className="border-t border-dashed border-line" />
      <div className="flex justify-between gap-0.5">{INF.map((n) => <Dente key={n} n={n} />)}</div></div></div></div>)
}

function Assinatura({ patient, tipo, onSaved }) {
  const ref = useRef(), [draw, setDraw] = useState(false), [has, setHas] = useState(false), [busy, setBusy] = useState(false)
  useEffect(() => { const c = ref.current, r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = 160 * 2; const x = c.getContext('2d'); x.scale(2, 2); x.lineWidth = 2.2; x.lineCap = 'round'; x.strokeStyle = '#0b2a3a' }, [])
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
  const down = (e) => { e.preventDefault(); ref.current.setPointerCapture(e.pointerId); const x = ref.current.getContext('2d'); x.beginPath(); x.moveTo(...pos(e)); setDraw(true) }
  const move = (e) => { if (!draw) return; const x = ref.current.getContext('2d'); x.lineTo(...pos(e)); x.stroke(); setHas(true) }
  const salvar = async () => {
    setBusy(true)
    try {
      const png = ref.current.toDataURL('image/png'); let path = png
      if (!DEMO) { const blob = await (await fetch(png)).blob(); path = `${patient.id}/${Date.now()}.png`; const { error } = await supabase.storage.from('termos').upload(path, blob, { contentType: 'image/png' }); if (error) throw error }
      await db.upsert('signed_terms', { patient_id: patient.id, tipo, arquivo_path: path, criado_em: new Date().toISOString() }); onSaved()
    } catch { notify('Falha ao salvar a assinatura. Tente de novo.') } finally { setBusy(false) }
  }
  return (<div>
    <canvas ref={ref} className="w-full h-40 border-2 border-dashed border-line rounded-xl bg-slate-50 touch-none" onPointerDown={down} onPointerMove={move} onPointerUp={() => setDraw(false)} aria-label="Quadro de assinatura" />
    <div className="flex gap-2 mt-2"><button type="button" className="btn btn-ghost" onClick={() => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); setHas(false) }}>Limpar</button>
      <button type="button" className="btn btn-primary flex-1" disabled={!has || busy} onClick={salvar}>{has ? 'Salvar termo assinado' : 'Salvar (falta assinar)'}</button></div></div>)
}
const TERMOS = {
  'Consentimento para tratamento': 'Declaro que fui informado(a) sobre o diagnóstico, as opções de tratamento, seus riscos, benefícios e alternativas, e autorizo a realização dos procedimentos odontológicos propostos pelo(a) cirurgião(ã)-dentista responsável.',
  'Consentimento para implante / cirurgia': 'Declaro que recebi explicações sobre o procedimento cirúrgico, o pós-operatório, os riscos possíveis (inchaço, sangramento, infecção, falha de osseointegração) e as recomendações de cuidado, e autorizo sua realização.',
  'Uso de imagem': 'Autorizo o uso de fotografias e imagens do meu tratamento para fins de documentação clínica e, se eu assinar abaixo, divulgação educativa, sem identificação do meu nome.',
}

export default function Pacientes() {
  const { rows, save, remove } = useTable('patients'), { rows: terms } = useTable('signed_terms'), { rows: aps } = useTable('appointments'), { rows: pays } = useTable('payments'), { rows: svs } = useTable('services'), { rows: bds } = useTable('budgets')
  const [evo, setEvo] = useState('')
  const [q, setQ] = useState(''), [p, setP] = useState(null), [tab, setTab] = useState('dados'), [termo, setTermo] = useState(Object.keys(TERMOS)[0])
  const lista = rows.filter((x) => (x.nome + digits(x.whatsapp) + (x.cpf || '')).toLowerCase().includes(q.toLowerCase().trim())).sort((a, b) => a.nome.localeCompare(b.nome))
  const novo = () => { setP({ nome: '', whatsapp: '', cpf: '', nascimento: '', email: '', anamnese: {}, odontograma: {}, observacoes: '' }); setTab('dados') }
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value })
  const an = (k) => (e) => setP({ ...p, anamnese: { ...p.anamnese, [k]: e.target.value } })
  const gravar = async (e) => { e?.preventDefault(); if (p.whatsapp && digits(p.whatsapp).length < 10) return notify('WhatsApp precisa de DDD (10+ dígitos).'); const r = await save({ ...p, nascimento: p.nascimento || null }); setP(r) }
  const meus = terms.filter((t) => t.patient_id === p?.id)
  return (<>
    <PageHead title="Pacientes" sub={`${rows.length} cadastrados`}><button className="btn btn-primary" onClick={novo}><Plus size={16} />Novo paciente</button></PageHead>
    <div className="relative mb-4"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className="input !pl-9" placeholder="Buscar por nome, WhatsApp ou CPF" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    {lista.length === 0 ? <div className="card"><Empty>{rows.length ? 'Nenhum resultado.' : 'Nenhum paciente ainda. Toque em "Novo paciente".'}</Empty></div> :
      <div className="card divide-y divide-line">{lista.map((x) => <button key={x.id} onClick={() => { setP(x); setTab('dados') }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between gap-3"><b>{x.nome}</b><span className="text-sm text-slate-500">{x.whatsapp}</span></button>)}</div>}
    {p && <Modal wide title={p.id ? p.nome : 'Novo paciente'} onClose={() => setP(null)}>
      <div className="flex gap-1 mb-4 overflow-x-auto">{[['dados', 'Dados'], ['anamnese', 'Anamnese'], ['odonto', 'Odontograma'], ['hist', 'Histórico'], ['termos', 'Termos']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} disabled={k !== 'dados' && !p.id} className={`btn !py-1.5 ${tab === k ? 'btn-primary' : 'btn-ghost'}`}>{l}</button>)}</div>
      {tab === 'dados' && <form onSubmit={gravar}>
        <div className="grid sm:grid-cols-2 gap-x-3">
          <Field label="Nome completo"><input className="input" required value={p.nome} onChange={set('nome')} /></Field>
          <Field label="WhatsApp"><input className="input" inputMode="tel" value={p.whatsapp || ''} onChange={set('whatsapp')} /></Field>
          <Field label="CPF"><input className="input" inputMode="numeric" value={p.cpf || ''} onChange={set('cpf')} /></Field>
          <Field label="Nascimento"><input type="date" className="input" value={p.nascimento || ''} onChange={set('nascimento')} /></Field>
          <Field label="E-mail"><input type="email" className="input" value={p.email || ''} onChange={set('email')} /></Field>
          <Field label="Queixa principal"><input className="input" value={p.anamnese?.queixa || ''} onChange={an('queixa')} /></Field></div>
        <Field label="Observações"><textarea rows={3} className="input" value={p.observacoes || ''} onChange={set('observacoes')} /></Field>
        <div className="flex justify-between gap-2">
          {p.id ? <button type="button" className="btn btn-danger" onClick={async () => { if (await ask(`Excluir ${p.nome} e todo o histórico? Não dá para desfazer.`)) { await remove(p.id); setP(null) } }}>Excluir</button> : <span />}
          <div className="flex gap-2">{p.whatsapp && <a className="btn btn-ghost" target="_blank" rel="noreferrer" href={waLink(p.whatsapp, `Olá, ${p.nome.split(' ')[0]}!`)}>WhatsApp</a>}<button className="btn btn-primary">Salvar</button></div></div></form>}
      {tab === 'anamnese' && <form onSubmit={gravar}>
        <div className="grid sm:grid-cols-2 gap-x-4">{PERGUNTAS.map(([k, l]) => <Field key={k} label={l}><select className="input" value={p.anamnese?.[k] || ''} onChange={an(k)}>{SN.map((o) => <option key={o} value={o}>{o || '—'}</option>)}</select></Field>)}</div>
        <Field label="Medicamentos em uso"><input className="input" value={p.anamnese?.medicamentos || ''} onChange={an('medicamentos')} /></Field>
        <Field label="Outras condições de saúde"><textarea rows={2} className="input" value={p.anamnese?.outras || ''} onChange={an('outras')} /></Field>
        <button className="btn btn-primary w-full">Salvar anamnese</button></form>}
      {tab === 'odonto' && <><Odonto value={p.odontograma || {}} onChange={(o) => setP({ ...p, odontograma: o })} /><button className="btn btn-primary w-full mt-4" onClick={() => gravar()}>Salvar odontograma</button></>}
      {tab === 'hist' && (() => {
        const mine = aps.filter((a) => a.patient_id === p.id).sort((a, b) => b.inicio.localeCompare(a.inicio)), pg = pays.filter((x) => x.patient_id === p.id), pago = pg.reduce((s, x) => s + Number(x.valor), 0)
        const orc = bds.filter((b) => b.patient_id === p.id && b.status !== 'recusado').reduce((s, b) => s + b.itens.reduce((t, i) => t + i.qtd * i.valor, 0) - (b.desconto || 0), 0)
        const addEvo = async () => { if (!evo.trim()) return; const r = await save({ ...p, evolucoes: [{ id: crypto.randomUUID?.() || String(Date.now()), data: new Date().toISOString(), texto: evo.trim() }, ...(p.evolucoes || [])] }); setP(r); setEvo('') }
        return (<div>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center"><div className="card p-2.5"><div className="label">Consultas</div><b>{mine.length}</b></div><div className="card p-2.5"><div className="label">Já pago</div><b>{brl(pago)}</b></div><div className="card p-2.5"><div className="label">Em orçamentos</div><b>{brl(orc)}</b></div></div>
          <div className="label">Nova evolução clínica</div><textarea rows={3} className="input mb-2" value={evo} onChange={(e) => setEvo(e.target.value)} placeholder="Procedimento realizado, achados, orientações, próximos passos…" /><button className="btn btn-primary mb-5" disabled={!evo.trim()} onClick={addEvo}>Registrar evolução</button>
          {(p.evolucoes || []).map((e) => <div key={e.id} className="border-l-2 border-gold pl-3 mb-3"><div className="text-xs text-slate-500">{new Date(e.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div><p className="text-sm whitespace-pre-wrap">{e.texto}</p></div>)}
          <div className="label mt-4">Consultas</div><ul className="text-sm divide-y divide-line">{mine.map((a) => <li key={a.id} className="py-2 flex justify-between gap-2"><span>{new Date(a.inicio).toLocaleDateString('pt-BR')} · {svs.find((s) => s.id === a.service_id)?.nome}</span><span className="text-slate-500">{STATUS[a.status][0]}</span></li>)}{!mine.length && <li className="py-2 text-slate-500">Nenhuma consulta.</li>}</ul>
        </div>) })()}
      {tab === 'termos' && <div>
        <Field label="Tipo de termo"><select className="input" value={termo} onChange={(e) => setTermo(e.target.value)}>{Object.keys(TERMOS).map((k) => <option key={k}>{k}</option>)}</select></Field>
        <div className="bg-slate-50 rounded-xl p-3 text-sm mb-3"><b>{p.nome}</b>, {TERMOS[termo]}</div>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><PenLine size={13} />Assine no quadro abaixo</p>
        <Assinatura patient={p} tipo={termo} onSaved={() => notify('Termo salvo.')} />
        {meus.length > 0 && <div className="mt-5"><div className="label">Termos assinados</div><ul className="text-sm divide-y divide-line">{meus.map((t) => <li key={t.id} className="py-2 flex justify-between"><span>{t.tipo}</span><span className="text-slate-500">{new Date(t.criado_em).toLocaleDateString('pt-BR')}</span></li>)}</ul></div>}
      </div>}
    </Modal>}
  </>)
}
