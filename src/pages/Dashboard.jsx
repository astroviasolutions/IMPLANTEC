import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTable } from '../lib/db'
import { PageHead, Stat } from '../components/ui'
import { brl, hm, ymd, STATUS } from '../lib/util'
export default function Dashboard() {
  const { rows: ap } = useTable('appointments'), { rows: pay } = useTable('payments'), { rows: pt } = useTable('patients'), { rows: bud } = useTable('budgets'), { rows: sv } = useTable('services'), { rows: dn } = useTable('dentists')
  const hoje = ymd(new Date()), mes = hoje.slice(0, 7)
  const d = useMemo(() => {
    const doDia = ap.filter((a) => ymd(new Date(a.inicio)) === hoje && a.status !== 'cancelado').sort((a, b) => a.inicio.localeCompare(b.inicio))
    const rec = pay.filter((p) => ymd(new Date(p.data)).startsWith(mes)).reduce((s, p) => s + Number(p.valor), 0)
    const abertos = bud.filter((b) => b.status === 'aberto')
    const pend = abertos.reduce((s, b) => s + b.itens.reduce((x, i) => x + i.qtd * i.valor, 0) - (b.desconto || 0), 0)
    return { doDia, rec, abertos: abertos.length, pend, novos: ap.filter((a) => a.origem === 'site' && a.status === 'agendado') }
  }, [ap, pay, bud, hoje, mes])
  const nome = (a) => pt.find((p) => p.id === a.patient_id)?.nome || a.nome_externo || '—'
  return (<>
    <PageHead title="Painel" sub={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Stat label="Consultas hoje" value={d.doDia.length} />
      <Stat label="Recebido no mês" value={brl(d.rec)} accent="text-emerald-700" />
      <Stat label="Orçamentos abertos" value={d.abertos} hint={brl(d.pend) + ' em aberto'} />
      <Stat label="Pacientes" value={pt.length} />
    </div>
    {d.novos.length > 0 && <div className="card p-4 mb-4 border-gold"><b>{d.novos.length} solicitação(ões) do site aguardando confirmação</b> <Link to="/app/agenda" className="text-brand font-semibold text-sm ml-2">Abrir agenda →</Link></div>}
    <div className="card p-5">
      <h2 className="font-bold mb-3">Agenda de hoje</h2>
      {d.doDia.length === 0 ? <p className="text-sm text-slate-500">Nenhuma consulta hoje.</p> : <ul className="divide-y divide-line">{d.doDia.map((a) => (
        <li key={a.id} className="py-2.5 flex items-center gap-3"><span className="font-extrabold w-14">{hm(new Date(a.inicio))}</span><span className="w-1 h-8 rounded" style={{ background: dn.find((x) => x.id === a.dentist_id)?.cor }} />
          <span className="flex-1 min-w-0"><b className="block truncate">{nome(a)}</b><span className="text-xs text-slate-500">{sv.find((s) => s.id === a.service_id)?.nome} · {dn.find((x) => x.id === a.dentist_id)?.nome}</span></span>
          <span className={`chip ${STATUS[a.status][1]}`}>{STATUS[a.status][0]}</span></li>))}</ul>}
    </div></>)
}
