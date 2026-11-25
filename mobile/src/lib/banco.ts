import { Banco } from '../types';
import { seed } from './orcamento';

/** Garante que o que veio do aparelho tem a forma esperada; senão começa do zero com os exemplos. */
export function lerBanco(bruto: string | null): Banco {
  if (!bruto) return seed();
  try {
    const d = JSON.parse(bruto);
    if (d && d.v === 2 && d.perfil && Array.isArray(d.catalogo) && Array.isArray(d.orcamentos) && typeof d.proxNum === 'number') return d as Banco;
  } catch {
    /* dados corrompidos: recomeça */
  }
  return seed();
}
