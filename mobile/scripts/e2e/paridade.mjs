// Roda o MESMO roteiro no prototipo HTML e no app e compara o que aparece em cada tela.
import { writeFileSync } from 'node:fs';
import { abrir } from './cdp.mjs';

const OUT = process.argv[2];
const alvos = { proto: 'http://localhost:8766/app/index.html', app: 'http://localhost:8765/' };

async function roteiro(nome, url, porta) {
  const a = await abrir(url, `${OUT}/perfil-${nome}`, porta);
  const estados = {};
  const marca = async (k) => { estados[k] = await a.texto(); };
  const passo = async (k, fn) => { try { await fn(); } catch (e) { estados[k + ' [ERRO]'] = { linhas: [String(e.message)], inputs: [], botoes: [] }; return; } await marca(k); };

  await marca('01 inicio');
  await passo('02 filtro aprovados', () => a.clicar('Aprovados'));
  await passo('03 filtro recusados', () => a.clicar('Recusados'));
  await passo('04 filtro esperando', () => a.clicar('Esperando'));
  await passo('05 filtro todos', () => a.clicar('Todos'));
  await passo('06 detalhe o15', () => a.clicar('Dona Marta Ribeiro'));
  await passo('07 detalhe status aprovado', () => a.clicar('Aprovado'));
  await passo('08 detalhe status esperando', () => a.clicar('Esperando'));
  await passo('09 excluir dialogo', () => a.clicar('Excluir'));
  await passo('10 dialogo voltar', () => a.clicar('Voltar'));
  await passo('11 duplicar', () => a.clicar('Duplicar'));
  await passo('12 editor aberto (copia)', async () => { await a.sleep(300); });
  await passo('13 gerar sem cliente', () => a.clicar('Gerar orçamento'));
  await passo('14 abrir folha', () => a.clicar('Adicionar serviço'));
  await passo('15 busca tomada', () => a.digitar('Buscar: tomada, chuveiro…', 'chuv'));
  await passo('16 + chuveiro', () => a.clicar('Adicionar Instalação de chuveiro'));
  await passo('17 criar servico novo', async () => { await a.digitar('Nome do serviço novo', 'Poda de arvore'); await a.digitar('Preço do serviço novo', '120'); await a.clicar('Criar e colocar no orçamento'); });
  await passo('18 fechar folha', () => a.clicar('Fechar'));
  await passo('19 editor com itens', async () => { await a.sleep(200); });
  await passo('20 add material vazio', () => a.clicar('Adicionar material'));
  await passo('21 add material', async () => { await a.digitar('Nome do material', 'Fita isolante'); await a.digitar('Preço unitário', '6,5'); await a.clicar('Adicionar material'); });
  await passo('22 desconto', async () => { await a.digitar('Desconto', '10', true); await a.tirarFoco(); });
  await passo('23 cancelar editor', () => a.clicar('Voltar'));
  await passo('24 voltar ao inicio', () => a.clicar('Voltar ao início'));
  await passo('25 novo orcamento', () => a.clicar('Novo orçamento'));
  await passo('26 cancelar novo', () => a.clicar('Voltar'));
  await passo('27 meus servicos', () => a.clicar('Meus serviços'));
  await passo('28 add servico lista vazio', () => a.clicar('Adicionar à lista'));
  await passo('29 perfil', () => a.clicar('Perfil'));
  await passo('30 add prof Encanador', () => a.clicar('+ Encanador'));
  await passo('31 add prof outra vazio', () => a.clicar('Adicionar profissão'));
  await passo('32 apagar exemplos dialogo', () => a.clicar('Apagar exemplos e começar'));
  await passo('33 apagar exemplos confirma', () => a.clicar('Apagar exemplos'));
  await passo('34 comecar sem escolha', () => a.clicar('Começar'));
  await passo('35 outra profissao', () => a.digitar('Ex.: serralheiro, vidraceiro, jardineiro', 'serralheiro'));
  await passo('36 escolhe Pedreiro', () => a.clicar('Pedreiro'));
  await passo('37 comecar', () => a.clicar('Começar'));
  await passo('38 inicio vazio', async () => {});
  a.fechar();
  return { estados, erros: a.erros };
}

const resultado = {};
for (const [nome, url] of Object.entries(alvos)) resultado[nome] = await roteiro(nome, url, nome === 'proto' ? 9441 : 9442);
writeFileSync(`${OUT}/paridade.json`, JSON.stringify(resultado, null, 1));

// compara
const tokens = (linhas) => { const m = {}; linhas.join(' ').replace(/ /g, ' ').replace(/…/g, '...').split(/\s+/).filter(Boolean).forEach((t) => { m[t] = (m[t] || 0) + 1; }); return m; };
const valores = (inputs) => inputs.map((x) => x.replace(/^campo\[[^\]]*\] = /, '').replace(/ \| ph: .*$/, '')).sort();
let difs = 0;
for (const k of Object.keys(resultado.proto.estados)) {
  const p = resultado.proto.estados[k], q = resultado.app.estados[k];
  if (!q) { console.log(`
### ${k}: app sem estado`); difs++; continue; }
  const tp = tokens(p.linhas), tq = tokens(q.linhas);
  const falta = [], sobra = [];
  for (const t of new Set([...Object.keys(tp), ...Object.keys(tq)])) { const d = (tq[t] || 0) - (tp[t] || 0); if (d < 0) falta.push(`${t}${d < -1 ? ' x' + -d : ''}`); if (d > 0) sobra.push(`${t}${d > 1 ? ' x' + d : ''}`); }
  const vp = valores(p.inputs).join(' | '), vq = valores(q.inputs).join(' | ');
  if (falta.length || sobra.length || vp !== vq) {
    difs++;
    console.log(`
### ${k}`);
    if (falta.length) console.log('  FALTA NO APP (existe no protótipo): ' + falta.join(' ¦ '));
    if (sobra.length) console.log('  SOBRA NO APP (não existe no protótipo): ' + sobra.join(' ¦ '));
    if (vp !== vq) { console.log('  campos protótipo: ' + vp); console.log('  campos app:       ' + vq); }
  }
}
console.log(`
PARIDADE: ${Object.keys(resultado.proto.estados).length} estados comparados, ${difs} com diferença`);
console.log('erros JS protótipo:', resultado.proto.erros.length, '| app:', resultado.app.erros.length);
process.exit(0);
