import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Icone } from '../components/Icone';
import { Botao, BotaoIcone, BotaoTexto, BarraFixa, Campo, Cartao, Chip, Entrada, EntradaDinheiro, EntradaInteiro, EntradaQtd, Folha, H1, H2, Passo, Tela, Txt, useAviso, useCores } from '../components/ui';
import { DIA, data, fmtQtd, lerDinheiro, numero, reais, semRS, uid } from '../lib/format';
import { ordenarItens, total } from '../lib/orcamento';
import { FONTE, RAIO } from '../theme';
import { Banco, Item, Orcamento } from '../types';

type Mudar = (fn: (b: Banco) => Banco) => void;

export function Editor({ db, mudar, rascunho, setRascunho, editando, cancelar, gerar }: {
  db: Banco;
  mudar: Mudar;
  rascunho: Orcamento;
  setRascunho: (fn: (r: Orcamento) => Orcamento) => void;
  editando: boolean;
  cancelar: () => void;
  gerar: () => void;
}) {
  const c = useCores();
  const aviso = useAviso();
  const [folha, setFolha] = useState(false);
  const [matNome, setMatNome] = useState('');
  const [matQtd, setMatQtd] = useState('1');
  const [matPreco, setMatPreco] = useState('');
  const r = rascunho;

  const itensComIdx = r.itens.map((it, i) => ({ it, i }));
  const serv = itensComIdx.filter((x) => x.it.tipo === 'servico');
  const mat = itensComIdx.filter((x) => x.it.tipo === 'material');

  const setItem = (idx: number, p: Partial<Item>) => setRascunho((x) => ({ ...x, itens: x.itens.map((it, i) => (i === idx ? { ...it, ...p } : it)) }));
  const tirarItem = (idx: number) => setRascunho((x) => ({ ...x, itens: x.itens.filter((_, i) => i !== idx) }));
  const mudarQtd = (idx: number, d: number) => setItem(idx, { qtd: Math.max(1, r.itens[idx].qtd + d) });

  const addMaterial = () => {
    if (!matNome.trim()) { aviso('Escreva o nome do material'); return; }
    const novo: Item = { tipo: 'material', nome: matNome.trim(), qtd: Math.max(1, parseInt(matQtd, 10) || 1), preco: lerDinheiro(matPreco) };
    setRascunho((x) => ({ ...x, itens: ordenarItens(x.itens.concat(novo)) }));
    setMatNome(''); setMatQtd('1'); setMatPreco('');
  };

  const tentarGerar = () => {
    if (!r.itens.length) { aviso('Coloque pelo menos um serviço ou material'); return; }
    gerar();
  };

  const linhaItem = ({ it, i }: { it: Item; i: number }) => {
    const s = it.catId ? db.catalogo.find((x) => x.id === it.catId) : null;
    const dica = s && s.preco !== it.preco;
    return (
      <View key={i + it.nome} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.linha, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <Txt forte style={{ flex: 1 }}>{it.nome}</Txt>
          <BotaoIcone icone="fechar" size={20} rotulo={'Tirar ' + it.nome} onPress={() => tirarItem(i)} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Passo rotuloMenos="Diminuir quantidade" rotuloMais="Aumentar quantidade" onMenos={() => mudarQtd(i, -1)} onMais={() => mudarQtd(i, 1)}>
            <EntradaQtd qtd={it.qtd} rotulo={'Quantidade de ' + it.nome} onChange={(q) => setItem(i, { qtd: q })} />
          </Passo>
          {it.un ? <Txt peq suave>{it.un}</Txt> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, minWidth: 120 }}>
            <Txt suave style={{ fontSize: 14 }}>× R$</Txt>
            <EntradaDinheiro centavos={it.preco} rotulo={'Preço de ' + it.nome} onChange={(p) => setItem(i, { preco: p })} style={{ minHeight: 40, flex: 1, maxWidth: 110, paddingHorizontal: 10, fontSize: 15 }} />
          </View>
          <Txt forte num style={{ marginLeft: 'auto' }}>{reais(it.qtd * it.preco)}</Txt>
        </View>
        {dica ? (
          <BotaoTexto
            onPress={() => {
              mudar((b) => ({ ...b, catalogo: b.catalogo.map((x) => (x.id === it.catId ? { ...x, preco: it.preco } : x)) }));
              aviso('Preço atualizado na sua lista');
            }}
          >
            {'Usar ' + reais(it.preco) + ' sempre para este serviço'}
          </BotaoTexto>
        ) : null}
      </View>
    );
  };

  const noOrc = r.itens.filter((i) => i.tipo === 'servico').length;

  return (
    <>
      <Tela
        comBarra
        rodape={
          <BarraFixa>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: c.amareloClaro, borderRadius: RAIO.md, paddingVertical: 8, paddingHorizontal: 14 }}>
              <Txt forte>Total</Txt>
              <Text style={{ fontFamily: FONTE.display800, fontSize: 30, lineHeight: 36, color: c.ink, fontVariant: ['tabular-nums'] }}>{reais(total(r))}</Text>
            </View>
            <Botao largura onPress={tentarGerar}>{editando ? 'Salvar orçamento' : 'Gerar orçamento'}</Botao>
          </BarraFixa>
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <BotaoIcone icone="voltar" rotulo="Voltar" onPress={cancelar} />
          <View style={{ flex: 1 }}>
            <H1 style={{ fontSize: 22, lineHeight: 26 }}>{editando ? 'Editar orçamento' : 'Novo orçamento'}</H1>
            <Txt peq suave>{'Nº ' + numero(r.num) + ' · ' + data(r.criadoEm)}</Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Campo rotulo="Cliente" style={{ flex: 1.4 }}>
            <Entrada accessibilityLabel="Cliente" value={r.cliente} onChangeText={(t) => setRascunho((x) => ({ ...x, cliente: t }))} placeholder="Nome do cliente" autoComplete="off" />
          </Campo>
          <Campo rotulo="WhatsApp" style={{ flex: 1 }}>
            <Entrada accessibilityLabel="WhatsApp" value={r.tel} onChangeText={(t) => setRascunho((x) => ({ ...x, tel: t }))} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
          </Campo>
        </View>

        <Cartao style={{ paddingTop: 4, paddingBottom: 12 }}>
          <H2 style={{ paddingTop: 10, paddingBottom: 6 }}>Serviços</H2>
          {serv.length ? serv.map(linhaItem) : <Txt suave style={{ fontSize: 14, paddingTop: 14, paddingBottom: 6 }}>Escolha os serviços da sua lista. O preço já vem preenchido.</Txt>}
          <Botao variante="tracejado" icone="mais" largura style={{ marginTop: 12 }} onPress={() => setFolha(true)}>Adicionar serviço</Botao>
        </Cartao>

        <Cartao style={{ paddingTop: 4, paddingBottom: 12 }}>
          <H2 style={{ paddingTop: 10, paddingBottom: 6 }}>Materiais</H2>
          {mat.length ? mat.map(linhaItem) : <Txt suave style={{ fontSize: 14, paddingTop: 14, paddingBottom: 6 }}>Opcional. Coloque o material se for você que vai comprar.</Txt>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>
            <Entrada value={matNome} onChangeText={setMatNome} placeholder="Material" accessibilityLabel="Nome do material" onSubmitEditing={addMaterial} style={{ flex: 1, minWidth: 140, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
            <Entrada value={matQtd} onChangeText={setMatQtd} keyboardType="number-pad" accessibilityLabel="Quantidade" style={{ width: 64, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
            <Entrada value={matPreco} onChangeText={setMatPreco} keyboardType="decimal-pad" placeholder="R$ 0,00" accessibilityLabel="Preço unitário" onSubmitEditing={addMaterial} style={{ width: 96, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
          </View>
          <Botao variante="tracejado" icone="mais" largura style={{ marginTop: 8 }} onPress={addMaterial}>Adicionar material</Botao>
        </Cartao>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Campo rotulo="Desconto (R$)" style={{ flex: 1 }}>
            <EntradaDinheiro centavos={r.desconto || 0} rotulo="Desconto" onChange={(d) => setRascunho((x) => ({ ...x, desconto: d }))} />
          </Campo>
          <Campo rotulo="Vale por (dias)" style={{ flex: 1 }}>
            <EntradaInteiro valor={r.validade} rotulo="Vale por (dias)" onChange={(n) => setRascunho((x) => ({ ...x, validade: n }))} />
          </Campo>
        </View>

        <Campo rotulo="Condições">
          <Entrada accessibilityLabel="Condições" multiline value={r.condicoes != null ? r.condicoes : db.perfil.condicoes} onChangeText={(t) => setRascunho((x) => ({ ...x, condicoes: t }))} />
        </Campo>
      </Tela>

      <FolhaCatalogo aberta={folha} fechar={() => setFolha(false)} db={db} mudar={mudar} rascunho={r} setRascunho={setRascunho} noOrc={noOrc} />
    </>
  );
}

function FolhaCatalogo({ aberta, fechar, db, mudar, rascunho: r, setRascunho, noOrc }: {
  aberta: boolean;
  fechar: () => void;
  db: Banco;
  mudar: Mudar;
  rascunho: Orcamento;
  setRascunho: (fn: (r: Orcamento) => Orcamento) => void;
  noOrc: number;
}) {
  const c = useCores();
  const aviso = useAviso();
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('Todos');
  const [csNome, setCsNome] = useState('');
  const [csPreco, setCsPreco] = useState('');

  const cats = ['Todos'].concat(db.catalogo.map((s) => s.cat || 'Outros').filter((x, i, a) => a.indexOf(x) === i));
  const q = busca.trim().toLowerCase();
  const lista = db.catalogo.filter((s) => (catFiltro === 'Todos' || (s.cat || 'Outros') === catFiltro) && (!q || s.nome.toLowerCase().indexOf(q) >= 0));

  const qtdNoOrc = (id: string) => r.itens.find((it) => it.catId === id)?.qtd ?? 0;
  const catQtd = (id: string, d: number) => {
    const s = db.catalogo.find((x) => x.id === id);
    if (!s) return;
    setRascunho((x) => {
      const idx = x.itens.findIndex((it) => it.catId === id);
      let itens = x.itens;
      if (idx < 0 && d > 0) itens = itens.concat({ tipo: 'servico', catId: s.id, nome: s.nome, qtd: 1, preco: s.preco, un: s.un || '' });
      else if (idx >= 0) {
        itens = itens.map((it, i) => (i === idx ? { ...it, qtd: it.qtd + d } : it)).filter((it) => it.qtd > 0);
      }
      return { ...x, itens: ordenarItens(itens) };
    });
  };

  const criar = () => {
    const nome = (csNome || busca).trim();
    if (!nome) { aviso('Escreva o nome do serviço'); return; }
    const novo = { id: uid(), nome, preco: lerDinheiro(csPreco), un: '', cat: db.perfil.profissoes[0] || 'Meus serviços' };
    mudar((b) => ({ ...b, catalogo: b.catalogo.concat(novo) }));
    setRascunho((x) => ({ ...x, itens: ordenarItens(x.itens.concat({ tipo: 'servico', catId: novo.id, nome: novo.nome, qtd: 1, preco: novo.preco, un: '' })) }));
    setBusca(''); setCsNome(''); setCsPreco('');
    aviso('Criado e salvo na sua lista');
  };

  return (
    <Folha
      aberta={aberta}
      onFechar={fechar}
      rodape={<Botao largura onPress={fechar}>{'Pronto' + (noOrc ? ' · ' + noOrc + (noOrc === 1 ? ' serviço' : ' serviços') : '')}</Botao>}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONTE.display800, fontSize: 22, color: c.ink }}>Adicionar serviço</Text>
        <BotaoIcone icone="fechar" rotulo="Fechar" onPress={fechar} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingTop: 4, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderWidth: 1, borderColor: c.linhaForte, borderRadius: RAIO.sm, backgroundColor: c.superficie }}>
          <Icone nome="busca" size={20} color={c.inkSuave} />
          <Entrada value={busca} onChangeText={setBusca} placeholder="Buscar: tomada, chuveiro…" accessibilityLabel="Buscar serviço" style={{ flex: 1, borderWidth: 0, minHeight: 48, paddingHorizontal: 0, backgroundColor: 'transparent' }} />
        </View>

        {cats.length > 2 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {cats.map((x) => <Chip key={x} ativo={catFiltro === x} onPress={() => setCatFiltro(x)}>{x}</Chip>)}
          </ScrollView>
        ) : null}

        {lista.length ? (
          lista.map((s) => {
            const q2 = qtdNoOrc(s.id);
            return (
              <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: q2 ? c.amareloClaro : c.superficie, borderWidth: q2 ? 1.5 : 1, borderColor: q2 ? c.amareloFita : c.linha, borderRadius: RAIO.md }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt forte>{s.nome}</Txt>
                  <Txt peq suave num>{reais(s.preco) + (s.un ? ' / ' + s.un : '') + (q2 ? ' · ' + fmtQtd(q2) + ' no orçamento' : '')}</Txt>
                </View>
                {q2 ? (
                  <Passo rotuloMenos="Tirar um" rotuloMais="Colocar mais um" onMenos={() => catQtd(s.id, -1)} onMais={() => catQtd(s.id, 1)}>
                    <Txt forte num style={{ minWidth: 26, textAlign: 'center', fontFamily: FONTE.sans700 }}>{q2}</Txt>
                  </Passo>
                ) : (
                  <Pressable onPress={() => catQtd(s.id, 1)} accessibilityRole="button" accessibilityLabel={'Adicionar ' + s.nome} style={{ width: 38, height: 40, borderRadius: 10, borderWidth: 1, borderColor: c.amareloFita, backgroundColor: c.amareloFita, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22, lineHeight: 24, color: c.asfalto }}>+</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        ) : (
          <Txt suave style={{ fontSize: 14, paddingTop: 14, paddingBottom: 6 }}>Nada com esse nome. Crie aqui embaixo.</Txt>
        )}

        <View style={{ gap: 4, paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: c.linhaForte, borderStyle: 'dashed' }}>
          <Txt forte style={{ paddingTop: 6 }}>Não achou? Crie aqui</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 6 }}>
            <Entrada value={csNome || busca} onChangeText={setCsNome} placeholder="Nome do serviço" accessibilityLabel="Nome do serviço novo" style={{ flex: 1, minWidth: 150, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
            <Entrada value={csPreco} onChangeText={setCsPreco} keyboardType="decimal-pad" placeholder="R$ 0,00" accessibilityLabel="Preço do serviço novo" style={{ width: 104, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
          </View>
          <Botao variante="tracejado" icone="mais" largura onPress={criar}>Criar e colocar no orçamento</Botao>
          <Txt peq suave>Fica salvo na sua lista para os próximos orçamentos.</Txt>
        </View>
      </ScrollView>
    </Folha>
  );
}

export { DIA, semRS };
