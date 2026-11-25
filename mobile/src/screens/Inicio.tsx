import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Icone, Simbolo } from '../components/Icone';
import { Botao, Cartao, Chip, Etiqueta, Exemplo, H1, H2, NavInferior, Nota, Tela, Topo, Txt, useCores } from '../components/ui';
import { nomeDoMes, quando, reais } from '../lib/format';
import { resumoItens, total } from '../lib/orcamento';
import { FONTE } from '../theme';
import { Banco } from '../types';

export type FiltroLista = 'todos' | 'esperando' | 'aprovado' | 'recusado';
export type TelaId = 'inicio' | 'servicos' | 'perfil';

export function Inicio({ db, filtro, setFiltro, ir, novo, abrir }: {
  db: Banco;
  filtro: FiltroLista;
  setFiltro: (f: FiltroLista) => void;
  ir: (t: TelaId) => void;
  novo: () => void;
  abrir: (id: string) => void;
}) {
  const c = useCores();
  const mes = new Date();
  mes.setDate(1);
  mes.setHours(0, 0, 0, 0);
  const doMes = db.orcamentos.filter((o) => o.criadoEm >= mes.getTime());
  const fechado = doMes.filter((o) => o.status === 'aprovado').reduce((s, o) => s + total(o), 0);
  const lista = db.orcamentos
    .slice()
    .sort((a, b) => b.criadoEm - a.criadoEm)
    .filter((o) => filtro === 'todos' || o.status === filtro);
  const primeiro = (db.perfil.nome || '').split(' ')[0];
  const h = new Date().getHours();
  const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const temExemplo = db.orcamentos.some((o) => o.exemplo);
  const filtros: [FiltroLista, string][] = [['todos', 'Todos'], ['esperando', 'Esperando'], ['aprovado', 'Aprovados'], ['recusado', 'Recusados']];

  return (
    <Tela comBarra rodape={<NavInferior atual="inicio" ir={ir} />}>
      <Topo>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Simbolo />
          <Text style={{ fontFamily: FONTE.display800, fontSize: 22, letterSpacing: -0.3, color: c.ink }}>Pode Fazer</Text>
        </View>
      </Topo>

      <View style={{ gap: 4 }}>
        <H1>{saud + (primeiro ? ', ' + primeiro : '')}</H1>
        <Txt suave>Qual serviço vamos orçar hoje?</Txt>
      </View>

      <Botao grande largura icone="mais" onPress={novo}>Novo orçamento</Botao>

      <Cartao style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }} accessible accessibilityLabel="Resumo do mês">
          <Txt peq suave>{'Feitos em ' + nomeDoMes()}</Txt>
          <Text style={{ fontFamily: FONTE.display800, fontSize: 26, lineHeight: 30, color: c.ink, fontVariant: ['tabular-nums'] }}>{doMes.length}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Txt peq suave>Fechados</Txt>
          <Text style={{ fontFamily: FONTE.display800, fontSize: 26, lineHeight: 30, color: c.ink, fontVariant: ['tabular-nums'] }}>{reais(fechado).replace(',00', '')}</Text>
        </View>
      </Cartao>

      {temExemplo ? <Nota>Os orçamentos marcados como exemplo são só para você ver como fica. Apague em Perfil quando for usar de verdade.</Nota> : null}

      <View style={{ gap: 12 }}>
        <H2>Orçamentos</H2>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 2 }}>
          {filtros.map(([v, nome]) => (
            <Chip key={v} ativo={filtro === v} onPress={() => setFiltro(v)}>{nome}</Chip>
          ))}
        </ScrollView>

        {!lista.length ? (
          <Txt suave peq style={{ paddingTop: 14, fontSize: 14 }}>Nenhum orçamento aqui ainda. Toque em Novo orçamento para fazer o primeiro.</Txt>
        ) : (
          <View style={{ gap: 10 }}>
            {lista.map((o) => (
              <Pressable key={o.id} onPress={() => abrir(o.id)} accessibilityRole="button">
                <Cartao style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <Txt forte numberOfLines={1} style={{ flexShrink: 1 }}>{o.cliente || 'Sem nome'}</Txt>
                      {o.exemplo ? <Exemplo /> : null}
                    </View>
                    <Txt forte num>{reais(total(o))}</Txt>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <Txt peq suave numberOfLines={1} style={{ flex: 1 }}>{resumoItens(o) + ' · ' + quando(o.criadoEm)}</Txt>
                    <Etiqueta status={o.status} />
                  </View>
                </Cartao>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Tela>
  );
}
