// Segundo roteiro: editar/salvar, quantidades, "usar preco", categorias, WhatsApp, edicao de servicos.
import { writeFileSync } from 'node:fs';
import { abrir } from './cdp.mjs';

const OUT = process.argv[2];
const alvos = { proto: 'http://localhost:8766/app/index.html', app: 'http://localhost:8765/' };

async function roteiro(nome, url, porta) {
  const a = await abrir(url, `${OUT}/perfil2-${nome}`, porta);
  await a.ev(`window.__abertos = []; window.open = (u) => { window.__abertos.push(u); return null; };`);
  // proto: campo por label (id) ; precisa achar por rotulo -> acrescenta aria-label temporario
  await a.ev(`document.querySelectorAll('label[for]').forEach(l => { const i = document.getElementById(l.getAttribute('for')); if (i && !i.getAttribute('aria-label')) i.setAttribute('aria-label', l.innerText.trim()); })`);
  const estados = {}; const extras = {};
  const marca = async (k) => { estados[k] = await a.texto(); };
  const passo = async (k, fn) => { try { await fn(); } catch (e) { estados[k + ' [ERRO]'] = { linhas: [String(e.message)], inputs: [], botoes: [] }; return; } await marca(k); };
  const relabel = () => a.ev(`document.querySelectorAll('label[for]').forEach(l => { const i = document.getElementById(l.getAttribute('for')); if (i && !i.getAttribute('aria-label')) i.setAttribute('aria-label', l.innerText.trim()); })`);

  await passo('01 abre o15', () => a.clicar('Dona Marta Ribeiro'));
  await passo('02 editar', async () => { await a.clicar('Editar'); await relabel(); });
  await passo('03 + qtd chuveiro', () => a.clicar('Aumentar quantidade', 0));
  await passo('04 - qtd tomada', () => a.clicar('Diminuir quantidade', 1));
  await passo('05 preco chuveiro 150', async () => { await a.digitar('Preço de Instalação de chuveiro', '150', true); await a.tirarFoco(); });
  await passo('06 usar preco sempre', () => a.clicar('Usar R$ 150,00 sempre para este serviço'));
  await passo('07 tirar tomada', () => a.clicar('Tirar Troca de tomada'));
  await passo('08 validade 30', async () => { await relabel(); await a.digitar('Vale por (dias)', '30', true); });
  await passo('09 condicoes', async () => { await a.digitar('Condições', 'Pagamento a combinar.', true); });
  await passo('10 salvar', () => a.clicar('Salvar orçamento'));
  await passo('11 whatsapp', async () => {
    const href = await a.ev(`(() => { const x = [...document.querySelectorAll('a')].find(a => a.href.includes('wa.me')); return x ? x.href : null; })()`);
    if (href) { extras.zap = href; return; }
    await a.clicar('Enviar no WhatsApp'); extras.zap = await a.ev('window.__abertos[0] || null');
  });
  await passo('12 copiar texto', () => a.clicar('Copiar texto'));
  await passo('13 volta inicio', () => a.clicar('Voltar ao início'));
  await passo('14 perfil + Encanador', async () => { await a.clicar('Perfil'); await a.clicar('+ Encanador'); });
  await passo('15 add prof Encanador de novo? (ja esta)', () => a.digitar('Outra profissão', 'encanador'));
  await passo('16 add prof outra clique', () => a.clicar('Adicionar profissão'));
  await passo('17 nome perfil', async () => { await relabel(); await a.digitar('Seu nome ou da empresa', 'Carlos Mendes Jr', true); });
  await passo('18 novo orcamento', async () => { await a.clicar('Início'); await a.clicar('Novo orçamento'); });
  await passo('19 folha', () => a.clicar('Adicionar serviço'));
  await passo('20 chip Encanador', () => a.clicar('Encanador'));
  await passo('21 + torneira', () => a.clicar('Adicionar Troca de torneira'));
  await passo('22 mais um', () => a.clicar('Colocar mais um'));
  await passo('23 tirar um', () => a.clicar('Tirar um'));
  await passo('24 tirar um (remove)', () => a.clicar('Tirar um'));
  await passo('25 busca sem resultado', () => a.digitar('Buscar: tomada, chuveiro…', 'zzzz'));
  await passo('26 limpa busca + fecha', async () => { await a.digitar('Buscar: tomada, chuveiro…', '', true); await a.clicar('Pronto'); });
  await passo('27 cliente e tel', async () => { await relabel(); await a.digitar('Cliente', 'Maria'); await a.digitar('WhatsApp', '(54) 99999-1234'); });
  await passo('28 gerar sem itens', () => a.clicar('Gerar orçamento'));
  await passo('29 meus servicos', async () => { await a.clicar('Voltar'); await a.clicar('Meus serviços'); });
  await passo('30 renomeia e muda preco', async () => { await a.digitar('Nome do serviço', 'Troca de tomada X', true); });
  await passo('31 tirar servico', () => a.clicar('Tirar Troca de tomada X da lista'));
  await passo('32 add servico', async () => { await a.digitar('Nome do serviço novo', 'Teste novo'); await a.digitar('Preço do serviço novo', '33'); await a.clicar('Adicionar à lista'); });
  a.fechar();
  return { estados, extras, erros: a.erros };
}

