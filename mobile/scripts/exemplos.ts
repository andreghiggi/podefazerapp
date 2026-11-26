// Dados de exemplo usados SOMENTE nas conferencias (o app comeca vazio).
import { LISTAS } from '../src/data/listas';
import { DIA } from '../src/lib/format';
import { Banco, Servico } from '../src/types';

export function seed(agora: number = Date.now()): Banco {
  const cat: Servico[] = LISTAS.Eletricista.map((c, i) => ({ id: 's' + (i + 1), nome: c[0], preco: c[1], un: '', cat: 'Eletricista' }));
  return {
    v: 2,
    perfil: {
      nome: 'Carlos Mendes',
      profissao: 'Eletricista',
      profissoes: ['Eletricista'],
      telefone: '(11) 98888-1234',
      cidade: '',
      condicoes: 'Pagamento: Pix ou dinheiro, metade no início e metade ao final do serviço.\nGarantia de 90 dias sobre o serviço executado.',
      exemplo: true,
    },
    catalogo: cat,
    proxNum: 16,
    orcamentos: [
      {
        id: 'o15', num: 15, cliente: 'Dona Marta Ribeiro', tel: '(11) 97777-5678', criadoEm: agora, status: 'esperando', validade: 15, desconto: 1020, exemplo: true, condicoes: null,
        itens: [
          { tipo: 'servico', catId: 's4', nome: 'Instalação de chuveiro', qtd: 1, preco: 12000 },
          { tipo: 'servico', catId: 's1', nome: 'Troca de tomada', qtd: 3, preco: 4500 },
          { tipo: 'material', nome: 'Disjuntor 32A', qtd: 1, preco: 3850 },
          { tipo: 'material', nome: 'Tomada 10A com espelho', qtd: 3, preco: 1890 },
        ],
      },
      {
        id: 'o14', num: 14, cliente: 'Padaria Pão Quente', tel: '', criadoEm: agora - DIA, status: 'aprovado', validade: 15, desconto: 0, exemplo: true, condicoes: null,
        itens: [
          { tipo: 'servico', catId: 's9', nome: 'Montagem de quadro de distribuição', qtd: 1, preco: 45000 },
          { tipo: 'servico', catId: 's8', nome: 'Troca de disjuntor', qtd: 4, preco: 8000 },
          { tipo: 'material', nome: 'Disjuntor 32A', qtd: 4, preco: 3850 },
          { tipo: 'material', nome: 'Quadro de embutir para 12 disjuntores', qtd: 1, preco: 35600 },
        ],
      },
      {
        id: 'o13', num: 13, cliente: 'Seu João Batista', tel: '', criadoEm: agora - 4 * DIA, status: 'aprovado', validade: 15, desconto: 0, exemplo: true, condicoes: null,
        itens: [
          { tipo: 'servico', nome: 'Troca da fiação da sala', qtd: 1, preco: 42000 },
          { tipo: 'material', nome: 'Cabo flexível 2,5 mm (rolo 100 m)', qtd: 1, preco: 20000 },
        ],
      },
      {
        id: 'o12', num: 12, cliente: 'Ana Paula Lima', tel: '', criadoEm: agora - 6 * DIA, status: 'recusado', validade: 15, desconto: 0, exemplo: true, condicoes: null,
        itens: [{ tipo: 'servico', catId: 's7', nome: 'Ventilador de teto', qtd: 1, preco: 15000 }],
      },
    ],
  };
}
