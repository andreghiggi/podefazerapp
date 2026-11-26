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

export const CONDICOES_PADRAO = 'Pagamento: Pix ou dinheiro, metade no início e metade ao final do serviço.\nGarantia de 90 dias sobre o serviço executado.';

/** Aparelho novo: sem cliente, sem orçamento e sem perfil. Os serviços sugeridos entram quando a pessoa escolhe a profissão. */
export function bancoVazio(): Banco {
  return {
    v: 2,
    perfil: { nome: '', profissao: '', profissoes: [], telefone: '', cidade: '', condicoes: CONDICOES_PADRAO },
    catalogo: [],
    proxNum: 1,
    orcamentos: [],
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
