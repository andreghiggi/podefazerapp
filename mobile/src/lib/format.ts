// Formatação em pt-BR feita à mão (não depende do Intl do aparelho, que varia no Android).
export const DIA = 86400000;

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function milhar(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 18000 -> "180,00" */
export function semRS(centavos: number): string {
  const c = Math.round(Math.abs(centavos));
  const sinal = centavos < 0 ? '-' : '';
  return sinal + milhar(Math.floor(c / 100)) + ',' + String(c % 100).padStart(2, '0');
}

/** 18000 -> "R$ 180,00" (espaço comum; no app o texto não quebra porque o valor vai sozinho) */
export function reais(centavos: number): string {
  const neg = centavos < 0;
  return (neg ? '-' : '') + 'R$ ' + semRS(Math.abs(centavos));
}

/** "R$ 1.234,50" / "12,5" / "12.50" -> centavos */
export function lerDinheiro(txt: string | null | undefined): number {
  let s = String(txt ?? '').replace(/[^\d,.\-]/g, '');
  if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(s);
  return isNaN(v) || v < 0 ? 0 : Math.round(v * 100);
}

export function data(ts: number): string {
  const d = new Date(ts);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

/** "Hoje", "Ontem" ou "25 de nov" */
export function quando(ts: number, agora: number = Date.now()): string {
  const d0 = new Date(agora);
  d0.setHours(0, 0, 0, 0);
  if (ts >= d0.getTime()) return 'Hoje';
  if (ts >= d0.getTime() - DIA) return 'Ontem';
  const d = new Date(ts);
  return d.getDate() + ' de ' + MESES_CURTOS[d.getMonth()];
}

export function nomeDoMes(ts: number = Date.now()): string {
  return MESES[new Date(ts).getMonth()];
}

export function numero(n: number): string {
  return String(n).padStart(4, '0');
}

/** 1.5 -> "1,5" ; 1000 -> "1.000" */
export function fmtQtd(q: number): string {
  const v = Math.round(Number(q) * 100) / 100;
  const [i, f] = String(v).split('.');
  return milhar(Number(i)) + (f ? ',' + f : '');
}

export function lerQtd(txt: string | null | undefined): number {
  const v = parseFloat(String(txt ?? '').replace(/\./g, '').replace(',', '.'));
  return isNaN(v) || v <= 0 ? 1 : Math.round(v * 100) / 100;
}

export function uid(): string {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function juntarProfs(ps: string[]): string {
  const n = ps.map((p, i) => (i ? p.toLowerCase() : p));
  return n.length <= 1 ? n[0] || '' : n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1];
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
