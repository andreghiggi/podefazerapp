import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Botao, Campo, Cartao, Chip, Entrada, H1, H2, NavInferior, Nota, Tela, Txt } from '../components/ui';
import { PROFS } from '../data/listas';
import { Banco, Perfil as PerfilT } from '../types';
import { TelaId } from './Inicio';

export function Perfil({ db, setPerfil, ir, addProf, limparExemplos, zerar }: {
  db: Banco;
  setPerfil: (p: Partial<PerfilT>) => void;
  ir: (t: TelaId) => void;
  addProf: (nome: string) => void;
  limparExemplos: () => void;
  zerar: () => void;
}) {
  const p = db.perfil;
  const [nova, setNova] = useState('');
  const temExemplo = db.orcamentos.some((o) => o.exemplo);
  const faltam = PROFS.filter((x) => p.profissoes.indexOf(x) < 0);

  return (
    <Tela comBarra rodape={<NavInferior atual="perfil" ir={ir} />}>
      <View style={{ gap: 4 }}>
        <H1>Perfil</H1>
        <Txt suave>Esses dados aparecem no topo de todo orçamento.</Txt>
      </View>

      <Campo rotulo="Seu nome ou da empresa">
        <Entrada value={p.nome} onChangeText={(t) => setPerfil({ nome: t })} />
      </Campo>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Campo rotulo="Como aparece no orçamento" style={{ flex: 1 }}>
          <Entrada value={p.profissao} onChangeText={(t) => setPerfil({ profissao: t })} />
        </Campo>
        <Campo rotulo="Telefone" style={{ flex: 1 }}>
          <Entrada value={p.telefone} onChangeText={(t) => setPerfil({ telefone: t })} keyboardType="phone-pad" />
        </Campo>
      </View>

      <Cartao style={{ gap: 10 }}>
        <H2>Suas profissões</H2>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {p.profissoes.map((x) => <Chip key={x} destaque>{x}</Chip>)}
        </View>
        {faltam.length ? (
          <>
            <Txt peq suave>Faz mais coisa? Toque para trazer os serviços dessa área para a sua lista:</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {faltam.map((x) => <Chip key={x} onPress={() => addProf(x)}>{'+ ' + x}</Chip>)}
            </View>
          </>
        ) : null}
        <View style={{ gap: 8, paddingTop: 4 }}>
          <Entrada value={nova} onChangeText={setNova} placeholder="Outra profissão" accessibilityLabel="Outra profissão" style={{ minHeight: 46, paddingHorizontal: 10, fontSize: 15 }} />
          <Botao variante="tracejado" icone="mais" largura onPress={() => { addProf(nova); setNova(''); }}>Adicionar profissão</Botao>
        </View>
      </Cartao>

      <Campo rotulo="Condições padrão">
        <Entrada multiline value={p.condicoes} onChangeText={(t) => setPerfil({ condicoes: t })} />
      </Campo>

      <Nota>Tudo fica guardado só neste aparelho. Esta versão ainda não tem backup na nuvem: se trocar de celular, os orçamentos não vão junto.</Nota>

      {temExemplo ? <Botao largura onPress={limparExemplos}>Apagar exemplos e começar</Botao> : null}
      <Botao variante="perigo" largura onPress={zerar}>Apagar tudo</Botao>
    </Tela>
  );
}

export { ScrollView };
