import { Banco } from '../types';
import { bancoVazio } from './orcamento';

/** Tira o que era exemplo em instalações antigas (orçamentos e o perfil fictício). */
function semExemplos(b: Banco): Banco {
  const orcamentos = b.orcamentos.filter((o) => !o.exemplo);
  const tinha = orcamentos.length !== b.orcamentos.length;
  if (b.perfil.exemplo) {
    const vazio = bancoVazio();
    return { ...vazio, orcamentos, proxNum: orcamentos.length ? b.proxNum : 1 };
  }
  return tinha ? { ...b, orcamentos, proxNum: orcamentos.length ? b.proxNum : 1 } : b;
}

/** Garante que o que veio do aparelho tem a forma esperada; senão começa vazio. */
export function lerBanco(bruto: string | null): Banco {
  if (!bruto) return bancoVazio();
  try {
    const d = JSON.parse(bruto);
    if (d && d.v === 2 && d.perfil && Array.isArray(d.catalogo) && Array.isArray(d.orcamentos) && typeof d.proxNum === 'number') return semExemplos(d as Banco);
  } catch {
    /* dados corrompidos: recomeça */
  }
  return bancoVazio();
}
