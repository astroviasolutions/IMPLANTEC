import { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTable } from '../lib/db'
import { useClinica, fill } from '../lib/settings'
import { PageHead, Empty } from '../components/ui'
import { waLink, ymd } from '../lib/util'
export default function Retornos() {
  const { rows: pt } = useTable('patients'), { rows: ap } = useTable('appointments'), { cfg } = useClinica()
  const { retornos, aniv } = useMemo(() => {
    const lim = new Date(); lim.setMonth(lim.getMonth() - cfg.retorno_meses); const agora = new Date()
    const ret = pt.map((p) => {
      const mine = ap.filter((a) => a.patient_id === p.id && a.status !== 'cancelado')
      if (mine.some((a) => new Date(a.inicio) > agora)) return null
      const ult = mine.filter((a) => a.status === 'concluido').map((a) => a.inicio).sort().pop()
      return ult && new Date(ult) < lim ? { p, ult } : null
    }).filter(Boolean).sort((a, b) => a.ult.localeCompare(b.ult))
    const mm = ymd(new Date()).slice(5, 7)
    const an = pt.filter((p) => p.nascimento && p.nascimento.slice(5, 7) === mm).sort((a, b) => a.nascimento.slice(8).localeCompare(b.nascimento.slice(8)))
    return { retornos: ret, aniv: an }
  }, [pt, ap, cfg.retorno_meses])
  const wa = (p, tpl) => waLink(p.whatsapp, fill(tpl, { nome: p.nome.split(' ')[0], clinica: cfg.nome }))
  const Linha = ({ p, sub, tpl }) => <div className="px-4 py-3 flex items-center gap-3"><span className="flex-1 min-w-0"><b className="block truncate">{p.nome}</b><span className="text-xs text-slate-500">{sub}</span></span>{p.whatsapp ? <a className="btn btn-ghost !py-1.5" target="_blank" rel="noreferrer" href={wa(p, tpl)}><MessageCircle size={16} />Chamar</a> : <span className="text-xs text-slate-400">sem WhatsApp</span>}</div>
  return (<>
    <PageHead title="Retornos e aniversários" sub="Quem chamar hoje para manter a agenda cheia" />
    <div className="grid lg:grid-cols-2 gap-4">
      <section><h2 className="font-bold mb-2">Sem voltar há {cfg.retorno_meses}+ meses <span className="chip bg-slate-100 text-slate-700">{retornos.length}</span></h2>
        {retornos.length ? <div className="card divide-y divide-line">{retornos.map(({ p, ult }) => <Linha key={p.id} p={p} tpl={cfg.msg_retorno} sub={`Última visita: ${new Date(ult).toLocaleDateString('pt-BR')}`} />)}</div> : <div className="card"><Empty>Nenhum paciente em atraso de retorno.</Empty></div>}</section>
      <section><h2 className="font-bold mb-2">Aniversariantes do mês <span className="chip bg-slate-100 text-slate-700">{aniv.length}</span></h2>
        {aniv.length ? <div className="card divide-y divide-line">{aniv.map((p) => <Linha key={p.id} p={p} tpl={cfg.msg_aniversario} sub={`Dia ${p.nascimento.slice(8)}`} />)}</div> : <div className="card"><Empty>Ninguém faz aniversário neste mês.</Empty></div>}</section>
    </div>
    <p className="text-xs text-slate-500 mt-4">Os textos das mensagens podem ser editados em Configurações → Mensagens. O botão abre o WhatsApp com a mensagem pronta; o envio é manual.</p></>)
}
