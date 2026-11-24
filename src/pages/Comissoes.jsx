import { useState } from 'react'
import { useTable } from '../lib/db'
import { PageHead, Empty } from '../components/ui'
import { brl, ymd } from '../lib/util'
export default function Comissoes() {
  const { rows: pay } = useTable('payments'), { rows: dn } = useTable('dentists'), { rows: lab } = useTable('expenses')
  const [mes, setMes] = useState(ymd(new Date()).slice(0, 7))
  const m = pay.filter((p) => ymd(new Date(p.data)).startsWith(mes))
  const linhas = dn.map((d) => { const bruto = m.filter((p) => p.dentist_id === d.id).reduce((s, p) => s + Number(p.valor), 0); return { d, bruto, com: bruto * (d.comissao_pct / 100) } })
  const tot = linhas.reduce((s, l) => s + l.com, 0)
  return (<>
    <PageHead title="Comissões" sub="Calculadas sobre o que foi efetivamente recebido" />
    <input type="month" className="input !w-auto mb-4" value={mes} onChange={(e) => setMes(e.target.value)} />
    {dn.length === 0 ? <div className="card"><Empty>Cadastre profissionais em Config.</Empty></div> : <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="p-3">Profissional</th><th className="p-3 text-right">Recebido</th><th className="p-3 text-right">%</th><th className="p-3 text-right">Comissão</th></tr></thead>
      <tbody className="divide-y divide-line">{linhas.map(({ d, bruto, com }) => <tr key={d.id}><td className="p-3 font-semibold"><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: d.cor }} />{d.nome}</td><td className="p-3 text-right">{brl(bruto)}</td><td className="p-3 text-right">{d.comissao_pct}%</td><td className="p-3 text-right font-bold">{brl(com)}</td></tr>)}</tbody>
      <tfoot><tr className="border-t-2 border-ink"><td className="p-3 font-bold" colSpan={3}>Total a pagar</td><td className="p-3 text-right font-extrabold">{brl(tot)}</td></tr></tfoot></table></div>}
    <p className="text-xs text-slate-500 mt-3">Não desconta custo de laboratório/material. Ajuste a regra se a clínica abater esses custos antes de comissionar.</p>
  </>)
}
