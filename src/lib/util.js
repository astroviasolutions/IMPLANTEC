export const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))
export const pad = (n) => String(n).padStart(2, '0')
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
export const fmtDia = (d) => new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
export const digits = (s) => (s || '').replace(/\D/g, '')
export const waLink = (tel, msg) => `https://wa.me/55${digits(tel)}?text=${encodeURIComponent(msg || '')}`
export const mkDate = (dia, hora) => new Date(`${dia}T${hora}:00`)
export const STATUS = {
  agendado: ['Agendado', 'bg-slate-100 text-slate-700'],
  confirmado: ['Confirmado', 'bg-sky-100 text-sky-800'],
  em_atendimento: ['Em atendimento', 'bg-amber-100 text-amber-800'],
  concluido: ['Concluído', 'bg-emerald-100 text-emerald-800'],
  faltou: ['Faltou', 'bg-rose-100 text-rose-800'],
  cancelado: ['Cancelado', 'bg-zinc-200 text-zinc-600'],
}
export const FORMAS = { pix: 'Pix', dinheiro: 'Dinheiro', debito: 'Débito', credito: 'Crédito', boleto: 'Boleto', convenio: 'Convênio' }
