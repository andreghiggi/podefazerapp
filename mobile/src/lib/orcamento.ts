import { LISTAS } from '../data/listas';
import { Banco, Item, Orcamento, Servico, Status } from '../types';
import { DIA, data, fmtQtd, juntarProfs, numero, reais, uid } from './format';

export const ROTULO: Record<Status, string> = { esperando: 'Esperando', aprovado: 'Aprovado', recusado: 'Recusado' };

export function qtdUn(it: Item): string {
  return fmtQtd(it.qtd) + (it.un ? ' ' + it.un : '');
}

export function subtotal(o: Orcamento): number {
  return o.itens.reduce((s, it) => s + it.qtd * it.preco, 0);
}

export function total(o: Orcamento): number {
  return Math.max(0, subtotal(o) - (o.desconto || 0));
}

export function resumoItens(o: Orcamento): string {
  const s = o.itens.filter((i) => i.tipo === 'servico');
  if (!s.length) return o.itens.length ? o.itens[0].nome : 'Sem itens';
  let t = s[0].nome;
  if (s.length > 1) t += ' + ' + (s.length - 1) + (s.length === 2 ? ' serviço' : ' serviços');
  return t;
}

export function ordenarItens(itens: Item[]): Item[] {
  return itens.slice().sort((x, y) => (x.tipo === 'servico' ? 0 : 1) - (y.tipo === 'servico' ? 0 : 1));
}

export function condicoesDe(o: Orcamento, padrao: string): string {
  return o.condicoes != null ? o.condicoes : padrao;
}

export function listaDe(prof: string): Servico[] {
  return (LISTAS[prof] || []).map((c) => ({ id: uid(), nome: c[0], preco: c[1], un: c[2] || '', cat: prof }));
}

/** Traz para o catálogo os serviços da profissão que ainda não estão lá (sem repetir nome). */
export function mesclarLista(catalogo: Servico[], prof: string): Servico[] {
  const tem: Record<string, boolean> = {};
  catalogo.forEach((s) => (tem[s.nome.toLowerCase()] = true));
  const novos = listaDe(prof).filter((s) => !tem[s.nome.toLowerCase()]);
  return catalogo.concat(novos);
}

export function novoRascunho(proxNum: number): Orcamento {
  return { id: uid(), num: proxNum, cliente: '', tel: '', criadoEm: Date.now(), status: 'esperando', validade: 15, desconto: 0, condicoes: null, itens: [] };
}

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

/** Texto do WhatsApp (negrito com *, itálico com _). */
export function mensagem(o: Orcamento, p: Banco['perfil']): string {
  const l: string[] = [];
  l.push('*Orçamento nº ' + numero(o.num) + '*');
  l.push(p.nome + (p.profissao ? ' · ' + p.profissao : '') + (p.telefone ? ' · ' + p.telefone : ''));
  l.push('');
  l.push('Cliente: ' + (o.cliente || '—'));
  const serv = o.itens.filter((i) => i.tipo === 'servico');
  const mat = o.itens.filter((i) => i.tipo === 'material');
  const bloco = (t: string, arr: Item[]) => {
    if (!arr.length) return;
    l.push('');
    l.push('*' + t + '*');
    arr.forEach((it) => l.push('• ' + (it.un ? qtdUn(it) + ' de ' : fmtQtd(it.qtd) + '× ') + it.nome + ' — ' + reais(it.qtd * it.preco)));
  };
  bloco('Serviços', serv);
  bloco('Materiais', mat);
  l.push('');
  if (o.desconto) {
    l.push('Subtotal: ' + reais(subtotal(o)));
    l.push('Desconto: − ' + reais(o.desconto));
  }
  l.push('*Total: ' + reais(total(o)) + '*');
  l.push('Válido até ' + data(o.criadoEm + o.validade * DIA));
  const cond = condicoesDe(o, p.condicoes);
  if (cond) {
    l.push('');
    l.push(cond);
  }
  l.push('');
  l.push('_Feito com Pode Fazer · podefazer.com.br_');
  return l.join('\n');
}

export function linkZap(o: Orcamento, p: Banco['perfil']): string {
  let d = String(o.tel || '').replace(/\D/g, '');
  if (d && d.length <= 11) d = '55' + d;
  return 'https://wa.me/' + (d.length >= 12 ? d : '') + '?text=' + encodeURIComponent(mensagem(o, p));
}

export { juntarProfs };
