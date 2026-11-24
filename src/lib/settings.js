import { useTable } from './db'
export const DEFAULTS = {
  nome: 'Implantec Odontologia', whatsapp: '', endereco: '', abre: '08:00', fecha: '18:00', almoco_ini: '12:00', almoco_fim: '13:30',
  intervalo: 30, antecedencia_h: 2, dias: [1, 2, 3, 4, 5, 6], janela_dias: 30, online_ativo: true, bloqueios: [], retorno_meses: 6, estoque_alerta: true,
  msg_confirma: 'Olá, {nome}! Confirmamos sua consulta ({procedimento}) na {clinica} em {data} às {hora}. Responda SIM para confirmar.',
  msg_retorno: 'Olá, {nome}! Faz um tempo desde sua última visita à {clinica}. Que tal agendar uma avaliação de retorno?',
  msg_aniversario: 'Parabéns, {nome}! 🎂 A equipe da {clinica} deseja um dia muito especial e um sorriso ainda mais bonito!',
}
export function useClinica() {
  const { rows, save, loading } = useTable('settings')
  const cfg = { ...DEFAULTS, ...(rows.find((r) => r.chave === 'clinica')?.valor || {}) }
  return { cfg, loading, saveCfg: (v) => save({ chave: 'clinica', valor: { ...cfg, ...v } }) }
}
export const fill = (tpl, o) => tpl.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '')
export const toMin = (hhmm) => { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m }
