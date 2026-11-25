import { spawn } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';

export async function abrir(url, perfilDir, porta) {
  rmSync(perfilDir, { recursive: true, force: true });
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, '--user-data-dir=' + perfilDir, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let alvo;
  for (let i = 0; i < 40; i++) { try { const l = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); alvo = l.find((x) => x.type === 'page'); if (alvo) break; } catch {} await sleep(300); }
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map(); const erros = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') erros.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url }); await sleep(3500);

  const centro = (txt, nth = 0) => ev(`(() => {
    const t = ${JSON.stringify(txt)}; const out = [];
    document.querySelectorAll('*').forEach(e => {
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
      const own = (e.getAttribute('aria-label') === t) || ((e.innerText || '').replace(/ /g,' ').trim() === t && ![...e.children].some(c => (c.innerText || '').replace(/ /g,' ').trim() === t));
      if (own) out.push(e);
    });
    const e = out[${nth}]; if (!e) return null; e.scrollIntoView({block:'center'}); const r = e.getBoundingClientRect();
    const x = r.x + r.width / 2, y = r.y + r.height / 2; const top = document.elementFromPoint(x, y);
    window.__alvoClique = e;
    return { x, y, coberto: !(top && (e === top || e.contains(top) || top.contains(e))) };
  })()`);
  const api = {
    erros, sleep, ev, send,
    async clicar(txt, nth = 0) {
      const c = await centro(txt, nth); if (!c) throw new Error('nao achei: ' + txt);
      if (c.coberto) { await ev('window.__alvoClique.click()'); await sleep(400); return; }
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await sleep(400);
    },
    async existe(txt) { return !!(await centro(txt)); },
    async digitar(campo, texto, limpar = false) {
      await ev(`(() => { const t = ${JSON.stringify(campo)}; const e = [...document.querySelectorAll('input,textarea')].find(i => i.placeholder === t || i.getAttribute('aria-label') === t || i.id === t); if (!e) throw new Error('campo nao achado ' + t); e.scrollIntoView({block:'center'}); e.focus(); ${limpar ? 'e.select();' : ''} })()`);
      await sleep(120);
      if (limpar) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 }); }
      if (texto) await send('Input.insertText', { text: texto });
      await sleep(200);
    },
    async tirarFoco() { await ev('document.activeElement && document.activeElement.blur()'); await sleep(200); },
    async texto() {
      return await ev(`(() => {
        const linhas = document.body.innerText.split('\\n').map(s => s.replace(/\\s+/g, ' ').trim()).filter(Boolean);
        const inputs = [...document.querySelectorAll('input,textarea')].filter(i => i.getBoundingClientRect().width).map(i => 'campo[' + (i.getAttribute('aria-label') || i.placeholder || i.id || '') + '] = ' + (i.value || '(vazio)') + (i.placeholder ? ' | ph: ' + i.placeholder : ''));
        const botoes = [...document.querySelectorAll('[aria-label]')].filter(b => b.getBoundingClientRect().width && b.tagName !== 'INPUT' && b.tagName !== 'TEXTAREA').map(b => 'rotulo: ' + b.getAttribute('aria-label'));
        return { linhas, inputs, botoes: [...new Set(botoes)] };
      })()`);
    },
    async shot(arq) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(arq, Buffer.from(r.result.data, 'base64')); },
    fechar() { try { ws.close(); } catch {} chrome.kill(); },
  };
  return api;
}
