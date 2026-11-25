import { Orcamento, Perfil } from '../types';
import { DIA, data, numero, reais } from './format';
import { condicoesDe, qtdUn, subtotal, total } from './orcamento';

const SIMBOLO =
  '<svg width="14" height="14" viewBox="0 0 64 64"><path d="M14 4h36a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H27l-13 9v-9a10 10 0 0 1-10-10V14A10 10 0 0 1 14 4z" fill="#FFC21A"/><path d="M18.5 28.5l9 9 17.5-18" fill="none" stroke="#1C1F23" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

/** HTML do orçamento em A4 (o mesmo desenho do "papel" do app), usado para gerar o PDF. */
export function htmlDoPdf(o: Orcamento, p: Perfil): string {
  const serv = o.itens.filter((i) => i.tipo === 'servico');
  const mat = o.itens.filter((i) => i.tipo === 'material');
  const linhas = (arr: typeof serv) =>
    arr
      .map((it) => `<tr><td>${esc(it.nome)}</td><td class="d">${esc(qtdUn(it))}</td><td class="d">${reais(it.preco)}</td><td class="d">${reais(it.qtd * it.preco)}</td></tr>`)
      .join('');
  const cond = condicoesDe(o, p.condicoes);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 40px 44px; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Helvetica, Arial, sans-serif; color: #1C1F23; font-size: 12px; line-height: 17px; }
.cab { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 12px; border-bottom: 2px solid #1C1F23; }
.cab .dir { text-align: right; }
.nome { font-size: 20px; font-weight: 800; }
.tit { font-size: 20px; font-weight: 800; letter-spacing: .5px; }
.c { color: #5E6268; }
.rot { font-size: 9px; font-weight: 700; letter-spacing: .8px; color: #5E6268; text-transform: uppercase; }
table { width: 100%; border-collapse: collapse; margin-top: 14px; }
th { text-align: left; font-size: 9px; letter-spacing: .6px; color: #5E6268; font-weight: 600; padding: 7px 6px; background: #F3EFE6; }
td { padding: 8px 6px; border-bottom: 1px solid #E6E0D3; vertical-align: top; }
.d { text-align: right; white-space: nowrap; }
.g td { border-bottom: none; font-weight: 700; font-size: 10px; letter-spacing: .4px; padding-top: 14px; }
.tot { margin: 14px 0 0 auto; width: 250px; }
.tot div { display: flex; justify-content: space-between; padding: 2px 8px; }
.tot .t { background: #FFF1C7; border-radius: 6px; padding: 9px 8px; margin-top: 4px; align-items: center; }
.tot .t strong { font-size: 18px; font-weight: 800; }
.cond { margin-top: 18px; white-space: pre-line; }
.rod { margin-top: 26px; padding-top: 10px; border-top: 1px solid #E6E0D3; text-align: center; font-size: 10px; color: #5E6268; }
</style></head><body>
<div class="cab"><div><div class="nome">${esc(p.nome || 'Seu nome')}</div><div class="c">${esc(p.profissao)}</div><div class="c">${esc(p.telefone)}</div></div>
<div class="dir"><div class="tit">ORÇAMENTO</div><div><strong>Nº ${numero(o.num)}</strong></div><div class="c">Emitido em ${data(o.criadoEm)}</div><div class="c">Válido até ${data(o.criadoEm + o.validade * DIA)}</div></div></div>
<div style="padding:14px 0 2px"><div class="rot">Cliente</div><div style="font-weight:600;font-size:14px">${esc(o.cliente || '—')}</div>${o.tel ? `<div class="c">${esc(o.tel)}</div>` : ''}</div>
<table><thead><tr><th>DESCRIÇÃO</th><th class="d">QTD</th><th class="d">UNIT.</th><th class="d">TOTAL</th></tr></thead><tbody>
${serv.length ? `<tr class="g"><td colspan="4">SERVIÇOS</td></tr>${linhas(serv)}` : ''}
${mat.length ? `<tr class="g"><td colspan="4">MATERIAIS</td></tr>${linhas(mat)}` : ''}
</tbody></table>
<div class="tot">${o.desconto ? `<div><span class="c">Subtotal</span><span>${reais(subtotal(o))}</span></div><div><span class="c">Desconto</span><span>− ${reais(o.desconto)}</span></div>` : ''}
<div class="t"><span style="font-weight:700">TOTAL</span><strong>${reais(total(o))}</strong></div></div>
${cond ? `<div class="cond"><div class="rot">Condições</div>${esc(cond)}</div>` : ''}
<div class="rod">${SIMBOLO} Feito com <strong style="color:#1C1F23">Pode Fazer</strong> · podefazer.com.br</div>
</body></html>`;
}
