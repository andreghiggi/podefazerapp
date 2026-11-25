// Teste de uso do app no Chrome (CDP): cria um orcamento do comeco ao fim e tira capturas.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2];
const URL_APP = 'http://localhost:8765/';
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--remote-debugging-port=9333', '--user-data-dir=' + OUT + '/perfil-chrome', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let alvo;
for (let i = 0; i < 40; i++) {
  try { const l = await (await fetch('http://127.0.0.1:9333/json')).json(); alvo = l.find((x) => x.type === 'page'); if (alvo) break; } catch {}
  await sleep(300);
}
const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); const erros = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') erros.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') erros.push('console.error: ' + d.params.args.map((a) => a.value || a.description).join(' '));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const shot = async (nome) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/${nome}.png`, Buffer.from(r.result.data, 'base64')); console.log('captura', nome); };

// acha o elemento mais interno com esse texto (ou aria-label) e devolve o centro
const centro = (alvoTxt, nth = 0) => ev(`(() => {
  const t = ${JSON.stringify(alvoTxt)}; const out = [];
  document.querySelectorAll('*').forEach(e => {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
    const own = (e.getAttribute('aria-label') === t) || ((e.innerText || '').trim() === t && ![...e.children].some(c => (c.innerText || '').trim() === t));
    if (own) out.push(e);
  });
  const e = out[${nth}]; if (!e) return null; e.scrollIntoView({block:'center'}); const r = e.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
})()`);
const clicar = async (txt, nth = 0) => {
  const c = await centro(txt, nth); if (!c) throw new Error('nao achei: ' + txt);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
  await sleep(450);
};
const digitar = async (placeholderOuLabel, texto) => {
  await ev(`(() => { const t = ${JSON.stringify(placeholderOuLabel)}; const e = [...document.querySelectorAll('input,textarea')].find(i => i.placeholder === t || i.getAttribute('aria-label') === t); if (!e) throw new Error('campo nao achado ' + t); e.scrollIntoView({block:'center'}); e.focus(); })()`);
  await sleep(150);
  await send('Input.insertText', { text: texto });
  await sleep(250);
};
const tem = (txt) => ev(`document.body.innerText.includes(${JSON.stringify(txt)})`);
const falhas = []; let ok = 0;
const conf = (n, c) => { if (c) { ok++; console.log('  ok  ' + n); } else { falhas.push(n); console.log('  FALHOU  ' + n); } };

try {
  await send('Page.navigate', { url: URL_APP }); await sleep(3500);
  await shot('01-inicio');
  conf('inicio mostra o resumo e exemplos', (await tem('Boa')) && (await tem('Dona Marta Ribeiro')));

  await clicar('Novo orçamento'); await sleep(500);
  conf('abriu o editor (Nº 0016)', await tem('Nº 0016'));
  await shot('02-editor-vazio');
  await digitar('Nome do cliente', 'Seu Zé da Padaria');
  await digitar('(00) 00000-0000', '54999991234');

  await clicar('Adicionar serviço'); await sleep(600);
  await shot('03-folha-servicos');
  await clicar('Adicionar Troca de tomada');
  await clicar('Colocar mais um');
  conf('folha mostra 2 no orçamento', await tem('2 no orçamento'));
  await shot('04-folha-com-itens');
  await digitar('Nome do serviço novo', 'Limpeza de calha');
  await digitar('Preço do serviço novo', '90');
  await clicar('Criar e colocar no orçamento'); await sleep(500);
  conf('serviço novo criado e salvo', await tem('Criado e salvo na sua lista'));
  await clicar('Pronto · 2 serviços');
  await sleep(500);
  conf('editor lista os serviços escolhidos', (await tem('Troca de tomada')) && (await tem('Limpeza de calha')));

  await digitar('Material', 'Disjuntor 32A');
  await digitar('Preço unitário', '38,50');
  await clicar('Adicionar material');
  conf('material entrou', await tem('Disjuntor 32A'));
  await shot('05-editor-cheio');
  const tot = await ev(`document.body.innerText.match(/Total\\s*\\n?\\s*(R\\$ [\\d.,]+)/)?.[1]`);
  console.log('   total mostrado:', tot);
  conf('total = 2×45,00 + 90,00 + 38,50 = R$ 218,50', tot === 'R$ 218,50');

  await clicar('Gerar orçamento'); await sleep(700);
  conf('tela "Orçamento pronto!"', await tem('Orçamento pronto!'));
  await shot('06-pronto');
  await clicar('Aprovado'); await sleep(400);
  conf('aviso "pode fazer"', await tem('pode fazer'));
  await shot('07-aprovado');
  conf('abre WhatsApp do cliente', (await ev(`document.body.innerText.includes('Abre a conversa com 54999991234')`)));

  await clicar('Voltar ao início'); await sleep(500);
  conf('volta ao inicio com o orçamento novo', (await tem('Seu Zé da Padaria')) && (await tem('Fechados')));
  await shot('08-inicio-novo');

  await clicar('Meus serviços'); await sleep(500);
  conf('meus serviços tem o serviço criado', await ev(`[...document.querySelectorAll('input')].some(i => i.value === 'Limpeza de calha')`));
  await shot('09-servicos');
  await clicar('Perfil'); await sleep(500);
  await shot('10-perfil');
  conf('perfil mostra opção de apagar exemplos', await tem('Apagar exemplos e começar'));
  await clicar('Apagar exemplos e começar'); await sleep(400);
  await shot('11-dialogo');
  await clicar('Apagar exemplos'); await sleep(600);
  conf('vai para a boas-vindas', await tem('Qual é o seu serviço?'));
  await shot('12-boas-vindas');
  await clicar('Pintor'); await clicar('Começar'); await sleep(600);
  conf('começar traz a lista do pintor', await tem('Pronto! Sua lista já tem'));
  await shot('13-pos-boas-vindas');

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] }); await sleep(600);
  await shot('14-escuro');
} catch (e) {
  console.log('ERRO NO FLUXO:', e.message); await shot('erro');
}
console.log(`\nFLUXO: ${ok} ok, ${falhas.length} falhas`); falhas.forEach((f) => console.log(' - ' + f));
console.log('erros do navegador:', erros.length ? erros.slice(0, 8) : 'nenhum');
ws.close(); chrome.kill(); process.exit(0);
