import { uid } from './util'
// Dados de DEMONSTRAÇÃO (fictícios) — só aparecem no modo demo, nunca em produção.
const d1 = uid(), d2 = uid(), d3 = uid()
const svc = (nome, categoria, duracao_min, preco) => ({ id: uid(), nome, categoria, duracao_min, preco, ativo: true })
export const seed = () => ({
  dentists: [
    { id: d1, nome: 'Dr. Implantodontista', cro: 'CRO-PR 0000', especialidade: 'Implantodontia', comissao_pct: 40, cor: '#0e7490', ativo: true },
    { id: d2, nome: 'Dra. Ortodontista', cro: 'CRO-PR 0000', especialidade: 'Ortodontia', comissao_pct: 35, cor: '#7c3aed', ativo: true },
    { id: d3, nome: 'Dr. Clínico Geral', cro: 'CRO-PR 0000', especialidade: 'Clínica geral', comissao_pct: 30, cor: '#059669', ativo: true },
  ],
  services: [
    svc('Avaliação inicial', 'Clínica', 30, 0), svc('Limpeza (profilaxia)', 'Clínica', 45, 200),
    svc('Restauração', 'Clínica', 60, 250), svc('Clareamento dental', 'Estética', 60, 900),
    svc('Implante unitário', 'Implantodontia', 90, 3500), svc('Manutenção de aparelho', 'Ortodontia', 30, 180),
    svc('Canal (endodontia)', 'Endodontia', 90, 800), svc('Urgência / dor', 'Clínica', 30, 150),
  ],
  patients: [], appointments: [], budgets: [], payments: [], expenses: [], notices: [], signed_terms: [],
  settings: [{ chave: 'clinica', valor: { nome: 'Implantec Odontologia', whatsapp: '', abre: '08:00', fecha: '18:00', intervalo: 30, dias: [1, 2, 3, 4, 5, 6] } }],
})