const resultado = {};
for (const [nome, url] of Object.entries(alvos)) resultado[nome] = await roteiro(nome, url, nome === 'proto' ? 9451 : 9452);
writeFileSync(`${OUT}/paridade2.json`, JSON.stringify(resultado, null, 1));

const tokens = (linhas) => { const m = {}; linhas.join(' ').replace(/ /g, ' ').replace(/…/g, '...').replace(/Nº (\d+)EXEMPLO/g, 'Nº $1 EXEMPLO').split(/\s+/).filter(Boolean).forEach((t) => { m[t] = (m[t] || 0) + 1; }); return m; };
const valores = (inputs) => inputs.map((x) => x.replace(/^campo\[[^\]]*\] = /, '').replace(/ \| ph: .*$/, '')).sort();
let difs = 0;
for (const k of Object.keys(resultado.proto.estados)) {
  const p = resultado.proto.estados[k], q = resultado.app.estados[k];
  if (!q) { console.log(`\n### ${k}: app sem estado`); difs++; continue; }
  const tp = tokens(p.linhas), tq = tokens(q.linhas);
  const falta = [], sobra = [];
  for (const t of new Set([...Object.keys(tp), ...Object.keys(tq)])) { const d = (tq[t] || 0) - (tp[t] || 0); if (d < 0) falta.push(`${t}${d < -1 ? ' x' + -d : ''}`); if (d > 0) sobra.push(`${t}${d > 1 ? ' x' + d : ''}`); }
  const vp = valores(p.inputs).join(' | '), vq = valores(q.inputs).join(' | ');
  if (falta.length || sobra.length || vp !== vq) {
    difs++;
    console.log(`\n### ${k}`);
    if (falta.length) console.log('  FALTA NO APP: ' + falta.join(' ¦ '));
    if (sobra.length) console.log('  SOBRA NO APP: ' + sobra.join(' ¦ '));
    if (vp !== vq) { console.log('  campos protótipo: ' + vp); console.log('  campos app:       ' + vq); }
  }
}
const zp = resultado.proto.extras.zap, zq = resultado.app.extras.zap;
console.log('\nLink WhatsApp protótipo:', zp); console.log('Link WhatsApp app:      ', zq);
console.log('links iguais:', decodeURIComponent(zp || '').replace(/\s/g, ' ') === decodeURIComponent(zq || '').replace(/\s/g, ' '));
console.log(`\nPARIDADE 2: ${Object.keys(resultado.proto.estados).length} estados, ${difs} com diferença | erros JS proto ${resultado.proto.erros.length} app ${resultado.app.erros.length}`);
process.exit(0);
