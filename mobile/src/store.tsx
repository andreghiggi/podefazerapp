import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { lerBanco } from './lib/banco';
import { bancoVazio } from './lib/orcamento';
import { Banco } from './types';

const CHAVE = 'pode-fazer-v1';

interface Ctx {
  db: Banco;
  /** aplica uma mudança no banco e guarda no aparelho */
  mudar: (fn: (atual: Banco) => Banco) => void;
  /** volta ao começo, sem nada guardado */
  zerar: () => void;
}

const BancoContext = createContext<Ctx | null>(null);

export function useBanco(): Ctx {
  const c = useContext(BancoContext);
  if (!c) throw new Error('useBanco fora do BancoProvider');
  return c;
}

export function BancoProvider({ children, carregando }: { children: React.ReactNode; carregando?: React.ReactNode }) {
  const [db, setDb] = useState<Banco | null>(null);
  const ref = useRef<Banco | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((v) => v, () => null)
      .then((v) => {
        const b = lerBanco(v);
        ref.current = b;
        setDb(b);
      });
  }, []);

  const gravar = useCallback((b: Banco) => {
    ref.current = b;
    setDb(b);
    AsyncStorage.setItem(CHAVE, JSON.stringify(b)).catch(() => {
      /* sem armazenamento: segue na memória */
    });
  }, []);

  const mudar = useCallback((fn: (atual: Banco) => Banco) => gravar(fn(ref.current as Banco)), [gravar]);
  const zerar = useCallback(() => {
    AsyncStorage.removeItem(CHAVE).catch(() => {});
    gravar(bancoVazio());
  }, [gravar]);

  if (!db) return <>{carregando ?? null}</>;
  return <BancoContext.Provider value={{ db, mudar, zerar }}>{children}</BancoContext.Provider>;
}
