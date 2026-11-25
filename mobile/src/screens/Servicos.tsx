import React, { useState } from 'react';
import { View } from 'react-native';
import { Botao, BotaoIcone, Cartao, Entrada, EntradaDinheiro, H1, NavInferior, Tela, Txt, useAviso, useCores } from '../components/ui';
import { lerDinheiro, uid } from '../lib/format';
import { FONTE } from '../theme';
import { Banco } from '../types';
import { TelaId } from './Inicio';

export function Servicos({ db, mudar, ir }: { db: Banco; mudar: (fn: (b: Banco) => Banco) => void; ir: (t: TelaId) => void }) {
  const c = useCores();
  const aviso = useAviso();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  const cats = db.catalogo.map((s) => s.cat || 'Meus serviços').filter((x, i, a) => a.indexOf(x) === i);
  const ordenados = cats.flatMap((cat) => db.catalogo.filter((s) => (s.cat || 'Meus serviços') === cat));

  const editar = (id: string, p: { nome?: string; preco?: number }) =>
    mudar((b) => ({ ...b, catalogo: b.catalogo.map((s) => (s.id === id ? { ...s, ...p } : s)) }));

  const adicionar = () => {
    if (!nome.trim()) { aviso('Escreva o nome do serviço'); return; }
    mudar((b) => ({ ...b, catalogo: b.catalogo.concat({ id: uid(), nome: nome.trim(), preco: lerDinheiro(preco), un: '', cat: b.perfil.profissoes[0] || 'Meus serviços' }) }));
    setNome(''); setPreco('');
    aviso('Serviço adicionado');
  };

  let ultima: string | null = null;
  return (
    <Tela comBarra rodape={<NavInferior atual="servicos" ir={ir} />}>
      <View style={{ gap: 4 }}>
        <H1>Meus serviços</H1>
        <Txt suave>Os preços são seus. Mude aqui e todo orçamento novo já sai com o valor certo.</Txt>
      </View>

      <Cartao style={{ paddingTop: 0, paddingBottom: 12 }}>
        {ordenados.map((s) => {
          const cat = s.cat || 'Meus serviços';
          let cab = null;
          if (cats.length > 1 && cat !== ultima) {
            ultima = cat;
            cab = <Txt style={{ fontFamily: FONTE.sans700, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', paddingTop: 14, paddingBottom: 2 }} suave>{cat}</Txt>;
          }
          return (
            <View key={s.id}>
              {cab}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.linha }}>
                <Entrada value={s.nome} onChangeText={(t) => editar(s.id, { nome: t })} accessibilityLabel="Nome do serviço" style={{ flex: 1, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
                <View style={{ width: 104 }}>
                  <EntradaDinheiro centavos={s.preco} rotulo={'Preço de ' + s.nome} onChange={(p) => editar(s.id, { preco: p })} style={{ minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
                </View>
                <BotaoIcone icone="lixo" size={20} rotulo={'Tirar ' + s.nome + ' da lista'} onPress={() => mudar((b) => ({ ...b, catalogo: b.catalogo.filter((x) => x.id !== s.id) }))} />
              </View>
            </View>
          );
        })}
        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 12 }}>
          <Entrada value={nome} onChangeText={setNome} placeholder="Serviço novo" accessibilityLabel="Nome do serviço novo" style={{ flex: 1, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
          <Entrada value={preco} onChangeText={setPreco} keyboardType="decimal-pad" placeholder="R$ 0,00" accessibilityLabel="Preço do serviço novo" style={{ width: 104, minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
        </View>
        <Botao variante="tracejado" icone="mais" largura style={{ marginTop: 8 }} onPress={adicionar}>Adicionar à lista</Botao>
      </Cartao>
    </Tela>
  );
}
