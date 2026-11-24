import { uid } from './util'
// Dados de DEMONSTRAÇÃO (fictícios) — só aparecem no modo demo, nunca em produção.
const d1 = uid(), d2 = uid(), d3 = uid()
const svc = (nome, categoria, duracao_min, preco) => ({ id: uid(), nome, categoria, duracao_min, preco, ativo: true })
const at = (dias, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dias); d.setHours(h, m, 0, 0); return d }
export const seed = () => {
  const S = {
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
}
  // Pacientes e movimentação FICTÍCIOS, só para demonstrar o app.
  const [i, o, c] = S.dentists, sv = (n) => S.services.find((x) => x.nome.startsWith(n))
  const P = (nome, whatsapp, nasc, anam, odo) => ({ id: uid(), nome, whatsapp, cpf: '', nascimento: nasc, email: '', anamnese: anam, odontograma: odo, observacoes: '' })
  S.patients = [
    P('Mariana Exemplo', '(41) 99999-0001', '1988-04-12', { queixa: 'Dente 36 ausente, quer implante', diabetes: 'Não', hipertensao: 'Não', fumante: 'Não' }, { 36: 'ausente', 16: 'restaurado', 26: 'restaurado', 48: 'carie' }),
    P('Carlos Demonstração', '(41) 99999-0002', '1975-09-30', { queixa: 'Dor ao mastigar', hipertensao: 'Sim', anticoagulante: 'Sim', medicamentos: 'Losartana' }, { 46: 'canal', 47: 'coroa', 18: 'ausente', 28: 'ausente' }),
    P('Fernanda Teste', '(41) 99999-0003', '1999-01-22', { queixa: 'Clareamento', gravida: 'Não', bruxismo: 'Sim' }, { 11: 'restaurado', 21: 'restaurado' }),
  ]
  const [m, k, f] = S.patients
  const ap = (p, d, s, dia, h, mi, status, origem = 'interno') => ({ id: uid(), patient_id: p?.id || null, dentist_id: d.id, service_id: s.id, inicio: at(dia, h, mi).toISOString(), fim: at(dia, h, mi + s.duracao_min).toISOString(), status, origem })
  S.appointments = [
    ap(m, i, sv('Implante'), 0, 9, 0, 'confirmado'), ap(k, i, sv('Canal'), 0, 11, 0, 'em_atendimento'), ap(f, c, sv('Clareamento'), 0, 14, 0, 'agendado'),
    ap(null, o, sv('Manutenção'), 0, 16, 0, 'agendado', 'site'), ap(m, c, sv('Limpeza'), 1, 10, 0, 'agendado'), ap(f, o, sv('Manutenção'), 2, 15, 30, 'agendado'),
  ]
  S.appointments[3].nome_externo = 'Roberto (pelo site)'; S.appointments[3].whatsapp_externo = '(41) 99999-0004'
  S.budgets = [{ id: uid(), patient_id: m.id, dentist_id: i.id, itens: [{ nome: 'Implante unitário', dente: '36', qtd: 1, valor: 3500 }, { nome: 'Avaliação inicial', dente: '', qtd: 1, valor: 0 }], desconto: 200, parcelas: 6, status: 'aberto', criado_em: at(-3, 10).toISOString() }]
  S.payments = [
    { id: uid(), patient_id: k.id, dentist_id: i.id, valor: 800, forma: 'pix', data: at(0, 8, 30).toISOString(), obs: 'Canal' },
    { id: uid(), patient_id: f.id, dentist_id: c.id, valor: 450, forma: 'credito', data: at(-2, 15).toISOString(), obs: 'Entrada clareamento' },
    { id: uid(), patient_id: m.id, dentist_id: c.id, valor: 200, forma: 'dinheiro', data: at(-5, 11).toISOString(), obs: 'Limpeza' },
  ]
  S.expenses = [{ id: uid(), descricao: 'Aluguel', categoria: 'Fixa', valor: 3200, data: at(0, 9).toISOString().slice(0, 10) }, { id: uid(), descricao: 'Laboratório de prótese', categoria: 'Laboratório', valor: 650, data: at(-1, 9).toISOString().slice(0, 10) }]
  S.notices = [{ id: uid(), titulo: 'Atendimento com hora marcada', texto: 'Urgências: chame a clínica pelo WhatsApp.', ativo: true }]
  return S
}
