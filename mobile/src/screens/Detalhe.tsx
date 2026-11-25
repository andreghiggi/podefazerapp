import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Icone, Simbolo } from '../components/Icone';
import { BarraFixa, Botao, BotaoIcone, Etiqueta, Exemplo, H1, Tela, Txt, useAviso, useCores } from '../components/ui';
import { DIA, data, numero, reais } from '../lib/format';
import { ROTULO, condicoesDe, linkZap, mensagem, qtdUn, resumoItens, subtotal, total } from '../lib/orcamento';
import { htmlDoPdf } from '../lib/pdf';
import { FONTE, RAIO } from '../theme';
import { Item, Orcamento, Perfil, Status } from '../types';

const CINZA = '#5E6268';
const TINTA = '#1C1F23';
const LINHA = '#E6E0D3';

/** O papel do orçamento: fica branco nos dois temas, como o PDF. */
function Papel({ o, p }: { o: Orcamento; p: Perfil }) {
  const serv = o.itens.filter((i) => i.tipo === 'servico');
  const mat = o.itens.filter((i) => i.tipo === 'material');
  const cond = condicoesDe(o, p.condicoes);
  const t = (extra?: object) => ({ fontFamily: FONTE.sans400, fontSize: 13, lineHeight: 18, color: TINTA, ...extra });
  const rotulo = { fontFamily: FONTE.sans700, fontSize: 10, letterSpacing: 0.8, color: CINZA, textTransform: 'uppercase' as const };

  const linhas = (arr: Item[]) =>
    arr.map((it, i) => (
      <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: LINHA, gap: 6 }}>
        <Text style={[t(), { flex: 1 }]}>{it.nome}</Text>
        <Text style={[t(), { width: 54, textAlign: 'right' }]}>{qtdUn(it)}</Text>
        <Text style={[t(), { width: 68, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{reais(it.preco)}</Text>
        <Text style={[t(), { width: 72, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{reais(it.qtd * it.preco)}</Text>
      </View>
    ));
  const grupo = (nome: string) => <Text style={[t({ fontFamily: FONTE.sans700, fontSize: 11, letterSpacing: 0.4 }), { paddingTop: 12, paddingHorizontal: 6 }]}>{nome}</Text>;

  return (
    <View accessible accessibilityLabel="Orçamento como o cliente recebe" style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINHA, borderRadius: 4, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: TINTA, flexWrap: 'wrap' }}>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontFamily: FONTE.display800, fontSize: 17, lineHeight: 22, color: TINTA }}>{p.nome || 'Seu nome'}</Text>
          <Text style={t({ color: CINZA })}>{p.profissao}</Text>
          <Text style={t({ color: CINZA })}>{p.telefone}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: FONTE.display800, fontSize: 17, letterSpacing: 0.5, color: TINTA }}>ORÇAMENTO</Text>
          <Text style={t({ fontFamily: FONTE.sans700 })}>{'Nº ' + numero(o.num)}</Text>
          <Text style={t({ color: CINZA })}>{'Emitido em ' + data(o.criadoEm)}</Text>
          <Text style={t({ color: CINZA })}>{'Válido até ' + data(o.criadoEm + o.validade * DIA)}</Text>
        </View>
      </View>

      <View style={{ paddingTop: 12, paddingBottom: 4 }}>
        <Text style={rotulo}>Cliente</Text>
        <Text style={t({ fontFamily: FONTE.sans600, fontSize: 14 })}>{o.cliente || '—'}</Text>
        {o.tel ? <Text style={t({ color: CINZA })}>{o.tel}</Text> : null}
      </View>

      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F3EFE6', paddingVertical: 6, paddingHorizontal: 6, gap: 6 }}>
          {[['DESCRIÇÃO', undefined], ['QTD', 54], ['UNIT.', 68], ['TOTAL', 72]].map(([n, w], i) => (
            <Text key={i} style={{ fontFamily: FONTE.sans600, fontSize: 10, letterSpacing: 0.6, color: CINZA, ...(w ? { width: w as number, textAlign: 'right' as const } : { flex: 1 }) }}>{n as string}</Text>
          ))}
        </View>
        {serv.length ? <>{grupo('SERVIÇOS')}{linhas(serv)}</> : null}
        {mat.length ? <>{grupo('MATERIAIS')}{linhas(mat)}</> : null}
      </View>

      <View style={{ marginTop: 12, alignSelf: 'flex-end', width: 230, gap: 3 }}>
        {o.desconto ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
              <Text style={t({ color: CINZA })}>Subtotal</Text><Text style={t()}>{reais(subtotal(o))}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
              <Text style={t({ color: CINZA })}>Desconto</Text><Text style={t()}>{'− ' + reais(o.desconto)}</Text>
            </View>
          </>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF1C7', borderRadius: RAIO.sm, padding: 8, marginTop: 4 }}>
          <Text style={t({ fontFamily: FONTE.sans700 })}>TOTAL</Text>
          <Text style={{ fontFamily: FONTE.display800, fontSize: 19, color: TINTA, fontVariant: ['tabular-nums'] }}>{reais(total(o))}</Text>
        </View>
      </View>

      {cond ? (
        <View style={{ marginTop: 16 }}>
          <Text style={rotulo}>Condições</Text>
          <Text style={t()}>{cond}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderTopColor: LINHA, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Simbolo size={14} />
        <Text style={t({ fontSize: 11, color: CINZA })}>Feito com <Text style={{ fontFamily: FONTE.sans700, color: TINTA }}>Pode Fazer</Text> · podefazer.com.br</Text>
      </View>
    </View>
  );
}

export function Detalhe({ o, perfil, recemFeito, voltar, mudarStatus, duplicar, editar, excluir }: {
  o: Orcamento;
  perfil: Perfil;
  recemFeito: boolean;
  voltar: () => void;
  mudarStatus: (s: Status) => void;
  duplicar: () => void;
  editar: () => void;
  excluir: () => void;
}) {
  const c = useCores();
  const aviso = useAviso();

  const copiar = async () => {
    try {
      await Clipboard.setStringAsync(mensagem(o, perfil));
      aviso('Texto copiado. É só colar no WhatsApp.');
    } catch {
      aviso('Não deu para copiar aqui. Use Enviar no WhatsApp.');
    }
  };

  const zap = async () => {
    try {
      await Linking.openURL(linkZap(o, perfil));
    } catch {
      aviso('Não deu para abrir o WhatsApp. Use Copiar texto.');
    }
  };

  const pdf = async () => {
    try {
      const html = htmlDoPdf(o, perfil);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Orçamento nº ' + numero(o.num), UTI: 'com.adobe.pdf' });
      else aviso('Não deu para compartilhar o PDF neste aparelho.');
    } catch {
      aviso('Não deu para gerar o PDF. Tente de novo.');
    }
  };

  const status: Status[] = ['esperando', 'aprovado', 'recusado'];

  return (
    <Tela
      comBarra
      rodape={
        <BarraFixa>
          <Botao variante="verde" icone="zap" largura onPress={zap}>Enviar no WhatsApp</Botao>
          <Botao variante="contorno" icone="doc" largura onPress={pdf}>Compartilhar PDF</Botao>
          <Txt peq suave style={{ textAlign: 'center' }}>{o.tel ? 'Abre a conversa com ' + o.tel + ' com o orçamento escrito.' : 'Sem número: o WhatsApp vai pedir para escolher o contato.'}</Txt>
        </BarraFixa>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
        <BotaoIcone icone={recemFeito ? 'fechar' : 'voltar'} rotulo="Voltar ao início" onPress={voltar} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Txt peq suave num>{'Nº ' + numero(o.num)}</Txt>
          {o.exemplo ? <Exemplo /> : null}
        </View>
      </View>

      {recemFeito ? (
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 4 }}>
          <Simbolo size={80} />
          <H1 style={{ fontSize: 36, lineHeight: 40, textAlign: 'center' }}>Orçamento pronto!</H1>
          <Txt suave style={{ textAlign: 'center' }}>{'Agora é só mandar' + (o.cliente ? ' para ' + o.cliente : '') + '.'}</Txt>
        </View>
      ) : (
        <View style={{ gap: 4 }}>
          <H1>{o.cliente || 'Sem nome'}</H1>
          <Txt suave num>{reais(total(o)) + ' · ' + resumoItens(o)}</Txt>
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Txt peq forte suave>Situação</Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {status.map((s) => {
            const ativo = o.status === s;
            const cor = { esperando: [c.amareloClaro, c.amareloFita], aprovado: [c.verdeFundo, c.verde], recusado: [c.vermelhoFundo, c.vermelho] }[s];
            return (
              <Pressable
                key={s}
                onPress={() => mudarStatus(s)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: RAIO.sm, borderWidth: ativo ? 1.5 : 1, backgroundColor: ativo ? cor[0] : c.superficie, borderColor: ativo ? cor[1] : c.linha }}
              >
                <Text style={{ fontFamily: FONTE.sans600, fontSize: 14, color: ativo ? c.ink : c.inkSuave }}>{ROTULO[s]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Papel o={o} p={perfil} />

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao variante="contorno" icone="copiar" onPress={duplicar} style={{ flex: 1 }}>Duplicar</Botao>
          <Botao variante="contorno" icone="lapis" onPress={editar} style={{ flex: 1 }}>Editar</Botao>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao variante="contorno" icone="doc" onPress={copiar} style={{ flex: 1 }}>Copiar texto</Botao>
          <Botao variante="perigo" icone="lixo" onPress={excluir} style={{ flex: 1 }}>Excluir</Botao>
        </View>
      </View>
    </Tela>
  );
}

